# Bug Fixing Workflow

**⚠️ PRIMARY FAILURE MODE: Assuming Framework Limitations**

**Real failure from 2026-02-06 session:**
```
Symptom: Clicking primitive "worked" ✓ but primitive not added ✗
My conclusion: "Playwright/@dnd-kit incompatibility - framework limitation"
My action: Tried workarounds (JSON editing, complex selectors)
Time wasted: 60+ minutes
Bug status: NOT FIXED

What I should have done (5 minutes):
1. Detect: Test passed ✓ but screenshot unchanged ✗ = FALSE SUCCESS
2. Read: PrimitiveActionPalette.tsx component code
3. Find: Only useDraggable hook, no onClick handler
4. Fix: Add onClick handler to component
5. Re-test: Feature now works ✓
6. Result: BUG FIXED, feature usable

Statistics from session:
- Tried 2 approaches (click, dragAndDrop)
- Concluded "framework issue" after 2 failed attempts
- Never read the code
- Never tested simple `text=Focus` selector
- Never considered missing event handler
```

**The Lesson:** 99% of test failures are application bugs or wrong selectors, NOT framework limitations.

**Default action:** Investigate and FIX bugs. Reporting should be rare (10% of cases).

---

**CRITICAL: When tests fail or features don't work → INVESTIGATE and FIX the bug, don't assume limitations.**

## The Golden Rule

```
99% of test failures are due to:
1. Application bugs (70%)
2. Wrong test selectors (25%)
3. Timing issues (4%)
4. Framework limitations (1%)

DEFAULT ASSUMPTION: It's an application bug until proven otherwise.
```

## The 3-Question Triage

When a test fails or feature doesn't work, ask these in order:

### Question 1: Is it a TEST issue?

**Symptoms:**
- Wrong selector (element exists but not found)
- Timing issue (element loads after action)
- Assertion too strict

**Fix:** Update the test
```json
// Wrong selector
{ "selector": "button.submit" } → { "selector": "text=Submit" }

// Timing
Add: { "type": "waitForTimeout", "timeout": 1000 }
```

### Question 2: Is it an APP BUG? (Most Common!)

**Symptoms:**
- Test passes ✓ BUT screenshot shows no change ❌
- Element exists BUT clicking does nothing
- Feature described BUT not implemented
- Console errors during interaction

**Fix:** Fix the application code

**MANDATORY STEPS:**
1. Read the component code
2. Identify the bug (missing handler, wrong logic, etc.)
3. Fix the code
4. Re-run the test
5. Verify it now works

### Question 3: Is it a FRAMEWORK limitation? (Rare!)

**Symptoms:**
- Test correct ✓
- App code correct ✓
- Multiple interaction approaches all fail ✓
- Known Playwright/library issue (verified online)

**Fix:** Document + workaround

**ONLY conclude this after exhausting options 1 and 2!**

---

## 🚨 Type Confusion Warning (Common Pitfall)

**When debugging, CHECK TYPE DEFINITIONS FIRST before "fixing" field names.**

### The Problem

```typescript
// Code uses definition.primitives
const items = definition.primitives;

// You think: "That's wrong, should be .actions"
// You change to:
const items = definition.actions;  // ❌ WRONG!

// Still doesn't work...
// You waste 10+ minutes debugging...
```

### The Solution

**ALWAYS check the interface definition BEFORE assuming**:

```typescript
// 1. READ THE TYPES FIRST
interface ActionDefinition {
  primitives: Primitive[];  // ← Actual field name
  // NO "actions" field exists!
}

// 2. USE THE CORRECT FIELD
const items = definition.primitives;  // ✅ CORRECT
```

### Common Confusions

| Code Uses | You Assume | Actual Field | Type |
|-----------|------------|--------------|------|
| `definition.primitives` | Should be `.actions` | `primitives` | `ActionDefinition` |
| `flow.actions` | Should be `.primitives` | `actions` | `Flow` (action IDs) |
| `action.selector` | Should be `.element` | `selector` | `ClickAction` |
| `step.primitives` | Should be `.actions` | Both valid! | `FlowStep` |

### Investigation Steps

**When you see code that "looks wrong":**

