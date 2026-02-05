# E2E Testing Guide: Discovery-First Iterative Approach

## Core Philosophy: HTML-First → Validate → Build

**NEVER guess selectors.** Always extract HTML first for exact selectors.

```
❌ WRONG: Assumption-Based Testing
1. Guess selectors: [data-tab='actions']
2. Create 9-step flow
3. Run → all fail
4. Debug for 20 minutes
5. Realize UI is completely different

❌ SLOW: Screenshot-Based Testing
1. Navigate + screenshot (20s)
2. Analyze visually (5 min)
3. Guess selectors from screenshot
4. Test → selectors wrong
5. Debug for 10+ minutes

✅ RIGHT: HTML-First Testing (FASTEST)
1. Navigate + capture HTML (15s)
2. Extract exact selectors from HTML (30s)
3. Create 1 action with real selectors
4. Test in isolation (15s) → Works first try
5. Add next action
6. Repeat → Full E2E passes in 5-10 min
```

---

## The HTML-First Workflow

### Phase 1: HTML-FIRST DISCOVERY (PRIMARY METHOD)

**Goal:** Extract exact selectors from HTML for 10x faster testing.

**Why HTML-first:** 10x faster than screenshot analysis, exact selectors, no guessing.

#### Step 1: Capture HTML + Check Console

```json
{
  "name": "discover-html",
  "baseUrl": "http://localhost:4000",
  "failFast": true,
  "monitorConsole": true,
  "steps": [{
    "name": "Load and capture",
    "url": "/actions",
    "expectedUrl": "/actions",
    "capture": { "html": true, "screenshot": true }
  }]
}
```

```bash
tsty run discover-html --fail-fast
```

#### Step 1.5: CHECK CONSOLE FIRST (CRITICAL)

**Before analyzing HTML, check console:**

```bash
# Check for console errors IMMEDIATELY
cat .tsty/reports/flow-discover-html-*.json | jq '.steps[0].consoleErrors'
```

**If consoleErrors > 0:**
- 🚨 **STOP EVERYTHING**
- Read error: `jq '.steps[0].console' report.json`
- Fix JavaScript error in app code
- Re-run discovery
- Verify consoleErrors = 0

**If consoleErrors = 0:**
- ✅ Continue to Step 2

#### Step 2: Extract Selectors from HTML (EXACT COMMANDS)

**Location:** `.tsty/reports/flow-discover-html-*.json`

**Extract HTML to file:**
```bash
# Extract HTML from latest report
cat .tsty/reports/flow-discover-html-*.json | jq -r '.steps[0].html' > page.html

# Or with specific report name
cat .tsty/reports/flow-discover-html-1234567890.json | jq -r '.steps[0].html' > page.html
```

**Find selectors in HTML:**
```bash
# Find all placeholder attributes (best for inputs)
grep -o 'placeholder="[^"]*"' page.html

# Find all data-testid attributes (best for stable selectors)
grep -o 'data-testid="[^"]*"' page.html

# Find all button text
grep -oP '(?<=<button[^>]*>)[^<]+' page.html

# Find all input names
grep -o 'name="[^"]*"' page.html

# Find all aria-labels
grep -o 'aria-label="[^"]*"' page.html
```

**What to extract from HTML (in priority order):**
1. `data-testid="..."` - BEST: Stable, explicit test selectors
2. `placeholder="..."` - GREAT: Input hints (exact text)
3. `name="..."` - GOOD: Form field names
4. `aria-label="..."` - GOOD: Accessibility labels
5. Text content - GOOD: User-facing text
6. CSS classes - AVOID: Unstable, change often

**Example HTML:**
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

**Extracted selectors (GOOD - from HTML):**
- Button: `[data-action="create"]` or `text=New Action`
- Input: `input[placeholder="Enter action name"]`

#### Selector Quality: Good vs Bad

**✅ GOOD (from HTML):**
```json
// Exact placeholder from HTML
{ "selector": "input[placeholder='Enter action name']" }

// Exact text from HTML
{ "selector": "text=New Action" }

// Exact name attribute
{ "selector": "input[name='actionName']" }
```

