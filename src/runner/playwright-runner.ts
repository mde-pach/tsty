import {
	type Browser,
	type BrowserContext,
	chromium,
	type Page,
} from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { getAbsolutePath, loadConfig } from "../lib/config";
import { DependencyValidator } from "../lib/dependency-validator";
import { FileManager } from "../lib/file-manager";
import {
	ActionDefinition,
	type AssertionResult,
	type EvaluateResult,
	type Flow,
	type FlowAssertion,
	type StepResult,
	type TestReport,
} from "../lib/types";
import { executeActions } from "./action-executor";
import { InterpolationContext } from "../lib/variable-interpolator";

/**
 * Main test runner that executes flows using Playwright
 */
export class PlaywrightRunner {
	private config = loadConfig();
	private fileManager: FileManager;
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private page: Page | null = null;
	private progressCallback?: (event: any) => void;
	private cliOptions?: { failFast?: boolean; monitorConsole?: boolean };

	constructor(
		projectRoot?: string,
		progressCallback?: (event: any) => void,
		cliOptions?: { failFast?: boolean; monitorConsole?: boolean }
	) {
		if (projectRoot) {
			this.config = loadConfig(projectRoot);
		}
		this.fileManager = new FileManager(projectRoot);
		this.progressCallback = progressCallback;
		this.cliOptions = cliOptions;
	}

	private emitProgress(event: any): void {
		if (this.progressCallback) {
			this.progressCallback(event);
		}
	}

	/**
	 * Execute flow dependencies in correct order
	 */
	private async executeDependencies(
		flowId: string,
		device: "desktop" | "mobile",
		executedFlows: Set<string> = new Set(),
	): Promise<void> {
		// Prevent infinite loops
		if (executedFlows.has(flowId)) {
			return;
		}

		const flowFile = await this.fileManager.getFlow(flowId);
		if (
			!flowFile ||
			!flowFile.flow.dependencies ||
			flowFile.flow.dependencies.length === 0
		) {
			return;
		}

		// Validate dependencies
		const allFlows = await this.fileManager.listFlows();
		const validator = new DependencyValidator();
		const validation = validator.validate(
			flowId,
			flowFile.flow.dependencies,
			new Map(allFlows.map((f) => [f.id, f.flow.dependencies || []])),
			"flow",
		);

		if (!validation.valid) {
			throw new Error(
				`Dependency validation failed: ${validation.errors.join(", ")}`,
			);
		}

		// Build dependency graph and get execution order
		const dependencyNodes = validator.buildGraph(
			allFlows.map((f) => ({
				id: f.id,
				name: f.name,
				type: "flow" as const,
				dependencies: f.flow.dependencies || [],
			})),
		);
		const executionOrder = validator.getExecutionOrder(dependencyNodes);

		// Filter to only the dependencies we need
		const neededDeps = new Set(flowFile.flow.dependencies);
		const orderedDeps = executionOrder.filter((id) => neededDeps.has(id));
		for (const depId of orderedDeps) {
			if (!executedFlows.has(depId)) {
				// Recursively execute dependencies of dependencies
				await this.executeDependencies(depId, device, executedFlows);

				// Execute the dependency flow
				console.log(`Executing dependency: ${depId}`);
				await this.runFlow(depId, device);
				executedFlows.add(depId);
			}
		}
	}

