# Quick Decision Reference for Autonomous Iteration

**Load this when unsure what to do next during autonomous testing.**

Use this reference to make fast, unambiguous decisions about when to stop, continue, fix test code vs. application code, and when to create new actions.

---

## Table of Contents

1. [Is This Test Actually Successful?](#is-this-test-actually-successful) ⭐ **START HERE**
2. [Should I Report This to User?](#should-i-report-this-to-user)
3. [After Running a Test](#after-running-a-test)
4. [When to Stop Iterating](#when-to-stop-iterating)
5. [When to Create New Action vs. Fix Current](#when-to-create-new-action-vs-fix-current)
6. [What to Fix: Test vs. Application Code](#what-to-fix-test-vs-application-code)
7. [Priority Order for Fixes](#priority-order-for-fixes)

---

## Is This Test Actually Successful?

**Use this FIRST after every test completes. Passing steps ≠ successful test.**

```
Test exit code?
├─ 0 (passed) → Verify outcome quality ↓
└─ 1 (failed) → Go to "After Running a Test" section

Verify outcome quality:
├─ Screenshot shows expected UI changes?
│  ├─ YES (elements added, state changed) → Continue ↓
│  └─ NO (looks identical to before) → INVESTIGATE
│
├─ Created files have expected content?
│  ├─ YES (data present, structure correct) → Continue ↓
│  └─ NO (empty arrays, missing fields) → INVESTIGATE
│
├─ Counts/badges/metrics updated?
│  ├─ YES (0 → 1, empty → filled) → Continue ↓
│  └─ NO (unchanged) → INVESTIGATE
│
└─ Would a real user be satisfied?
   ├─ YES → TRUE SUCCESS ✓
   └─ NO → FALSE SUCCESS - INVESTIGATE

INVESTIGATE means:
1. Use Investigation Protocol (see SKILL.md)
2. Try alternative approaches (3+ different selectors/interactions)
3. If all fail → Report to user with evidence
4. Never skip broken features and pretend success
```

## Should I Report This to User?

**Use when feature isn't working after investigation.**

```
Is the feature working?
├─ YES (UI responds, data saves correctly) → Continue testing
└─ NO → Did you try multiple approaches?
   ├─ NO (tried 1-2 approaches) → Try more first
   └─ YES (tried 3+ approaches) → Continue ↓
      ├─ All approaches failed?
      │  ├─ YES → Likely app bug → REPORT
      │  └─ NO → One works → Use working approach
      │
      └─ REPORT with:
         - Expected behavior
         - Actual behavior (screenshot)
         - All attempts made (list selectors/interactions)
         - Console errors (if any)
         - File contents (if relevant)
         - Hypothesis about cause
         - Question: "Should I fix or work around?"
```

**See [REPORTING-ISSUES.md](REPORTING-ISSUES.md) for detailed reporting template.**

---

## After Running a Test

**Immediate decision tree after `tsty run` completes:**

```
Exit code 0?
├─ YES → Success! View screenshots
│  ├─ Visual issues in screenshots?
│  │  ├─ Critical bugs (broken layout, missing elements) → Note + Continue iteration
│  │  └─ Minor UX issues (spacing, colors) → Note as "UX improvements" (non-blocking)
│  └─ No issues? → DONE or create next test
│
└─ NO (exit 1) → Failed! Check report
   ├─ Check: stoppedEarly?
   │  ├─ Yes → Read stopReason
   │  │  ├─ "Console errors detected" → 🚨 FIX APP CODE NOW
   │  │  ├─ "Navigation failed" → Update expectedUrl or fix app redirect
   │  │  └─ "Step failed" → Check specific step error below
   │  └─ No → Check which step failed
   │
   ├─ Check: consoleErrors > 0?
   │  └─ Yes → 🚨 STOP EVERYTHING
   │     ├─ Read steps[N].console
   │     ├─ Fix JavaScript error in APPLICATION code
   │     ├─ Re-run SAME test (don't create new actions)
   │     └─ Verify consoleErrors = 0 before continuing
   │
   ├─ Check: step error message?
   │  ├─ "Timeout" → Selector wrong or element slow
   │  │  ├─ View screenshot → Element visible?
   │  │  │  ├─ Yes → Increase timeout or add explicit wait
   │  │  │  └─ No → Fix selector
   │  │  └─ Re-run SAME test
   │  │
   │  ├─ "Element not found" → Selector mismatch
   │  │  ├─ View screenshot → Element exists?
   │  │  │  ├─ Yes → Update selector to match actual DOM
   │  │  │  └─ No → Element not rendered (check app code)
   │  │  └─ Re-run SAME test
   │  │
   │  └─ Other error → Read full error, apply fix
   │
   └─ Re-run after fix → Verify exit 0
```

**Key Principles:**
- **Console errors = STOP** - Fix app code immediately
- **Selector errors = FIX SELECTOR** - Update test code
- **Exit 0 + screenshots OK = DONE** - Move to next test

---

## When to Stop Iterating

### ✅ STOP when ALL conditions met:

1. **Exit code 0** - Test passed
2. **No console errors** - `consoleErrors: 0` in all steps
3. **Screenshots correct** - No obvious bugs visible
4. **All assertions passed** - No failed assertions

**Example:**
```bash
tsty run my-flow --fail-fast
# Exit code: 0
# consoleErrors: 0
# Screenshots: ✓ No layout bugs
# Assertions: ✓ All passed
# → STOP iteration, test is complete
```

### ❌ DON'T STOP when:

1. **Exit code 1** - Test failed
2. **Console errors present** - Any step has `consoleErrors > 0`
3. **Obvious bugs in screenshots** - Broken layout, missing elements, overlapping text
4. **Assertions failing** - Expected elements not visible

**Example:**
```bash
tsty run my-flow --fail-fast
# Exit code: 1
# consoleErrors: 1
# Error: "TypeError: Cannot read property 'map' of undefined"
# → DON'T STOP - Fix JavaScript bug and re-run
```

### Edge Cases

**Minor UX issues (non-blocking):**
- Small spacing inconsistencies
- Color contrast slightly off
- Non-critical visual polish

**Action:** Note as "UX improvements" but don't iterate further. Move to next test.

**Application not rendering:**
- Blank page in screenshot
- "Loading..." stuck forever
- 404 error

**Action:** Fix application code (routing, data fetching, component rendering), then re-run.

---

## When to Create New Action vs. Fix Current

### Create New Action When:

1. **Current action passes** - Exit code 0, no errors
2. **Ready for next step** - Previous steps validated
3. **Building flow incrementally** - Micro-iteration mode

**Example:**
```bash
# Action 1 passes
tsty run test-action1 --fail-fast  # Exit 0 ✓

# Create action 2
echo '...' > .tsty/actions/action2.json
tsty run test-action2 --fail-fast  # Test action 2
```

### Fix Current Action When:

1. **Current action fails** - Exit code 1
2. **Console errors** - JavaScript bugs detected
3. **Selector doesn't work** - Element not found or timeout
4. **Assertions fail** - Expected state not reached

**Example:**
```bash
# Action 1 fails
tsty run test-action1 --fail-fast  # Exit 1 ✗
# Error: "Timeout waiting for selector"

# Fix action 1 (update selector)
# Edit .tsty/actions/action1.json

# Re-run same test
tsty run test-action1 --fail-fast  # Exit 0 ✓

# Now create action 2
```

**The Iron Rule:** Never create action N+1 until action N passes (exit 0).

---

## What to Fix: Test vs. Application Code

### Fix APPLICATION Code When:

1. **Console errors (JavaScript):**
   - `TypeError`, `ReferenceError`, `Cannot read property`
   - **Action:** Fix bug in app's `.tsx`, `.ts`, `.js`, `.jsx` files
   - **Tool:** Use Read to examine file, Edit to fix

2. **Visual bugs (Layout/CSS):**
   - Overlapping text, broken layout, missing elements
   - **Action:** Fix CSS, component structure, responsive styles
   - **Tool:** Use Read to check styles, Edit to fix

3. **Functionality bugs (Logic):**
   - Form doesn't submit, navigation doesn't work, data not loading
   - **Action:** Fix component logic, API calls, event handlers
   - **Tool:** Use Read to find bug, Edit to fix

4. **Missing elements (Rendering):**
   - Expected element doesn't exist in screenshot
   - **Action:** Check conditional rendering, data flow
   - **Tool:** Read component code, fix rendering logic

### Fix TEST Code When:

1. **Selector mismatch:**
   - Error: "Element not found" but element visible in screenshot
   - **Action:** Update selector to match actual DOM
   - **Tool:** Edit flow/action JSON with correct selector

2. **Wrong timeout:**
   - Element exists but loads slowly
   - **Action:** Increase timeout or add waitForLoadState
   - **Tool:** Edit flow/action JSON

3. **Wrong assertion:**
   - Assertion expects wrong state
   - **Action:** Update assertion selector or type
   - **Tool:** Edit flow/action JSON

4. **Wrong expected URL:**
   - Navigation works but expectedUrl incorrect
   - **Action:** Update expectedUrl to match actual redirect
   - **Tool:** Edit flow JSON

### Decision Matrix

| Symptom | Evidence | Fix What |
|---------|----------|----------|
| Console error | `TypeError: Cannot read...` | **APP CODE** |
| Selector timeout | Element visible in screenshot | **TEST CODE** (selector) |
| Selector timeout | Element NOT in screenshot | **APP CODE** (rendering) |
| Layout broken | Overlapping, misaligned | **APP CODE** (CSS) |
| Assertion fails | Element exists but different selector | **TEST CODE** (assertion) |
| Assertion fails | Element doesn't exist | **APP CODE** (rendering) |
| Navigation fails | expectedUrl different from actual | **TEST CODE** (expectedUrl) |
| Navigation fails | Redirect broken | **APP CODE** (routing) |

---

## Priority Order for Fixes

**When multiple issues detected, fix in this order:**

### Priority 1: Console Errors (CRITICAL)
- **Why:** JavaScript errors break all future steps
- **Action:** Fix immediately, re-run
- **Time saved:** 60-90 seconds per iteration

**Example:**
```json
{
  "consoleErrors": 1,
  "console": ["TypeError: Cannot read property 'map' of undefined at Dashboard.tsx:45"]
}
```

**Fix:** Add null check in Dashboard.tsx line 45

### Priority 2: Selector Errors (HIGH)
- **Why:** Current step can't proceed
- **Action:** Fix selector or rendering, re-run
- **Time saved:** 20-30 seconds per iteration

**Example:**
```
Error: Timeout waiting for selector: button:has-text('Create')
Screenshot shows: Button with text "Create New"
```

**Fix:** Update selector to `button:has-text('Create New')`

### Priority 3: Failed Assertions (MEDIUM)
- **Why:** Expected state not reached
- **Action:** Verify why assertion failed, fix cause
- **Time saved:** 15-20 seconds per iteration

**Example:**
```json
{
  "failedAssertions": [
    { "type": "visible", "selector": "h1:has-text('Dashboard')" }
  ]
}
```

**Fix:** Check if h1 exists with different text, or if element missing

### Priority 4: Visual Issues (LOW)
- **Why:** Layout bugs affect UX but don't block tests
- **Action:** Fix CSS/layout, verify with screenshot
- **Time saved:** Prevents user-facing bugs

**Example:**
- Screenshot shows text overlapping image
- **Fix:** Add margin or flexbox gap

### Priority 5: UX Improvements (NON-BLOCKING)
- **Why:** Polish, not bugs
- **Action:** Note for later, don't iterate now
- **Time saved:** Don't waste time on perfection

**Example:**
- Spacing slightly inconsistent
- Color contrast could be better
- **Action:** Note as "Future improvements", move on

---

## Examples

### Example 1: Console Error (Fix App Code)

**Report:**
```json
{
  "success": false,
  "stoppedEarly": true,
  "stopReason": "Console errors detected",
  "steps": [{
    "consoleErrors": 1,
    "console": ["TypeError: Cannot read property 'map' of undefined at Dashboard.tsx:45"]
  }]
}
```

**Decision:**
1. **What:** Console error (Priority 1)
2. **Fix what:** APPLICATION code (Dashboard.tsx:45)
3. **Action:** Read Dashboard.tsx, add null check, re-run

**DO NOT:** Create new actions, update selectors, or continue building flow

### Example 2: Selector Mismatch (Fix Test Code)

**Report:**
```json
{
  "success": false,
  "steps": [{
    "error": "Timeout 30000ms exceeded waiting for selector button:has-text('Create')"
  }]
}
```

**Screenshot:** Shows button with text "Create New Action"

**Decision:**
1. **What:** Selector timeout (Priority 2)
2. **Fix what:** TEST code (selector)
3. **Action:** Update selector to `button:has-text('Create New')`

**DO NOT:** Change app code, adjust timeout without checking screenshot

### Example 3: Test Passed (Create Next Action)

**Report:**
```json
{
  "success": true,
  "steps": [
    { "success": true, "consoleErrors": 0 },
    { "success": true, "consoleErrors": 0 }
  ]
}
```

**Screenshots:** All correct, no bugs

**Decision:**
1. **What:** Test passed (exit 0)
2. **Fix what:** Nothing
3. **Action:** Create next action or move to next test

**DO NOT:** Keep iterating on passed test, look for non-existent issues

---

## Summary

**Quick checklist after every run:**

1. ✅ Exit 0? → Check screenshots → DONE or next test
2. ❌ Console errors? → Fix app code → Re-run
3. ❌ Selector timeout? → Check screenshot → Fix selector or app
4. ❌ Assertion failed? → Verify selector or rendering → Fix
5. ⚠️ Visual issues? → Note severity → Fix or defer

**Golden rule:** Fix in priority order (console → selector → assertion → visual → UX)
