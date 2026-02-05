/**
 * @vipro/qa-framework
 * Visual QA testing framework for web applications
 */

// API exports (for Next.js route handlers)
export * as api from "./api";
export * from "./dashboard";
// Dashboard exports (React components)
export { QADashboard } from "./dashboard";
export { ensureDirectories, getAbsolutePath, loadConfig } from "./lib/config";
export { FileManager } from "./lib/file-manager";
// Core exports
export * from "./lib/types";
// Runner exports
export { executeAction, executeActions, PlaywrightRunner } from "./runner";