	/**
	 * Run a test flow
	 */
	async runFlow(
		flowId: string,
		device: "desktop" | "mobile" = "desktop",
		executedFlows?: Set<string>,
	): Promise<TestReport> {
		const flowFile = await this.fileManager.getFlow(flowId);
		if (!flowFile) {
			throw new Error(`Flow ${flowId} not found`);
		}

		const flow = flowFile.flow;
		const startTime = Date.now();
		const runId = `${flowId}-${Date.now()}`;
		const screenshotDir = `run-${runId}`;

		// Create screenshot directory for this run
		const screenshotPath = getAbsolutePath(
			path.join(this.config.screenshotsDir, screenshotDir),
		);
		if (!fs.existsSync(screenshotPath)) {
			fs.mkdirSync(screenshotPath, { recursive: true });
		}

		// Emit start event
		this.emitProgress({
			type: "start",
			timestamp: new Date().toISOString(),
			data: {
				flowId,
				flowName: flow.name,
				totalSteps: flow.steps.length,
				device,
				runId,
			},
		});

		// Execute dependencies first (only if not already executed)
		if (!executedFlows) {
			executedFlows = new Set();
			await this.executeDependencies(flowId, device, executedFlows);
		}

		// Initialize browser
		await this.initBrowser(device);

		const report: TestReport = {
			flow: flow.name,
			flowId,
			timestamp: new Date().toISOString(),
			device,
			steps: [],
			passed: 0,
			failed: 0,
			totalSteps: flow.steps.length,
			runId,
			screenshotDir,
			stoppedEarly: false,
		};

		// Execute each step
		for (let i = 0; i < flow.steps.length; i++) {
			const step = flow.steps[i];

			// Emit step start event
			this.emitProgress({
				type: "step_start",
				timestamp: new Date().toISOString(),
				data: {
					stepNumber: i + 1,
					stepName: step.name,
					url: step.url || "",
				},
			});

			try {
				const stepResult = await this.executeStep(
					step,
					flow.baseUrl,
					i + 1,
					screenshotDir,
				);
				report.steps.push(stepResult);

				if (stepResult.passed) {
					report.passed++;
				} else {
					report.failed++;
				}

				// Emit step complete event
				this.emitProgress({
					type: "step_complete",
					timestamp: new Date().toISOString(),
					data: {
						stepNumber: i + 1,
						stepName: step.name,
						result: stepResult,
					},
				});

				// FAIL-FAST: Check if we should stop execution
				const shouldStop = this.shouldStopExecution(flow, stepResult, step);
				if (shouldStop.stop) {
					report.stoppedEarly = true;
					report.stopReason = shouldStop.reason;

					// Emit early stop event
					this.emitProgress({
						type: "early_stop",
						timestamp: new Date().toISOString(),
						data: {
							stepNumber: i + 1,
							stepName: step.name,
							reason: shouldStop.reason,
						},
					});

					console.error(`\n❌ STOPPING FLOW: ${shouldStop.reason}`);
					console.error(`   Failed at step ${i + 1}: ${step.name}`);
					if (stepResult.consoleErrors && stepResult.consoleErrors > 0) {
						console.error(`   Console errors: ${stepResult.consoleErrors}`);
					}
					if (stepResult.navigationFailed) {
						console.error(`   Navigation failed - check expected URL`);
					}
					console.error(`\n   Fix the issue and re-run the flow.\n`);

					break; // Stop executing remaining steps
				}
			} catch (error) {
				// Emit step error event
				this.emitProgress({
					type: "step_error",
					timestamp: new Date().toISOString(),
					data: {
						stepNumber: i + 1,
						stepName: step.name,
						error: String(error),
					},
				});
				throw error;
			}
		}

		// Clean up
		await this.cleanup();

		report.duration = Date.now() - startTime;

		// Save report
		await this.fileManager.saveReport(flowId, report);

		// Emit complete event
		this.emitProgress({
			type: "complete",
			timestamp: new Date().toISOString(),
			data: {
				report,
			},
		});

		return report;
	}

	/**
	 * Determine if execution should stop (fail-fast logic)
	 */
	private shouldStopExecution(
		flow: Flow,
		stepResult: StepResult,
		step: Flow["steps"][0]
	): { stop: boolean; reason?: string } {
		// CLI options override flow options
		const failFast = this.cliOptions?.failFast ?? flow.failFast ?? false;
		const monitorConsole = this.cliOptions?.monitorConsole ?? flow.monitorConsole ?? true;

		// Don't stop if fail-fast is disabled
		if (!failFast) {
			return { stop: false };
		}

		// Stop if step failed
		if (!stepResult.passed) {
			// Check specific failure reasons
			if (stepResult.navigationFailed) {
				return {
					stop: true,
					reason: `Navigation failed at step "${step.name}" - expected URL not reached`
				};
			}

			if (stepResult.errors.length > 0) {
				return {
					stop: true,
					reason: `Step "${step.name}" failed: ${stepResult.errors[0]}`
				};
			}

			// Failed assertions
			const failedAssertions = stepResult.assertions.filter(a => !a.passed);
			if (failedAssertions.length > 0) {
				return {
					stop: true,
					reason: `Step "${step.name}" failed assertion: ${failedAssertions[0].type} ${failedAssertions[0].selector || ''}`
				};
			}

			return {
				stop: true,
				reason: `Step "${step.name}" failed`
			};
		}

		// Stop if console errors detected on navigation steps (even if step passed)
		if (monitorConsole && step.url && stepResult.consoleErrors && stepResult.consoleErrors > 0) {
			return {
				stop: true,
				reason: `Console errors detected during navigation to "${step.url}" (${stepResult.consoleErrors} error(s))`
			};
		}

		// Continue execution
		return { stop: false };
	}

