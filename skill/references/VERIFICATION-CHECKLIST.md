# Verification Checklist

**🚨 MANDATORY: Use after EVERY test run. Screenshot verification is NOT optional.**

---

## ⚠️ CRITICAL: Exit Code ≠ Feature Works

```
Exit code 0 means: Playwright didn't crash
Screenshot unchanged means: Feature is broken

ALWAYS verify BOTH
```

**Screenshot = Ground Truth**
**Exit code = Technical success only**

---

## 🎯 PRIMARY QUESTION: Is the Outcome Correct?

**Passing steps ≠ Correct outcome**

### Level 1: Outcome Verification (MANDATORY - Do This FIRST)

**🖼️ Screenshot Analysis (Ground Truth)**

After running test, **IMMEDIATELY open screenshot** and verify:

- [ ] **UI changed as expected** - Compare before/after screenshots
  - Button clicked → Something appeared/changed?
  - Form filled → Data visible in UI?
  - Item added → Count increased/item visible?

- [ ] **Visual feedback appeared** - Badges, counts, highlights, transitions
  - "Saved" indicator shown?
  - Success message displayed?
  - Loading spinner appeared then disappeared?

- [ ] **No unexpected states** - Errors, empty states, loading stuck
  - No error messages in screenshot?
  - No "No items yet" when items should exist?
  - No stuck loading states?

**If screenshot shows NO CHANGE from before step:**
→ 🚨 BUG in application (99% of cases)
→ NOT a test issue, NOT a timing issue
→ Read component code, find missing handler, fix it

**Visual Verification:**

**Functional Verification:**
- [ ] Created files have expected content (not empty/incomplete)
- [ ] Data was saved correctly (matches what was entered)
- [ ] Created artifact is usable (can run action, can load flow, etc.)
- [ ] Counts/metrics updated (e.g., "0 actions" → "1 action")

**Behavioral Verification:**
- [ ] User interaction had visible effect
- [ ] Expected navigation/transition occurred
- [ ] State changed appropriately

**If ANY verification fails:**
→ STOP: Use Investigation Protocol (see SKILL.md)
→ DON'T continue with broken features

**Example - Catching False Success:**
```
Test mechanics: ALL PASSED ✓
Created artifact: EXISTS ✓

But outcome check reveals:
→ File content: EMPTY (expected data missing)
→ Screenshot: UNCHANGED from before
→ UI state: NO VISIBLE DIFFERENCE

Conclusion: Test ran successfully but FEATURE FAILED
Must investigate why the user action didn't produce expected result
```

### Level 2: Technical Verification (After outcome is confirmed correct)

## After Discovery Run

- [ ] Exit code = 0
- [ ] Screenshot captured and readable
- [ ] HTML captured (if requested): check `.steps[0].html` in report
- [ ] Console errors = 0: `cat report.json | jq '.steps[0].consoleErrors'`
- [ ] Documented selectors from HTML or screenshot
- [ ] Dev server still running

**If ANY checkbox fails:** STOP, fix issue, re-run discovery.

## After Action Creation

- [ ] Action file saved to `.tsty/actions/`
- [ ] Action uses exact selectors (from HTML or verified screenshot)
- [ ] Action has 1-3 primitives max (keep it simple)
- [ ] Action tested in 2-step flow (navigate + action)

## After Action Test Run

- [ ] Exit code checked (0 = pass, 1 = fail)
- [ ] Report read: `cat .tsty/reports/flow-test-*.json`
- [ ] Console errors checked: `jq '.steps[1].consoleErrors' report.json`
- [ ] Screenshot viewed: `open .tsty/screenshots/run-*/2-*.png`
- [ ] Decision made: STOP (if errors) or CONTINUE (if success)

**If consoleErrors > 0:** STOP, fix code, re-run. Do NOT create next action.

## After Full Flow Run

- [ ] All screenshots viewed (EVERY single one)
- [ ] All console logs checked (each step)
- [ ] Visual issues documented (Critical vs UX improvements)
- [ ] Fixes prioritized (Console errors → Selectors → Visual → UX)
- [ ] Fixes applied
- [ ] Re-run scheduled

## Before Moving to Next Test

- [ ] Current flow exits with code 0
- [ ] All screenshots look correct
- [ ] No console errors in any step
- [ ] Visual issues documented (even if not fixed)
- [ ] Flow committed/saved

---

**Related Guides:**
- [ITERATIVE-WORKFLOW.md](ITERATIVE-WORKFLOW.md) - Iteration patterns
- [ANALYSIS-METHODS.md](ANALYSIS-METHODS.md) - How to analyze results
- [E2E-TESTING-GUIDE.md](E2E-TESTING-GUIDE.md) - Discovery-first testing
