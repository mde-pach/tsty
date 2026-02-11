#!/usr/bin/env node

/**
 * Tsty CLI
 * Main entry point for all CLI commands
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printBanner() {
  log('\n╔═══════════════════════════════════════════╗', 'cyan');
  log('║                                           ║', 'cyan');
  log('║         🧪 Tsty CLI               ║', 'cyan');
  log('║                                           ║', 'cyan');
  log('╚═══════════════════════════════════════════╝\n', 'cyan');
}

function showHelp() {
  printBanner();
  log('Usage:', 'bright');
  log('  tsty [command] [options]\n', 'reset');

  log('Commands:', 'bright');
  log('  init                 Initialize .tsty directory', 'reset');
  log('  run <flow-id>        Run a specific flow', 'reset');
  log('  list [actions]       List user-created actions', 'reset');
  log('  list flows           List flows', 'reset');
  log('  list reports         List test reports', 'reset');
  log('  primitives [cat]     List available primitives (48 building blocks)', 'reset');
  log('  validate <flow-id>   Validate flow dependencies', 'reset');
  log('  server               Start the dashboard server (default)', 'reset');
  log('  --help, -h           Show this help message\n', 'reset');

  log('Primitives vs Actions:', 'bright');
  log('  Primitives = Building blocks (click, fill, type) - framework-provided', 'cyan');
  log('  Actions    = User behaviors (login, checkout) - you create these\n', 'green');

  log('Examples:', 'bright');
  log('  tsty init', 'cyan');
  log('  tsty run checkout-flow', 'cyan');
  log('  tsty run checkout-flow --device mobile', 'cyan');
  log('  tsty list actions              # Show user-created actions', 'cyan');
  log('  tsty primitives                # Show 48 primitives', 'cyan');
  log('  tsty primitives mouse          # Show mouse primitives', 'cyan');
  log('  tsty validate checkout-flow', 'cyan');
  log('  tsty server --port 3000\n', 'cyan');

  log('Options:', 'bright');
  log('  --device <type>      Device type for run command (desktop|mobile)', 'reset');
  log('  --fail-fast          Stop flow execution on first failed step', 'reset');
  log('  --no-monitor         Disable console error monitoring', 'reset');
  log('  --port <port>        Port for server (default: 4000)', 'reset');
  log('  --host <host>        Host for server (default: localhost)\n', 'reset');
}

function execTsxCommand(scriptPath, args) {
  const frameworkDir = path.resolve(__dirname, '..');
  const tsxBin = path.join(frameworkDir, 'node_modules', '.bin', 'tsx');

  const result = spawnSync(tsxBin, [scriptPath, ...args], {
    stdio: 'inherit',
    env: { ...process.env, QA_PROJECT_ROOT: process.cwd() },
  });

  if (result.error) {
    log(`❌ Failed to execute command: ${result.error.message}`, 'red');
    process.exit(1);
  }

  process.exit(result.status || 0);
}

function startServer(args) {
  printBanner();

  const port = args.includes('--port') ? args[args.indexOf('--port') + 1] : '4000';
  const host = args.includes('--host') ? args[args.indexOf('--host') + 1] : 'localhost';

  const frameworkDir = path.resolve(__dirname, '..');

  log(`🚀 Starting Tsty server...`, 'green');
  log(`   URL: http://${host}:${port}\n`, 'cyan');

  // Determine which package manager to use
  const packageManager = process.env.npm_execpath?.includes('bun') ? 'bun' : 'npm';
  const runCommand = packageManager === 'bun' ? 'bun' : 'npx';

  // Start Next.js dev server
  const nextProcess = spawn(
    runCommand,
    ['next', 'dev', '-p', port, '-H', host],
    {
      cwd: frameworkDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        QA_PROJECT_ROOT: process.cwd(),
      },
    }
  );

  nextProcess.on('error', (error) => {
    log(`❌ Failed to start server: ${error.message}`, 'red');
    process.exit(1);
  });

  nextProcess.on('exit', (code) => {
    if (code !== 0) {
      log(`\n❌ Server exited with code ${code}`, 'red');
    } else {
      log('\n👋 Tsty stopped', 'blue');
    }
    process.exit(code || 0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    log('\n\n⏹️  Stopping Tsty...', 'yellow');
    nextProcess.kill('SIGINT');
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
  });
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Handle help
  if (command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Default to server if no command
  if (!command) {
    startServer(args);
    return;
  }

  // Handle server command
  if (command === 'server') {
    startServer(args.slice(1));
    return;
  }

  // Run other commands via tsx
  const frameworkDir = path.resolve(__dirname, '..');
  const commandScript = path.join(frameworkDir, 'src/cli/runner.ts');
  execTsxCommand(commandScript, [command, ...args.slice(1)]);
}

main();
