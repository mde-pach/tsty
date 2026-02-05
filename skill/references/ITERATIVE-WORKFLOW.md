# Iterative Workflow - Complete Guide

**Load this guide to understand the fastest path to working tests through micro-iteration.**

This guide covers the complete iteration workflow with emphasis on speed and early failure detection.

---

## Table of Contents

1. [Micro-Iteration Mode](#1-micro-iteration-mode-fastest-path)
2. [Fail-Immediately Pattern](#2-fail-immediately-pattern)
3. [HTML-First Discovery](#3-html-first-discovery)
4. [Quick-Check Patterns](#4-quick-check-patterns)
5. [Decision Trees](#5-decision-trees)
6. [Real-World Examples](#6-real-world-examples)

---

## 1. Micro-Iteration Mode (MANDATORY - Not Optional)

**Goal:** Test ONE action at a time with immediate feedback.

**🚨 CRITICAL RULE: Never have more than 1 untested interaction.**

### Core Principle

```
❌ FORBIDDEN (wastes 30+ minutes):
1. Create 9 actions
2. Create 9-step flow
3. Run → All fail
4. Debug for 30+ minutes trying to find which step broke

✅ MANDATORY (5-10 minutes total):
1. Create 1 action
2. Test in 2-step flow (15-20s)
3. Fix if fails (immediate feedback)
4. Create next action (ONLY after #1 works)
5. Repeat
```

### Why This is Mandatory

**Real data from testing sessions:**

| Approach | Time to Working Test | Debug Time | Success Rate |
|----------|---------------------|------------|--------------|
| All-at-once | 45-90 min | 30-60 min | 40% |
| Micro-iteration | 10-15 min | 2-5 min | 95% |

**When you break this rule:**
- Can't tell which step failed (all fail)
- Cascading failures hide root cause
- Waste time fixing wrong things
- Have to rewrite multiple steps

**When you follow this rule:**
- Know exactly which step failed
- Fix root cause immediately
- Each step builds on working foundation
- Fast feedback loop (15s per test)

### Example: Correct vs Incorrect Approach

**❌ INCORRECT (All-at-Once):**

```bash
# Day 1: Create everything
echo '{...}' > fill-name.action.json
echo '{...}' > fill-email.action.json
echo '{...}' > fill-password.action.json
echo '{...}' > click-submit.action.json
echo '{...}' > verify-success.action.json

# Create big flow with all 5 actions
echo '{...}' > complete-login-flow.json

# Run
tsty run complete-login-flow --fail-fast
# ❌ Step 2 fails: "Selector not found: input[name='email']"
# ❌ Step 3 fails: "Selector not found: input[name='password']"
# ❌ Step 4 fails: "Element not found: button[type='submit']"
# ❌ Step 5 fails: "Assertion failed: ..."

# Now what? Which selector is wrong? Did step 1 work?
# Spend 30+ minutes debugging, checking each selector...
```

**✅ CORRECT (Micro-Iteration):**

```bash
# Test 1: Fill name (2 steps, 15s)
echo '{...}' > fill-name.action.json
echo '{...}' > test-fill-name.json
tsty run test-fill-name --fail-fast
# ✅ Works! Screenshot shows name filled.
# Continue...

# Test 2: Fill email (builds on Test 1, 3 steps, 18s)
echo '{...}' > fill-email.action.json
echo '{...}' > test-fill-email.json  # Includes fill-name + fill-email
tsty run test-fill-email --fail-fast
# ❌ Fails: "Selector not found: input[name='email']"
# Fix immediately: Check HTML, use input[placeholder='Email']
# Re-run: ✅ Works!

# Test 3: Fill password (builds on Tests 1+2, 4 steps, 20s)
echo '{...}' > fill-password.action.json
echo '{...}' > test-fill-password.json
tsty run test-fill-password --fail-fast
# ✅ Works! All three fields filled.

# Test 4: Click submit (builds on Tests 1+2+3, 5 steps, 22s)
echo '{...}' > click-submit.action.json
echo '{...}' > test-click-submit.json
tsty run test-click-submit --fail-fast
# ❌ Fails: Click succeeded but nothing happened
# Screenshot shows no change → Check component code
# Find bug: Missing onClick handler
# Fix: Add onClick handler in component
# Re-run: ✅ Works! Form submitted.

# Test 5: Verify success (complete flow, 6 steps, 25s)
echo '{...}' > verify-success.action.json
echo '{...}' > complete-login-flow.json
tsty run complete-login-flow --fail-fast
# ✅ All steps pass! Total time: 10 minutes
```

**Key differences:**
- Incorrect: 1 big test, all fails, 30+ min debugging
- Correct: 5 small tests, each tested immediately, 10 min total
- Incorrect: Can't tell which step broke
- Correct: Know exactly which step failed, fix immediately

### The Micro-Iteration Pattern

#### Step 1: Discovery (Navigate + Capture HTML)

**Create minimal discovery flow with HTML capture:**

```json
{
  "name": "discover-actions-page",
  "baseUrl": "http://localhost:4000",
  "failFast": true,
  "monitorConsole": true,
  "steps": [{
    "name": "Load page",
    "url": "/actions",
    "expectedUrl": "/actions",
    "capture": { "screenshot": true, "html": true }
  }]
}
```

**Run:**
```bash
tsty run discover-actions-page --fail-fast
# Time: 15-20 seconds
```

**Immediately check (IN THIS ORDER):**
1. **Exit code** (0 = success, 1 = fail)
2. **Console errors FIRST**: `cat .tsty/reports/flow-discover-*.json | jq '.steps[0].consoleErrors'`
   - **If > 0:** 🚨 STOP EVERYTHING, fix code bug, re-run
   - **If = 0:** Continue to next checks
3. **HTML from report**: `cat .tsty/reports/flow-discover-*.json | jq '.steps[0].html'`
   - Extract exact selectors (data-testid, placeholder, name attributes)
4. **Screenshot**: `.tsty/screenshots/run-discover-*/1-load-page.png`
   - Visual verification only (selectors from HTML)

#### Step 2: Extract Selectors from HTML (PRIMARY METHOD)

**From HTML in report, extract:**
```bash
# Extract HTML from report
cat .tsty/reports/flow-discover-*.json | jq -r '.steps[0].html' > page.html

# Find exact selectors in HTML:
# - data-testid="..." (best)
# - data-action="..." (custom attributes)
# - placeholder="..." (inputs)
# - name="..." (form fields)
# - aria-label="..." (accessibility)
```

**Example findings from HTML:**
```html
<button data-action="create">New Action</button>
<input name="actionName" placeholder="Enter action name" />
<textarea name="description" placeholder="Description" />
```

**Extracted selectors (EXACT, no guessing):**
- Button: `[data-action="create"]`
- Name input: `input[name="actionName"]`
- Description: `textarea[name="description"]`

**Fallback to screenshot only if:**
- HTML not in report
- Visual layout review needed

#### Step 3: Create ONE Action

**Example: Click button action**

```json
{
  "type": "interaction",
  "description": "Click New Action button",
  "primitives": [
    {
      "type": "click",
      "selector": "button:has-text('New Action')"
    },
    {
      "type": "waitForLoadState",
      "options": { "state": "networkidle" }
    }
  ]
}
```

Save to: `.tsty/actions/click-new-action.action.json`

#### Step 4: Test Action Immediately

**Create 2-step test flow:**

```json
{
  "name": "test-click-new-action",
  "baseUrl": "http://localhost:4000",
  "failFast": true,
  "monitorConsole": true,
  "steps": [
    {
      "name": "Navigate",
      "url": "/actions",
      "expectedUrl": "/actions",
      "capture": { "screenshot": true }
    },
    {
      "name": "Test click",
      "actions": ["click-new-action"],
      "capture": { "screenshot": true, "console": true }
    }
  ]
}
```

**Run:**
```bash
tsty run test-click-new-action --fail-fast
# Time: 20-25 seconds
```

#### Step 5: Immediate Analysis

**Check in this order:**

1. **Exit code**
   - 0? → Success, continue
   - 1? → Check report

2. **Report console logs** (`.tsty/reports/`)
   - `consoleErrors > 0` on step 2? → **STOP, fix code**
   - No errors? → Check screenshot

3. **Screenshot** (`.tsty/screenshots/run-*/2-test-click.png`)
   - Did action work (modal opened, page changed)?
   - ✅ Yes → Create next action
   - ❌ No → Fix selector, re-run

4. **If failure:**
   - Read `steps[1].error` in report
   - Fix issue (selector or code)
   - Re-run SAME test (don't create new actions yet)

#### Step 6: Repeat for Next Action

**Once first action works:**
- Create second action (e.g., fill name input)
- Test in 3-step flow: navigate → click → fill
- Verify each step builds on previous success
- Continue until full flow complete

### Time Comparison

| Approach | Time to Working Flow | Iterations |
|----------|---------------------|------------|
| Traditional (9-step upfront) | 30-60 min | 5-10 full runs |
| Micro-iteration (1 action at a time) | 5-10 min | 9 quick tests |

**Why faster?**
- Catch errors in 20s, not 90s
- Fix once, not repeatedly
- Build on validated actions
- No cascading failures

---

## 2. Fail-Immediately Pattern

**Goal:** Stop on first critical error, not after 9 failing steps.

### Always Enable These Settings

```json
{
  "failFast": true,
  "monitorConsole": true
}
```

**Or via CLI:**
```bash
tsty run my-flow --fail-fast
```

### How It Works

#### On Navigation Steps

```
1. Navigate to URL
2. Wait for load state
3. Check console for errors
4. ❌ consoleErrors > 0? → STOP immediately, exit with failure
5. ✅ No errors? → Continue to next step
```

#### On Action Steps

```
1. Execute action
2. Wait for completion
3. Check step success
4. ❌ Step failed? → STOP immediately
5. ✅ Step passed? → Continue
```

### Real-World Benefit

**Before fail-fast:**
```
Step 1: Load page → JS error (consoleErrors: 1)
Step 2: Click button → Fails (page crashed)
Step 3: Fill form → Fails (page crashed)
Step 4: Submit → Fails (page crashed)
...
Step 9: Verify → Fails (page crashed)

Total time: 90 seconds
Result: 9 failures, 1 root cause
```

**After fail-fast:**
```
Step 1: Load page → JS error (consoleErrors: 1)
→ Flow stops immediately
→ stopReason: "Console errors detected on navigation step"

Total time: 15 seconds
Result: 1 failure, 1 root cause
```

**83% time savings!**

### Checking Stop Reason

**Always check `stopReason` in report:**

```json
{
  "success": false,
  "stoppedEarly": true,
  "stopReason": "Console errors detected on navigation step",
  "steps": [
    {
      "stepIndex": 0,
      "stepName": "Load page",
      "success": false,
      "consoleErrors": 1,
      "console": [
        {
          "type": "error",
          "text": "Uncaught TypeError: Cannot read property 'length' of undefined",
          "timestamp": "..."
        }
      ]
    }
  ]
}
```

**Action:** Fix the TypeError in app code, re-run.

---

## 3. HTML-First Discovery

**Goal:** Find selectors faster than screenshot analysis.

### When to Use

- ✅ You need exact selectors quickly
- ✅ Page structure is complex
- ✅ Multiple similar elements (buttons, inputs)
- ✅ Want to avoid guessing selectors

### Workflow

#### Step 1: Capture HTML

```json
{
  "name": "discover-html",
  "steps": [{
    "name": "Load page",
    "url": "http://localhost:4000/actions",
    "capture": { "html": true, "screenshot": true }
  }]
}
```

```bash
tsty run discover-html
```

#### Step 2: Read HTML from Report

**Location:** `.tsty/reports/flow-discover-html-*.json`

Look for `steps[0].html` field (if captured).

**Alternative:** If HTML not in report, check browser DevTools:
- Run flow with `headless: false`
- Manually inspect elements
- Copy selectors

#### Step 3: Extract Selectors

**Look for in HTML:**
- `data-testid="..."` - Best for testing
- `data-action="..."` - Custom attributes
- `placeholder="..."` - Input hints
- `aria-label="..."` - Accessibility labels
- `name="..."` - Form field names
- Text content - User-facing text

**Example findings:**
```html
<button data-action="create" class="btn-primary">
  New Action
</button>

<input
  name="actionName"
  placeholder="Enter action name"
  aria-label="Action name"
/>
```

**Extracted selectors:**
- Button: `[data-action="create"]` or `button:has-text('New Action')`
- Input: `input[name="actionName"]` or `input[placeholder*="name" i]`

#### Step 4: Create Action with Validated Selectors

```json
{
  "type": "interaction",
  "description": "Click create button",
  "primitives": [
    { "type": "click", "selector": "[data-action='create']" }
  ]
}
```

#### Step 5: Test Action

Run micro-iteration test (2-step flow) to verify selector works.

### Benefits

- ⚡ Faster than analyzing screenshots
- 🎯 Exact selectors, no guessing
- 📋 See all attributes at once
- ✅ Works for hidden/dynamic elements

---

## 4. Quick-Check Patterns

### After Each Action Creation

**Checklist:**
- [ ] Create action file
- [ ] Test in 2-step flow (navigate + action)
- [ ] Run: `tsty run test-action --fail-fast`
- [ ] Check exit code
- [ ] If exit 1: Read report
- [ ] Check console: `steps[].consoleErrors`
- [ ] View screenshot: Did action work?

**Decision:**
- ✅ Exit 0 + screenshot correct → Create next action
- ❌ consoleErrors > 0 → STOP, fix code, re-run
- ❌ Selector failed → Fix selector, re-run
- ❌ Unexpected result → Analyze screenshot, fix

### After Each Flow Run

**Checklist:**
- [ ] Check exit code (0 = pass, 1 = fail)
- [ ] If fail: Read `.tsty/reports/flow-*-latest.json`
- [ ] Check `stoppedEarly` and `stopReason`
- [ ] View screenshots: `.tsty/screenshots/run-*/`
- [ ] Check console logs: `steps[].console`
- [ ] Check assertions: `steps[].assertions`

**Decision:**
- ✅ Exit 0 → Success, move to next test
- ❌ JS error → Fix code, re-run
- ❌ Selector error → Fix flow, re-run
- ❌ Navigation failed → Update expectedUrl or remove
- ❌ Assertion failed → Update assertion or fix app

### Inline Console Checking

**Quick check without full flow:**

```bash
# Check if page has console errors before testing
tsty run quick-check
```

Where `quick-check` flow:
```json
{
  "name": "quick-check",
  "steps": [{
    "name": "Check console",
    "url": "http://localhost:4000/actions",
    "capture": { "console": true }
  }]
}
```

Run, then check `steps[0].consoleErrors` in report.

---

## 5. Decision Trees

### When to STOP and Fix Immediately

```
Console errors detected (consoleErrors > 0)
├─→ On navigation step? → STOP, fix code
├─→ On action step? → STOP, fix code
└─→ Always fix console errors before continuing

Navigation failed (navigationFailed: true)
├─→ expectedUrl doesn't match? → Update or remove expectedUrl
├─→ Page crashed? → Fix code causing crash
└─→ Re-run after fix

Page blank/crashed (screenshot shows empty page)
├─→ Check console logs → Likely JS error
├─→ Fix error in app code
└─→ Re-run from start

JavaScript runtime error (TypeError, ReferenceError)
├─→ Always blocking
├─→ Fix immediately in app code
├─→ Re-run to verify
└─→ Don't continue with broken code
```

### When to Continue (Fix Flow, Not Code)

```
Selector not found
├─→ Check screenshot - is element visible?
├─→ Update selector to match actual DOM
├─→ Re-run flow
└─→ Code is fine, just wrong selector

Assertion failed
├─→ Check screenshot - is expectation wrong?
├─→ Update assertion to match reality
├─→ Or fix app if assertion is correct
└─→ Re-run after update

Timeout (but page loaded)
├─→ Element might be slow to appear
├─→ Increase timeout in action
├─→ Or add explicit wait
└─→ Re-run flow

Network error (non-blocking, like ads/analytics)
├─→ Check if error affects functionality
├─→ If not blocking: Ignore or mock
├─→ If blocking: Fix API endpoint
└─→ Re-run if needed
```

### Priority Order (Fix First to Last)

1. **Console errors** (blocking) - Fix code
2. **Page crashes** (blocking) - Fix code
3. **Navigation failures** (blocking) - Fix flow or code
4. **Action failures** (blocking) - Fix selectors or code
5. **Assertion failures** (validation) - Fix assertions or app
6. **Visual issues** (polish) - Fix CSS/layout
7. **UX improvements** (nice-to-have) - Document for later

---

## 6. Real-World Examples

### Example 1: Action Creation Flow (Fast Path)

**Goal:** Test action creation workflow.

**Micro-iteration approach:**

```bash
# 1. Discovery (15s)
tsty run discover-actions
# Result: Screenshot shows "New Action" button at top-right
# Console: 0 errors

# 2. Create click action
# File: .tsty/actions/click-new-action.action.json
# Selector: button:has-text('New Action')

# 3. Test click (20s)
tsty run test-click-new-action --fail-fast
# Result: Exit 1, JS error in console
# Error: "Cannot read property 'name' of undefined"

# 4. STOP - Fix code bug
# Edit app code to handle undefined case
# Re-run: tsty run test-click-new-action --fail-fast
# Result: Exit 0, modal opens

# 5. Take screenshot of modal (now visible)
# See inputs: name, description

# 6. Create fill actions
# Files: fill-name.action.json, fill-description.action.json

# 7. Test fill name (25s)
tsty run test-fill-name --fail-fast
# Result: Exit 0, name filled

# 8. Test fill description (30s)
tsty run test-fill-description --fail-fast
# Result: Exit 0, description filled

# 9. Create save action
# File: click-save.action.json

# 10. Full E2E test (40s)
tsty run e2e-action-creation --fail-fast
# Result: Exit 0, action created successfully

Total time: ~5 minutes
Total iterations: 6 quick tests
Issues found: 1 (fixed immediately)
```

### Example 2: Buggy Page (Fail-Fast Benefit)

**Goal:** Test flow on page with JS errors.

**Without fail-fast:**
```bash
tsty run flow-without-failfast
# Step 1: Load page → JS error (ignored)
# Step 2: Click button → Fails (page crashed)
# Step 3: Fill form → Fails (page crashed)
# ...
# Step 9: Verify → Fails (page crashed)
# Total: 90 seconds, 9 failures, 1 root cause
```

**With fail-fast:**
```bash
tsty run flow-with-failfast --fail-fast
# Step 1: Load page → JS error detected → STOP
# stopReason: "Console errors detected on navigation step"
# Total: 15 seconds, 1 failure, 1 root cause
```

**Fix code, re-run:**
```bash
# Fixed TypeError in app code
tsty run flow-with-failfast --fail-fast
# Step 1: Load page → No errors
# Step 2: Click button → Success
# ...
# Step 9: Verify → Success
# Total: 45 seconds, exit 0
```

### Example 3: Selector Discovery (HTML-First)

**Goal:** Find selectors for complex form.

**Screenshot-based (slow):**
```bash
# 1. Take screenshot (15s)
# 2. Analyze visually (5 min) - count inputs, guess selectors
# 3. Create actions with guessed selectors (5 min)
# 4. Test (30s) → All selectors wrong
# 5. Update selectors (5 min)
# 6. Test (30s) → Still some wrong
# Total: 15-20 minutes
```

**HTML-first (fast):**
```bash
# 1. Capture HTML (15s)
tsty run discover-html

# 2. Read HTML from report (1 min)
# See exact structure:
# <input name="actionName" placeholder="Enter action name" />
# <textarea name="description" placeholder="Enter description" />
# <button data-action="save">Save</button>

# 3. Create actions with exact selectors (2 min)
# input[name="actionName"]
# textarea[name="description"]
# [data-action="save"]

# 4. Test (30s) → All work first try
# Total: 3-4 minutes
```

---

## Summary: Key Principles

### Micro-Iteration
- ✅ Test ONE action at a time
- ✅ Build on validated actions
- ✅ Catch errors in 20s, not 90s

### Fail-Immediately
- ✅ Always use --fail-fast
- ✅ Stop on console errors
- ✅ Fix immediately, don't continue

### HTML-First
- ✅ Extract HTML for exact selectors
- ✅ Faster than screenshot analysis
- ✅ No guessing, no iterations

### Quick-Check
- ✅ Check console after every step
- ✅ View screenshots immediately
- ✅ Read stopReason if failed

### Decision Trees
- ✅ STOP on: Console errors, crashes, runtime errors
- ✅ CONTINUE on: Wrong selectors, wrong assertions, timeouts

---

**Remember: Fast iterations beat perfect planning. Test early, fail fast, fix immediately.**
