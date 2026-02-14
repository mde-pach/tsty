#!/usr/bin/env tsx

/**
 * CLI Runner - Executes commands using the shared command modules
 */

import * as commands from './commands';

const [command, ...args] = process.argv.slice(2);
const projectRoot = process.env.QA_PROJECT_ROOT || process.cwd();

async function main() {
  try {
    switch (command) {
      case 'init':
        await commands.initProject(projectRoot);
        console.log('');
        break;

      case 'run': {
        const flowId = args[0];
        if (!flowId) {
          console.error('\x1b[31m❌ Error: Missing flow ID\x1b[0m');
          console.log('\x1b[33m   Usage: tsty run <flow-id> [--device mobile] [--fail-fast] [--no-monitor] [--mark-reference] [--issue <number>]\n\x1b[0m');
          process.exit(1);
        }

        const deviceIndex = args.indexOf('--device');
        const device = deviceIndex !== -1 && args[deviceIndex + 1]
          ? args[deviceIndex + 1] as 'desktop' | 'mobile'
          : 'desktop';

        if (!['desktop', 'mobile'].includes(device)) {
          console.error(`\x1b[31m❌ Error: Invalid device "${device}"\x1b[0m`);
          console.log('\x1b[33m   Device must be "desktop" or "mobile"\n\x1b[0m');
          process.exit(1);
        }

        // Parse CLI flags
        const failFast = args.includes('--fail-fast');
        const monitorConsole = !args.includes('--no-monitor');
        const markReference = args.includes('--mark-reference');

        // Parse --issue flag for automatic issue linking
        const issueIndex = args.indexOf('--issue');
        const issueNumber = issueIndex !== -1 && args[issueIndex + 1]
          ? parseInt(args[issueIndex + 1])
          : undefined;

        if (issueIndex !== -1 && !issueNumber) {
          console.error('\x1b[31m❌ Error: --issue requires a valid issue number\x1b[0m');
          console.log('\x1b[33m   Usage: tsty run <flow-id> --issue <number>\n\x1b[0m');
          process.exit(1);
        }

        const runId = await commands.runFlow(flowId, device, projectRoot, { failFast, monitorConsole });

        // Mark as reference if requested
        if (markReference && runId) {
          await commands.markReference(runId, flowId, projectRoot);
        }

        // Auto-link and auto-set-reference for issue
        if (issueNumber && runId) {
          await commands.autoLinkIssue(issueNumber, flowId, runId, projectRoot);
        }
        break;
      }

      case 'list': {
        const type = args[0] || 'actions';  // Default to actions (user-created behaviors)
        if (type === 'flows') {
          await commands.listFlows(projectRoot);
        } else if (type === 'actions') {
          await commands.listActions(projectRoot);
        } else if (type === 'reports') {
          const flowId = args[1];
          await commands.listReports(flowId, projectRoot);
        } else {
          console.error(`\x1b[31m❌ Unknown list type: ${type}\x1b[0m`);
          console.log('\x1b[33m   Valid types: flows, actions, reports\n\x1b[0m');
          process.exit(1);
        }
        break;
      }

      case 'primitives': {
        const category = args[0];
        await commands.listPrimitives(category);
        console.log('');
        break;
      }

      case 'actions:playwright': {
        // Deprecated - redirect to primitives
        const category = args[0];
        await commands.listPlaywrightActions(category);
        console.log('');
        break;
      }

      case 'validate': {
        const flowId = args[0];
        if (!flowId) {
          console.error('\x1b[31m❌ Error: Missing flow ID\x1b[0m');
          console.log('\x1b[33m   Usage: tsty validate <flow-id>\n\x1b[0m');
          process.exit(1);
        }

        await commands.validateFlow(flowId, projectRoot);
        console.log('');
        break;
      }

      case 'mark-reference': {
        const runId = args[0];
        if (!runId) {
          console.error('\x1b[31m❌ Error: Missing run ID\x1b[0m');
          console.log('\x1b[33m   Usage: tsty mark-reference <run-id> [--flow <flow-id>]\n\x1b[0m');
          process.exit(1);
        }

        const flowIndex = args.indexOf('--flow');
        const flowId = flowIndex !== -1 ? args[flowIndex + 1] : undefined;

        await commands.markReference(runId, flowId, projectRoot);
        break;
      }

      case 'clear-reference': {
        const flowId = args[0];
        if (!flowId) {
          console.error('\x1b[31m❌ Error: Missing flow ID\x1b[0m');
          console.log('\x1b[33m   Usage: tsty clear-reference <flow-id>\n\x1b[0m');
          process.exit(1);
        }

        await commands.clearReference(flowId, projectRoot);
        break;
      }

      case 'list-references': {
        await commands.listReferences(projectRoot);
        break;
      }

      case 'analyze-screenshots': {
        const runId = args[0];
        if (!runId) {
          console.error('\x1b[31m❌ Error: Missing run ID\x1b[0m');
          console.log('\x1b[33m   Usage: tsty analyze-screenshots <run-id>\x1b[0m');
          console.log('\x1b[33m   Hint: Run "tsty list reports" to see available run IDs\n\x1b[0m');
          process.exit(1);
        }

        await commands.analyzeScreenshots(runId, projectRoot);
        break;
      }

      case 'compare-runs': {
        const beforeRun = args[0];
        const afterRun = args[1];

        if (!beforeRun || !afterRun) {
          console.error('\x1b[31m❌ Error: Missing run IDs\x1b[0m');
          console.log('\x1b[33m   Usage: tsty compare-runs <before-run-id> <after-run-id>\x1b[0m');
          console.log('\x1b[33m   Hint: Run "tsty list reports" to see available run IDs\n\x1b[0m');
          process.exit(1);
        }

        await commands.compareRuns(beforeRun, afterRun, projectRoot);
        break;
      }

      case 'issue': {
        const action = args[0];

        if (action === 'fetch') {
          const issueNumber = parseInt(args[1]);
          if (!issueNumber) {
            console.error('\x1b[31m❌ Error: Missing issue number\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue fetch <number> [--repo owner/repo]\n\x1b[0m');
            process.exit(1);
          }

          const repoIndex = args.indexOf('--repo');
          const repo = repoIndex !== -1 ? args[repoIndex + 1] : undefined;

          await commands.fetchIssue(issueNumber, repo, projectRoot);
        } else if (action === 'list') {
          await commands.listIssues(projectRoot);
        } else if (action === 'link') {
          const issueNumber = parseInt(args[1]);
          if (!issueNumber) {
            console.error('\x1b[31m❌ Error: Missing issue number\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue link <number> --flow <flow-id>\n\x1b[0m');
            process.exit(1);
          }

          const flowIndex = args.indexOf('--flow');
          const flowId = flowIndex !== -1 ? args[flowIndex + 1] : undefined;

          if (!flowId) {
            console.error('\x1b[31m❌ Error: Missing --flow parameter\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue link <number> --flow <flow-id>\n\x1b[0m');
            process.exit(1);
          }

          await commands.linkIssueToFlow(issueNumber, flowId, projectRoot);
        } else if (action === 'view') {
          const issueNumber = parseInt(args[1]);
          if (!issueNumber) {
            console.error('\x1b[31m❌ Error: Missing issue number\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue view <number>\n\x1b[0m');
            process.exit(1);
          }

          await commands.viewIssue(issueNumber, projectRoot);
        } else if (action === 'set-reference') {
          const issueNumber = parseInt(args[1]);
          if (!issueNumber) {
            console.error('\x1b[31m❌ Error: Missing issue number\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue set-reference <number> --run <run-id>\n\x1b[0m');
            process.exit(1);
          }

          const runIndex = args.indexOf('--run');
          const runId = runIndex !== -1 ? args[runIndex + 1] : undefined;

          if (!runId) {
            console.error('\x1b[31m❌ Error: Missing --run parameter\x1b[0m');
            console.log('\x1b[33m   Usage: tsty issue set-reference <number> --run <run-id>\n\x1b[0m');
            process.exit(1);
          }

          await commands.setIssueReference(issueNumber, runId, projectRoot);
        } else {
          console.error('\x1b[31m❌ Error: Unknown issue action\x1b[0m');
          console.log('\x1b[33m   Valid actions: fetch, list, link, view, set-reference\n\x1b[0m');
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`\x1b[31m❌ Unknown command: ${command}\x1b[0m`);
        console.log('\x1b[33m   Run "tsty --help" for usage information\n\x1b[0m');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n\x1b[31m❌ Error: ${(error as Error).message}\x1b[0m\n`);
    process.exit(1);
  }
}

main();
