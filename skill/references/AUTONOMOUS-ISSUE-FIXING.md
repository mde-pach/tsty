# Autonomous GitHub Issue Fixing

**CRITICAL**: This is the PRIMARY workflow when GitHub issues are mentioned. Don't just track issues - **FIX THEM AUTONOMOUSLY**.

## ⚠️ Core Principle

When a user mentions a GitHub issue or asks to fix an issue:
- **DON'T**: Just fetch and link it to an existing flow
- **DO**: Autonomously create test → run → analyze → fix → verify → mark as fixed

## Autonomous Workflow

### Phase 1: Fetch & Understand

```bash
# Fetch the issue
tsty issue fetch <number> --repo <owner/repo>
```

**Then analyze the issue:**
1. Read `.tsty/issues/<number>.json`
2. Understand what the issue describes:
   - Bug report? → Create test that reproduces the bug
   - Feature request? → Create test for expected behavior
   - UI issue? → Create visual test
   - Interaction issue? → Create user flow test

### Phase 2: Create Test Flow Automatically

**Based on issue analysis, create a test flow that:**
- Reproduces the bug (if bug report)
- Tests the missing feature (if feature request)
- Validates the UI (if visual issue)

**Example for bug report "Button doesn't save form":**

```json
{
  "name": "Issue #123: Button Save Bug",
  "description": "Test to reproduce issue #123 - button doesn't save form",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "monitorConsole": false,
  "steps": [
    {
      "name": "Navigate to form page",
      "url": "/form",
      "capture": { "screenshot": true }
    },
    {
      "name": "Fill form fields",
      "primitives": [
        { "type": "fill", "selector": "input[name='name']", "value": "Test" },
        { "type": "fill", "selector": "input[name='email']", "value": "test@test.com" }
      ],
      "capture": { "screenshot": true }
    },
    {
      "name": "Click save button",
      "primitives": [
        { "type": "click", "selector": "button:has-text('Save')" },
        { "type": "waitForTimeout", "timeout": 1000 }
      ],
      "capture": { "screenshot": true }
    },
    {
      "name": "Verify data saved",
      "capture": { "screenshot": true },
      "assertions": [
        { "type": "visible", "selector": "text=Saved successfully" }
      ]
    }
  ]
}
```

**Save to:** `.tsty/flows/issue-<number>-<slug>.json`

**Then link automatically:**
```bash
tsty issue link <number> --flow issue-<number>-<slug>
```

### Phase 3: Run Test (Confirm Issue Exists)

```bash
tsty run issue-<number>-<slug> --fail-fast --no-monitor
```

**Expected outcome:** Test should FAIL (confirming the issue exists)

**If test passes:** Issue might already be fixed or test is wrong
- Re-analyze issue description
- Adjust test to actually reproduce the issue
- Re-run

**If test fails:** Good! Issue confirmed. Proceed to Phase 4.

**Capture reference:**
```bash
# Get runId from last run
tsty issue set-reference <number> --run <runId>
```

### Phase 4: Analyze Failure & Identify Root Cause

**Use existing analysis skills:**
1. Read report: `.tsty/reports/flow-issue-<number>-<timestamp>.json`
2. View screenshots: `.tsty/screenshots/run-issue-<number>-<timestamp>/`
3. Check console errors
4. Identify what failed:
   - Selector timeout? → Element missing or selector wrong
   - Assertion failed? → Expected behavior not happening
   - Console error? → JavaScript bug
   - Visual issue? → CSS/layout problem

**Identify files to fix:**
- Read component code related to the failure
- Identify the bug (missing onClick, broken logic, etc.)

### Phase 5: Fix the Code Automatically

**Apply fixes based on root cause:**

**Example: Missing onClick handler**
```typescript
// Before (buggy)
<button>Save</button>

// After (fixed)
<button onClick={handleSave}>Save</button>
```

**Example: Broken state update**
```typescript
// Before (buggy)
const handleSave = () => {
  // Missing state update
}

// After (fixed)
const handleSave = () => {
  setData(formData);
  setSaved(true);
}
```

**Use Edit tool to apply fixes.**

### Phase 6: Verify Fix

```bash
tsty run issue-<number>-<slug> --fail-fast --no-monitor
```

**Expected outcome:** Test should PASS (issue is fixed)

**If still fails:**
- Re-analyze failure
- Apply additional fixes
- Re-run (iterate until pass)

**If passes:**
- Issue is fixed!
- Proceed to Phase 7

### Phase 7: Mark as Fixed & Update Issue

**Update issue status:**
```bash
# Update issue status to 'fixed' in local JSON
# Could also comment on GitHub via gh CLI
```

**Document the fix:**
- Before/After comparison available in dashboard
- Screenshots show the fix worked
- Reference run (before) vs latest run (after)

## Full Autonomous Example

**User says:** "Fix issue #42 from our repo"

**Autonomous workflow:**

```bash
# 1. Fetch
tsty issue fetch 42 --repo owner/repo

# 2. Read and understand issue
# (Read .tsty/issues/42.json)
# Issue: "Submit button on checkout page doesn't process payment"

# 3. Create test flow
# (Write .tsty/flows/issue-42-checkout-submit.json)
# Flow tests: navigate → add item → checkout → submit → verify payment

# 4. Link issue to flow
tsty issue link 42 --flow issue-42-checkout-submit

# 5. Run test (should fail)
tsty run issue-42-checkout-submit --fail-fast --no-monitor

# 6. Analyze failure
# (Read report, screenshots, console logs)
# Finding: onClick handler missing on submit button

# 7. Fix the code
# (Edit app/checkout/page.tsx to add onClick handler)

# 8. Re-run test (should pass)
tsty run issue-42-checkout-submit --fail-fast --no-monitor

# 9. Set reference and mark fixed
tsty issue set-reference 42 --run <first-run-id>
# Update issue status to 'fixed'

# 10. Summary
# "Issue #42 fixed! Before/After comparison available at /issues/42"
```

## Decision Tree: When to Use Autonomous Workflow

**User mentions GitHub issue?**
- ✅ YES → Use autonomous workflow
- ❌ NO → Use standard testing workflow

**User says "fix this issue"?**
- ✅ YES → Full autonomous workflow (fetch → test → fix → verify)

**User says "test this issue"?**
- ✅ YES → Partial autonomous workflow (fetch → test → analyze, but don't fix yet)

**User says "fetch issue #X"?**
- ⚠️ MAYBE → Ask: "Should I also create a test and attempt to fix it?"

## Error Recovery

**Test creation fails:**
- Issue description unclear → Ask user for clarification
- Can't identify affected page/component → Ask user

**Test runs but doesn't fail:**
- Issue might be fixed already → Report to user
- Test might not reproduce issue correctly → Re-analyze and adjust

**Fix doesn't work (test still fails):**
- Iterate: Analyze → Fix → Test (up to 3 attempts)
- If still failing after 3 attempts → Report findings and ask for help

**Can't identify root cause:**
- Provide detailed analysis of what was found
- Ask user for guidance on where to look

## Integration with Existing Workflows

**This autonomous workflow uses:**
- E2E-TESTING-GUIDE.md → For creating test flows
- USER-FIRST-TESTING.md → For user-like test interactions
- BUG-DETECTION-CHECKLIST.md → For analyzing failures
- BUG-FIXING-WORKFLOW.md → For fixing code
- VERIFICATION-CHECKLIST.md → For verifying fixes

**It orchestrates them automatically instead of requiring manual steps.**
