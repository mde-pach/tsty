# Bug Detection Checklist

**When a feature doesn't work after test passes, use this checklist to find the bug fast.**

---

## 🎯 Default Assumption

**Application bug until proven otherwise**

```
Distribution of root causes (from real data):
├─ 80% Missing event handler (onClick, onSubmit, onChange)
├─ 15% Wrong selector in test
├─ 3% Wrong field name in code
├─ 1.9% Timing issue
└─ 0.1% Framework limitation
```

**Work through this checklist in order. Stop when you find the bug.**

---

## 1️⃣ Missing Event Handler (80% of issues)

**Symptom**: Click/fill succeeds but nothing happens (screenshot unchanged)

**Check**:
```typescript
// ❌ BAD: No onClick
<button>Save</button>

// ❌ BAD: Only useDraggable (for @dnd-kit)
<div {...listeners} {...attributes}>
  Item
</div>

// ✅ GOOD: Has onClick
<button onClick={handleSave}>Save</button>

// ✅ GOOD: Both drag AND click
<div {...listeners} {...attributes} onClick={handleClick}>
  Item
</div>
```

**Fix**:
1. Read the component file
2. Find the element (button, card, input)
3. Check if event handler exists
4. Add handler if missing:
   ```typescript
   const handleClick = () => {
     // Add item, open modal, etc.
   };
   ```
5. Re-run test

**Example from real testing**:
- Test clicked "Focus" primitive card
- Playwright reported success
- Screenshot showed "No actions yet"
- **Root cause**: Card had `useDraggable` but no `onClick`
- **Fix**: Added `onClick={handleClick}` with `addAction()` call
- Result: Feature worked

---

## 2️⃣ Wrong Selector (15% of issues)

**Symptom**: `TimeoutError: Waiting for selector "..." to be visible`

**Debug steps**:

1. **Check HTML from discovery flow**:
   ```bash
   cat .tsty/reports/*.json | jq -r '.steps[0].html' > page.html
   grep 'placeholder\|button\|aria-label' page.html
   ```

2. **Use EXACT text/placeholder from HTML**:
   ```json
   ✅ "selector": "input[placeholder='Email address']"  // From HTML
   ❌ "selector": "input[type='email']"  // Guessed
   ```

3. **Try simpler selectors**:
   ```json
   // Try in order:
   1. "text=Save"
   2. "button:has-text('Save')"
   3. "[aria-label='Save']"
   4. ".save-button"  // Last resort
   ```

4. **Check for dynamic content**:
   ```json
   // If element loads after page, add wait:
   {
     "type": "waitForSelector",
     "selector": "text=Dashboard"
   }
   ```

**Fix**: Update selector in flow JSON, re-run test

---

## 3️⃣ Wrong Field Name (3% of issues)

**Symptom**: Code reads `undefined`, context doesn't update, or TypeScript error

**Check type definitions FIRST**:

```typescript
// ❌ WRONG ASSUMPTION
const items = definition.actions  // Doesn't exist!

// ✅ CHECK TYPES FIRST
interface ActionDefinition {
  primitives: Primitive[];  // ← Actual field name
}

// ✅ CORRECT
const items = definition.primitives
```

**Common confusions**:
- `Flow.actions` (array of action IDs) vs `ActionDefinition.primitives` (array of primitive objects)
- `action.selector` vs `action.target` vs `action.element`
- `definition.steps` vs `flow.steps`

**Fix**:
1. Read the interface definition in `types.ts`
2. Find the ACTUAL field name
3. Update code to use correct field
4. Re-run test

**Example from real testing**:
- Context used `definition.primitives`
- I thought "that's wrong, should be `.actions`"
- Changed to `.actions` → Still didn't work
- **Checked types**: `primitives: Primitive[]` is correct!
- **Fix**: Reverted to `definition.primitives`

---

## 4️⃣ Timing Issue (1.9% of issues)

**Symptom**: Works sometimes, fails other times (flaky)

**Fixes**:

1. **Wait for load state**:
   ```json
   {
     "type": "waitForLoadState",
     "options": { "state": "networkidle" }
   }
   ```

2. **Wait for specific element**:
   ```json
   {
     "type": "waitForSelector",
     "selector": "text=Dashboard",
     "options": { "state": "visible" }
   }
   ```

3. **Short timeout for UI updates**:
   ```json
   {
     "type": "waitForTimeout",
     "timeout": 500
   }
   ```

4. **Check if dev server needs rebuild time**:
   ```bash
   # Wait for Next.js hot reload
   sleep 3 && tsty run my-flow
   ```

---

## 5️⃣ Framework Limitation (0.1% of issues)

**ONLY conclude this after trying everything above**

**Before blaming framework**:
- ✅ Tried `text=` selector + click
- ✅ Read component code and verified handlers exist
- ✅ Tested with 3+ different selector approaches
- ✅ Tried both click AND keyboard interaction
- ✅ Checked if framework has documented limitations

**Real framework limitations** (rare):
- Playwright can't interact with elements inside `<iframe>` from different origin
- Can't test browser native dialogs (alert/confirm)
- Can't test file system dialogs (some OS restrictions)
- Can't test browser extensions

**99% of the time it's NOT a framework limitation**

---

## 🔍 Investigation Workflow

When test passes but feature doesn't work:

```
1. Look at screenshot
   └─ No change? → Check #1 (Missing handler)

2. Check component code
   └─ No onClick? → Add it (#1)
   └─ Has onClick? → Check #3 (Field name)

3. Check console logs in report
   └─ Errors? → Fix app code
   └─ No errors? → Check #2 (Selector)

4. Try simpler selector
   └─ Still fails? → Check #4 (Timing)

5. Add wait/timeout
   └─ Still fails? → Check #3 (Field name)

6. All else fails?
   └─ Re-read component code carefully
   └─ Add debug console.logs
   └─ Check if using correct API/method
```

**Stop at first bug found. Fix it. Re-run. Don't continue investigating.**

---

## 💡 Key Principles

1. **Screenshot is ground truth** - If it doesn't show the change, feature is broken
2. **Read code before assuming** - Don't guess what's wrong
3. **Check types first** - Field name confusion wastes time
4. **Simple before complex** - Try `text=` + click before anything fancy
5. **Fix ONE thing at a time** - Don't change multiple things simultaneously

---

## 🚨 Red Flags

These are signs you're on the wrong track:

❌ "Let me try drag-and-drop" (before trying click)
❌ "Maybe it's a Playwright bug" (before reading code)
❌ "Let me use JavaScript evaluate" (before trying simple selector)
❌ "It worked in dev, must be timing" (before checking if handler exists)
❌ "I'll rewrite the whole test" (before finding the bug)

✅ "Let me check the screenshot"
✅ "Let me read the component code"
✅ "Let me verify the handler exists"
✅ "Let me use the simplest selector"
✅ "Let me fix ONE thing and re-test"

---

## 📊 Success Metrics

After using this checklist:

- ✅ Bug found in <5 minutes (vs 30+ without checklist)
- ✅ Fixed application code (vs worked around it)
- ✅ Test now reliable (not flaky)
- ✅ Learned what the actual bug was

**Remember**: Most bugs are in YOUR application code, not in the test framework or Playwright.
