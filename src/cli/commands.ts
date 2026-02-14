/**
 * CLI Commands for Tsty
 * Shared logic used by both CLI and API
 */

import { PlaywrightRunner } from '../runner/playwright-runner';
import { FileManager } from '../lib/file-manager';
import { DependencyValidator } from '../lib/dependency-validator';
import { ReferenceManager } from '../lib/reference-manager';
import { GitHubIssueManager } from '../lib/github-issue-manager';
import { loadConfig } from '../lib/config';
import { ACTION_CATEGORIES } from '../lib/generated-actions';
import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Initialize .tsty directory structure
 */
export async function initProject(projectRoot: string = process.cwd()): Promise<void> {
  const tstyDir = path.join(projectRoot, '.tsty');

  if (fs.existsSync(tstyDir)) {
    log('✅ .tsty directory already exists', 'green');
    log(`   Location: ${tstyDir}`, 'blue');
    return;
  }

  log('⚠️  No .tsty directory found', 'yellow');
  log('   Creating .tsty structure...', 'yellow');

  // Create directory structure
  fs.mkdirSync(tstyDir, { recursive: true });
  fs.mkdirSync(path.join(tstyDir, 'actions'), { recursive: true });
  fs.mkdirSync(path.join(tstyDir, 'flows'), { recursive: true });
  fs.mkdirSync(path.join(tstyDir, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(tstyDir, 'screenshots'), { recursive: true });
  fs.mkdirSync(path.join(tstyDir, 'issues'), { recursive: true });

  // Create default config
  const defaultConfig = {
    baseUrl: 'http://localhost:3000',
    viewports: {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 375, height: 667 },
    },
  };
  fs.writeFileSync(
    path.join(tstyDir, 'config.json'),
    JSON.stringify(defaultConfig, null, 2)
  );

  log('✅ Created .tsty directory structure', 'green');
  log(`   Location: ${tstyDir}`, 'blue');
  log(`   Config: ${path.join(tstyDir, 'config.json')}`, 'blue');
}

/**
 * Run a flow by ID
 */