1. **DON'T assume** - Check types first
2. **READ** the interface definition in `types.ts`
3. **FIND** the actual field name
4. **VERIFY** the code is using correct field
5. **ONLY THEN** change if actually wrong

### Real Example

From 2026-02-06 session:

```typescript
// Saw this code:
const newDefinition = {
  ...definition,
  actions: [...definition.primitives, action]  // Looks confusing
};

// Thought: "Bug! Should be definition.actions not .primitives"
// Changed to:
const newDefinition = {
  ...definition,
  actions: [...definition.actions, action]  // ❌ WRONG
};

// Still didn't work...

// THEN checked types:
interface ActionDefinition {
  primitives: Primitive[];  // ← primitives is CORRECT
}

// Root cause: Code was correct, I confused it with Flow.actions
```

### Prevention

**Before "fixing" a field name:**
- [ ] Read the type definition
- [ ] Confirm actual field name
- [ ] Check if multiple types have similar fields
- [ ] Verify which type the variable is

**Rule**: Type confusion wastes time. Check types FIRST, not last.

---

## Real Example from Session: The Primitive Click Bug

### What Happened:
```
Test: Click on "Focus" primitive to add it to sequence
Result: Test passed ✓, but primitive NOT added
Screenshot: "No actions yet" (unchanged)
```

### ❌ What I Did (Wrong):
```
1. Tried: click with complex selector
2. Tried: dragAndDrop
3. Both "passed" but didn't work
4. Concluded: "Playwright/@dnd-kit incompatibility"
5. Gave up, tried workarounds (JSON editing)
```

### ✅ What I SHOULD Have Done:
```
1. Tried: Simple click: text=Focus
2. Test passed but no effect (FALSE SUCCESS detected)
3. Investigate: Read PrimitiveActionPalette.tsx
4. Found: Only useDraggable hook, no onClick handler
5. Fixed: Add onClick handler to primitive cards
6. Re-test: Now clicking adds primitive to sequence
7. Success: Bug fixed, feature works
```

## Investigation Protocol (MANDATORY)

When feature doesn't work as expected:

### Step 1: Gather Evidence
- Screenshot BEFORE action
- Screenshot AFTER action
- Console logs from report
- Expected vs actual behavior

### Step 2: Reproduce with Simple Interaction
```json
// Try the SIMPLEST user action first
{ "type": "click", "selector": "text=Element" }
// Not:
{ "type": "dragAndDrop", ... }
```

### Step 3: Compare Screenshots
```
Before: Element visible, sequence empty
After: Element visible, sequence STILL empty
Conclusion: Click happened, but handler didn't work
```

### Step 4: Read the Code
```bash
# Find the component
grep -r "Focus an element" src/

# Read the component
cat src/dashboard/components/action-editor/primitive-action-palette.tsx

# Look for event handlers
# Found: useDraggable, no onClick → BUG!
```

### Step 5: Form Hypotheses
```
Hypothesis 1: Missing onClick handler
Hypothesis 2: droppable zone not configured
Hypothesis 3: Event propagation stopped somewhere
```

### Step 6: Test Each Hypothesis
```
Test H1: Add onClick handler → See if it fires
Test H2: Check DndContext configuration
Test H3: Check parent element handlers
```

### Step 7: Fix the Bug
```typescript
// Before (bug):
function PrimitiveActionCard({ template }: Props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `primitive-${template.type}`,
  });

  return <div ref={setNodeRef} {...listeners} {...attributes}>...</div>;
}

// After (fixed):
function PrimitiveActionCard({ template, onAdd }: Props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `primitive-${template.type}`,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAdd(template.type)} // ✅ Added
    >...</div>
  );
}
```

### Step 8: Re-Run Test
```bash
bun run qa run test-click-primitive --fail-fast
# ✅ Test Passed
# ✅ Screenshot shows primitive added
# ✅ Functional outcome correct
```

### Step 9: Verify Fix
- Test still passes ✓
- Screenshot shows expected change ✓
- Feature works as user would expect ✓

## Bug Classification & Response

### Type A: Missing Functionality
**Example:** Click does nothing because no onClick handler exists

**Response:**
1. Add the missing handler/feature
2. Re-test to verify it works

