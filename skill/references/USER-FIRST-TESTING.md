# User-First Testing Guide

**⚠️ MOST COMMON MISTAKE IN TESTING SESSIONS**

**Real failure from 2026-02-06 session:**
```
Task: Test action creation - add primitive to sequence
Approach: Used complex selector `div:has-text('Focus'):has-text('Focus an element')`
Then tried: dragAndDrop
Both "worked" ✓ but primitive wasn't added ✗

Wrong conclusion: "Playwright/@dnd-kit incompatibility"
Time wasted: 60+ minutes trying workarounds
Bug status: Not fixed

RIGHT approach (takes 2 minutes):
1. Try: { "type": "click", "selector": "text=Focus" }
2. Test passed but no effect → FALSE SUCCESS detected
3. Read PrimitiveActionPalette.tsx
4. Find: Missing onClick handler (only useDraggable)
5. Fix: Add onClick to card component
6. Re-test: Now works ✓
Result: Bug fixed, feature functional
```

**The Lesson:** ALWAYS try the simplest user-like interaction FIRST.
- Simple click with `text=` selector (99% of cases)
- THEN investigate if it doesn't work
- Read code before assuming framework limitations

---

**CRITICAL PRINCIPLE: Test like a human user would interact with the application.**

## The Golden Rule

```
Before trying complex automation:
Ask yourself: "How would a human user do this?"
Then do exactly that in your test.
```

## User Interaction Hierarchy (Try in Order)

### 1. **Simple Click** (99% of cases)
```json
// ✅ ALWAYS TRY FIRST
{ "type": "click", "selector": "text=Submit" }
{ "type": "click", "selector": "text=Focus" }
{ "type": "click", "selector": "button:has-text('Save')" }
```

### 2. **Simple Type/Fill** (for inputs)
```json
// ✅ How humans interact with forms
{ "type": "fill", "selector": "input[placeholder='Email']", "value": "test@example.com" }
{ "type": "type", "selector": "textarea", "text": "Hello world" }
```

### 3. **Keyboard Navigation** (if user would use keyboard)
```json
// ✅ For power users, accessibility
{ "type": "press", "key": "Enter" }
{ "type": "press", "key": "Tab" }
```

### 4. **Drag and Drop** (only if REQUIRED by UI)
```json
// ⚠️ ONLY if clicking doesn't work AND feature requires drag
{ "type": "dragAndDrop", "source": "text=Item", "target": "text=Drop Zone" }
```

### 5. **JavaScript Evaluation** (LAST RESORT)
```json
// ❌ AVOID - Only when NO user-facing interaction exists
{ "type": "evaluate", "pageFunction": "..." }
```

## Selector Simplicity Hierarchy

### Level 1: Text-Based (BEST - Most Human-Like)
```json
"text=Submit"              // Exact text
"text=Add to Cart"         // Multi-word exact
"button:has-text('Save')"  // Text within element type
```

**Why:** Humans identify elements by visible text, not CSS classes.

### Level 2: Semantic Attributes
```json
"placeholder=Email"           // Form placeholders
"[aria-label='Close dialog']" // Accessibility labels
"[role='button']"             // ARIA roles
"[name='username']"           // Form names
```

**Why:** These are user-visible/meaningful attributes.

### Level 3: Simple CSS (when text isn't unique)
```json
"button.primary"           // Simple class
"input[type='email']"      // Input types
"#submit-button"           // Unique IDs
```

**Why:** Still relatively stable selectors.

### Level 4: Complex Selectors (AVOID)
```json
// ❌ TOO COMPLEX - Fragile and hard to maintain
"div.container > div.form-group:nth-child(3) > input.form-control"
"div:has-text('Focus'):has-text('Focus an element')" // My mistake!
```

**Why:** Breaks easily with UI changes, not how users think.

## Real Example from This Session

### ❌ What I Did (Wrong):
```json
{
  "type": "click",
  "selector": "div:has-text('Focus'):has-text('Focus an element')"
}
// Result: Test passed, but primitive wasn't added!
// I never tried simple click, assumed Playwright issue
```

### ✅ What I Should Have Done:
```json
// Step 1: Try simple click (like a human)
{
  "type": "click",
  "selector": "text=Focus"
}
// If this doesn't work → Investigate why → Fix the bug
```

## The "Human Test" Checklist

Before writing ANY test step, ask:

- [ ] **Would a human see this text/button?** → Use text selector
- [ ] **Would a human click or drag?** → Try click first
- [ ] **Would a human use keyboard?** → Use press/type
- [ ] **Is this visible on screen?** → Don't use hidden elements
- [ ] **Is this how the app is meant to be used?** → Don't hack around bugs

## When Features Don't Work as Expected

### ❌ WRONG Approach (What I Did):
```
1. Try complex selector
2. Doesn't work
3. Try dragAndDrop
4. Doesn't work
5. Conclude: "Playwright limitation"
6. Give up / find workaround
```

### ✅ RIGHT Approach (What I Should Do):
```
1. Try simple user action (text=Focus click)
2. Doesn't work (test passes but no effect)
3. Compare screenshots → Primitive not added
4. Read component code → Find missing onClick handler
5. Fix the bug → Add click handler
6. Re-run test → Now it works!
7. Success: Bug fixed, test passes, feature works
```

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Over-Engineering
```json
// Using evaluate() when click would work
{
  "type": "evaluate",
  "pageFunction": "document.querySelector('button').click()"
}
// Should be:
{ "type": "click", "selector": "text=Submit" }
```

### ❌ Anti-Pattern 2: Assumption Without Investigation
```
"Drag and drop doesn't work → Must be Playwright/library issue"
// Should think:
"Feature doesn't work → Let me read the code and fix it"
```

### ❌ Anti-Pattern 3: Complex Selectors First
```json
{ "selector": "div.card:nth-child(3) > div.content > p.text" }
// Should try first:
{ "selector": "text=Expected Content" }
```

### ❌ Anti-Pattern 4: Accepting False Success
```
Test passed ✓
Screenshot shows no change ✓ ← Wait, this is WRONG!
Move to next test ✓ ← NO! Investigate!
```

## Best Practices Summary

1. **Think like a user, not a test engineer**
2. **Simplest interaction first** (click before drag, fill before evaluate)
3. **Text selectors whenever possible** (how humans identify elements)
4. **Verify functional outcome** (not just test pass)
5. **Fix bugs found** (don't work around them)
6. **Read code when stuck** (understand HOW features work)

## Quick Decision Tree

```
Need to interact with element?
├─ Is it text/button a user clicks? → text= selector + click
├─ Is it an input field? → placeholder/name selector + fill
├─ Does it require drag? → Try click first, then drag if truly needed
├─ Is it keyboard-driven? → press primitive
└─ No user-facing interaction? → Read code, maybe it's missing → Fix it
```

**Remember: If a human can do it, Playwright can do it. Keep it simple.**
