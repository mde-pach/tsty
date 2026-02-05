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
          console.log('\x1b[33m   Usage: tsty run <flow-id> [--device mobile] [--fail-fast] [--no-monitor]\n\x1b[0m');
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

        await commands.runFlow(flowId, device, projectRoot, { failFast, monitorConsole });
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
