# Analysis Examples - What Good Analysis Looks Like

**Load this to see concrete examples of effective test analysis.**

This guide demonstrates how to analyze test results and communicate findings clearly and actionably.

---

## Table of Contents

1. [Console Errors (CRITICAL)](#console-errors-critical)
2. [Selector Issues](#selector-issues)
3. [Visual Bugs](#visual-bugs)
4. [Assertion Failures](#assertion-failures)
5. [Mixed Issues](#mixed-issues)
6. [Success Cases](#success-cases)

---

## Console Errors (CRITICAL)

### Example 1: TypeError in Component

**Report excerpt:**
```json
{
  "success": false,
  "stoppedEarly": true,
  "stopReason": "Console errors detected",
  "steps": [{
    "name": "Load dashboard",
    "success": false,
    "consoleErrors": 1,
    "console": [
      "TypeError: Cannot read property 'map' of undefined at Dashboard.tsx:45:12"
    ]
  }]
}
```

**Good Analysis:**
```
🚨 CRITICAL: JavaScript error detected

Error: TypeError at Dashboard.tsx:45
Cause: Attempting to map over undefined array
Issue: Data not loaded before render

Fix required: Add null check or loading state
Location: src/pages/Dashboard.tsx:45

Action: Fix application code, not test
```

**What to do:**
1. Read Dashboard.tsx
2. Find line 45
3. Add null check: `data?.map()` or conditional render
4. Re-run SAME test to verify consoleErrors = 0

### Example 2: Network Error

**Report excerpt:**
```json
{
  "steps": [{
    "consoleErrors": 1,
    "console": [
      "GET http://localhost:3000/api/users 404 (Not Found)"
    ]
  }]
}
```

**Good Analysis:**
```
🚨 CRITICAL: API endpoint not found

Error: 404 on /api/users
Cause: API route doesn't exist or incorrect path
Issue: Component trying to fetch from missing endpoint

Fix required: Create API route or fix fetch URL
Location: Check API routes and component

Action: Fix application code (create route or fix URL)
```

**What to do:**
1. Check if `/api/users` route exists
2. If missing, create it
3. If exists, check component fetch URL
4. Re-run test

### Example 3: React Hook Error

**Report excerpt:**
```json
{
  "console": [
    "Warning: React Hook useEffect has a missing dependency: 'fetchData'"
  ]
}
```

**Good Analysis:**
```
⚠️ React Hook warning (non-blocking but should fix)

Warning: Missing dependency in useEffect
Issue: fetchData not in dependency array
Impact: May cause stale closures or infinite loops

Fix required: Add fetchData to deps or use useCallback
Location: Component using useEffect

Action: Fix application code (update useEffect deps)
```

---

## Selector Issues

### Example 4: Timeout - Selector Mismatch

**Report:**
```json
{
  "steps": [{
    "error": "Timeout 30000ms exceeded waiting for selector: button:has-text('Create')"
  }]
}
```

**Screenshot shows:** Button with text "Create New Action"

**Good Analysis:**
```
❌ Selector mismatch (Priority 2)

Expected: button:has-text('Create')
Actual: Button shows "Create New Action"
Cause: Partial text match failed

Fix required: Update selector to match full text
Location: Flow/action JSON

Action: Fix test selector
```

**What to do:**
```json
{
  "type": "click",
  "selector": "button:has-text('Create New Action')"
}
```

### Example 5: Timeout - Element Not Rendered

**Report:**
```json
{
  "steps": [{
    "error": "Timeout waiting for selector: [data-testid='user-menu']"
  }]
}
```

**Screenshot shows:** No user menu visible, blank header

**Good Analysis:**
```
❌ Element not rendered (Priority 2)

Expected: [data-testid='user-menu']
Actual: Element doesn't exist in DOM
Cause: Component not rendering or conditional logic broken

Fix required: Check component rendering logic
Location: Header component

Action: Fix application code (component rendering)
```

**What to do:**
1. Read header component
2. Check conditional render logic
3. Fix rendering condition
4. Re-run test

### Example 6: Element Exists But Selector Wrong

**Report:**
```json
{
  "error": "Element not found: input[placeholder='Email address']"
}
```

**HTML from report:**
```html
<input placeholder="Enter your email" name="email" />
```

**Good Analysis:**
```
❌ Selector doesn't match actual DOM

Expected: input[placeholder='Email address']
Actual: input[placeholder='Enter your email']
Cause: Placeholder text different than expected

Fix required: Update selector to match actual placeholder
Location: Flow/action JSON

Action: Fix test selector
```

**What to do:**
```json
{
  "type": "fill",
  "selector": "input[placeholder='Enter your email']",
  "value": "test@example.com"
}
```

---

## Visual Bugs

### Example 7: Layout Overlap

**Screenshot shows:** Text overlapping with image in hero section

**Good Analysis:**
```
🐛 Layout bug (Critical)

Issue: Hero text overlaps image on mobile viewport
Location: Home page, hero section
Impact: Text unreadable, poor UX

Fix required: Add margin or use flexbox with gap
Files: src/components/Hero.tsx, styles

Action: Fix application CSS/layout
```

**What to do:**
1. Read Hero component
2. Add CSS: `gap: 1rem` or `margin-bottom: 1rem`
3. Re-run test to verify screenshot

### Example 8: Missing Visual Element

**Screenshot shows:** Empty space where button should be

**Good Analysis:**
```
🐛 Missing element (Critical)

Issue: Submit button not visible in form
Location: Login form, bottom section
Impact: User cannot submit form

Fix required: Check conditional rendering or CSS display
Files: src/components/LoginForm.tsx

Action: Fix application code (rendering or CSS)
```

**What to do:**
1. Read LoginForm component
2. Check if button conditionally rendered
3. Check CSS for `display: none` or `visibility: hidden`
4. Fix rendering logic
5. Re-run test

### Example 9: Minor UX Issue (Non-Blocking)

**Screenshot shows:** Spacing slightly inconsistent between cards

**Good Analysis:**
```
💡 UX improvement (Non-blocking)

Issue: Card spacing inconsistent (12px vs 16px)
Location: Dashboard grid
Impact: Minor visual polish issue

Recommendation: Standardize to 16px gap
Files: src/components/CardGrid.tsx

Action: Note for later, don't iterate now
```

**What to do:**
- Note as "Future UX improvements"
- Don't spend time iterating
- Move to next test

---

## Assertion Failures

### Example 10: Assertion Selector Wrong

**Report:**
```json
{
  "failedAssertions": [{
    "type": "visible",
    "selector": "h1:has-text('Dashboard')",
    "message": "Element not visible"
  }]
}
```

**Screenshot shows:** H1 with text "My Dashboard"

**Good Analysis:**
```
❌ Assertion failed - text mismatch (Priority 3)

Expected: h1:has-text('Dashboard')
Actual: h1 shows "My Dashboard"
Cause: Text content different

Fix required: Update assertion to match actual text
Location: Flow JSON assertions

Action: Fix test assertion
```

**What to do:**
```json
{
  "assertions": [{
    "type": "visible",
    "selector": "h1:has-text('My Dashboard')"
  }]
}
```

### Example 11: Element Actually Not Visible

**Report:**
```json
{
  "failedAssertions": [{
    "type": "visible",
    "selector": ".success-message"
  }]
}
```

**Screenshot shows:** No success message after form submission

**Good Analysis:**
```
❌ Assertion failed - element missing (Priority 3)

Expected: .success-message visible after submit
Actual: No message rendered
Cause: Success handler not working or message not shown

Fix required: Check form submit handler and message rendering
Location: Form component

Action: Fix application code (submit handler)
```

**What to do:**
1. Read form component
2. Check onSubmit handler
3. Verify success message renders
4. Fix logic
5. Re-run test

---

## Mixed Issues

### Example 12: Multiple Issues (Prioritize Console First)

**Report:**
```json
{
  "success": false,
  "steps": [
    {
      "consoleErrors": 1,
      "console": ["TypeError: Cannot read property 'id' of null"]
    },
    {
      "error": "Timeout waiting for selector: button:has-text('Next')"
    }
  ]
}
```

**Screenshot:** Button shows "Continue" not "Next"

**Good Analysis:**
```
🚨 CRITICAL: Console error (Priority 1)
❌ Selector mismatch (Priority 2)

Priority 1: Fix console error first
- TypeError: null reference
- Location: Unknown (check stack trace)
- Action: Fix JavaScript bug

Priority 2: Fix selector after console error resolved
- Expected: "Next"
- Actual: "Continue"
- Action: Update selector

Order: Fix Priority 1, re-run, then check if Priority 2 still exists
```

**What to do:**
1. Fix console error FIRST
2. Re-run test
3. If selector still fails, fix selector
4. Re-run again

---

## Success Cases

### Example 13: Test Passed - No Issues

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

**Good Analysis:**
```
✅ Test passed successfully

Exit code: 0
Console errors: 0
Screenshots: ✓ All correct
Assertions: ✓ All passed

Status: COMPLETE - Ready for next test

Next action: Create next action or move to next test flow
```

**What to do:**
- Mark test as complete
- Create next test if building flow
- Or move to different feature

### Example 14: Test Passed - Minor UX Note

**Report:**
```json
{
  "success": true
}
```

**Screenshots:** Test passed but spacing could be better

**Good Analysis:**
```
✅ Test passed successfully

Exit code: 0
Console errors: 0
Screenshots: ✓ Functional
Assertions: ✓ All passed

💡 UX Note (non-blocking):
- Button spacing could be more consistent (8px vs 12px)
- Not a bug, just polish

Status: COMPLETE - Ready for next test

Next action: Move to next test (don't iterate on polish)
```

**What to do:**
- Note UX improvement for later
- Move to next test
- Don't waste time on minor polish

---

## Analysis Format Template

### For Console Errors:
```
🚨 CRITICAL: [Error type]

Error: [Error message]
Cause: [Root cause]
Issue: [What's broken]

Fix required: [What to change]
Location: [File and line]

Action: Fix application code
```

### For Selector Issues:
```
❌ [Selector timeout/mismatch]

Expected: [Selector used]
Actual: [What screenshot/HTML shows]
Cause: [Why mismatch]

Fix required: [Update selector or fix app]
Location: [Flow/action JSON or app file]

Action: Fix [test selector OR application code]
```

### For Visual Bugs:
```
🐛 [Layout/visual issue] (Critical/Non-blocking)

Issue: [What's wrong visually]
Location: [Component/page/section]
Impact: [User impact]

Fix required: [CSS/layout change]
Files: [Component files]

Action: Fix application CSS/layout
```

### For Successes:
```
✅ Test passed successfully

Exit code: 0
Console errors: 0
Screenshots: ✓ [Status]
Assertions: ✓ [Status]

Status: COMPLETE

Next action: [Create next test OR move to next feature]
```

---

## Key Principles

1. **Priority order:** Console errors → Selectors → Assertions → Visual → UX
2. **Be specific:** Include file names, line numbers, exact errors
3. **Be actionable:** Say WHAT to fix and WHERE
4. **Distinguish test vs app:** Clearly state which code to fix
5. **Don't iterate on polish:** Note UX improvements but move on
6. **One issue at a time:** Fix highest priority first, re-run, repeat
