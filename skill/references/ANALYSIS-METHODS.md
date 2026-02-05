# Analysis Methods - Complete Guide

**Load this after EVERY test run to analyze results comprehensively.**

This guide covers the four primary analysis methods:
1. Report Analysis (JSON)
2. Screenshot Analysis (PNG)
3. Console Log Analysis (from report)
4. Assertion Analysis (from report)

---

## Table of Contents

1. [Report Analysis](#1-report-analysis)
2. [Screenshot Analysis](#2-screenshot-analysis)
3. [Console Log Analysis](#3-console-log-analysis)
4. [Assertion Analysis](#4-assertion-analysis)
5. [Quick Error Reference](#quick-error-reference-table)

---

## 1. Report Analysis

**Read:** `.tsty/reports/flow-{id}-{timestamp}.json`

### Report Structure

```json
{
  "flowId": "my-test",
  "flowName": "My Test Flow",
  "success": false,  // ← Main indicator
  "error": "Step 2 failed: Timeout 30000ms exceeded",  // ← Root cause
  "stoppedEarly": true,  // ← Flow stopped via fail-fast
  "stopReason": "Navigation failed - expected URL not reached",  // ← Why stopped
  "startTime": "2026-02-06T10:00:00.000Z",
  "endTime": "2026-02-06T10:01:30.000Z",
  "duration": 90000,
  "runId": "run-my-test-1738843200000",
  "screenshotDir": ".tsty/screenshots/run-my-test-1738843200000",
  "steps": [
    {
      "stepIndex": 0,
      "stepName": "Load homepage",
      "success": true,
      "duration": 2500,
      "screenshot": "1-load-homepage.png",
      "url": "http://localhost:3000/",
      "console": [
        {
          "type": "error",
          "text": "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT",
          "timestamp": "2026-02-06T10:00:00.123Z"
        }
      ],
      "consoleErrors": 1,  // ← Count of console errors
      "assertions": [
        { "type": "visible", "selector": "h1", "passed": true }
      ]
    },
    {
      "stepIndex": 1,
      "stepName": "Click login",
      "success": false,  // ← Failed step
      "navigationFailed": true,  // ← Navigation didn't reach expectedUrl
      "error": "Timeout 30000ms exceeded",  // ← Step error
      "duration": 30000,
      "screenshot": "2-click-login.png",
      "console": [
        { "type": "error", "text": "Uncaught TypeError: Cannot read property 'submit' of null", "timestamp": "2026-02-06T10:00:15.123Z" }
      ],
      "consoleErrors": 1,
      "assertions": []
    }
  ]
}
```

### What to Check

1. **`success` field** - false = flow failed
2. **`error` field** - root cause of failure
3. **`stoppedEarly` field** - true = flow stopped via fail-fast mode
4. **`stopReason` field** - why the flow stopped early
5. **`steps[].success`** - which step failed
6. **`steps[].error`** - step-specific error
7. **`steps[].console`** - JavaScript errors/warnings (structured format with type, text, timestamp)
8. **`steps[].consoleErrors`** - count of console errors in this step
9. **`steps[].navigationFailed`** - true = navigation didn't reach expectedUrl
10. **`steps[].assertions`** - failed assertions
11. **`duration`** - performance issues (>5s per step = investigate)

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Timeout exceeded` | Selector not found within timeout | Check selector, increase timeout, or wait for element |
| `Element not found` | Selector doesn't match DOM | Verify selector, check if element exists in screenshot |
| `Cannot read property X of null` | JavaScript error in app code | Fix null access in app code |
| `net::ERR_*` | Network/API issues | Fix backend or mock |
| Failed assertion | Element not visible/missing | Check screenshot for element state |
| `Navigation failed` | URL doesn't match expectedUrl | Verify expectedUrl matches actual navigation |
| `Console errors detected` | JavaScript errors preventing load | Check steps[].console for error details |
| Flow stopped early | Fail-fast triggered | Check stopReason field for specific cause |

---

## 2. Screenshot Analysis

**Location:** `.tsty/screenshots/run-{id}-{timestamp}/`

### Screenshot Naming

Screenshots are numbered sequentially:
- `1-step-name.png` - First step
- `2-step-name.png` - Second step
- `3-step-name.png` - Third step
- etc.

### Two-Tier Analysis Format

**Read EVERY screenshot** and analyze using this format:

```
🔴 Critical Issues (N) - Layout bugs, must fix

1. [Issue name]
Current: [What's wrong]
Expected: [What it should be]

---

💡 UX Improvements (N) - Working but could be better

2. [Issue name]
Current: [Current state]
Improvement: [How to improve]
```

### Priority Levels (analyze in order)

1. **Structure** - Overflow, squished containers, z-index issues, broken layout
2. **Layout** - Misalignment, broken grids, unintended wrapping, spacing issues
3. **Accessibility** - Contrast (WCAG AA: 4.5:1 text, 3:1 large text), text size (min 16px body), touch targets (min 44x44px)
4. **UX** - Visual hierarchy, exposed IDs/raw data, inconsistent patterns, unclear labels

### Screenshot-Specific Checks

- **Does the page look broken?** → Critical layout bug
- **Are all expected elements visible?** → Missing/hidden elements
- **Is text readable?** → Contrast, size, truncation
- **Are buttons/links clear?** → Labels, sizing, spacing
- **Is the visual hierarchy logical?** → Headings, emphasis, grouping
- **Are there any console errors visible?** → Check steps[].console in report

**See also:** [VISUAL-ANALYSIS-GUIDE.md](VISUAL-ANALYSIS-GUIDE.md) for detailed visual analysis methodology.

---

## 3. Console Log Analysis

**Source:** `steps[].console` in report (structured format with type, text, timestamp)

### Log Types

- `error` - JavaScript errors (MUST fix)
- `warning` - Potential issues (SHOULD fix)
- `info` - Informational (usually safe to ignore)
- `log` - Debug output (usually safe to ignore)

### What to Look For

#### 1. JavaScript Errors (type: "error")

| Error Pattern | Meaning | Fix |
|---------------|---------|-----|
| `Uncaught TypeError` | Code bug (null/undefined access) | Add null checks, fix logic |
| `Uncaught ReferenceError` | Missing variable/function | Define variable, import function |
| `Uncaught SyntaxError` | Code syntax error | Fix syntax |
| `Failed to load resource` | Missing file/API endpoint | Check file path, API endpoint |

#### 2. Network Errors

| Error Pattern | Meaning | Fix |
|---------------|---------|-----|
| `net::ERR_BLOCKED_BY_CLIENT` | Ad blocker or CSP | Disable blocker or fix CSP headers |
| `net::ERR_CONNECTION_REFUSED` | Server not running | Start server |
| `404 Not Found` | Missing resource | Check URL, add resource |
| `500 Internal Server Error` | Backend error | Fix backend code |

#### 3. React/Framework Warnings

| Warning Pattern | Meaning | Fix |
|-----------------|---------|-----|
| `Warning: Each child in a list should have a unique "key" prop` | Missing React keys | Add unique key prop to list items |
| `Warning: Cannot update a component while rendering` | State update timing | Move state update to useEffect |
| `Warning: validateDOMNesting` | Invalid HTML structure | Fix HTML nesting (e.g., div in p) |

### How to Fix Console Errors

- **JavaScript errors** → Fix app code
- **Network errors** → Fix backend/API or update URLs in flow
- **Framework warnings** → Improve code quality (optional if tests pass)

---

## 4. Assertion Analysis

**Source:** `steps[].assertions` in report

### Assertion Structure

```json
{
  "type": "visible",
  "selector": "h1.title",
  "passed": false,
  "error": "Element not found: h1.title"
}
```

### Assertion Types

| Type | Purpose | Pass Condition |
|------|---------|----------------|
| `visible` | Element is visible on page | Element exists and visible |
| `text` | Element contains expected text | Text matches exactly or contains substring |
| `count` | Number of matching elements | Count matches expected |
| `attribute` | Element has expected attribute value | Attribute exists with expected value |

### Common Assertion Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `Element not found` | Wrong selector or element doesn't exist | Check screenshot, verify selector with DevTools |
| `Expected text "X" but got "Y"` | Content mismatch | Update expected text or fix app to show correct text |
| `Expected 5 elements but found 3` | Count mismatch | Fix app to render correct number of elements |
| `Attribute "disabled" not found` | Element missing attribute | Add attribute or update assertion |

### How to Fix Assertions

1. **Check screenshot** - Is element actually visible?
2. **Verify selector** - Use DevTools to test selector (if running locally)
3. **Update selector** - Use more specific or user-facing selector
4. **Wait for content** - Add explicit wait before assertion if element loads asynchronously
5. **Check JavaScript** - Element may be hidden/removed by JavaScript (check console logs)

---

## Quick Error Reference Table

### Fast Lookup: Error → Action

| See This | Check | Then |
|----------|-------|------|
| `success: false` | `error` field | Read root cause message |
| `stoppedEarly: true` | `stopReason` field | Understand why flow stopped |
| Step failed | `steps[].error` | Read step-specific error |
| High duration | `steps[].duration` | Investigate performance (>5s is slow) |
| `consoleErrors > 0` | `steps[].console` | Read JavaScript errors |
| `navigationFailed: true` | `expectedUrl` vs actual | Fix navigation or remove expectedUrl |
| `passed: false` | `steps[].assertions` | Check which assertions failed |
| Empty screenshot | Flow crashed | Check report for errors before step |

### Analysis Workflow

```
1. Read report → Find failed step
   ↓
2. Check step error → Understand what failed
   ↓
3. View screenshot → See visual state at failure
   ↓
4. Check console logs → See JavaScript errors
   ↓
5. Check assertions → See what validation failed
   ↓
6. Prioritize fixes:
   - Console errors (blocking)
   - Failed step (blocking)
   - Failed assertions (blocking)
   - Visual issues (polish)
   ↓
7. Apply fixes → Re-run
```

---

## Related Guides

- **[ITERATIVE-WORKFLOW.md](ITERATIVE-WORKFLOW.md)** - Iteration patterns and fix strategies
- **[VISUAL-ANALYSIS-GUIDE.md](VISUAL-ANALYSIS-GUIDE.md)** - Detailed visual analysis methodology
- **[FAIL-FAST-GUIDE.md](FAIL-FAST-GUIDE.md)** - Understanding fail-fast mode and stop reasons
- **[E2E-TESTING-GUIDE.md](E2E-TESTING-GUIDE.md)** - Discovery-first testing approach

---

**Last Updated:** 2026-02-06