**❌ BAD (guessed):**
```json
// Guessed CSS class (changes often)
{ "selector": ".btn-primary" }

// Guessed structure (fragile)
{ "selector": "div > div > button:nth-child(2)" }

// Partial/wrong text
{ "selector": "text=Create" }  // HTML says "New Action"

// Overly complex
{ "selector": "div:has-text('New'):has-text('Action')" }
```

**Real example from testing session:**
```html
<!-- HTML captured -->
<input placeholder="Action name (e.g., Login, Search, Add to cart)" />

✅ CORRECT (exact from HTML):
"selector": "input[placeholder='Action name (e.g., Login, Search, Add to cart)']"

❌ WRONG (guessed):
"selector": "input[type='text']"  // Too generic, multiple matches
"selector": "input[name='name']"  // Field doesn't have name attribute
```

**Rule**: If you didn't see it in the HTML, don't use it.

#### Step 3: Create Actions with Validated Selectors

```json
{
  "type": "interaction",
  "description": "Click create button",
  "primitives": [
    { "type": "click", "selector": "[data-action='create']" }
  ]
}
```

#### Step 4: Test Action

Run micro-iteration test (2-step flow) to verify selector works.

**Benefits of HTML-first:**
- ⚡ 10x Faster - No visual interpretation needed
- 🎯 100% Exact - Copy selectors from source
- 📋 Complete - Hidden/dynamic elements visible
- ✅ First-try success - No guessing, no retries

---

### Phase 1B: Screenshot-Based Discovery (FALLBACK ONLY)

**Use screenshot-based ONLY when:**
- HTML not captured in report (framework limitation)
- Visual layout review needed (spacing, alignment, colors)
- Accessibility analysis required (contrast, size)

**Process:**
1. Run discovery with `capture: { screenshot: true }`
2. View screenshot: `.tsty/screenshots/run-*/1-*.png`
3. Identify elements visually
4. Use user-perspective selectors:
   - Text content: `button:has-text('New Action')`
   - Placeholders: `input[placeholder*='email' i]`
   - ARIA labels: `[aria-label='Submit']`
5. Test selector immediately (2-step flow)
6. If wrong: View screenshot again, update selector

**Why slower:**
- Visual interpretation takes 5+ min
- Selectors often need refinement (1-3 retries)
- Can't see hidden attributes

**Bottom line:** Always try HTML-first. Use screenshot only when HTML unavailable.

---

### Phase 2: VALIDATE (Test One Action at a Time)

**Goal:** Confirm each selector works BEFORE building complex flows.

```bash
# Step 1: Create minimal action (single interaction)
```

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
      "type": "waitForSelector",
      "selector": "h1, h2",
      "options": { "state": "visible", "timeout": 5000 }
    }
  ]
}
```

```bash
# Step 2: Test action in isolation (2-step flow)
```

```json
{
  "name": "Test Click New Action",
  "steps": [
    {
      "name": "Navigate",
      "url": "http://localhost:4000/actions",
      "actions": [],
      "capture": { "screenshot": true }
    },
    {
      "name": "Click Button",
      "actions": ["click-new-action"],
      "capture": { "screenshot": true }
    }
  ]
}
```

```bash
# Step 3: Run test
npx qa run test-click-new-action

# Step 4: Check results
# - Screenshot shows modal/page opened? ✓
# - Console logs show errors? → STOP, fix code
# - Selector worked? ✓
```

**Decision Point:**
- ❌ Console errors? → **STOP. Fix app bugs first. Re-run.**
- ❌ Selector failed? → **Update selector. Re-run.**
- ✅ Success? → **Continue to next action.**

---

### Phase 3: BUILD (Assemble Validated Actions)

**Goal:** Combine tested actions into multi-step flows.

**Critical Rule: URL Behavior**

```json
{
  "steps": [
    {
      "name": "Navigate to Actions",
      "url": "http://localhost:4000/actions",  // ← NAVIGATES to this URL
      "actions": ["click-new-action"]          // ← THEN executes
    },
    {
      "name": "Fill Form",
      // ⚠️ NO url field = stays on current page
      "actions": ["fill-action-name", "fill-description"]
    },
    {
      "name": "Submit",
      // ⚠️ NO url field = stays on current page
      "actions": ["click-save"]
    }
  ]
}
```

**Common Mistake:**

```json
// ❌ WRONG: URL in every step = resets to homepage every time
{
  "steps": [
    { "url": "http://localhost:4000", "actions": ["fill-form"] },
    { "url": "http://localhost:4000", "actions": ["click-submit"] }
  ]
}

