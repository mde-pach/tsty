# Autonomous GitHub Issue Fixing

**CRITICAL**: This is the PRIMARY workflow when GitHub issues are mentioned. Don't just track issues - **FIX THEM AUTONOMOUSLY**.

## ⚠️ Core Principle

When a user mentions a GitHub issue or asks to fix an issue:
- **DON'T**: Just fetch and link it to an existing flow
- **DO**: Autonomously create test → run → analyze → fix → verify → mark as fixed

## Autonomous Workflow (COMPLETE)

**Full process overview:**
1. ✅ Fetch issue from GitHub
2. ✅ Store locally in `.tsty/issues/`
3. ✅ **AUTO-CREATE test flow** (`.tsty/flows/issue-{number}-{slug}.json`)
4. ✅ **AUTO-LINK flow to issue** (set `linkedFlowId` in issue JSON)
5. ✅ **AUTO-RUN and mark as reference** (run test + extract runId + set `referenceRunId`)
6. ✅ **AUTO-ANALYZE screenshots** (list + read ALL PNGs from reference run)
7. ✅ Apply fixes based on visual analysis
8. ✅ **AUTO-RE-RUN** (capture AFTER state)
9. ✅ **AUTO-COMPARE** (read screenshots from BOTH runs, verify improvement)

### Phase 1: Fetch & Understand

