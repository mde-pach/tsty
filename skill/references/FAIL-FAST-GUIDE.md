# Fail-Fast Mode & Console Monitoring Guide

Comprehensive guide to fail-fast mode and console error monitoring in Tsty.

---

## Table of Contents

1. [Overview](#overview)
2. [Fail-Fast Mode](#fail-fast-mode)
3. [Console Monitoring](#console-monitoring)
4. [Configuration](#configuration)
5. [How It Works](#how-it-works)
6. [When to Use](#when-to-use)
7. [Performance Impact](#performance-impact)
8. [Examples](#examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Fail-fast mode and console monitoring are intelligent test execution features that:
- **Stop tests early** when critical failures occur
- **Catch JavaScript errors** immediately
- **Save time** by not running remaining steps after root cause failure
- **Provide clear error context** for faster debugging

**Key benefits**:
- ⚡ **60-78% faster** iteration cycles
- 🐛 **Immediate error detection** (don't wait for full flow)
- 🎯 **Clear failure root cause** (no cascading errors)
- 💰 **Cost savings** in CI/CD (less compute time)

---

## Fail-Immediately Pattern (CRITICAL)

**Always use this pattern for fastest debugging.**

### Core Concept

**OLD WAY (slow):**
```
Run all 9 steps → Wait 90s → See 8 failures → Find 1 root cause → Fix → Repeat
```

**NEW WAY (fast):**
```
Run step 1 → Console error → STOP at 15s → Fix → Re-run → Success
```

### How to Enable

**Always use both flags together:**

```json
{
  "failFast": true,          // Stop on first failure
  "monitorConsole": true     // Check console errors on navigation
}
```

**Or via CLI:**
```bash
tsty run my-flow --fail-fast
```

### What Happens

#### On Navigation Steps (with monitorConsole: true)

```
1. Navigate to URL
2. Wait for page load
3. Check console for errors
4. ❌ If consoleErrors > 0:
   - STOP immediately
   - Set stopReason: "Console errors detected on navigation step"
   - Exit with failure (exit code 1)
5. ✅ If no errors:
   - Continue to next step
```

#### On Action Steps

```
1. Execute primitives/actions
2. Check step success
3. ❌ If step failed:
   - STOP immediately
   - Set stopReason: "Step failed - [error message]"
   - Exit with failure
4. ✅ If step passed:
   - Continue to next step
```

### Real-World Comparison

**Before (without fail-fast + monitorConsole):**

```bash
tsty run action-creation-flow

Step 1: Load /actions → JS error (ignored) → 5s
Step 2: Click button → Fails (page crashed) → 15s
Step 3: Fill name → Fails (page crashed) → 15s
Step 4: Fill desc → Fails (page crashed) → 15s
Step 5: Click save → Fails (page crashed) → 15s
Step 6: Verify → Fails (page crashed) → 15s

Total: 80 seconds
Result: 5 failures, 1 root cause (JS error in step 1)
```

**After (with fail-fast + monitorConsole):**

```bash
tsty run action-creation-flow --fail-fast

Step 1: Load /actions → JS error detected → STOP

❌ STOPPING FLOW
stopReason: "Console errors detected on navigation step"
consoleErrors: 1
Error: Uncaught TypeError: Cannot read property 'length' of undefined

Total: 15 seconds
Result: 1 failure, 1 root cause (JS error in step 1)
```

**Time saved: 65 seconds (81% faster)**

### Checking Stop Reason

**Always read `stopReason` in report:**

```json
{
  "success": false,
  "stoppedEarly": true,
  "stopReason": "Console errors detected on navigation step",
  "steps": [
    {
      "stepIndex": 0,
      "stepName": "Load actions page",
      "success": false,
      "consoleErrors": 1,
      "console": [
        {
          "type": "error",
          "text": "Uncaught TypeError: Cannot read property 'length' of undefined",
          "location": "app.js:123:45",
          "timestamp": "2026-02-06T10:00:00.123Z"
        }
      ]
    }
  ]
}
```

**Next action:**
1. Read error message
2. Fix code bug at app.js:123
3. Re-run flow
4. Verify error is gone

### When to Use Fail-Immediately

**✅ ALWAYS use for:**
- Development (iterate fast)
- Debugging (find root cause)
- CI/CD pipelines (fail fast on regression)
- New flows (catch errors early)

**❌ RARELY skip for:**
- You need to see ALL failures in one run
- Testing multiple independent features
- Want complete test coverage report

**Default recommendation: Always enabled**

---

## Fail-Fast Mode

### What is Fail-Fast?

Fail-fast stops flow execution immediately when a step fails, instead of continuing with remaining steps.

**Without fail-fast** (default behavior):
```
Step 1: Load page → ✓ (5s)
Step 2: Click button → ✗ (15s timeout)
Step 3: Fill form → ✗ (15s timeout) [dependent on step 2]
Step 4: Submit → ✗ (15s timeout) [dependent on step 2]
Step 5: Verify → ✗ (15s timeout) [dependent on step 2]

Total: 65 seconds, 4 meaningless failures
```

**With fail-fast**:
```
Step 1: Load page → ✓ (5s)
Step 2: Click button → ✗ (15s timeout)

❌ STOPPING FLOW: Step failed - button selector not found
Total: 20 seconds, clear root cause
```

**Time saved**: 45 seconds (69% faster)

---

### Stop Conditions

Fail-fast stops execution when:

1. **Step fails** - Primitives/actions/assertions failed
2. **Navigation fails** - Didn't reach `expectedUrl`
3. **Console errors on navigation** - JavaScript errors detected (with `monitorConsole: true`)
4. **Any critical failure** - Framework error, timeout, etc.

---

### Enabling Fail-Fast

#### Method 1: CLI Flag (Overrides Flow Config)

```bash
# Enable for single run
tsty run my-flow --fail-fast

# Combine with other options
tsty run my-flow --fail-fast --device mobile
```

**Use case**: Quick testing without modifying flow JSON

---

#### Method 2: Flow Configuration

```json
{
  "name": "My Flow",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "steps": [...]
}
```

**Use case**: Permanent fail-fast for this flow (e.g., critical tests)

---

### Report Format

When flow stops early, report includes:

```json
{
  "flowId": "my-flow",
  "success": false,
  "stoppedEarly": true,
  "stopReason": "Navigation failed - expected URL not reached",
  "steps": [
    {
      "stepIndex": 0,
      "success": true
    },
    {
      "stepIndex": 1,
      "success": false,
      "navigationFailed": true,
      "error": "Expected /dashboard but got /login"
    }
    // Steps 2-8 were skipped
  ]
}
```

**Fields**:
- `stoppedEarly: true` - Flow stopped before completing all steps
- `stopReason` - Why the flow stopped (human-readable)
- `navigationFailed` - Navigation didn't reach expectedUrl (if applicable)

---

## Console Monitoring

### What is Console Monitoring?

Console monitoring captures and analyzes browser console messages (errors, warnings, logs) during test execution.

**Key feature**: On navigation steps, stops flow if console errors detected (when combined with fail-fast).

---

### How It Works

**Always happens** (not conditional):
1. Every step captures console messages
2. Messages stored in `steps[].console` array
3. Errors counted in `steps[].consoleErrors`
4. On navigation steps: checks if `consoleErrors > 0`
5. If errors found: stops flow (with fail-fast + monitorConsole enabled)

**Console message structure**:
```json
{
  "type": "error | warning | info | log",
  "text": "Error message text",
  "timestamp": "2026-02-06T10:00:00.000Z"
}
```

---

### Why Console Monitoring Matters

**Problem**: JavaScript errors break page functionality, but tests continue running.

**Without console monitoring**:
```
Step 1: Load page → JS error (ignored) → continues
Step 2: Click button → fails (page broken)
Step 3: Fill form → fails (page broken)
Step 4: Submit → fails (page broken)
...
Step 9: Finally reports all failures

Total: 60+ seconds wasted on meaningless tests
```

**With console monitoring + fail-fast**:
```
Step 1: Load page → JS error detected → STOP

❌ STOPPING FLOW: Console errors detected on navigation
Console errors: 1
  - TypeError: Cannot read property 'map' of undefined

Total: 10 seconds → fix error → re-run
```

**Time saved**: 50+ seconds per iteration

---

### Console Error Types

#### JavaScript Errors (Must Fix)

```
TypeError: Cannot read property 'x' of undefined
ReferenceError: variableName is not defined
SyntaxError: Unexpected token
```

**Action**: Fix application code

---

#### Network Errors

```
Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
Failed to load resource: net::ERR_CONNECTION_REFUSED
404 Not Found: /api/endpoint
500 Internal Server Error
```

**Action**: Fix API endpoints or update URLs

---

#### React/Framework Warnings

```
Warning: Each child in a list should have a unique "key" prop
Warning: Cannot update a component while rendering
Warning: validateDOMNesting
```

**Action**: Improve code quality (optional if tests pass)

---

### Disabling Console Monitoring

**Method 1: CLI Flag**

```bash
tsty run my-flow --no-monitor
```

**Method 2: Flow Configuration**

```json
{
  "name": "My Flow",
  "monitorConsole": false,
  "steps": [...]
}
```

**When to disable**:
- Many false-positive warnings
- Testing third-party sites with uncontrollable console output
- Console errors expected (testing error handling)

**Note**: Console logs still captured, just won't stop flow

---

## Configuration

### Recommended Defaults (Iteration)

For fast iteration during development:

```json
{
  "name": "Development Flow",
  "failFast": true,
  "monitorConsole": true,
  "steps": [...]
}
```

**Run**:
```bash
tsty run dev-flow
# Or explicitly
tsty run dev-flow --fail-fast
```

**Benefits**:
- Stop at first failure (60-78% time savings)
- Catch JS errors immediately
- Fast feedback loop
- Clear root cause

---

### CI/CD Configuration

For CI/CD pipelines:

```json
{
  "name": "CI Flow",
  "failFast": true,
  "monitorConsole": true,
  "steps": [...]
}
```

**Run in CI**:
```bash
npx qa run ci-flow --fail-fast
```

**Benefits**:
- Fast failure (don't waste CI minutes)
- Early detection of regressions
- Clear failure reports
- Cost savings (less compute time)

---

### Complete Test Coverage

When need full test coverage report:

```json
{
  "name": "Full Coverage Flow",
  "failFast": false,
  "monitorConsole": true,
  "steps": [...]
}
```

**Run**:
```bash
tsty run full-coverage
```

**Benefits**:
- See all failures in one run
- Complete test coverage report
- Identify all issues at once

**Trade-off**: Slower (no early stopping)

---

## How It Works

### Execution Flow with Fail-Fast

```
┌─────────────────────────────────────────────┐
│ Start Flow                                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Execute Step N                              │
│ - Run primitives/actions                    │
│ - Capture console logs                      │
│ - Take screenshot (if requested)            │
│ - Run assertions                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Check if failed │
        └────┬────────┬───┘
             │        │
            NO       YES
             │        │
             ▼        ▼
    ┌────────────┐  ┌──────────────────────┐
    │ Continue   │  │ Fail-fast enabled?   │
    │ to next    │  └────┬────────────┬────┘
    │ step       │       │           │
    └────────────┘      YES          NO
                        │            │
                        ▼            ▼
           ┌───────────────────┐  ┌──────────────┐
           │ STOP FLOW         │  │ Continue to  │
           │ - Set stoppedEarly│  │ next step    │
           │ - Set stopReason  │  └──────────────┘
           │ - Skip remaining  │
           └───────────────────┘
```

---

### Console Monitoring Flow

```
┌─────────────────────────────────────────────┐
│ Navigation Step with URL                    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Navigate to URL                             │
│ - Goto page                                 │
│ - Wait for load state                       │
│ - Capture console messages                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │ Console errors > 0?  │
        └────┬───────────┬─────┘
             │           │
            NO          YES
             │           │
             ▼           ▼
    ┌────────────┐  ┌──────────────────────┐
    │ Continue   │  │ monitorConsole=true? │
    └────────────┘  └────┬────────────┬────┘
                         │            │
                        YES          NO
                         │            │
                         ▼            ▼
           ┌───────────────────┐  ┌──────────────┐
           │ Check fail-fast   │  │ Continue     │
           └────┬─────────┬────┘  └──────────────┘
                │         │
               YES       NO
                │         │
                ▼         ▼
    ┌───────────────┐  ┌──────────────┐
    │ STOP FLOW     │  │ Continue     │
    │ (console err) │  │ (log warning)│
    └───────────────┘  └──────────────┘
```

---

## When to Use

### ✅ Use Fail-Fast When

| Scenario | Reason |
|----------|--------|
| **Development iteration** | Stop at root cause, fix, re-run quickly |
| **Debugging failing tests** | Find exact failure point without noise |
| **CI/CD pipelines** | Fail fast on regression, save compute time |
| **Quick smoke tests** | Fast validation of critical paths |
| **Time-constrained testing** | Get results quickly during dev |

---

### ❌ Don't Use Fail-Fast When

| Scenario | Reason |
|----------|--------|
| **Complete test coverage** | Need to see all failures in one run |
| **Testing independent features** | Each step tests unrelated functionality |
| **Debugging multiple issues** | Want to identify all problems at once |
| **Test suite analysis** | Building comprehensive test report |

---

### ✅ Use Console Monitoring When

| Scenario | Reason |
|----------|--------|
| **Testing own application** | Catch JS bugs immediately |
| **Development** | Early detection of code errors |
| **Clean console expected** | Page should load without errors |
| **Fast iteration** | Don't waste time on broken pages |

---

### ❌ Disable Console Monitoring When

| Scenario | Reason |
|----------|--------|
| **Third-party sites** | Can't control their console output |
| **Many false positives** | Warnings that don't affect functionality |
| **Testing error handling** | Console errors are expected |
| **Legacy applications** | Known console warnings |

---

## Performance Impact

### Time Savings: Real Examples

#### Example 1: 9-Step E2E Flow

**Without fail-fast** (step 2 fails):
```
Step 1: Load page (5s) ✓
Step 2: Click button (15s timeout) ✗
Step 3: Fill form (15s timeout) ✗
Step 4: Click next (15s timeout) ✗
Step 5: Fill more (15s timeout) ✗
Step 6: Submit (15s timeout) ✗
Step 7: Wait (15s timeout) ✗
Step 8: Verify (15s timeout) ✗
Step 9: Check (5s) ✗

Total: 115 seconds
```

**With fail-fast**:
```
Step 1: Load page (5s) ✓
Step 2: Click button (15s timeout) ✗

❌ STOPPING FLOW

Total: 20 seconds
Time saved: 95 seconds (82% faster)
```

---

#### Example 2: Console Error on Step 1

**Without console monitoring**:
```
Step 1: Load page → JS error (ignored) (5s) ✓
Step 2: Click button (15s timeout) ✗
Step 3: Fill form (15s timeout) ✗
Step 4: Submit (15s timeout) ✗

Total: 50 seconds
```

**With console monitoring + fail-fast**:
```
Step 1: Load page → JS error detected (5s) ✗

❌ STOPPING FLOW: Console errors detected

Total: 5 seconds
Time saved: 45 seconds (90% faster)
```

---

### CI/CD Cost Savings

**Scenario**: 100 test runs per day, 50% fail at step 2

**Without fail-fast**:
- Failed run: 115 seconds
- 50 failed runs/day = 5,750 seconds = 96 minutes
- CI cost: ~$10/day (GitHub Actions)

**With fail-fast**:
- Failed run: 20 seconds
- 50 failed runs/day = 1,000 seconds = 17 minutes
- CI cost: ~$2/day

**Savings**: $8/day = $240/month = $2,880/year

---

## Examples

### Example 1: Basic Fail-Fast

**Flow**: `.tsty/flows/login.json`

```json
{
  "name": "Login Flow",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "steps": [
    {
      "name": "Load login page",
      "url": "/login",
      "expectedUrl": "/login"
    },
    {
      "name": "Fill credentials",
      "actions": ["fill-email", "fill-password"]
    },
    {
      "name": "Submit",
      "actions": ["click-submit"],
      "expectedUrl": "/dashboard"
    }
  ]
}
```

**Run**:
```bash
tsty run login --fail-fast
```

**If step 2 fails**:
```
Step 1/3: Load login page... ✓
Step 2/3: Fill credentials... ✗

❌ STOPPING FLOW: Action execution failed
Error: Element not found: input[name='email']

✗ Flow stopped early at step 2/3
Exit code: 1
```

---

### Example 2: Console Monitoring

**Flow**: `.tsty/flows/dashboard.json`

```json
{
  "name": "Dashboard Test",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "monitorConsole": true,
  "steps": [
    {
      "name": "Load dashboard",
      "url": "/dashboard",
      "expectedUrl": "/dashboard",
      "capture": { "screenshot": true }
    },
    {
      "name": "Check widgets",
      "assertions": [
        { "type": "visible", "selector": ".widget" }
      ]
    }
  ]
}
```

**Run**:
```bash
tsty run dashboard
```

**If JS error on step 1**:
```
Step 1/2: Load dashboard... ✗

❌ STOPPING FLOW: Console errors detected on navigation

Console errors (2):
  1. TypeError: Cannot read property 'map' of undefined
     at Dashboard.tsx:45:12
  2. Failed to load resource: net::ERR_BLOCKED_BY_CLIENT
     /api/widgets

✗ Flow stopped early at step 1/2
Exit code: 1
```

---

### Example 3: Selective Fail-Fast

**Flow**: `.tsty/flows/mixed.json`

```json
{
  "name": "Mixed Flow",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "monitorConsole": false,
  "steps": [
    {
      "name": "Critical step",
      "url": "/"
    },
    {
      "name": "Optional step",
      "url": "/optional"
    }
  ]
}
```

**Run with override**:
```bash
# Enable console monitoring for this run
tsty run mixed --fail-fast
# (monitorConsole=false in flow, so console errors ignored)

# Or disable fail-fast
tsty run mixed
# (runs all steps even if one fails)
```

---

## Best Practices

### 1. Use Fail-Fast by Default During Development

✅ **DO**:
```json
{
  "name": "Dev Flow",
  "failFast": true,
  "monitorConsole": true
}
```

**Run**:
```bash
tsty run dev-flow --fail-fast
```

---

### 2. Disable for Complete Coverage Reports

✅ **DO**:
```json
{
  "name": "Coverage Flow",
  "failFast": false,
  "monitorConsole": true
}
```

**When**: Weekly/monthly comprehensive test runs

---

### 3. Always Monitor Console During Development

✅ **DO**: Keep `monitorConsole: true` to catch JS bugs early

❌ **DON'T**: Disable unless absolutely necessary

---

### 4. Use CLI Flags for One-Off Overrides

✅ **DO**:
```bash
# Override flow config for single run
tsty run my-flow --fail-fast
tsty run my-flow --no-monitor
```

**Instead of**: Editing flow JSON for temporary changes

---

### 5. Fix Console Errors Immediately

✅ **DO**:
```
1. Run test
2. Console error detected → STOP
3. Fix JS error in code
4. Re-run test
5. Repeat until clean console
```

❌ **DON'T**: Ignore console errors and disable monitoring

---

## Troubleshooting

### Issue 1: Flow Stops Too Early

**Symptom**: Flow stops at step that should pass

**Possible causes**:
1. Console warnings treated as errors
2. Expected URL mismatch
3. Assertion too strict

**Solution**:
```bash
# Run without fail-fast to see all steps
tsty run my-flow

# Check report for actual error
cat .tsty/reports/flow-my-flow-*.json | jq '.stopReason'

# Disable console monitoring if false positives
tsty run my-flow --fail-fast --no-monitor
```

---

### Issue 2: Flow Doesn't Stop on Failure

**Symptom**: Flow continues even after obvious failure

**Possible causes**:
1. Fail-fast not enabled
2. Failure not detected (soft failure)

**Solution**:
```bash
# Explicitly enable fail-fast
tsty run my-flow --fail-fast

# Or update flow JSON
{
  "failFast": true
}
```

---

### Issue 3: Console Errors Not Detected

**Symptom**: JS errors in browser but flow doesn't stop

**Possible causes**:
1. Console monitoring disabled
2. Errors not on navigation step
3. Errors occur after step completes

**Solution**:
```json
{
  "monitorConsole": true,
  "steps": [
    {
      "name": "Step with potential errors",
      "url": "/page",
      "primitives": [
        { "type": "goto", "url": "/page" },
        { "type": "waitForLoadState", "options": { "state": "networkidle" } }
      ]
    }
  ]
}
```

**Ensure**: Wait for page to fully load before checking console

---

## Cross-References

- **Flow Structure**: See [FLOW-STRUCTURE.md](FLOW-STRUCTURE.md) for complete JSON schema
- **CLI Reference**: See [CLI-REFERENCE.md](CLI-REFERENCE.md) for all commands
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for real-world scenarios
- **Config**: See [CONFIG.md](CONFIG.md) for configuration options

---

**Last Updated**: 2026-02-06