export async function runFlow(
  flowId: string,
  device: 'desktop' | 'mobile' = 'desktop',
  projectRoot?: string,
  options?: { failFast?: boolean; monitorConsole?: boolean }
): Promise<string | undefined> {
  log(`\n🧪 Running flow: ${flowId}`, 'cyan');
  log(`   Device: ${device}`, 'blue');

  // Show CLI overrides if provided
  if (options?.failFast !== undefined) {
    log(`   Fail-fast: ${options.failFast ? 'enabled' : 'disabled'}`, 'blue');
  }
  if (options?.monitorConsole !== undefined) {
    log(`   Console monitoring: ${options.monitorConsole ? 'enabled' : 'disabled'}`, 'blue');
  }
  console.log();

  const runner = new PlaywrightRunner(projectRoot, undefined, options);
  const report = await runner.runFlow(flowId, device);

  // Print summary
  const passed = report.failed === 0;
  log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'Passed' : 'Failed'}`, passed ? 'green' : 'red');
  log(`   Steps: ${report.passed}/${report.totalSteps} passed`, 'blue');
  if (report.duration) {
    log(`   Duration: ${(report.duration / 1000).toFixed(2)}s`, 'blue');
  }

  if (report.failed > 0) {
    log(`   Failed: ${report.failed} step(s)`, 'red');
  }

  // Show early stop info
  if (report.stoppedEarly) {
    log(`\n⚠️  Flow stopped early`, 'yellow');
    if (report.stopReason) {
      log(`   Reason: ${report.stopReason}`, 'yellow');
    }
  }

  log(`\n📸 Screenshots saved to: .tsty/screenshots/`, 'cyan');
  log(`📄 Report saved to: .tsty/reports/\n`, 'cyan');

  // Return runId for reference marking
  return report.runId;
}

/**
 * List all flows
 */
export async function listFlows(projectRoot?: string): Promise<void> {
  const fileManager = new FileManager(projectRoot);
  const flows = await fileManager.listFlows();

  if (flows.length === 0) {
    log('No flows found', 'yellow');
    log('Create a flow in .tsty/flows/ or use the dashboard\n', 'blue');
    return;
  }

  log(`\n📋 Flows (${flows.length}):\n`, 'bright');
  flows.forEach((f) => {
    log(`  ${f.id}`, 'cyan');
    log(`    Name: ${f.flow.name}`, 'reset');
    if (f.flow.description) {
      log(`    Description: ${f.flow.description}`, 'reset');
    }
    log(`    Steps: ${f.flow.steps.length}`, 'blue');
    if (f.flow.dependencies && f.flow.dependencies.length > 0) {
      log(`    Dependencies: ${f.flow.dependencies.join(', ')}`, 'yellow');
    }
    log('', 'reset');
  });
}

/**
 * List all actions
 */
export async function listActions(projectRoot?: string): Promise<void> {
  const fileManager = new FileManager(projectRoot);
  const actions = await fileManager.listActions();

  if (actions.length === 0) {
    log('No actions found', 'yellow');
    log('Create an action in .tsty/actions/ or use the dashboard\n', 'blue');
    return;
  }

  log(`\n📋 User Actions (${actions.length}):\n`, 'bright');
  log('Actions are user-centered behaviors composed of primitives.\n', 'blue');

  actions.forEach((a) => {
    log(`  ${a.id}`, 'cyan');
    if (a.definition.description) {
      log(`    ${a.definition.description}`, 'reset');
    }
    if ('primitives' in a.definition && Array.isArray(a.definition.primitives)) {
      log(`    ${a.definition.type} (${a.definition.primitives.length} primitives)`, 'blue');

      // Warn if only 1 primitive
      if (a.definition.primitives.length === 1) {
        log(`    ⚠️  Single primitive - consider using primitive directly in flow`, 'yellow');
      }
    } else {
      log(`    Type: ${a.definition.type}`, 'blue');
    }
    log('', 'reset');
  });
}

/**
 * List all available Playwright primitives
 * Shows all 48 auto-generated primitives from Playwright's Page API
 */
export async function listPrimitives(category?: string): Promise<void> {
  const categories = Object.keys(ACTION_CATEGORIES).sort();

  if (category) {
    // Show specific category
    const methods = ACTION_CATEGORIES[category as keyof typeof ACTION_CATEGORIES];
    if (!methods) {
      log(`❌ Category "${category}" not found`, 'red');
      log(`\nAvailable categories: ${categories.join(', ')}`, 'blue');
      return;
    }

    log(`\n🧱 ${category.toUpperCase()} Primitives (${methods.length}):\n`, 'bright');
    methods.forEach((method: string) => {
      log(`  ${method}`, 'cyan');
    });
    log('', 'reset');
  } else {
    // Show all categories
    const totalPrimitives = Object.values(ACTION_CATEGORIES).flat().length;
    log(`\n🧱 Available Primitives (${totalPrimitives} building blocks):\n`, 'bright');
    log('Primitives are framework-provided Playwright operations.', 'blue');
    log('Compose them into Actions (user behaviors) in .tsty/actions/\n', 'blue');

    categories.forEach((cat) => {
      const methods = ACTION_CATEGORIES[cat as keyof typeof ACTION_CATEGORIES];
      log(`  ${cat.toUpperCase()} (${methods.length})`, 'bright');
      methods.forEach((method: string) => {
        log(`    • ${method}`, 'cyan');
      });
      log('', 'reset');
    });

    log('\n💡 Primitives vs Actions:', 'bright');
    log('  Primitives = Building blocks (click, fill, type)', 'cyan');
    log('  Actions    = User behaviors (login, checkout, add-to-cart)', 'green');
    log('\n📚 Usage:', 'bright');
    log('  tsty primitives <category>  Show primitives in a specific category', 'blue');
    log('  tsty primitives mouse       Example: show mouse primitives', 'blue');
    log('  tsty list actions           Show user-created actions\n', 'blue');
  }
}

/**
 * @deprecated Use listPrimitives instead
 */
export async function listPlaywrightActions(category?: string): Promise<void> {
  log('⚠️  Command deprecated. Use "tsty primitives" instead.\n', 'yellow');
  await listPrimitives(category);
}

/**
 * List all reports
 */
export async function listReports(flowId?: string, projectRoot?: string): Promise<void> {
  const fileManager = new FileManager(projectRoot);
  const reports = flowId
    ? fileManager.getFlowReports(flowId)
    : await fileManager.listReports();

  if (reports.length === 0) {
    log('No reports found', 'yellow');
    log('Run a flow to generate reports\n', 'blue');
    return;
  }

  log(`\n📊 Reports (${reports.length}):\n`, 'bright');
  reports.forEach((r) => {
    const passed = r.report.failed === 0;
    log(`  ${r.id}`, 'cyan');
    log(`    Flow: ${r.flowName}`, 'reset');
    log(`    Date: ${new Date(r.createdAt).toLocaleString()}`, 'reset');
    log(
      `    Result: ${passed ? '✅ Passed' : '❌ Failed'} (${r.report.passed}/${r.report.totalSteps})`,
      passed ? 'green' : 'red'
    );
    log('', 'reset');
  });
}

/**
 * Validate a flow's dependencies
 */
export async function validateFlow(flowId: string, projectRoot?: string): Promise<void> {
  const fileManager = new FileManager(projectRoot);
  const flowFile = await fileManager.getFlow(flowId);

  if (!flowFile) {
    log(`❌ Flow not found: ${flowId}`, 'red');
    process.exit(1);
  }

  log(`\n🔍 Validating flow: ${flowFile.flow.name}`, 'cyan');

  if (!flowFile.flow.dependencies || flowFile.flow.dependencies.length === 0) {
    log('✅ No dependencies to validate', 'green');
    return;
  }

  const allFlows = await fileManager.listFlows();
  const validator = new DependencyValidator();

  const dependencyMap = new Map(
    allFlows.map((f) => [f.id, f.flow.dependencies || []])
  );

  const validation = validator.validate(
    flowId,
    flowFile.flow.dependencies,
    dependencyMap,
    'flow'
  );

  if (validation.valid) {
    log('✅ Dependencies valid', 'green');
    log(`   Dependencies: ${flowFile.flow.dependencies.join(', ')}`, 'blue');
  } else {
    log('❌ Invalid dependencies', 'red');
    validation.errors.forEach((error) => {
      log(`   ${error}`, 'red');
    });
    process.exit(1);
  }
}

/**
 * Mark a run as reference for comparison
 */
export async function markReference(runId: string, flowId: string | undefined, projectRoot?: string): Promise<void> {
  const fileManager = new FileManager(projectRoot);
  const referenceManager = new ReferenceManager(path.join(projectRoot || process.cwd(), '.tsty'));

  // If no flowId provided, try to extract from runId
  let targetFlowId = flowId;

  if (!targetFlowId) {
    // Extract flow ID from run ID format: run-{flowId}-{timestamp}
    const match = runId.match(/^run-(.+)-\d+$/);
    if (match) {
      targetFlowId = match[1];
    } else {
      log('❌ Could not determine flow ID from run ID', 'red');
      log('   Usage: tsty mark-reference <run-id> --flow <flow-id>', 'yellow');
      process.exit(1);
    }
  }

  try {
    await referenceManager.markAsReference(runId, targetFlowId);
    log(`\n✅ Marked run as reference`, 'green');
    log(`   Run: ${runId}`, 'cyan');
    log(`   Flow: ${targetFlowId}`, 'cyan');
    log(`\n💡 Next steps:`, 'bright');
    log(`   1. Make code changes`, 'reset');
    log(`   2. Run: tsty run ${targetFlowId} --compare-to-reference`, 'cyan');
    log(`   3. View comparison in dashboard\n`, 'reset');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * Clear reference for a flow
 */
export async function clearReference(flowId: string, projectRoot?: string): Promise<void> {
  const referenceManager = new ReferenceManager(path.join(projectRoot || process.cwd(), '.tsty'));

  try {
    const currentRef = await referenceManager.getReference(flowId);

    if (!currentRef) {
      log(`\nℹ️  No reference set for flow: ${flowId}`, 'yellow');
      return;
    }

    await referenceManager.clearReference(flowId);
    log(`\n✅ Cleared reference for flow: ${flowId}`, 'green');
    log(`   Previous reference: ${currentRef}`, 'cyan');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * List all flows with references
 */
export async function listReferences(projectRoot?: string): Promise<void> {
  const referenceManager = new ReferenceManager(path.join(projectRoot || process.cwd(), '.tsty'));

  try {
    const references = await referenceManager.listAllReferences();

    if (references.length === 0) {
      log('\nℹ️  No references set', 'yellow');
      log('   Use: tsty mark-reference <run-id> --flow <flow-id>\n', 'cyan');
      return;
    }

    log(`\n📌 References (${references.length}):\n`, 'bright');
    references.forEach((ref) => {
      log(`  ${ref.flowId}`, 'cyan');
      log(`    Reference Run: ${ref.referenceRunId}`, 'reset');
      log(`    Device: ${ref.device}`, 'reset');
      if (ref.timestamp) {
        log(`    Captured: ${new Date(ref.timestamp).toLocaleString()}`, 'reset');
      }
      log('', 'reset');
    });
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * Fetch a GitHub issue
 */
export async function fetchIssue(issueNumber: number, repo?: string, projectRoot?: string): Promise<void> {
  const issueManager = new GitHubIssueManager(path.join(projectRoot || process.cwd(), '.tsty/issues'));

  try {
    // Check if gh CLI is available
    const hasGh = await issueManager.checkGhCLI();
    if (!hasGh) {
      log('\n❌ Error: GitHub CLI (gh) not found or not authenticated', 'red');
      log('   Install: https://cli.github.com/', 'yellow');
      log('   Authenticate: gh auth login\n', 'yellow');
      process.exit(1);
    }

    // Fetch issue
    await issueManager.fetchIssue(issueNumber, repo);

    // Success message is printed by the bash script
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * List all fetched issues
 */
export async function listIssues(projectRoot?: string): Promise<void> {
  const issueManager = new GitHubIssueManager(path.join(projectRoot || process.cwd(), '.tsty/issues'));

  try {
    const issues = await issueManager.listIssues();

    if (issues.length === 0) {
      log('\nℹ️  No issues fetched yet', 'yellow');
      log('   Use: tsty issue fetch <number> [--repo owner/repo]\n', 'cyan');
      return;
    }

    log(`\n📋 Fetched Issues (${issues.length}):\n`, 'bright');
    issues.forEach((issue) => {
      const statusColors = {
        pending: 'yellow',
        linked: 'blue',
        testing: 'cyan',
        fixed: 'green',
        failed: 'red',
      } as const;

      log(`  #${issue.number} - ${issue.title}`, 'cyan');
      log(`    State: ${issue.state}`, 'reset');
      log(`    Status: ${issue.status}`, statusColors[issue.status] || 'reset');
      log(`    Repository: ${issue.repository}`, 'reset');
      log(`    Fetched: ${new Date(issue.fetchedAt).toLocaleString()}`, 'reset');

      if (issue.linkedFlowId) {
        log(`    Linked to flow: ${issue.linkedFlowId}`, 'blue');
      }

      if (issue.labels && issue.labels.length > 0) {
        log(`    Labels: ${issue.labels.map(l => l.name).join(', ')}`, 'reset');
      }

      log('', 'reset');
    });
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * Link issue to flow
 */
