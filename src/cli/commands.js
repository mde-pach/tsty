/**
 * CLI Commands for Tsty
 * Shared logic used by both CLI and API
 */
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				var desc = Object.getOwnPropertyDescriptor(m, k);
				if (
					!desc ||
					("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
				) {
					desc = { enumerable: true, get: () => m[k] };
				}
				Object.defineProperty(o, k2, desc);
			}
		: (o, m, k, k2) => {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
			});
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? (o, v) => {
				Object.defineProperty(o, "default", { enumerable: true, value: v });
			}
		: (o, v) => {
				o["default"] = v;
			});
var __importStar =
	(this && this.__importStar) ||
	(() => {
		var ownKeys = (o) => {
			ownKeys =
				Object.getOwnPropertyNames ||
				((o) => {
					var ar = [];
					for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
					return ar;
				});
			return ownKeys(o);
		};
		return (mod) => {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i]);
			__setModuleDefault(result, mod);
			return result;
		};
	})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = initProject;
exports.runFlow = runFlow;
exports.listFlows = listFlows;
exports.listActions = listActions;
exports.listReports = listReports;
exports.validateFlow = validateFlow;
const playwright_runner_1 = require("../runner/playwright-runner");
const file_manager_1 = require("../lib/file-manager");
const dependency_validator_1 = require("../lib/dependency-validator");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
};
function log(message, color = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}
/**
 * Initialize .tsty directory structure
 */
async function initProject(projectRoot = process.cwd()) {
	const tstyDir = path.join(projectRoot, ".tsty");
	if (fs.existsSync(tstyDir)) {
		log("✅ .tsty directory already exists", "green");
		log(`   Location: ${tstyDir}`, "blue");
		return;
	}
	log("⚠️  No .tsty directory found", "yellow");
	log("   Creating .tsty structure...", "yellow");
	// Create directory structure
	fs.mkdirSync(tstyDir, { recursive: true });
	fs.mkdirSync(path.join(tstyDir, "actions"), { recursive: true });
	fs.mkdirSync(path.join(tstyDir, "flows"), { recursive: true });
	fs.mkdirSync(path.join(tstyDir, "reports"), { recursive: true });
	fs.mkdirSync(path.join(tstyDir, "screenshots"), { recursive: true });
	// Create default config
	const defaultConfig = {
		baseUrl: "http://localhost:3000",
		viewports: {
			desktop: { width: 1920, height: 1080 },
			mobile: { width: 375, height: 667 },
		},
	};
	fs.writeFileSync(
		path.join(tstyDir, "config.json"),
		JSON.stringify(defaultConfig, null, 2),
	);
	log("✅ Created .tsty directory structure", "green");
	log(`   Location: ${tstyDir}`, "blue");
	log(`   Config: ${path.join(tstyDir, "config.json")}`, "blue");
}
/**
 * Run a flow by ID
 */
async function runFlow(flowId, device = "desktop", projectRoot) {
	log(`\n🧪 Running flow: ${flowId}`, "cyan");
	log(`   Device: ${device}\n`, "blue");
	const runner = new playwright_runner_1.PlaywrightRunner(projectRoot);
	const report = await runner.runFlow(flowId, device);
	// Print summary
	const passed = report.failed === 0;
	log(
		`\n${passed ? "✅" : "❌"} Test ${passed ? "Passed" : "Failed"}`,
		passed ? "green" : "red",
	);
	log(`   Steps: ${report.passed}/${report.totalSteps} passed`, "blue");
	if (report.duration) {
		log(`   Duration: ${(report.duration / 1000).toFixed(2)}s`, "blue");
	}
	if (report.failed > 0) {
		log(`   Failed: ${report.failed} step(s)`, "red");
	}
	log(`\n📸 Screenshots saved to: .tsty/screenshots/`, "cyan");
	log(`📄 Report saved to: .tsty/reports/\n`, "cyan");
	return report;
}
/**
 * List all flows
 */