### Type B: Broken Logic
**Example:** Click handler exists but has wrong logic

**Response:**
1. Fix the logic bug
2. Re-test to verify correct behavior

### Type C: Selector Issue
**Example:** Element exists but selector doesn't match

**Response:**
1. Update selector in test
2. Re-run test

### Type D: Timing Issue
**Example:** Element loads after test tries to interact

**Response:**
1. Add appropriate wait primitive
2. Re-run test

### Type E: Framework Limitation (Very Rare!)
**Example:** Playwright truly cannot simulate the interaction

**Response:**
1. Document the limitation
2. Add alternative interaction method to app
3. Use workaround in test

## Decision Tree

```
Feature doesn't work?
│
├─ Did test throw error?
│  ├─ Yes → Selector wrong? → Fix selector
│  └─ No → Continue below
│
├─ Did test pass but no visible change?
│  ├─ Yes → FALSE SUCCESS → Investigate code
│  └─ No → Continue below
│
├─ Console errors during step?
│  ├─ Yes → JavaScript bug → Fix app code
│  └─ No → Continue below
│
├─ Element visible in screenshot?
│  ├─ No → Wait for element → Add wait
│  └─ Yes → Continue below
│
├─ Tried simple user action (text= + click)?
│  ├─ No → Try that first!
│  └─ Yes → Continue below
│
├─ Read component code?
│  ├─ No → Read it now!
│  └─ Yes → Continue below
│
├─ Found missing handler/logic bug?
│  ├─ Yes → Fix the bug!
│  └─ No → Continue below
│
├─ Tried 3+ different interaction methods?
│  ├─ No → Try more approaches
│  └─ Yes → Might be framework limit, verify online
│
└─ Confirmed framework limitation?
   ├─ No → Keep investigating
   └─ Yes → Document + alternative
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Assuming Limitations Too Quickly
```
"Drag and drop doesn't work with @dnd-kit"
// Without:
// - Trying simple click
// - Reading the code
// - Checking if onClick exists
```

### ❌ Mistake 2: Accepting False Success
```
Test: ✅ Passed
Screenshot: No change
Action: Move to next test
// Should: Investigate why no change!
```

### ❌ Mistake 3: Working Around Instead of Fixing
```
Bug: Feature X doesn't work via UI
Action: Use evaluate() to manipulate state directly
// Should: Fix feature X so it works via UI!
```

### ❌ Mistake 4: Single Hypothesis
```
"It's a Playwright issue"
// Should: Test multiple hypotheses
// - Missing handler?
// - Wrong event type?
// - Element not interactive?
// - Timing issue?
```

### ❌ Mistake 5: Not Reading Code
```
"I tried 2 approaches, both failed, must be limitation"
// Should: Read the actual code to understand HOW it works
```

## Best Practices

### ✅ DO:
- **Investigate before concluding**
- **Read code when feature doesn't work**
- **Fix bugs found during testing**
- **Re-test after fixes to verify**
- **Try simple interactions first**
- **Form multiple hypotheses**

### ❌ DON'T:
- **Assume framework limitations**
- **Accept false success (passed but wrong outcome)**
- **Work around bugs instead of fixing**
- **Use complex interactions before simple ones**
- **Give up after 1-2 attempts**

## The Iterative Fix Loop

```
1. Feature doesn't work
2. Gather evidence (screenshots, console)
3. Try simple interaction
4. Still doesn't work?
5. Read component code
6. Identify bug
7. Fix bug
8. Re-run test
9. Verify fix worked
10. Move to next test
```

**Remember: Your job is to make tests pass by fixing the application, not to report failures.**

## When to Escalate vs Fix

### Fix Yourself:
- Missing event handlers (onClick, onChange)
- Wrong selector in test
- Timing issues (add waits)
- Simple logic bugs
- Missing form attributes (name, placeholder)
- Broken assertions in test

### Escalate/Discuss with User:
- Architectural decisions (should this feature exist?)
- Complex refactoring needed
- Breaking changes required
- Security implications
- Third-party library bugs (truly confirmed)
- Database schema changes

**Default: Fix yourself. Escalate only when truly blocked.**