export async function linkIssueToFlow(issueNumber: number, flowId: string, projectRoot?: string): Promise<void> {
  const issueManager = new GitHubIssueManager(path.join(projectRoot || process.cwd(), '.tsty/issues'));

  try {
    await issueManager.linkToFlow(issueNumber, flowId);
    log(`\n✅ Linked issue #${issueNumber} to flow: ${flowId}`, 'green');
    log(`   Status updated to: linked`, 'cyan');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * View issue details
 */
export async function viewIssue(issueNumber: number, projectRoot?: string): Promise<void> {
  const issueManager = new GitHubIssueManager(path.join(projectRoot || process.cwd(), '.tsty/issues'));

  try {
    const issue = await issueManager.getIssue(issueNumber);

    log(`\n📋 Issue #${issue.number}`, 'bright');
    log(`   ${issue.title}\n`, 'cyan');

    log('Details:', 'bright');
    log(`  State: ${issue.state}`, 'reset');
    log(`  Status: ${issue.status}`, 'reset');
    log(`  Repository: ${issue.repository}`, 'reset');
    log(`  URL: ${issue.url}`, 'blue');
    log(`  Created: ${new Date(issue.createdAt).toLocaleString()}`, 'reset');
    log(`  Updated: ${new Date(issue.updatedAt).toLocaleString()}`, 'reset');

    if (issue.labels && issue.labels.length > 0) {
      log(`  Labels: ${issue.labels.map(l => l.name).join(', ')}`, 'reset');
    }

    if (issue.linkedFlowId) {
      log(`\n  Linked Flow: ${issue.linkedFlowId}`, 'blue');
    }

    if (issue.referenceRunId) {
      log(`  Reference Run: ${issue.referenceRunId}`, 'cyan');
    }

    if (issue.body) {
      log('\nDescription:', 'bright');
      // Truncate body to first 500 chars
      const body = issue.body.length > 500
        ? issue.body.substring(0, 500) + '...'
        : issue.body;
      log(`  ${body}\n`, 'reset');
    }
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}

/**
 * Set reference run for issue
 */
export async function setIssueReference(issueNumber: number, runId: string, projectRoot?: string): Promise<void> {
  const issueManager = new GitHubIssueManager(path.join(projectRoot || process.cwd(), '.tsty/issues'));

  try {
    await issueManager.setReferenceRun(issueNumber, runId);

    log(`\n✅ Reference run set for issue #${issueNumber}`, 'green');
    log(`   Run ID: ${runId}`, 'cyan');
    log(`   Status: testing\n`, 'reset');
  } catch (error) {
    log(`\n❌ Error: ${(error as Error).message}`, 'red');
    process.exit(1);
  }
}