```bash
# Fetch the issue using GitHub CLI
gh issue view <number> --repo <owner/repo> --json title,body,labels,number > .tsty/issues/<number>.json
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

**CRITICAL: Link flow to issue immediately:**

```bash
# Update .tsty/issues/<number>.json to add:
{
  ...existing fields...,
  "linkedFlowId": "issue-<number>-<slug>",
  "status": "linked"
}
```

This links the test flow to the issue for tracking and comparison features.

**→ See [ISSUE-FLOW-LINKING.md](ISSUE-FLOW-LINKING.md) for detailed linking instructions**

### Phase 3: Run Test & Mark as Reference (Confirm Issue Exists)

```bash
tsty run issue-<number>-<slug> --fail-fast --no-monitor
```

**MANDATORY: Analyze screenshots** (CRITICAL - DO NOT SKIP)

```bash
# Get runId from the test output (e.g., run-issue-123-slug-1234567)
ls -1 .tsty/screenshots/<runId>/*.png
```

**Then read EVERY screenshot PNG:**
```
Read .tsty/screenshots/<runId>/1-step-name.png
Read .tsty/screenshots/<runId>/2-step-name.png
# etc. for all screenshots listed by analyze-screenshots
```

**Visual analysis:**
- What does the screenshot show?
- What is the current state of the UI?
- Is the issue visible in the screenshots?
- Does the visual evidence confirm the bug?

**CRITICAL: Capture runId and link as reference:**

After the test completes, extract the runId from output:
```
✅ Test Passed (or Failed)
Screenshots saved to: .tsty/screenshots/run-issue-123-slug-1771094164532/
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your runId
```

**Update issue with reference run:**
```bash
# Update .tsty/issues/<number>.json to add:
{
  ...existing fields...,
  "referenceRunId": "run-issue-123-slug-1771094164532",
  "status": "testing"
}
```

This marks this run as the BEFORE state for later comparison.

**Expected outcome:** Test should FAIL (confirming the issue exists)

**If test passes:** Issue might already be fixed or test is wrong
- **Check screenshots** - do they show the issue?
- Re-analyze issue description
- Adjust test to actually reproduce the issue
- Re-run

**If test fails:** Good! Issue confirmed. Proceed to Phase 4.

### Phase 4: Analyze Failure & Identify Root Cause

**Step 1: Visual Analysis (PRIMARY source of truth)**

From Phase 3, you already listed and read screenshots. Now analyze what you saw:
- What UI elements are visible?
- What's wrong visually?
- Does the visual evidence match the issue description?

**Step 2: Technical Analysis**

1. Read report: `.tsty/reports/flow-issue-<number>-<timestamp>.json`
2. Check console errors in report
3. Identify what failed:
   - Selector timeout? → Element missing or selector wrong
   - Assertion failed? → Expected behavior not happening
   - Console error? → JavaScript bug
   - Visual issue? → CSS/layout problem

**Step 3: Identify files to fix**

Based on BOTH visual and technical analysis:
- Read component code related to the failure
- Identify the bug (missing onClick, broken logic, etc.)
- Plan the fix based on visual evidence

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

### Phase 6: Verify Fix Visually

**Step 1: Re-run the test**

```bash
tsty run issue-<number>-<slug> --fail-fast --no-monitor
```

**Step 2: Analyze new screenshots (MANDATORY)**

```bash
# Get the new runId from test output
ls -1 .tsty/screenshots/<newRunId>/*.png
```

Read all new screenshots:
```
Read .tsty/screenshots/<newRunId>/1-step-name.png
Read .tsty/screenshots/<newRunId>/2-step-name.png
# etc.
```

**Step 3: Compare before/after (CRITICAL)**

```bash
ls -1 .tsty/screenshots/<beforeRunId>/*.png
ls -1 .tsty/screenshots/<newRunId>/*.png
```

List screenshots from BOTH runs, then read them all:
```
# Before (from Phase 3)
Read .tsty/screenshots/<beforeRunId>/1-step-name.png

# After (just captured)
Read .tsty/screenshots/<newRunId>/1-step-name.png
```

**Step 4: Visual Verification**

Compare what you see:
- BEFORE: What was wrong visually?
- AFTER: What changed?
- Is the issue visually fixed?
- Would a user see the improvement?

**Expected outcome:** Test should PASS AND screenshots show visual improvement

**If still fails:**
- Analyze failure from screenshots
- Apply additional fixes
- Re-run (iterate until pass)

**If passes BUT screenshots show no change:**
- The fix didn't work visually
- Re-analyze the code
- Fix the actual issue
- Don't commit until screenshots show the change

**If passes AND screenshots show improvement:**
- ✅ Issue is fixed visually!
- Workflow complete - ready for next steps (commit, PR, etc.)

## Full Autonomous Example

**User says:** "Fix issue #42 from our repo"

**Autonomous workflow:**

```bash
# 1. Fetch issue using GitHub CLI
gh issue view 42 --repo owner/repo --json title,body,labels,number > .tsty/issues/42.json

# 2. Read and understand issue
# (Read .tsty/issues/42.json)
# Issue: "Submit button on checkout page doesn't process payment"

# 3. Create test flow
# (Write .tsty/flows/issue-42-checkout-submit.json)
# Flow tests: navigate → add item → checkout → submit → verify payment

# 4. Link flow to issue
# (Edit .tsty/issues/42.json to add linkedFlowId: "issue-42-checkout-submit", status: "linked")

# 5. Run test and mark as reference (should fail initially)
tsty run issue-42-checkout-submit --fail-fast --no-monitor

# 6. Extract runId and link as reference
# (From output: run-issue-42-checkout-submit-1771094164532)
# (Edit .tsty/issues/42.json to add referenceRunId: "run-issue-42-checkout-submit-1771094164532", status: "testing")

# 7. List and analyze screenshots
ls -1 .tsty/screenshots/run-issue-42-checkout-submit-<timestamp>/*.png
# Then read each screenshot PNG file

# 8. Analyze failure from visual evidence
# (Read report, screenshots, console logs)
# Finding: onClick handler missing on submit button

# 9. Fix the code based on visual analysis
# (Edit app/checkout/page.tsx to add onClick handler)

# 10. Re-run test to verify fix
tsty run issue-42-checkout-submit --fail-fast --no-monitor

# 11. List and compare before/after screenshots
ls -1 .tsty/screenshots/run-issue-42-checkout-submit-<before>/*.png
ls -1 .tsty/screenshots/run-issue-42-checkout-submit-<after>/*.png
# Read screenshots from both runs to verify visual improvement

# 12. Visual verification complete
# BEFORE (run-issue-42-checkout-submit-<before>):
# Submit button visible but clicking had no effect.
#
# AFTER (run-issue-42-checkout-submit-<after>):
# Submit button now processes payment and shows confirmation.
#
# Issue #42 fixed! Linked to flow, reference captured, visual verification confirms the fix works.
```

## Decision Tree: When to Use Autonomous Workflow

**User mentions GitHub issue?**
- ✅ YES → Use autonomous workflow
- ❌ NO → Use standard testing workflow

**User says "fix this issue"?**
- ✅ YES → Full autonomous workflow (fetch → create flow → link → run reference → analyze → fix → re-run → compare)

**User says "test this issue"?**
- ✅ YES → Partial autonomous workflow (fetch → create flow → link → run reference → analyze, but don't fix yet)

**User says "fetch issue #X"?**
- ⚠️ MAYBE → Fetch and ask: "Should I also create a test flow and attempt to fix it?"

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
