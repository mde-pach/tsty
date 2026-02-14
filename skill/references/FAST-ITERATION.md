# Fast Iteration Pattern

**Goal: Test-fix cycles in 20-30 seconds instead of 60-90 seconds**

## Optimized Iteration Loop

```
1. Create minimal test (10s)
   ├─ Single step to target page
   ├─ capture: { screenshot: "on-failure" }
   └─ No unnecessary waits

2. Run with fail-fast (15s)
   └─ tsty run flow --fail-fast --no-monitor

3. Smart analysis (5-30s depending on result)
   ├─ PASSED + seen before → Skip screenshots (5s)
   ├─ PASSED + new page → Read 1 critical screenshot (15s)
   └─ FAILED → Read failure screenshot only (20s)

4. Fix immediately (variable)
   └─ Use Edit tool on identified issue

5. Re-run (15s)
   └─ Same command

Total: 45-70s (vs old 90-120s)
```

## Speed Optimizations

### A. Minimize Screenshots

**Instead of:**
```json
{
  "steps": [
    {"name": "Home", "url": "/", "capture": {"screenshot": true}},
    {"name": "Navigate", "url": "/issues", "capture": {"screenshot": true}},
    {"name": "View issue", "url": "/issues/1", "capture": {"screenshot": true}}
  ]
}
```

**Use:**
```json
{
  "steps": [
    {"name": "Navigate to target", "url": "/issues/1", "capture": {"screenshot": true}}
  ]
}
```

**Savings:**
- 2 fewer screenshots
- 40% faster test execution
- 3400 fewer tokens if analyzed

### B. Skip Waits When Possible

**Instead of:**
```json
{
  "primitives": [
    {"type": "waitForLoadState", "options": {"state": "networkidle"}},
    {"type": "waitForTimeout", "timeout": 2000}
  ]
}
```

**Use:**
```json
{
  "primitives": [
    {"type": "waitForLoadState", "options": {"state": "domcontentloaded"}}
  ]
}
```

**Savings:** 2-3 seconds per step

### C. Batch Test Runs

When testing multiple changes, create ONE flow with multiple assertions:

```json
{
  "name": "Comprehensive check",
  "steps": [{
    "name": "Check all features",
    "url": "/page",
    "assertions": [
      {"type": "visible", "selector": "text=Feature 1"},
      {"type": "visible", "selector": "text=Feature 2"},
      {"type": "visible", "selector": "text=Feature 3"}
    ]
  }]
}
```

Instead of 3 separate test runs.

## When to Use Full Analysis

**Use FULL screenshot analysis when:**
1. **Initial bug investigation** - Understanding the issue
2. **After applying fix** - Verifying it worked
3. **Before git commit** - Final visual confirmation

**Skip screenshot analysis when:**
1. **Health checks** - Just need exit code
2. **Intermediate iterations** - Still working on fix
3. **Re-running without changes** - Testing cache/rebuild

## Example: Fast Bug Fix Flow

```bash
# 1. Initial investigation (FULL analysis)
tsty run bug-reproduction --fail-fast
ls -1 .tsty/screenshots/run-bug-*/
read all screenshots → understand issue → 60s

# 2. Apply fix
edit component.tsx → 30s

# 3. Quick verification (NO screenshot analysis)
tsty run bug-reproduction --fail-fast
check exit code only → 15s

# 4. If passed, final verification (1 screenshot)
read target screenshot → confirm visually → 20s

# 5. Commit
git commit → 10s

Total: ~135s (vs old approach: 240s+)
```

## Token Budget

**Per session target: <15,000 tokens for screenshots**

Track as you go:
- Health check: 0 tokens (skip analysis)
- Initial bug investigation: 3,400 tokens (2 screenshots)
- Post-fix verification: 1,700 tokens (1 screenshot)
- Before commit comparison: 3,400 tokens (before/after)
- **Total: 8,500 tokens** ✅ (well under budget)
