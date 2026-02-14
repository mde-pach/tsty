import { promises as fs } from 'fs';
import path from 'path';
import type { Flow, TestReport } from './types';

export interface ReferenceInfo {
  flowId: string;
  referenceRunId: string;
  timestamp: string;
  device: 'desktop' | 'mobile';
}

/**
 * Manages reference runs for before/after screenshot comparison
 */
export class ReferenceManager {
  private baseDir: string;

  constructor(baseDir = '.tsty') {
    this.baseDir = baseDir;
  }

  /**
   * Mark a run as reference for a flow
   */
  async markAsReference(runId: string, flowId: string): Promise<void> {
    // Update the flow to store reference run ID
    const flowPath = await this.findFlowPath(flowId);
    if (!flowPath) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    const flowContent = await fs.readFile(flowPath, 'utf-8');
    const flowData: Flow = JSON.parse(flowContent);

    flowData.referenceRunId = runId;

    await fs.writeFile(flowPath, JSON.stringify(flowData, null, 2));

    // Mark the report as reference
    const reportPath = await this.findReportPath(runId);
    if (reportPath) {
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      const reportData: TestReport = JSON.parse(reportContent);

      reportData.isReference = true;

      await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    }
  }

  /**
   * Get reference run ID for a flow
   */
  async getReference(flowId: string): Promise<string | null> {
    const flowPath = await this.findFlowPath(flowId);
    if (!flowPath) {
      return null;
    }

    const flowContent = await fs.readFile(flowPath, 'utf-8');
    const flowData: Flow = JSON.parse(flowContent);

    return flowData.referenceRunId || null;
  }

  /**
   * Clear reference for a flow
   */
  async clearReference(flowId: string): Promise<void> {
    const flowPath = await this.findFlowPath(flowId);
    if (!flowPath) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    const flowContent = await fs.readFile(flowPath, 'utf-8');
    const flowData: Flow = JSON.parse(flowContent);

    // Get old reference run ID to unmark it
    const oldReferenceRunId = flowData.referenceRunId;

    // Clear from flow
    delete flowData.referenceRunId;
    await fs.writeFile(flowPath, JSON.stringify(flowData, null, 2));

    // Unmark the report
    if (oldReferenceRunId) {
      const reportPath = await this.findReportPath(oldReferenceRunId);
      if (reportPath) {
        const reportContent = await fs.readFile(reportPath, 'utf-8');
        const reportData: TestReport = JSON.parse(reportContent);

        delete reportData.isReference;

        await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
      }
    }
  }

  /**
   * List all flows with their references
   */
  async listAllReferences(): Promise<ReferenceInfo[]> {
    const flowsDir = path.join(this.baseDir, 'flows');
    const references: ReferenceInfo[] = [];

    try {
      const entries = await this.readDirRecursive(flowsDir);
      const flowFiles = entries.filter(f => f.endsWith('.json'));

      for (const flowFile of flowFiles) {
        const content = await fs.readFile(flowFile, 'utf-8');
        const flowData: Flow = JSON.parse(content);

        if (flowData.referenceRunId) {
          // Get flow ID from file path
          const flowId = path.relative(flowsDir, flowFile).replace('.json', '');

          // Try to get report metadata
          const reportPath = await this.findReportPath(flowData.referenceRunId);
          let timestamp = '';
          let device: 'desktop' | 'mobile' = 'desktop';

          if (reportPath) {
            const reportContent = await fs.readFile(reportPath, 'utf-8');
            const reportData: TestReport = JSON.parse(reportContent);
            timestamp = reportData.timestamp;
            device = reportData.device;
          }

          references.push({
            flowId,
            referenceRunId: flowData.referenceRunId,
            timestamp,
            device,
          });
        }
      }
    } catch (error) {
      // Directory might not exist yet
      return [];
    }

    return references;
  }

  /**
   * Find flow file path by ID
   */
  private async findFlowPath(flowId: string): Promise<string | null> {
    const flowsDir = path.join(this.baseDir, 'flows');

    // Try direct path first
    const directPath = path.join(flowsDir, `${flowId}.json`);
    try {
      await fs.access(directPath);
      return directPath;
    } catch {
      // Not found, search recursively
    }

    // Search recursively
    try {
      const entries = await this.readDirRecursive(flowsDir);
      const flowFiles = entries.filter(f => f.endsWith('.json'));

      for (const flowFile of flowFiles) {
        const relPath = path.relative(flowsDir, flowFile).replace('.json', '');
        if (relPath === flowId || path.basename(flowFile, '.json') === flowId) {
          return flowFile;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Find report file path by run ID
   */
  private async findReportPath(runId: string): Promise<string | null> {
    const reportsDir = path.join(this.baseDir, 'reports');

    try {
      const files = await fs.readdir(reportsDir);

      for (const file of files) {
        if (file.includes(runId) && file.endsWith('.json')) {
          return path.join(reportsDir, file);
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  /**
   * Recursively read directory
   */
  private async readDirRecursive(dir: string): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subResults = await this.readDirRecursive(fullPath);
          results.push(...subResults);
        } else {
          results.push(fullPath);
        }
      }
    } catch {
      // Ignore errors (directory might not exist)
    }

    return results;
  }
}
