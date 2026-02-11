import * as fs from "fs";
import * as path from "path";
import { getAbsolutePath, loadConfig } from "./config";
import type {
	ActionDefinition,
	ActionFile,
	Flow,
	FlowFile,
	TstyConfig,
	ReportFile,
	SmartCollection,
	TestReport,
} from "./types";

/**
 * File manager for reading and writing QA test files
 */
export class FileManager {
	private config: TstyConfig;

	constructor(projectRoot?: string) {
		// Always reload config to pick up QA_PROJECT_ROOT from environment
		this.config = loadConfig(projectRoot);
	}

	// ============================================================================
	// Actions
	// ============================================================================

	/**
	 * Recursively find all files in a directory
	 */
	private findFilesRecursively(dir: string, extension: string): string[] {
		const files: string[] = [];

		if (!fs.existsSync(dir)) {
			return files;
		}

		const entries = fs.readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				files.push(...this.findFilesRecursively(fullPath, extension));
			} else if (entry.isFile() && entry.name.endsWith(extension)) {
				files.push(fullPath);
			}
		}

		return files;
	}

	/**
	 * List all action files (recursively searches category subdirectories)
	 */
	async listActions(): Promise<ActionFile[]> {
		const actionsDir = getAbsolutePath(this.config.actionsDir);

		if (!fs.existsSync(actionsDir)) {
			return [];
		}

		const filePaths = this.findFilesRecursively(actionsDir, ".action.json");

		return filePaths.map((filePath) => {
			const stats = fs.statSync(filePath);
			const definition = JSON.parse(
				fs.readFileSync(filePath, "utf-8"),
			) as ActionDefinition;
			const relativePath = path.relative(actionsDir, filePath);
			const id = relativePath.replace(".action.json", "").replace(/\\/g, "/");

			return {
				id,
				name: path.basename(filePath, ".action.json").replace(/-/g, " "),
				path: filePath,
				definition,
				createdAt: stats.birthtime.toISOString(),
				updatedAt: stats.mtime.toISOString(),
			};
		});
	}

	/**
	 * Get a specific action by ID
	 */
	async getAction(id: string): Promise<ActionFile | null> {
		const actions = await this.listActions();
		return actions.find((a) => a.id === id) || null;
	}

	/**
	 * Create a new action (supports category subdirectories via id like "category/action-name")
	 */
	async createAction(
		id: string,
		definition: ActionDefinition,
	): Promise<ActionFile> {
		const actionsDir = getAbsolutePath(this.config.actionsDir);
		const filePath = path.join(actionsDir, `${id}.action.json`);

		if (fs.existsSync(filePath)) {
			throw new Error(`Action ${id} already exists`);
		}

		// Create category subdirectory if needed
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(filePath, JSON.stringify(definition, null, 2));

		const action = await this.getAction(id);
		if (!action) {
			throw new Error("Failed to create action");
		}

		return action;
	}

	/**
	 * Update an existing action (supports category subdirectories)
	 */
	async updateAction(
		id: string,
		definition: ActionDefinition,
	): Promise<ActionFile> {
		const actionsDir = getAbsolutePath(this.config.actionsDir);
		const filePath = path.join(actionsDir, `${id}.action.json`);

		if (!fs.existsSync(filePath)) {
			throw new Error(`Action ${id} not found`);
		}

		// Ensure directory exists (in case of category subdirectories)
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(filePath, JSON.stringify(definition, null, 2));

		const action = await this.getAction(id);
		if (!action) {
			throw new Error("Failed to update action");
		}

		return action;
	}

	/**
	 * Delete an action
	 */
	async deleteAction(id: string): Promise<void> {
		const actionsDir = getAbsolutePath(this.config.actionsDir);
		const filePath = path.join(actionsDir, `${id}.action.json`);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}

	// ============================================================================
	// Flows
	// ============================================================================

	/**
	 * List all flow files (recursively searches category subdirectories)
	 */
	async listFlows(): Promise<FlowFile[]> {
		const flowsDir = getAbsolutePath(this.config.flowsDir);

		if (!fs.existsSync(flowsDir)) {
			return [];
		}

		const filePaths = this.findFilesRecursively(flowsDir, ".json").filter(
			(f) => !f.endsWith(".example.json"),
		);

		return filePaths.map((filePath) => {
			const stats = fs.statSync(filePath);
			const flow = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Flow;
			const relativePath = path.relative(flowsDir, filePath);
			const id = relativePath.replace(".json", "").replace(/\\/g, "/");

			// Get last run info from reports
			const reports = this.getFlowReports(id);
			const lastReport = reports.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)[0];

			return {
				id,
				name: flow.name,
				path: filePath,
				flow,
				createdAt: stats.birthtime.toISOString(),
				updatedAt: stats.mtime.toISOString(),
				lastRun: lastReport?.createdAt,
				lastRunStatus: lastReport
					? lastReport.report.failed === 0
						? "passed"
						: "failed"
					: undefined,
			};
		});
	}

	/**
	 * Get a specific flow by ID
	 */
	async getFlow(id: string): Promise<FlowFile | null> {
		const flows = await this.listFlows();
		return flows.find((f) => f.id === id) || null;
	}

	/**
	 * Create a new flow (supports category subdirectories via id like "category/flow-name")
	 */
	async createFlow(id: string, flow: Flow): Promise<FlowFile> {
		const flowsDir = getAbsolutePath(this.config.flowsDir);
		const filePath = path.join(flowsDir, `${id}.json`);

		if (fs.existsSync(filePath)) {
			throw new Error(`Flow ${id} already exists`);
		}

		// Create category subdirectory if needed
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(filePath, JSON.stringify(flow, null, 2));

		const flowFile = await this.getFlow(id);
		if (!flowFile) {
			throw new Error("Failed to create flow");
		}

		return flowFile;
	}

	/**
	 * Update an existing flow (supports category subdirectories)
	 */
	async updateFlow(id: string, flow: Flow): Promise<FlowFile> {
		const flowsDir = getAbsolutePath(this.config.flowsDir);
		const filePath = path.join(flowsDir, `${id}.json`);

		if (!fs.existsSync(filePath)) {
			throw new Error(`Flow ${id} not found`);
		}

		// Ensure directory exists (in case of category subdirectories)
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(filePath, JSON.stringify(flow, null, 2));

		const flowFile = await this.getFlow(id);
		if (!flowFile) {
			throw new Error("Failed to update flow");
		}

		return flowFile;
	}

	/**
	 * Delete a flow
	 */
	async deleteFlow(id: string): Promise<void> {
		const flowsDir = getAbsolutePath(this.config.flowsDir);
		const filePath = path.join(flowsDir, `${id}.json`);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}

	// ============================================================================
	// Reports
	// ============================================================================

	/**
	 * List all reports
	 */
	async listReports(): Promise<ReportFile[]> {
		const reportsDir = getAbsolutePath(this.config.reportsDir);

		if (!fs.existsSync(reportsDir)) {
			return [];
		}

		const files = fs
			.readdirSync(reportsDir)
			.filter((f) => f.endsWith(".json"))
			.sort((a, b) => {
				const statsA = fs.statSync(path.join(reportsDir, a));
				const statsB = fs.statSync(path.join(reportsDir, b));
				return statsB.mtime.getTime() - statsA.mtime.getTime();
			});

		return files.map((file) => {
			const filePath = path.join(reportsDir, file);
			const stats = fs.statSync(filePath);
			const report = JSON.parse(
				fs.readFileSync(filePath, "utf-8"),
			) as TestReport;

			// Use flowId stored in report (preferred), fallback to filename extraction for old reports
			const flowId = report.flowId || file
				.replace("flow-", "")
				.split("-")
				.slice(0, -1)
				.join("-");

			return {
				id: file.replace(".json", ""),
				flowId,
				flowName: report.flow,
				path: filePath,
				report,
				createdAt: stats.birthtime.toISOString(),
			};
		});
	}

	/**
	 * Get a specific report by ID
	 */
	async getReport(id: string): Promise<ReportFile | null> {
		const reports = await this.listReports();
		return reports.find((r) => r.id === id) || null;
	}

	/**
	 * Get all reports for a specific flow (flowId may include category path)
	 */
	getFlowReports(flowId: string): ReportFile[] {
		const reportsDir = getAbsolutePath(this.config.reportsDir);

		if (!fs.existsSync(reportsDir)) {
			return [];
		}

		// Replace path separators to match saved filename format
		const safeFlowId = flowId.replace(/\//g, "-").replace(/\\/g, "-");
		const files = fs
			.readdirSync(reportsDir)
			.filter(
				(f) => f.startsWith(`flow-${safeFlowId}-`) && f.endsWith(".json"),
			);

		return files.map((file) => {
			const filePath = path.join(reportsDir, file);
			const stats = fs.statSync(filePath);
			const report = JSON.parse(
				fs.readFileSync(filePath, "utf-8"),
			) as TestReport;

			return {
				id: file.replace(".json", ""),
				flowId,
				flowName: report.flow,
				path: filePath,
				report,
				createdAt: stats.birthtime.toISOString(),
			};
		});
	}

	/**
	 * Save a test report (flowId may include category path like "dashboard/flow-name")
	 */
	async saveReport(flowId: string, report: TestReport): Promise<ReportFile> {
		const reportsDir = getAbsolutePath(this.config.reportsDir);
		const timestamp = Date.now();
		// Replace path separators in flowId to create a flat filename
		const safeFlowId = flowId.replace(/\//g, "-").replace(/\\/g, "-");
		const filename = `flow-${safeFlowId}-${timestamp}.json`;
		const filePath = path.join(reportsDir, filename);

		fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

		const reportFile = await this.getReport(filename.replace(".json", ""));
		if (!reportFile) {
			throw new Error("Failed to save report");
		}

		return reportFile;
	}

	/**
	 * Delete a report
	 */
	async deleteReport(id: string): Promise<void> {
		const reportsDir = getAbsolutePath(this.config.reportsDir);
		const filePath = path.join(reportsDir, `${id}.json`);

		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	}

	/**
	 * Clear old reports for a flow, keeping only the most recent one
	 * Also deletes associated screenshot directories
	 */
	async clearOldReports(flowId: string): Promise<{ deleted: number }> {
		const reports = this.getFlowReports(flowId);

		if (reports.length <= 1) {
			return { deleted: 0 };
		}

		// Sort by timestamp (newest first)
		const sortedReports = reports.sort((a, b) => {
			const dateA = new Date(a.report.timestamp).getTime();
			const dateB = new Date(b.report.timestamp).getTime();
			return dateB - dateA;
		});

		// Keep the first (most recent), delete the rest
		const reportsToDelete = sortedReports.slice(1);
		const screenshotsDir = getAbsolutePath(this.config.screenshotsDir);

		for (const reportFile of reportsToDelete) {
			// Delete report file
			await this.deleteReport(reportFile.id);

			// Delete screenshot directory if it exists
			if (reportFile.report.screenshotDir) {
				const screenshotDirPath = path.join(
					screenshotsDir,
					reportFile.report.screenshotDir,
				);
				if (fs.existsSync(screenshotDirPath)) {
					fs.rmSync(screenshotDirPath, { recursive: true, force: true });
				}
			}
		}

		return { deleted: reportsToDelete.length };
	}

	// ============================================================================
	// Screenshots
	// ============================================================================

	/**
	 * Get screenshot path
	 */
	getScreenshotPath(filename: string): string {
		const screenshotsDir = getAbsolutePath(this.config.screenshotsDir);
		return path.join(screenshotsDir, filename);
	}

	/**
	 * Check if screenshot exists
	 */
	screenshotExists(filename: string): boolean {
		return fs.existsSync(this.getScreenshotPath(filename));
	}

	// ============================================================================
	// Smart Collections
	// ============================================================================

	/**
	 * List all smart collections
	 */
	async listCollections(): Promise<SmartCollection[]> {
		const testDir = getAbsolutePath(".tsty");
		const collectionsFile = path.join(testDir, "collections.json");

		if (!fs.existsSync(collectionsFile)) {
			return [];
		}

		try {
			const content = fs.readFileSync(collectionsFile, "utf-8");
			return JSON.parse(content) as SmartCollection[];
		} catch (error) {
			console.error("Error reading collections file:", error);
			return [];
		}
	}

	/**
	 * Get a specific collection by ID
	 */
	async getCollection(id: string): Promise<SmartCollection | null> {
		const collections = await this.listCollections();
		return collections.find((c) => c.id === id) || null;
	}

	/**
	 * Create a new collection
	 */
	async createCollection(
		collection: Omit<SmartCollection, "id" | "createdAt" | "updatedAt">,
	): Promise<SmartCollection> {
		const collections = await this.listCollections();
		const testDir = getAbsolutePath(".tsty");
		const collectionsFile = path.join(testDir, "collections.json");

		// Generate ID
		const id = this.generateId(collection.name);

		// Check for duplicate names
		if (
			collections.some(
				(c) => c.name.toLowerCase() === collection.name.toLowerCase(),
			)
		) {
			throw new Error(
				`Collection with name "${collection.name}" already exists`,
			);
		}

		const newCollection: SmartCollection = {
			id,
			...collection,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		collections.push(newCollection);
		fs.writeFileSync(collectionsFile, JSON.stringify(collections, null, 2));

		return newCollection;
	}

	/**
	 * Update an existing collection
	 */
	async updateCollection(
		id: string,
		updates: Partial<Omit<SmartCollection, "id" | "createdAt">>,
	): Promise<SmartCollection> {
		const collections = await this.listCollections();
		const testDir = getAbsolutePath(".tsty");
		const collectionsFile = path.join(testDir, "collections.json");

		const index = collections.findIndex((c) => c.id === id);
		if (index === -1) {
			throw new Error(`Collection ${id} not found`);
		}

		// Check for duplicate names (excluding current collection)
		if (updates.name) {
			const duplicate = collections.find(
				(c) =>
					c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase(),
			);
			if (duplicate) {
				throw new Error(
					`Collection with name "${updates.name}" already exists`,
				);
			}
		}

		const updatedCollection: SmartCollection = {
			...collections[index],
			...updates,
			updatedAt: new Date().toISOString(),
		};

		collections[index] = updatedCollection;
		fs.writeFileSync(collectionsFile, JSON.stringify(collections, null, 2));

		return updatedCollection;
	}

	/**
	 * Delete a collection
	 */
	async deleteCollection(id: string): Promise<void> {
		const collections = await this.listCollections();
		const testDir = getAbsolutePath(".tsty");
		const collectionsFile = path.join(testDir, "collections.json");

		const filtered = collections.filter((c) => c.id !== id);

		if (filtered.length === collections.length) {
			throw new Error(`Collection ${id} not found`);
		}

		fs.writeFileSync(collectionsFile, JSON.stringify(filtered, null, 2));
	}

	// ============================================================================
	// Folders
	// ============================================================================

	/**
	 * List all folders (both from file structure and empty folders metadata)
	 */
	async listFolders(): Promise<string[]> {
		const testDir = getAbsolutePath(".tsty");
		const foldersFile = path.join(testDir, "folders.json");

		// Get folders from flow file structure
		const flows = await this.listFlows();
		const fileFolders = new Set<string>();

		for (const flow of flows) {
			const parts = flow.id.split("/");
			if (parts.length > 1) {
				// Build nested folder paths (e.g., "a", "a/b", "a/b/c")
				let currentPath = "";
				for (let i = 0; i < parts.length - 1; i++) {
					currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
					fileFolders.add(currentPath);
				}
			}
		}

		// Get empty folders from metadata
		let emptyFolders: string[] = [];
		if (fs.existsSync(foldersFile)) {
			try {
				const data = JSON.parse(fs.readFileSync(foldersFile, "utf-8"));
				emptyFolders = data.folders || [];
			} catch (error) {
				console.error("Error reading folders.json:", error);
			}
		}

		// Merge and return unique folders
		const allFolders = new Set([...fileFolders, ...emptyFolders]);
		return Array.from(allFolders).sort();
	}

	/**
	 * Create an empty folder
	 */
	async createFolder(folderPath: string): Promise<void> {
		const testDir = getAbsolutePath(".tsty");
		const foldersFile = path.join(testDir, "folders.json");

		// Read existing folders
		let data: { folders: string[] } = { folders: [] };
		if (fs.existsSync(foldersFile)) {
			try {
				data = JSON.parse(fs.readFileSync(foldersFile, "utf-8"));
			} catch (error) {
				console.error("Error reading folders.json:", error);
			}
		}

		// Add new folder if it doesn't exist
		if (!data.folders.includes(folderPath)) {
			data.folders.push(folderPath);
			data.folders.sort();

			// Ensure directory exists
			if (!fs.existsSync(testDir)) {
				fs.mkdirSync(testDir, { recursive: true });
			}

			fs.writeFileSync(foldersFile, JSON.stringify(data, null, 2));
		}
	}

	/**
	 * Rename a folder
	 */
	async renameFolder(oldPath: string, newPath: string): Promise<void> {
		const testDir = getAbsolutePath(".tsty");
		const foldersFile = path.join(testDir, "folders.json");

		if (!fs.existsSync(foldersFile)) {
			return;
		}

		try {
			const data = JSON.parse(fs.readFileSync(foldersFile, "utf-8"));
			const index = data.folders.indexOf(oldPath);

			if (index !== -1) {
				data.folders[index] = newPath;
				data.folders.sort();
				fs.writeFileSync(foldersFile, JSON.stringify(data, null, 2));
			}
		} catch (error) {
			console.error("Error renaming folder:", error);
		}
	}

	/**
	 * Delete an empty folder
	 */
	async deleteFolder(folderPath: string): Promise<void> {
		const testDir = getAbsolutePath(".tsty");
		const foldersFile = path.join(testDir, "folders.json");

		if (!fs.existsSync(foldersFile)) {
			return;
		}

		try {
			const data = JSON.parse(fs.readFileSync(foldersFile, "utf-8"));
			data.folders = data.folders.filter((f: string) => f !== folderPath);
			fs.writeFileSync(foldersFile, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error("Error deleting folder:", error);
		}
	}

	// ============================================================================
	// Utilities
	// ============================================================================

	/**
	 * Generate a URL-safe ID from a name
	 */
	private generateId(name: string): string {
		const base = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");

		// Add timestamp to ensure uniqueness
		const timestamp = Date.now().toString(36);
		return `${base}-${timestamp}`;
	}
}
