# Visual Analysis Workflow

**This is the MANDATORY workflow for autonomous visual QA testing.**

## Core Principle

> **Screenshots are your PRIMARY source of truth, not exit codes.**

```
Test passed (exit 0) = Playwright didn't crash
Feature works = Visual evidence shows it works
```

## The Complete Workflow

### Phase 1: Initial Run & Analysis

**1. Run the test:**
```bash
tsty run <flow-id> --fail-fast --no-monitor
```

**2. Get the run ID from output:**
```
✅ Test Passed
Screenshots saved to: .tsty/screenshots/run-<flow>-<timestamp>/
                                        ^^^^^^^^^^^^^^^^^^^^
                                        This is your run ID
```

**3. List all screenshots:**
```bash
ls -1 .tsty/screenshots/run-<flow>-<timestamp>/*.png
```

**4. Read EVERY screenshot PNG:**
```
Read .tsty/screenshots/run-<flow>-<timestamp>/1-step-name.png
Read .tsty/screenshots/run-<flow>-<timestamp>/2-step-name.png
Read .tsty/screenshots/run-<flow>-<timestamp>/3-step-name.png
```

**5. Document what you see:**

Example good analysis:
```
Screenshot 1 (navigate-to-page.png):
- Page header shows "Issue #1: improve comparison layout"
- Two-column layout with "Reference Run" and "Current Run" sections
- Small badge labels with camera emoji
- Badge styling: text-sm, rounded-full, pastel colors (blue-100, green-100)
- Screenshot containers have thin borders (appears to be border-2)
- No size information visible
- Visual hierarchy is flat - labels don't stand out

Issues identified:
1. Labels are too small and not prominent
2. Pastel colors provide low contrast
3. Missing size comparison data
4. Thin borders don't create clear separation
```