// ✅ RIGHT: URL only when navigating
{
  "steps": [
    { "url": "http://localhost:4000/form", "actions": ["fill-form"] },
    { "actions": ["click-submit"] }  // Stays on /form
  ]
}
```

---

### Phase 4: E2E (Full Flow Execution)

**Goal:** Run complete user journey, iterate if needed.

```bash
# Run full E2E
npx qa run e2e-action-creation

# Check ALL data sources:
1. Exit code (0 = pass, 1 = fail)
2. Screenshots (all steps look correct?)
3. Console logs (no errors?)
4. Report JSON (all steps passed?)
```

---

## Early Failure Detection

### Rule: Stop Immediately on Critical Errors

**JavaScript Runtime Errors = STOP**

If you see this in a screenshot:
```
Runtime TypeError
Cannot read properties of undefined (reading 'length')
```

**DO NOT:**
- ❌ Continue executing 6 more steps
- ❌ Wait 90 seconds for flow to complete
- ❌ Just report the error

**DO:**
- ✅ **STOP the analysis immediately**
- ✅ **Fix the code bug**
- ✅ **Re-run from start**
- ✅ **Verify fix worked**

### Checking for Errors Early

Add this to every navigation step:

```json
{
  "primitives": [
    { "type": "goto", "url": "..." },
    { "type": "waitForLoadState", "options": { "state": "networkidle" } },
    {
      "type": "waitForSelector",
      "selector": "body",
      "options": { "state": "visible" }
    }
  ]
}
```

If `waitForSelector` fails → page crashed → STOP.

---

## Selector Best Practices

### Human-Centric Selector Strategy

**Core Principle:** Use selectors that mimic how REAL USERS interact with the interface.

**Think like a user:**
- Users see text: "New Action" button
- Users read labels: "Email address" input
- Users don't see: CSS classes, internal IDs, Vue/React internals

### ✅ Good Selectors (User Perspective)

```json
// What user sees: "New Action" button
{ "selector": "button:has-text('New Action')" }

// What user sees: "email" placeholder
{ "selector": "input[placeholder*='email' i]" }

// What user sees: "Settings" link
{ "selector": "a[href='/settings']" }

// What user sees: "Password" label above input
{ "selector": "label:has-text('Password') + input" }

// What user sees: "Save" button with primary styling
{ "selector": "button:has-text('Save')" }
```

### ❌ Bad Selectors (Developer Perspective)

```json
// User doesn't see class names
{ "selector": ".btn-primary-xyz123" }

// User doesn't see auto-generated IDs
{ "selector": "#input-47" }

// User doesn't see Vue scoped attributes
{ "selector": "[data-v-abc123]" }

// User doesn't see complex CSS paths
{ "selector": "div.container > div:nth-child(3) > button.btn" }
```

### Why Human-Centric Matters

1. **Tests read like user actions** - "Click 'New Action'" vs "Click .btn-xyz"
2. **Selectors survive refactoring** - Text rarely changes, classes do
3. **Tests document user flows** - Readable by non-technical stakeholders
4. **Accessible selectors = accessible UI** - If selector is hard to write, UI might be hard to use

### Priority Order (User Perspective)

Use selectors in this order (most to least preferred):

**1. Visible Text (Best for Users)**
```json
{ "selector": "button:has-text('New Action')" }
{ "selector": "a:has-text('Settings')" }
{ "selector": "h1:has-text('Dashboard')" }
```
Why: Users identify elements by visible text.

**2. ARIA/Accessibility Attributes**
```json
{ "selector": "[role='button'][aria-label='Create']" }
{ "selector": "input[aria-label='Email address']" }
{ "selector": "[role='dialog'][aria-labelledby='title']" }
```
Why: Screen readers use these; they're semantic and stable.

**3. Placeholder Text**
```json
{ "selector": "input[placeholder*='email' i]" }
{ "selector": "textarea[placeholder*='description' i]" }
```
Why: Users see placeholders as hints; they're user-facing.

**4. Form Attributes (name, type, value)**
```json
{ "selector": "input[name='email']" }
{ "selector": "input[type='password']" }
{ "selector": "select[name='country']" }
```
Why: Semantic HTML attributes with clear purpose.

**5. Data Attributes (Test-Specific)**
```json
{ "selector": "[data-testid='submit-btn']" }
{ "selector": "[data-action='create']" }
```
Why: Explicit test hooks, stable across styling changes.

**6. IDs/Classes (Last Resort)**
```json
{ "selector": "#email-input" }
{ "selector": ".submit-button" }
```
Why: Implementation details; may change with refactoring.

### Flexible Selectors (Fallback Strategy)

Use multiple selectors with commas - Playwright tries each in order:

```json
{
  "type": "click",
  "selector": "button:has-text('New Action'), [data-action='new-action'], .new-action-btn"
}
```

**Order strategy:**
1. User-facing selector (text)
2. Test-specific attribute (data-action)
3. Class as last resort

### Real-World Examples

**Login Form:**
```json
// ✅ User perspective
{ "selector": "input[type='email']" }
{ "selector": "input[type='password']" }
{ "selector": "button:has-text('Sign In')" }