async function listFlows(projectRoot) {
	const fileManager = new file_manager_1.FileManager(projectRoot);
	const flows = await fileManager.listFlows();
	if (flows.length === 0) {
		log("No flows found", "yellow");
		log("Create a flow in .tsty/flows/ or use the dashboard\n", "blue");
		return;
	}
	log(`\n📋 Flows (${flows.length}):\n`, "bright");
	flows.forEach((f) => {
		log(`  ${f.id}`, "cyan");
		log(`    Name: ${f.flow.name}`, "reset");
		if (f.flow.description) {
			log(`    Description: ${f.flow.description}`, "reset");
		}
		log(`    Steps: ${f.flow.steps.length}`, "blue");
		if (f.flow.dependencies && f.flow.dependencies.length > 0) {
			log(`    Dependencies: ${f.flow.dependencies.join(", ")}`, "yellow");
		}
		log("", "reset");
	});
}
/**
 * List all actions
 */
async function listActions(projectRoot) {
	const fileManager = new file_manager_1.FileManager(projectRoot);
	const actions = await fileManager.listActions();
	if (actions.length === 0) {
		log("No actions found", "yellow");
		log(
			"Create an action in .tsty/actions/ or use the dashboard\n",
			"blue",
		);
		return;
	}
	log(`\n📋 Actions (${actions.length}):\n`, "bright");
	actions.forEach((a) => {
		log(`  ${a.id}`, "cyan");
		if (a.definition.description) {
			log(`    ${a.definition.description}`, "reset");
		}
		if ("actions" in a.definition && Array.isArray(a.definition.actions)) {
			log(
				`    Type: Reusable (${a.definition.actions.length} actions)`,
				"blue",
			);
		} else {
			log(`    Type: ${a.definition.type}`, "blue");
		}
		log("", "reset");
	});
}
/**
 * List all reports
 */
async function listReports(flowId, projectRoot) {
	const fileManager = new file_manager_1.FileManager(projectRoot);
	const reports = flowId
		? fileManager.getFlowReports(flowId)
		: await fileManager.listReports();
	if (reports.length === 0) {
		log("No reports found", "yellow");
		log("Run a flow to generate reports\n", "blue");
		return;
	}
	log(`\n📊 Reports (${reports.length}):\n`, "bright");
	reports.forEach((r) => {
		const passed = r.report.failed === 0;
		log(`  ${r.id}`, "cyan");
		log(`    Flow: ${r.flowName}`, "reset");
		log(`    Date: ${new Date(r.createdAt).toLocaleString()}`, "reset");
		log(
			`    Result: ${passed ? "✅ Passed" : "❌ Failed"} (${r.report.passed}/${r.report.totalSteps})`,
			passed ? "green" : "red",
		);
		log("", "reset");
	});
}
/**
 * Validate a flow's dependencies
 */
async function validateFlow(flowId, projectRoot) {
	const fileManager = new file_manager_1.FileManager(projectRoot);
	const flowFile = await fileManager.getFlow(flowId);
	if (!flowFile) {
		log(`❌ Flow not found: ${flowId}`, "red");
		process.exit(1);
	}
	log(`\n🔍 Validating flow: ${flowFile.flow.name}`, "cyan");
	if (!flowFile.flow.dependencies || flowFile.flow.dependencies.length === 0) {
		log("✅ No dependencies to validate", "green");
		return;
	}
	const allFlows = await fileManager.listFlows();
	const validator = new dependency_validator_1.DependencyValidator();
	const dependencyMap = new Map(
		allFlows.map((f) => [f.id, f.flow.dependencies || []]),
	);
	const validation = validator.validate(
		flowId,
		flowFile.flow.dependencies,
		dependencyMap,
		"flow",
	);
	if (validation.valid) {
		log("✅ Dependencies valid", "green");
		log(`   Dependencies: ${flowFile.flow.dependencies.join(", ")}`, "blue");
	} else {
		log("❌ Invalid dependencies", "red");
		validation.errors.forEach((error) => {
			log(`   ${error}`, "red");
		});
		process.exit(1);
	}
}
