# CLI Reference

Complete command-line interface reference for Tsty.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Commands](#core-commands)
4. [Flow Execution](#flow-execution)
5. [Listing Resources](#listing-resources)
6. [Validation](#validation)
7. [Dashboard Server](#dashboard-server)
8. [CLI Options](#cli-options)
9. [Use Cases](#use-cases)
10. [Exit Codes](#exit-codes)

---

## Overview

Tsty provides a comprehensive CLI for test automation, CI/CD integration, and autonomous iteration.

**Package**: `tsty` (installed from GitHub, not npm)

**Aliases**:
- `tsty` (primary)
- `qa` (alternative)

---

## Installation

This package is not published on npm. Install directly from GitHub:

### Global Installation (Recommended)

```bash
# With bun (recommended)
bun install -g https://github.com/mde-pach/tsty.git

# With npm
npm install -g https://github.com/mde-pach/tsty.git
```

**Usage**: `tsty <command>`

---

### Local Installation (Project Dependency)

```bash
# With bun
bun add -d https://github.com/mde-pach/tsty.git

# With npm
npm install --save-dev https://github.com/mde-pach/tsty.git
```

**Usage**: `npx tsty <command>` or `npx qa <command>`

---

## Core Commands

### `tsty init`

Initialize Tsty in current directory.

**Usage**:
```bash
tsty init
```

**What it does**:
- Creates `.tsty/` directory structure
- Generates default `config.json`
- Creates subdirectories: `actions/`, `flows/`, `reports/`, `screenshots/`
- Creates organization files: `folders.json`, `tags.json`, `collections.json`

**When to use**:
- Starting new project
- First time using Tsty
- After cloning repository

**Example**:
```bash
$ cd /path/to/my-project
$ tsty init
✓ Created .tsty directory
✓ Created config.json
✓ Created subdirectories
✓ Initialization complete
```

---

## Flow Execution

### `tsty run <flow-id>`

Execute a test flow.

**Basic usage**:
```bash
tsty run my-flow
```

**With options**:
```bash
tsty run my-flow --fail-fast
tsty run my-flow --device mobile
tsty run my-flow --device tablet --fail-fast
tsty run my-flow --no-monitor
```

**Arguments**:
- `<flow-id>` (required) - Flow ID (filename without `.json`)

**Options**:
| Flag | Description | Default |
|------|-------------|---------|
| `--fail-fast` | Stop on first failed step | false |
| `--no-monitor` | Disable console error monitoring | false (monitoring enabled) |
| `--device <type>` | Device type (desktop/tablet/mobile) | desktop |

---

### Flow Execution Examples

**Example 1: Basic run**
```bash
$ tsty run login-flow
Running flow: login-flow
Step 1/3: Load login page... ✓
Step 2/3: Fill credentials... ✓
Step 3/3: Submit form... ✓

✓ Flow completed successfully in 4.2s
Exit code: 0
```

**Example 2: Fail-fast mode**
```bash
$ tsty run checkout-flow --fail-fast
Running flow: checkout-flow (fail-fast enabled)
Step 1/5: Load products... ✓
Step 2/5: Add to cart... ✓
Step 3/5: Navigate to checkout... ✗

❌ STOPPING FLOW: Navigation failed - expected URL not reached
Reason: Expected /checkout, got /cart

✗ Flow stopped early at step 3/5
Exit code: 1
```

**Time saved**: 60-78% (stopped at step 3 instead of running all 5 steps)

---

**Example 3: Mobile device**
```bash
$ tsty run responsive-test --device mobile
Running flow: responsive-test (viewport: 375x667)
Step 1/2: Homepage... ✓
Step 2/2: Navigation menu... ✓

✓ Flow completed successfully in 3.1s
```

---

**Example 4: Multiple options**
```bash
$ tsty run e2e-flow --device tablet --fail-fast
Running flow: e2e-flow (tablet viewport, fail-fast enabled)
Step 1/8: Setup... ✓
Step 2/8: Login... ✓
Step 3/8: Dashboard... ✗

❌ STOPPING FLOW: Console errors detected on navigation
Console errors: 2
  - TypeError: Cannot read property 'map' of undefined
  - Failed to load resource: net::ERR_BLOCKED_BY_CLIENT

✗ Flow stopped early at step 3/8
Exit code: 1
```

---

## Listing Resources

### `tsty list` / `tsty list flows`

List all flows.

**Usage**:
```bash
tsty list
# or
tsty list flows
```

**Output**:
```
Available flows:
  ✓ login-flow (3 steps)
  ✓ checkout-flow (5 steps)
  ✗ registration-flow (4 steps)
  ✓ visual-audit (12 steps)

Total: 4 flows
```

---

### `tsty list actions`

List all reusable actions.

**Usage**:
```bash
tsty list actions
```

**Output**:
```
Available actions:
  auth/do-login
  auth/do-logout
  forms/fill-registration
  navigation/click-menu
  common/wait-for-load

Total: 5 actions
```

---

### `tsty list reports`

List all test reports.

**Usage**:
```bash
tsty list reports
```

**Output**:
```
Recent reports:
  flow-login-flow-1738843200000 (2026-02-06 10:00:00) ✓
  flow-checkout-flow-1738843100000 (2026-02-06 09:58:20) ✗
  flow-visual-audit-1738843000000 (2026-02-06 09:56:40) ✓

Total: 3 reports
```

---

### `tsty primitives`

List 48 framework-provided primitives (Playwright building blocks).

**Usage**:
```bash
# List all categories
tsty primitives

# List specific category
tsty primitives mouse
tsty primitives navigation
tsty primitives input
```

**Output** (all categories):
```
Playwright Actions (48 total):

Navigation (5):
  - goto
  - goBack
  - goForward
  - reload
  - setContent

Mouse (5):
  - click
  - dblclick
  - hover
  - dragAndDrop
  - tap

Input (8):
  - fill
  - type
  - press
  - check
  - uncheck
  - selectOption
  - setInputFiles
  - focus
  - blur

Waiting (6):
  - waitForLoadState
  - waitForTimeout
  - waitForSelector
  - waitForFunction
  - waitForURL
  - waitForEvent

Locators (7):
  - locator
  - getByRole
  - getByText
  - getByLabel
  - getByPlaceholder
  - getByAltText
  - getByTitle
  - getByTestId

Information (4):
  - content
  - title
  - url
  - viewportSize

Other (13):
  - screenshot
  - evaluate
  - evaluateHandle
  - dispatchEvent
  - setViewportSize
  - setExtraHTTPHeaders
  - bringToFront
  - close
  - pdf
  - pause
  - mouse
```

---

## Validation

### `tsty validate <flow-id>`

Validate flow dependencies and structure.

**Usage**:
```bash
tsty validate my-flow
```

**Checks**:
- Circular dependency detection
- Dependency depth (max 5 levels)
- Referenced actions exist
- Valid JSON structure
- Required fields present

**Example output** (valid):
```bash
$ tsty validate checkout-flow
✓ Flow structure valid
✓ Dependencies valid (2 dependencies)
✓ No circular dependencies
✓ All referenced actions exist
✓ Validation passed
```

**Example output** (invalid):
```bash
$ tsty validate broken-flow
✗ Circular dependency detected:
  broken-flow → setup-flow → broken-flow

✗ Referenced action not found: missing-action

✗ Validation failed
Exit code: 1
```

---

## Dashboard Server

### `tsty` / `tsty server`

Start dashboard web interface.

**Basic usage**:
```bash
tsty
# or
tsty server
```

**With options**:
```bash
tsty --port 3001
tsty --host 0.0.0.0 --port 4000
```

**Options**:
| Flag | Description | Default |
|------|-------------|---------|
| `--port <port>` | Server port | 4000 |
| `--host <host>` | Server host | localhost |

**Output**:
```bash
$ tsty
Starting Tsty dashboard...
Server running at http://localhost:4000
Press Ctrl+C to stop
```

**Opens in browser automatically**: http://localhost:4000

---

## CLI Options

### Global Options

Available for all commands:

| Option | Description |
|--------|-------------|
| `--help` | Show help |
| `--version` | Show version |
| `--verbose` | Verbose output |
| `--quiet` | Minimal output |

**Usage**:
```bash
tsty --help
tsty --version
tsty run my-flow --verbose
```

---

### Flow Execution Options

#### `--fail-fast`

Stop execution on first failed step.

**When to use**:
- ✅ During iteration (saves 60-78% time)
- ✅ CI/CD pipelines (fail fast on regression)
- ✅ Debugging failing tests
- ❌ When need complete test coverage report

**Example**:
```bash
# Without fail-fast: runs all 9 steps even if step 2 fails (60s)
tsty run my-flow

# With fail-fast: stops at step 2 (15s)
tsty run my-flow --fail-fast
```

**Time savings**: 60-78% per iteration

---

#### `--no-monitor`

Disable console error monitoring.

**Default behavior** (monitoring enabled):
- Captures all console messages
- Counts errors per step
- Stops flow if console errors on navigation (with fail-fast)

**With `--no-monitor`**:
- Still captures console logs
- Doesn't stop on console errors
- Use when many false-positive warnings

**Example**:
```bash
# Normal (stops on console errors with fail-fast)
tsty run my-flow --fail-fast

# Ignore console errors
tsty run my-flow --fail-fast --no-monitor
```

---

#### `--device <type>`

Override viewport size.

**Available devices**:
- `desktop` (1920x1080)
- `tablet` (768x1024)
- `mobile` (375x667)

**Custom viewports**: Define in `.tsty/config.json`

**Example**:
```bash
# Desktop (default)
tsty run my-flow

# Mobile
tsty run my-flow --device mobile

# Tablet
tsty run my-flow --device tablet
```

**Use for**: Responsive testing

---

## Use Cases

### Use Case 1: CI/CD Integration

**Goal**: Run tests in GitHub Actions

**Workflow**:
```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Start app
        run: npm start &

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: |
          npx qa run smoke-tests --fail-fast
          npx qa run critical-flows --fail-fast

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: .tsty/screenshots/
```

**Benefits**:
- Automated testing on every commit
- Fast failure with `--fail-fast`
- Screenshot artifacts on failure

---

### Use Case 2: Pre-Commit Hook

**Goal**: Run tests before committing code

**Setup**:
```bash
# .husky/pre-commit
#!/bin/sh
npx qa run smoke-tests --fail-fast || exit 1
```

**Benefits**:
- Catch bugs before pushing
- Fast feedback with fail-fast
- Prevents broken commits

---

### Use Case 3: Autonomous Iteration

**Goal**: Iterate on failing tests until passing

**Script**:
```bash
#!/bin/bash
# iterate-until-passing.sh

while true; do
  echo "Running test..."
  npx qa run my-flow --fail-fast

  if [ $? -eq 0 ]; then
    echo "✓ Tests passing!"
    break
  fi

  echo "✗ Tests failed, analyzing..."

  # Analyze report
  REPORT=$(ls -t .tsty/reports/flow-my-flow-*.json | head -1)
  cat $REPORT | jq '.error'

  # Analyze screenshots
  SCREENSHOTS=$(ls -t .tsty/screenshots/run-my-flow-* | head -1)
  ls -la $SCREENSHOTS

  echo "Fix issues and press Enter to re-run..."
  read
done
```

**Benefits**:
- Automated iteration loop
- Quick feedback
- Systematic fixing

---

### Use Case 4: Multi-Device Testing

**Goal**: Test responsive design across devices

**Script**:
```bash
#!/bin/bash
# test-responsive.sh

DEVICES=("desktop" "tablet" "mobile")

for DEVICE in "${DEVICES[@]}"; do
  echo "Testing on $DEVICE..."
  npx qa run responsive-test --device $DEVICE

  if [ $? -ne 0 ]; then
    echo "✗ Failed on $DEVICE"
    exit 1
  fi
done

echo "✓ All devices passed!"
```

**Benefits**:
- Comprehensive responsive testing
- Automated across all viewports
- Early detection of layout issues

---

### Use Case 5: Parallel Test Execution

**Goal**: Run multiple flows in parallel

**Script**:
```bash
#!/bin/bash
# run-parallel.sh

npx qa run login-flow --fail-fast &
npx qa run checkout-flow --fail-fast &
npx qa run search-flow --fail-fast &

wait

echo "All tests completed"
```

**Benefits**:
- Faster total execution time
- Parallel CI/CD jobs
- Efficient resource usage

---

## Exit Codes

### Success Codes

| Code | Meaning |
|------|---------|
| `0` | All tests passed |

### Error Codes

| Code | Meaning |
|------|---------|
| `1` | Test failed |
| `2` | Configuration error |
| `3` | Validation error |
| `4` | File not found |

**Check exit code**:
```bash
npx qa run my-flow
echo $?  # 0 = success, 1 = failure
```

**In scripts**:
```bash
if npx qa run my-flow --fail-fast; then
  echo "Tests passed"
else
  echo "Tests failed"
  exit 1
fi
```

---

## Command Examples

### Quick Reference

```bash
# Initialize
tsty init

# Run flow
tsty run my-flow
tsty run my-flow --fail-fast
tsty run my-flow --device mobile --fail-fast
tsty run my-flow --no-monitor

# List resources
tsty list
tsty list actions
tsty list reports
tsty primitives

# Validate
tsty validate my-flow

# Start dashboard
tsty
tsty --port 3001

# Help
tsty --help
tsty run --help
```

---

## Performance Tips

### 1. Always Use Fail-Fast During Iteration

❌ **Slow**:
```bash
tsty run my-flow
# Runs all 9 steps even if step 2 fails
# Time: 60 seconds
```

✅ **Fast**:
```bash
tsty run my-flow --fail-fast
# Stops at step 2 failure
# Time: 15 seconds (75% faster)
```

### 2. Run Only Changed Tests

```bash
# Instead of running all tests
npx qa run full-suite

# Run specific test
npx qa run login-flow --fail-fast
```

### 3. Use Parallel Execution

```bash
# Run in parallel (faster)
npx qa run test1 --fail-fast &
npx qa run test2 --fail-fast &
wait

# Instead of sequential (slower)
npx qa run test1 --fail-fast
npx qa run test2 --fail-fast
```

---

## Troubleshooting

### Command Not Found

**Problem**: `tsty: command not found`

**Solution**:
```bash
# Check if installed globally
npm list -g tsty

# If not, install from GitHub
bun install -g https://github.com/mde-pach/tsty.git
# or
npm install -g https://github.com/mde-pach/tsty.git
```

---

### Configuration Not Found

**Problem**: `No configuration file found`

**Solution**:
```bash
# Initialize first
tsty init

# Verify config exists
cat .tsty/config.json

# Check you're in correct directory
pwd
```

---

### Flow Not Found

**Problem**: `Flow 'my-flow' not found`

**Solution**:
```bash
# List available flows
tsty list

# Check file exists
ls -la .tsty/flows/

# Verify filename matches (without .json)
# File: .tsty/flows/my-flow.json
# Command: tsty run my-flow
```

---

### Port Already In Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port
tsty --port 3001
```

---

## Cross-References

- **Flow Structure**: See [FLOW-STRUCTURE.md](FLOW-STRUCTURE.md) for JSON format
- **Dashboard**: See [DASHBOARD.md](DASHBOARD.md) for web interface
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for complete scenarios
- **Fail-Fast**: See [FAIL-FAST-GUIDE.md](FAIL-FAST-GUIDE.md) for detailed guide
- **Config**: See [CONFIG.md](CONFIG.md) for configuration options

---

**Last Updated**: 2026-02-06