// ❌ Developer perspective
{ "selector": "#email-input-component-47" }
{ "selector": ".password-field-wrapper input" }
{ "selector": ".btn.btn-primary.submit-btn" }
```

**Navigation Menu:**
```json
// ✅ User perspective
{ "selector": "nav a:has-text('Dashboard')" }
{ "selector": "a[href='/settings']" }
{ "selector": "[role='navigation'] >> text='Profile'" }

// ❌ Developer perspective
{ "selector": ".nav-item:nth-child(1)" }
{ "selector": "#menu-link-0" }
{ "selector": "div[data-v-123abc] a" }
```

### Selector Testing Pattern

**Before committing to a selector:**

1. **Can you explain it to a user?** "Click the 'New Action' button" ✅ vs "Click .btn-xyz" ❌
2. **Will it survive a redesign?** Button text stable, class names change
3. **Is it accessible?** If hard to select, might be hard to use
4. **Does it have fallbacks?** Multiple options increase reliability

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Guessing Selectors

**Wrong:**
```json
{ "selector": "[data-tab='actions']" }  // Guessed, doesn't exist
```

**Right:**
```bash
1. Take screenshot first
2. See actual button text: "Library"
3. Use: "a[href='/actions']" or ":has-text('Library')"
```

---

### ❌ Pitfall 2: URL in Every Step

**Wrong:**
```json
{
  "steps": [
    { "url": "http://localhost:4000", "actions": ["fill-name"] },
    { "url": "http://localhost:4000", "actions": ["fill-email"] },
    { "url": "http://localhost:4000", "actions": ["submit"] }
  ]
}
```
Result: Resets to homepage before each step, previous data lost.

**Right:**
```json
{
  "steps": [
    { "url": "http://localhost:4000/form", "actions": ["fill-name"] },
    { "actions": ["fill-email"] },
    { "actions": ["submit"] }
  ]
}
```
Result: Stays on /form, data persists.

---

### ❌ Pitfall 3: Ignoring Console Errors

**Wrong:**
```
Step 2: Click button → JS error in console
Step 3: Fill form → fails (page crashed)
Step 4: Submit → fails (page crashed)
...spend 90 seconds running 7 more failing steps
```

**Right:**
```
Step 2: Click button → JS error in console
→ STOP IMMEDIATELY
→ Fix the JS error in the app code
→ Re-run from step 1
→ Verify error is gone
```

---

### ❌ Pitfall 4: Creating All Actions Upfront

**Wrong:**
```bash
1. Create 9 actions without testing
2. Create 9-step flow
3. Run → 8 steps fail
4. Debug for 20 minutes
```

**Right:**
```bash
1. Create action 1
2. Test action 1 (2-step flow)
3. ✓ Success
4. Create action 2
5. Test action 2 (3-step flow)
6. ✓ Success
7. Continue...
```

---

## Iteration Speed Optimization

### Slow (90s per iteration):
```
1. Create 9-step flow
2. Run all 9 steps
3. Step 2 fails with JS error
4. Steps 3-9 fail because page crashed
5. Wait 90 seconds for flow to complete
6. Fix error
7. Re-run all 9 steps
```

### Fast (15-20s per iteration):
```
1. Create 2-step flow (navigate → screenshot)
2. Run (15s)
3. Check screenshot for errors
4. If error: fix, re-run (15s)
5. If success: add step 3
6. Run (20s)
7. Continue incrementally
```

**Key: Fail fast, iterate quickly.**

---

## Example: Creating Action Creation E2E Test

### ❌ Wrong Approach

```bash
# Day 1: Spend 30 minutes guessing
1. Create 7 actions with guessed selectors
2. Create 9-step flow
3. Run → all fail
4. Check screenshots → UI is different than expected
5. Update all selectors
6. Run → step 3 has JS error
7. Continue anyway → waste 60 seconds
8. Fix JS error
9. Run again → selectors still wrong
10. Repeat 5 more times...
```

**Time: 30+ minutes, 6+ iterations**

---

### ✅ Right Approach

```bash
# Day 1: Spend 5 minutes succeeding
1. Discovery flow: navigate to /actions, screenshot (15s)
   → See: "New Action" button, actual URL structure