	/**
	 * Initialize browser and page
	 */
	private async initBrowser(device: "desktop" | "mobile"): Promise<void> {
		const viewport = this.config.viewports[device];

		this.browser = await chromium.launch({
			headless: this.config.playwright?.headless ?? true,
			slowMo: this.config.playwright?.slowMo ?? 0,
		});

		this.context = await this.browser.newContext({
			viewport,
			recordVideo: undefined,
		});

		this.page = await this.context.newPage();

		// Set default timeout
		this.page.setDefaultTimeout(this.config.playwright?.timeout ?? 30000);
	}

	/**
	 * Execute a single step
	 */
	private async executeStep(
		step: Flow["steps"][0],
		baseUrl: string,
		stepNumber: number,
		screenshotDir: string,
	): Promise<StepResult> {
		if (!this.page) {
			throw new Error("Browser not initialized");
		}

		const stepStartTime = Date.now();
		const consoleMessages: any[] = [];
		let consoleErrorCount = 0;

		const result: StepResult = {
			name: step.name,
			url: step.url || this.page.url(),
			passed: true,
			assertions: [],
			screenshots: [],
			html: null,
			console: [],
			errors: [],
			consoleErrors: 0,
		};

		// ALWAYS monitor console messages (not just when explicitly requested)
		const consoleHandler = (msg: any) => {
			const messageData = {
				type: msg.type(),
				text: msg.text(),
				timestamp: new Date().toISOString(),
			};
			consoleMessages.push(messageData);

			if (msg.type() === 'error') {
				consoleErrorCount++;
			}
		};
		this.page.on("console", consoleHandler);

		try {
			const urlBeforeStep = this.page.url();

			// Navigate to URL only if provided
			if (step.url) {
				const fullUrl = step.url.startsWith("http")
					? step.url
					: `${baseUrl}${step.url}`;

				try {
					await this.page.goto(fullUrl, {
						waitUntil: "networkidle",
						timeout: step.timeout,
					});

					// Verify navigation succeeded
					const currentUrl = this.page.url();
					result.url = currentUrl;

					// Check if we reached the expected URL (if specified)
					if (step.expectedUrl) {
						if (!currentUrl.includes(step.expectedUrl)) {
							result.navigationFailed = true;
							result.errors.push(
								`Navigation failed: Expected URL to contain "${step.expectedUrl}", but got "${currentUrl}"`
							);
							result.passed = false;
						}
					}
				} catch (error) {
					result.navigationFailed = true;
					result.errors.push(`Navigation failed: ${String(error)}`);
					result.passed = false;
				}
			}

			// Execute primitives (if any) - NEW: Support inline primitives
			if (step.primitives && step.primitives.length > 0) {
				try {
					// Build interpolation context
					const context: InterpolationContext = {
						config: {
							baseUrl: this.config.baseUrl,
							credentials: this.config.auth?.credentials,
						},
					};

					const evalResults = await executeActions(this.page, step.primitives, context);
					if (evalResults.length > 0) {
						result.evaluateResults = [
							...(result.evaluateResults || []),
							...evalResults,
						];
					}
				} catch (error) {
					result.errors.push(`Primitive execution failed: ${String(error)}`);
					result.passed = false;
				}
			}

			// Execute actions (if any) - Original behavior preserved
			if (step.actions && step.actions.length > 0) {
				for (const actionId of step.actions) {
					try {
						const evalResults = await this.executeActionById(actionId);
						if (evalResults.length > 0) {
							result.evaluateResults = [
								...(result.evaluateResults || []),
								...evalResults,
							];
						}
					} catch (error) {
						result.errors.push(`Action "${actionId}" failed: ${String(error)}`);
						result.passed = false;
					}
				}
			}

			// Run assertions
			if (step.assertions) {
				for (const assertion of step.assertions) {
					const assertionResult = await this.runAssertion(assertion);
					result.assertions.push(assertionResult);

					if (!assertionResult.passed) {
						result.passed = false;
					}
				}
			}

			// Capture screenshot (conditional based on step result)
			const shouldCaptureScreenshot = (() => {
				const captureValue = step.capture?.screenshot;
				if (!captureValue) return false;
				if (captureValue === true || captureValue === "always") return true;
				if (captureValue === "never") return false;
				if (captureValue === "on-failure") return !result.passed;
				return false;
			})();

			if (shouldCaptureScreenshot) {
				// Use step number prefix for easy sorting (e.g., "1-homepage.png", "2-settings.png")
				const screenshotName = `${stepNumber}-${this.slugify(step.name)}.png`;
				const screenshotRelPath = path.join(screenshotDir, screenshotName);
				const screenshotAbsPath =
					this.fileManager.getScreenshotPath(screenshotRelPath);

				await this.page.screenshot({
					path: screenshotAbsPath,
					fullPage: false,
				});

				// Store relative path from screenshots directory for easy reference
				result.screenshots.push(screenshotRelPath);
			}

			// Capture HTML
			if (step.capture?.html) {
				result.html = await this.page.content();
			}
		} catch (error) {
			result.errors.push(String(error));
			result.passed = false;
		} finally {
			// Remove console handler
			this.page.off("console", consoleHandler);
		}

		// Store console messages
		result.console = consoleMessages;
		result.consoleErrors = consoleErrorCount;
		result.duration = Date.now() - stepStartTime;

		return result;
	}