Example bad analysis (DON'T DO THIS):
```
"Page loaded successfully."
```

### Phase 2: Fix Based on Visual Evidence

**1. Identify what needs to change:**

Based on screenshot analysis (not just issue description):
- Labels need to be larger and bolder
- Colors need higher contrast
- Size information needs to be added
- Borders need to be thicker

**2. Apply code fixes:**
- Make changes to the actual application code
- Base decisions on what you SAW in screenshots

**3. DO NOT commit yet - verify first**

### Phase 3: Verify Fix Visually

**1. Re-run the test:**
```bash
tsty run <flow-id> --fail-fast --no-monitor
```

**2. Get the new run ID:**
```
✅ Test Passed
Screenshots saved to: .tsty/screenshots/run-<flow>-<new-timestamp>/
```

**3. List screenshots from BOTH runs:**
```bash
ls -1 .tsty/screenshots/run-<flow>-<before-timestamp>/*.png
ls -1 .tsty/screenshots/run-<flow>-<after-timestamp>/*.png
```

**4. Read screenshots from BOTH runs:**
```
# Before (first run)
Read .tsty/screenshots/run-<flow>-<before>/1-step-name.png

# After (second run)
Read .tsty/screenshots/run-<flow>-<after>/1-step-name.png
```

**5. Visual comparison analysis:**

Example good comparison:
```
BEFORE (run-<flow>-111):
Screenshot 1 shows:
- Small badge labels: "📸 Reference (Before)"
- Pastel blue background: bg-blue-100
- Small font: text-sm
- Rounded full style
- No size information anywhere
- Thin borders on screenshot containers

AFTER (run-<flow>-222):
Screenshot 1 shows:
- Large bold labels: "BEFORE" and "AFTER"
- Solid blue/green backgrounds: bg-blue-500, bg-green-500
- White text on colored background
- Large font: text-lg font-bold
- Directional arrows (← for BEFORE, → for AFTER)
- NEW: Size comparison panel showing "1920×1080, 2.07MP"
- Thick borders: border-4 with shadow effects

VISUAL CHANGES CONFIRMED:
✅ Labels are 3x larger and much more prominent
✅ Colors changed from pastel to high-contrast solid
✅ Size information now displayed in dedicated panel
✅ Borders are 2x thicker with shadow depth
✅ Overall visual hierarchy is significantly stronger

CONCLUSION: The issue is visually fixed. Screenshots prove all requested improvements are visible.
```

Example bad comparison (DON'T DO THIS):
```
"I applied the fixes. The test passed."
```

### Phase 4: Commit Only After Visual Verification

**Only proceed if:**
- ✅ You read screenshots from BOTH runs
- ✅ Visual changes are clearly visible
- ✅ Changes match what was requested
- ✅ Screenshots prove the issue is fixed

**Then commit:**
```bash
git commit -m "Fix #X: [description]

BEFORE:
[What was wrong - based on screenshots]

AFTER:
[What changed - based on screenshots]

VISUAL VERIFICATION: ✅ Confirmed via screenshot comparison"
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Not reading screenshot files

**Wrong:**
```
"Screenshots were captured to .tsty/screenshots/run-xxx/"
[Proceeds without actually reading them]
```

**Correct:**
```
Read .tsty/screenshots/run-xxx/1-step.png
Read .tsty/screenshots/run-xxx/2-step.png
[Actually views the visual content]

"Screenshot 1 shows: [detailed visual analysis]"
```

### ❌ Mistake 2: Skipping screenshot listing and analysis

**Wrong:**
```
"Test passed, so I'll apply fixes based on the issue description."
```

**Correct:**
```bash
ls -1 .tsty/screenshots/run-xxx/*.png
# Then read each screenshot PNG file listed
```

### ❌ Mistake 3: Not comparing before/after

**Wrong:**
```
"I applied the fixes and re-ran. Test passed. Committing."
```

**Correct:**
```bash
ls -1 .tsty/screenshots/run-before/*.png
ls -1 .tsty/screenshots/run-after/*.png
# Then read screenshots from BOTH runs
# Then verify visual changes
# THEN commit
```

### ❌ Mistake 4: Vague analysis

**Wrong:**
```
"The page looks fine."
"Everything seems to work."
```

**Correct:**
```
"The comparison page shows:
- Two-column layout with headers 'Reference Run' and 'Current Run'
- Small badge labels (text-sm) with camera emoji
- Pastel colors: bg-blue-100 for reference, bg-green-100 for current
- No size information visible
- Borders appear thin (border-2)

Issues: Labels not prominent, missing size data, weak visual hierarchy"
```

### ❌ Mistake 5: Trusting exit code 0

**Wrong:**
```
"Exit code 0, so the issue is fixed."
```

**Correct:**
```
"Exit code 0 means Playwright didn't crash.
Now I need to verify visually:
[Reads screenshots]
[Compares before/after]
Screenshot comparison confirms: The issue IS visually fixed."
```

## When Visual Verification Fails

**If screenshots look the same after your fix:**

1. **Don't commit** - The fix didn't work
2. **Investigate why:**
   - Wrong component changed?
   - Code change didn't apply?
   - Need to rebuild/clear cache?
   - Logic error in fix?
3. **Fix the issue**
4. **Re-run and verify again**
5. **Iterate until screenshots show the change**

## Real Example: Issue #1

### Initial Run

```bash
tsty run issue-1-comparison-layout --fail-fast --no-monitor
# Output: run-issue-1-comparison-layout-1771090415999
```

```bash
ls -1 .tsty/screenshots/run-issue-1-comparison-layout-1771090415999/*.png
```

**Screenshot analysis:**
```
Read .tsty/screenshots/run-issue-1-comparison-layout-1771090415999/1-navigate.png

Visual observations:
- Page shows "Issue not found" error message
- This means: No comparison data exists yet
- Need to: Set up test data first (fetch issue, create runs)

CONCLUSION: Can't test comparison UI without comparison data.
Action: Set up test scenario first.
```

### After Setup & Fix

```bash
# After setting up data and applying fixes
tsty run issue-1-comparison-layout --fail-fast --no-monitor
# Output: run-issue-1-comparison-layout-1771090435999
```

```bash
ls -1 .tsty/screenshots/run-issue-1-comparison-layout-1771090425999/*.png
ls -1 .tsty/screenshots/run-issue-1-comparison-layout-1771090435999/*.png
```

**Before/After analysis:**
```
BEFORE (run-...-425999):
Read .tsty/screenshots/run-.../1-navigate.png
- Small badges "📸 Reference (Before)"
- Pastel bg-blue-100 color
- text-sm font
- No size information

AFTER (run-...-435999):
Read .tsty/screenshots/run-.../1-navigate.png
- Large bold "BEFORE" label
- Solid bg-blue-500 color
- text-lg font-bold
- Size panel: "1920×1080, 2.07MP"

VERIFIED: All improvements are visually confirmed.
```

## Key Takeaways

1. **Always list and read screenshots:**
   - `ls -1 .tsty/screenshots/<run-id>/*.png` after every run
   - Read EVERY PNG file listed

2. **Always read the PNG files:**
   - Don't just acknowledge they exist
   - Actually use Read tool to view visual content

3. **Always compare before/after:**
   - Read screenshots from both runs
   - Verify changes are visible
   - Document what changed visually

4. **Screenshots > Exit codes:**
   - Exit 0 just means "didn't crash"
   - Visual evidence shows if it actually works

5. **Never skip visual verification:**
   - Even when autonomous
   - Even when test passes
   - Always verify the outcome visually
