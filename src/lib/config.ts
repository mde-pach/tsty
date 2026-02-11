import * as fs from "fs";
import * as path from "path";
import type { TstyConfig } from "./types";

/**
 * Default configuration for Tsty
 */
export const defaultConfig: Partial<TstyConfig> = {
	testDir: "./.tsty",
	playwright: {
		headless: true,
		slowMo: 0,
		timeout: 30000,
	},
	viewports: {
		desktop: { width: 1920, height: 1080 },
		mobile: { width: 375, height: 667 },
		tablet: { width: 768, height: 1024 },
	},
};

/**
 * Load configuration from the host project
 * Looks for qa.config.js or qa.config.json in the project root
 */
export function loadConfig(projectRoot?: string): TstyConfig {
	// Use QA_PROJECT_ROOT env var set by CLI, or provided projectRoot, or CWD
	const root = projectRoot || process.env.QA_PROJECT_ROOT || process.cwd();

	// Try to load qa.config.js
	const jsConfigPath = path.join(root, "qa.config.js");
	if (fs.existsSync(jsConfigPath)) {
		const userConfig = require(jsConfigPath);
		return mergeConfig(userConfig);
	}

	// Try to load qa.config.json
	const jsonConfigPath = path.join(root, "qa.config.json");
	if (fs.existsSync(jsonConfigPath)) {
		const userConfig = JSON.parse(fs.readFileSync(jsonConfigPath, "utf-8"));
		return mergeConfig(userConfig);
	}

	// Try to load from .tsty/config.json (new location)
	const testConfigPath = path.join(root, ".tsty", "config.json");
	if (fs.existsSync(testConfigPath)) {
		const testConfig = JSON.parse(fs.readFileSync(testConfigPath, "utf-8"));
		return mergeConfig(testConfig);
	}

	throw new Error(
		"No configuration file found. Please create qa.config.js, qa.config.json, or .tsty/config.json",
	);
}

/**
 * Merge user config with defaults and compute derived paths
 */
function mergeConfig(
	userConfig: Partial<TstyConfig>,
): TstyConfig {
	const config = {
		...defaultConfig,
		...userConfig,
		playwright: {
			...defaultConfig.playwright,
			...userConfig.playwright,
		},
		viewports: {
			...defaultConfig.viewports,
			...userConfig.viewports,
		},
	} as TstyConfig;

	// Compute derived paths if not explicitly set
	const testDir = config.testDir;
	config.screenshotsDir =
		config.screenshotsDir || path.join(testDir, "screenshots");
	config.reportsDir = config.reportsDir || path.join(testDir, "reports");
	config.actionsDir = config.actionsDir || path.join(testDir, "actions");
	config.flowsDir = config.flowsDir || path.join(testDir, "flows");

	return config;
}

/**
 * Get the absolute path for a relative path from config
 */
export function getAbsolutePath(
	relativePath: string,
	projectRoot?: string,
): string {
	const root = projectRoot || process.env.QA_PROJECT_ROOT || process.cwd();
	return path.isAbsolute(relativePath)
		? relativePath
		: path.join(root, relativePath);
}

/**
 * Ensure all required directories exist
 */
export function ensureDirectories(config: TstyConfig): void {
	const dirs = [
		config.testDir,
		config.screenshotsDir,
		config.reportsDir,
		config.actionsDir,
		config.flowsDir,
	];

	for (const dir of dirs) {
		const absolutePath = getAbsolutePath(dir);
		if (!fs.existsSync(absolutePath)) {
			fs.mkdirSync(absolutePath, { recursive: true });
		}
	}
}