	/**
	 * Execute an action by loading its definition
	 */
	private async executeActionById(actionId: string): Promise<EvaluateResult[]> {
		if (!this.page) {
			throw new Error("Browser not initialized");
		}

		const actionFile = await this.fileManager.getAction(actionId);
		if (!actionFile) {
			throw new Error(`Action ${actionId} not found`);
		}

		// Build interpolation context
		const context: InterpolationContext = {
			config: {
				baseUrl: this.config.baseUrl,
				credentials: this.config.auth?.credentials,
			},
		};

		return executeActions(this.page, actionFile.definition.primitives, context);
	}

	/**
	 * Run an assertion
	 */
	private async runAssertion(
		assertion: FlowAssertion,
	): Promise<AssertionResult> {
		if (!this.page) {
			throw new Error("Browser not initialized");
		}

		const result: AssertionResult = {
			...assertion,
			passed: false,
		};

		try {
			switch (assertion.type) {
				case "visible":
					if (assertion.selector) {
						await this.page.waitForSelector(assertion.selector, {
							state: "visible",
							timeout: 5000,
						});
						result.passed = true;
					}
					break;

				case "hidden":
					if (assertion.selector) {
						await this.page.waitForSelector(assertion.selector, {
							state: "hidden",
							timeout: 5000,
						});
						result.passed = true;
					}
					break;

				case "text":
					if (assertion.selector) {
						const element = await this.page.$(assertion.selector);
						const text = await element?.textContent();
						result.actual = text;
						result.passed = text === assertion.expected;
					}
					break;

				case "count":
					if (assertion.selector) {
						const elements = await this.page.$$(assertion.selector);
						result.actual = elements.length;
						result.passed = elements.length === assertion.expected;
					}
					break;

				case "value":
					if (assertion.selector) {
						const value = await this.page.inputValue(assertion.selector);
						result.actual = value;
						result.passed = value === assertion.expected;
					}
					break;

				case "attribute":
					if (assertion.selector && assertion.attribute) {
						const value = await this.page.getAttribute(
							assertion.selector,
							assertion.attribute,
						);
						result.actual = value;
						result.passed = value === assertion.expected;
					}
					break;

				case "url": {
					const currentUrl = this.page.url();
					result.actual = currentUrl;
					if (typeof assertion.expected === "string") {
						result.passed = currentUrl.includes(assertion.expected);
					}
					break;
				}

				default:
					throw new Error(`Unknown assertion type: ${assertion.type}`);
			}
		} catch (error) {
			result.error = String(error);
			result.passed = false;
		}

		return result;
	}

	/**
	 * Clean up browser resources
	 */
	private async cleanup(): Promise<void> {
		if (this.page) {
			await this.page.close();
			this.page = null;
		}

		if (this.context) {
			await this.context.close();
			this.context = null;
		}

		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}

	/**
	 * Convert string to slug for filenames
	 */
	private slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	}
}
