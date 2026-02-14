# Smart Screenshot Analysis

**Principle: Analyze screenshots strategically, not mechanically**

## Decision Tree

```
After test run:
├─ Test FAILED?
│  ├─ YES → 📸 ANALYZE ALL (need to understand failure)
│  └─ NO → Continue...
│
├─ First time seeing this page?
│  ├─ YES → 📸 ANALYZE ALL (need to understand layout)
│  └─ NO → Continue...
│
├─ Visual changes expected?
│  ├─ YES → 📸 ANALYZE (verify changes worked)
│  └─ NO → Continue...
│
├─ Committing a fix?
│  ├─ YES → 📸 ANALYZE before/after (visual verification required)
│  └─ NO → Continue...
│
└─ Default → ⏭️ SKIP ANALYSIS (list files only for reference)
```

## Analysis Levels

### Level 1: SKIP (0 tokens)
- Test passed
- Seen this page before
- No visual changes expected
- Not committing

**Action:** None, or just list filenames for reference

### Level 2: QUICK GLANCE (500-800 tokens)
- Test passed
- Minor change verification
- Post-fix confirmation

**Action:**
- Read ONLY the critical screenshot (e.g., target page, not navigation steps)
- 1-sentence observation: "Shows expected page, no visual errors"

### Level 3: FULL ANALYSIS (1500-2000 tokens per screenshot)
- Test failed
- First time viewing
- Before/after comparison
- Visual bug investigation

**Action:**
- Read ALL screenshots
- Detailed visual observation (2-3 sentences each)
- Document issues, layout, state

## Examples

### ❌ BAD (wasteful):
```
Test: health-check (PASSED)
Action: Read all 3 screenshots, describe in detail
Cost: 4500 tokens
Value: Low (already know server works)
```

### ✅ GOOD (efficient):
```
Test: health-check (PASSED)
Action: ls -1 screenshots (verify files exist), skip read
Cost: 50 tokens
Value: High (confirmed test ran, saved time)
```

### ✅ GOOD (strategic):
```
Test: issue-page-layout (FAILED - 500 error)
Action: Read screenshot 2 only (where failure occurred)
Cost: 1700 tokens
Value: High (identified exact error)
```

### ✅ GOOD (before/after):
```
Test: Fixed layout bug
Action: Read BEFORE screenshot 1, READ AFTER screenshot 1, compare
Cost: 3400 tokens
Value: High (verified fix worked)
```

## Token Savings

**Old approach (analyze everything):**
- 10 test runs × 2 screenshots × 1700 tokens = **34,000 tokens**

**New approach (strategic):**
- 2 failures × 2 screenshots × 1700 tokens = **6,800 tokens**
- 3 verifications × 1 screenshot × 1700 tokens = **5,100 tokens**
- 5 passed tests × 0 tokens = **0 tokens**
- **Total: 11,900 tokens** (65% reduction)

## Red Flags (When You MUST Analyze)

Even if test passed, analyze screenshots if:
- Exit code 0 BUT expected visual change not mentioned in test output
- Console errors in report (might be visual issue)
- First run after fixing a bug (verify fix)
- Testing a visual feature (layout, styling, UI)

## Quick Check Pattern

```bash
# List screenshots
ls -1 .tsty/screenshots/run-xxx/*.png

# Check report for failures
cat .tsty/reports/flow-xxx.json | grep -q '"failed": 0' && echo "✅ All passed" || echo "❌ Failures detected"

# Decision
if [[ passed && seen_before && no_visual_changes ]]; then
  echo "⏭️ Skipping screenshot analysis (test passed, no changes)"
else
  echo "📸 Analyzing screenshots..."
  # Read PNGs
fi
```
