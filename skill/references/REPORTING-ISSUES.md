# Reporting Issues During Testing

## When to Report

Report to user when:
- **Feature appears broken** - Multiple interaction approaches failed (tried 3+ selectors/methods)
- **App shows errors** - Console errors in application code (not test framework)
- **Data is incomplete** - Created files are empty/invalid despite test passing
- **Stuck after investigation** - Tried multiple solutions from Investigation Protocol
- **Need user decision** - Whether to fix bug vs work around vs skip feature

## Evidence Collection Checklist

Before reporting, systematically collect evidence:

### Visual Evidence
- [ ] Screenshot before interaction
- [ ] Screenshot after interaction (showing lack of change)
- [ ] Comparison showing expected vs actual state

### Technical Evidence
- [ ] Exact commands run (including selectors used)
- [ ] Exit code (0 or 1)
- [ ] Console errors from report: `jq '.steps[N].console'`
- [ ] File contents (if created): `cat .tsty/path/file.json`
- [ ] Network errors (if any)

### Attempted Solutions
- [ ] List ALL selectors tried (minimum 3 different approaches)
- [ ] List ALL interaction types tried (click, drag, keyboard, etc.)
- [ ] Timing adjustments tried (waitForLoadState, waitForSelector, etc.)
- [ ] Alternative approaches tried (different workflows, workarounds)

## Report Template

Use this template for clear, actionable issue reports:

```markdown
## Issue: [Feature Name] Not Working

**What I'm trying to do:**
[User perspective description, e.g., "Add a primitive to the action sequence"]

**Expected behavior:**
- UI should show primitive in sequence
- Count should update to "1 action"
- File should have primitives: [{ type: "fill", ... }]

**Actual behavior:**
- UI still shows "No actions yet"
- Count still shows "0 actions"
- File has primitives: []

**Evidence:**

1. **Screenshots:**
   - Before: .tsty/screenshots/run-*/3-before-add-primitive.png
   - After: .tsty/screenshots/run-*/4-after-add-primitive.png
   - Observation: No visual change between before/after

2. **File content:**
   ```json
   {
     "type": "interaction",
     "description": "Test action",
     "primitives": []  // ← Expected content here
   }
   ```

3. **Console output:**
   - Exit code: 0 (test passed)
   - Console errors: 0
   - No JavaScript errors visible

4. **Commands run:**
   ```bash
   tsty run test-add-primitive --fail-fast
   # Exit 0 but outcome wrong
   ```

**Attempts made:**

1. Tried click selector: `"button:has-text('Fill')"` → No visible response
2. Tried dragAndDrop: `source: "div:has-text('Fill')", target: ".sequence"` → Selector timeout
3. Tried alternative selector: `"[data-primitive='fill']"` → Element not found
4. Tried double-click: `{ "type": "dblclick" }` → No response
5. Checked console: No JavaScript errors during interaction

**Hypothesis:**
Feature might be broken in the application. Neither click nor drag-and-drop adds
primitives to the sequence. Possible causes:
- Click handler not wired up
- Drag-and-drop event listeners missing
- Component state not updating

**Question:**
Should I:
1. Investigate the component code to fix the bug?
2. Work around it (e.g., edit JSON directly)?
3. Skip this feature for now?
```

## What NOT to Report

Don't report if:

### Too Early
- Only tried ONE approach (try at least 3 different selectors/interactions)
- Haven't checked screenshots (might be working but assertion wrong)
- Haven't checked file contents (might exist but need content verification)
- Haven't consulted Investigation Protocol yet

### Can Self-Resolve
- Selector just needs adjustment (element exists, wrong selector)
- Timing issue (add waitForLoadState, waitForSelector)
- Simple typo in test code
- Known workaround exists and makes sense

### Wrong Diagnosis
- Test framework error (not app bug) - fix test, don't report
- Expected behavior (feature works as designed, test expectations wrong)
- User error in test setup (fix test, don't report)

## Reporting Flow

```
Encounter issue
  ↓
Use Investigation Protocol (6 steps)
  ↓
Tried 3+ approaches? → NO → Try more first
  ↓ YES
Feature clearly broken? → NO → Fix selector/test
  ↓ YES
Collect evidence (checklist above)
  ↓
Format report (template above)
  ↓
Present to user with clear question
  ↓
User decides: Fix / Workaround / Skip
```

## Good Report Examples

### Example 1: Feature Broken

```
## Issue: Drag-and-Drop Primitives Not Working

**What I'm trying to do:** Add primitives to action sequence via drag-and-drop

**Expected:** Primitive appears in sequence, badge shows "1 action"
**Actual:** Sequence stays empty, badge shows "0 actions"

**Evidence:**
- Screenshots show no change after drag attempt
- File has empty primitives array
- Tried 5 different approaches (click, drag, dblclick, keyboard)
- No console errors

**Hypothesis:** Both click AND drag don't work - likely missing event handlers

**Question:** Should I fix the component or use JSON editor workaround?
```

### Example 2: Console Errors

```
## Issue: JavaScript Error Preventing Form Submission

**What I'm trying to do:** Submit login form

**Expected:** Navigate to /dashboard
**Actual:** Form doesn't submit, stays on /login

**Evidence:**
- Console shows: "TypeError: Cannot read property 'value' of null"
- Screenshot shows form unchanged
- Error in app code (src/components/LoginForm.tsx:45)

**Question:** Should I fix the TypeError in LoginForm.tsx?
```

## Bad Report Examples

### ❌ Too Vague

```
"The test isn't working. What should I do?"
```

**Problem:** No evidence, no context, no attempted solutions

### ❌ Premature

```
"Selector timeout on button:has-text('Submit'). Is the app broken?"
```

**Problem:** Only tried ONE selector, didn't investigate alternatives

### ❌ Wrong Focus

```
"The test framework has a bug - my assertion passed but feature didn't work"
```

**Problem:** This is the correct behavior! Test passing ≠ feature working. Should have used Investigation Protocol to check the outcome.

## Key Principles

1. **Evidence First** - Show, don't tell. Screenshots and file contents prove the issue.
2. **Exhaust Options** - Try multiple approaches before reporting (minimum 3).
3. **Clear Hypothesis** - Explain what you think is wrong and why.
4. **Actionable Question** - Give user clear options to choose from.
5. **Respect User Time** - Only report when truly stuck or need decision.

## After Reporting

Once user responds:

- **"Fix it"** → Investigate code, apply fix, re-test
- **"Work around"** → Use alternative approach, document why
- **"Skip for now"** → Note in test results, continue with other features
- **"Not a bug"** → Adjust test expectations, fix test code

Always re-test after resolution to verify the fix worked.