2. Create minimal action: click button (1 primitive)

3. Test: navigate → click → screenshot (20s)
   → JS error in console! Page crashed.

4. STOP. Fix code bug (2 min)

5. Re-run (20s)
   → Success! Action composer loaded.

6. Screenshot shows actual input fields
   → input[placeholder='Action name']
   → textarea[placeholder='Description']

7. Create fill actions with real selectors

8. Test: navigate → click → fill name → screenshot (25s)
   → Success!

9. Add fill description

10. Test: navigate → click → fill name → fill desc → screenshot (30s)
    → Success!

11. Full E2E runs perfectly (40s)
```

**Time: 5 minutes, 1-2 code fixes, flows pass first try**

---

## Browser & Dev Server Notes

### Browser Instances

```markdown
✅ Playwright launches its OWN browser (not your Chrome tabs)
✅ Completely isolated from your browsing
✅ Connects to dev server (localhost:4000)
✅ No conflict between test browser and your browser
⚠️  Dev server MUST be running for tests to work
```

### Running Tests

```bash
# Terminal 1: Start dev server
npm run dev
# Wait for: "Ready on http://localhost:4000"

# Terminal 2: Run tests
npx qa run flow-name
```

---

## Summary: Best Practices Checklist

**Before Creating ANY Test:**
- [ ] Dev server is running
- [ ] Navigate to target page manually (verify it loads)
- [ ] Create discovery flow (just navigate + screenshot)
- [ ] Run discovery, analyze screenshot
- [ ] Document actual selectors (not guessed ones)

**When Creating Actions:**
- [ ] Start with 1 primitive action
- [ ] Test in isolation (2-step flow)
- [ ] Check screenshot + console logs
- [ ] If errors: STOP, fix, re-run
- [ ] If success: add next action
- [ ] Never create 5+ actions without testing

**When Building Flows:**
- [ ] Only include `url` when navigating
- [ ] Omit `url` to stay on current page
- [ ] Use validated actions only
- [ ] Start with 2-3 steps, grow incrementally
- [ ] Check console logs after navigation steps

**When Tests Fail:**
- [ ] Check exit code
- [ ] View ALL screenshots
- [ ] Read console logs in report
- [ ] If JS error: STOP, fix code, re-run
- [ ] If selector wrong: update, re-run
- [ ] Don't continue with broken flows

**Iteration Strategy:**
- [ ] Fail fast (stop on first error)
- [ ] Fix immediately (don't just report)
- [ ] Re-run to verify fix
- [ ] Iterate until exit code 0
- [ ] Small iterations = faster overall

---

## When to Use Each Approach

### Use Discovery-First For:
- ✅ New features never tested before
- ✅ Complex multi-step workflows
- ✅ Pages you haven't seen yet
- ✅ When selectors might have changed

### Use Rapid Iteration For:
- ✅ Familiar pages with known structure
- ✅ Simple click/fill interactions
- ✅ Updating existing working tests
- ✅ Re-running after minor code changes

### Use Incremental Building For:
- ✅ Long E2E journeys (8+ steps)
- ✅ Critical user paths (checkout, signup)
- ✅ Flows with dependencies between steps
- ✅ When stability matters more than speed

---

**Remember: Screenshots and console logs are your best friends. Trust what you see, not what you assume.**
