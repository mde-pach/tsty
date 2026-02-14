import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { GitHubIssue } from './types';

/**
 * Manages GitHub issues fetched via gh CLI
 * Stores issues locally in .tsty/issues/
 */
export class GitHubIssueManager {
  private issuesDir: string;

  constructor(baseDir = '.tsty/issues') {
    this.issuesDir = baseDir;
  }

  /**
   * Check if gh CLI is available and authenticated
   */
  async checkGhCLI(): Promise<boolean> {
    try {
      execSync('gh auth status', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch issue using gh CLI (calls bash script)
   */
  async fetchIssue(issueNumber: number, repo?: string): Promise<GitHubIssue> {
    const scriptPath = path.join(__dirname, '../../scripts/fetch-github-issue.sh');
    const args = repo ? `${issueNumber} ${repo}` : `${issueNumber}`;

    try {
      execSync(`bash ${scriptPath} ${args}`, {
        stdio: 'inherit',
        encoding: 'utf-8',
        cwd: process.cwd(),
      });

      return this.getIssue(issueNumber);
    } catch (error) {
      throw new Error(`Failed to fetch issue #${issueNumber}: ${(error as Error).message}`);
    }
  }

  /**
   * Get locally saved issue
   */
  async getIssue(issueNumber: number): Promise<GitHubIssue> {
    const filePath = path.join(this.issuesDir, `${issueNumber}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Issue #${issueNumber} not found. Run: tsty issue fetch ${issueNumber}`);
    }
  }

  /**
   * List all fetched issues
   */
  async listIssues(): Promise<GitHubIssue[]> {
    try {
      await fs.access(this.issuesDir);
      const files = await fs.readdir(this.issuesDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      const issues = await Promise.all(
        jsonFiles.map(async (file) => {
          const content = await fs.readFile(
            path.join(this.issuesDir, file),
            'utf-8'
          );
          return JSON.parse(content);
        })
      );

      return issues.sort((a, b) => b.number - a.number);
    } catch {
      return [];
    }
  }

  /**
   * Update issue metadata (linkedFlowId, referenceRunId, status)
   */
  async updateIssue(
    issueNumber: number,
    updates: Partial<Pick<GitHubIssue, 'linkedFlowId' | 'referenceRunId' | 'status'>>
  ): Promise<void> {
    const issue = await this.getIssue(issueNumber);
    const updated = { ...issue, ...updates };

    const filePath = path.join(this.issuesDir, `${issueNumber}.json`);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
  }

  /**
   * Link issue to flow
   */
  async linkToFlow(issueNumber: number, flowId: string): Promise<void> {
    await this.updateIssue(issueNumber, {
      linkedFlowId: flowId,
      status: 'linked',
    });
  }

  /**
   * Set reference run for issue
   */
  async setReferenceRun(issueNumber: number, runId: string): Promise<void> {
    await this.updateIssue(issueNumber, {
      referenceRunId: runId,
      status: 'testing',
    });
  }

  /**
   * Mark issue as fixed
   */
  async markFixed(issueNumber: number): Promise<void> {
    await this.updateIssue(issueNumber, { status: 'fixed' });
  }

  /**
   * Mark issue as failed
   */
  async markFailed(issueNumber: number): Promise<void> {
    await this.updateIssue(issueNumber, { status: 'failed' });
  }

  /**
   * Delete issue from local storage
   */
  async deleteIssue(issueNumber: number): Promise<void> {
    const filePath = path.join(this.issuesDir, `${issueNumber}.json`);
    await fs.unlink(filePath);
  }
}
