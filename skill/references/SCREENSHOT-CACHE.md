# Screenshot Description Cache

**Goal: Don't re-read screenshots we've already analyzed**

## How It Works

### Cache File Structure

`.tsty/screenshot-cache.json`:
```json
{
  "run-flow-1771096654190/1-homepage.png": {
    "description": "Shows tsty dashboard with Tests page, flow list, and 0 passing stats. No errors visible.",
    "timestamp": "2026-02-14T20:15:00Z",
    "analyzed": true,
    "hasIssues": false
  },
  "run-flow-1771096654190/2-issue-page.png": {
    "description": "Runtime Error page - ENOENT: no such file or directory. Next.js build error.",
    "timestamp": "2026-02-14T20:15:05Z",
    "analyzed": true,
    "hasIssues": true,
    "errorType": "build-error"
  }
}
```

### Usage Pattern

```bash
# Before reading screenshot:
1. Check if exists in cache: cat .tsty/screenshot-cache.json | grep "screenshot-name.png"

2. If CACHED → Use description from cache (0 tokens!)
   "Screenshot already analyzed: Shows homepage with navigation, no errors"

3. If NOT CACHED → Read PNG, analyze, store in cache
   Read screenshot → analyze → add to cache (1700 tokens)

# Cache hit rate:
- First test run: 0% (no cache)
- Second run (re-test): 80% (most screenshots same)
- Third run (after fix): 20% (changed screenshots only)
```

## Implementation

### Creating/Updating Cache

```bash
# After analyzing a screenshot, append to cache:
cat > /tmp/cache-entry.json << EOF
{
  "$(basename "$screenshot_path")": {
    "description": "Your visual analysis here",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "analyzed": true,
    "hasIssues": false
  }
}
EOF

# Merge with existing cache
jq -s '.[0] * .[1]' .tsty/screenshot-cache.json /tmp/cache-entry.json > .tsty/screenshot-cache.tmp.json
mv .tsty/screenshot-cache.tmp.json .tsty/screenshot-cache.json
```

### Checking Cache

```bash
# Check if screenshot already analyzed:
screenshot_name="1-homepage.png"
cached_desc=$(cat .tsty/screenshot-cache.json 2>/dev/null | jq -r ".\"$screenshot_name\".description // empty")

if [ -n "$cached_desc" ]; then
  echo "✅ Using cached description: $cached_desc"
  # Save 1700 tokens!
else
  echo "📸 Reading screenshot (not in cache)"
  # Read PNG and analyze
fi
```

## Cache Invalidation

**Cache entry is INVALID when:**
1. Screenshot filename changed (new run with different timestamp)
2. Code changed significantly (clear cache manually)
3. Re-testing after fix (changed screenshots only)

**Cache entry is VALID when:**
1. Re-running same test without changes
2. Comparing before/after (before screenshots cached)
3. Health checks (always same)

## Token Savings

### Example Session

```
Test run 1 (initial):
- 5 screenshots
- 0 cache hits
- 5 reads × 1700 tokens = 8,500 tokens

Test run 2 (re-run):
- 5 screenshots
- 4 cache hits (same), 1 new (changed page)
- 1 read × 1700 tokens = 1,700 tokens
- Savings: 6,800 tokens (80% reduction)

Test run 3 (after fix):
- 5 screenshots
- 3 cache hits (unchanged pages), 2 new (fixed pages)
- 2 reads × 1700 tokens = 3,400 tokens
- Savings: 5,100 tokens (60% reduction)
```

## Smart Caching Strategy

### Cache These (High Reuse):
- ✅ Health check screenshots (always same when passing)
- ✅ Navigation/intermediate steps (don't change)
- ✅ Reference/baseline screenshots (used for comparison)

### Don't Cache These (Low Reuse):
- ❌ Failed step screenshots (usually unique errors)
- ❌ Actively developing page (changes frequently)
- ❌ Before/after comparison targets (expect changes)

## Combined with Smart Analysis

```
Decision flow:
├─ Should analyze? (decision tree)
│  ├─ NO → Skip (0 tokens)
│  └─ YES → Continue...
│
├─ Check cache
│  ├─ CACHED → Use description (0 tokens)
│  └─ NOT CACHED → Read PNG (1700 tokens)
```

**Maximum efficiency: Smart analysis + caching**

## Cache Management

### Initialize Cache
```bash
echo '{}' > .tsty/screenshot-cache.json
```

### Clear Cache (After Major Changes)
```bash
rm .tsty/screenshot-cache.json
echo '{}' > .tsty/screenshot-cache.json
```

### View Cache Stats
```bash
echo "Total cached screenshots: $(cat .tsty/screenshot-cache.json | jq 'keys | length')"
echo "With issues: $(cat .tsty/screenshot-cache.json | jq '[.[] | select(.hasIssues == true)] | length')"
```

## Integration with Skill

**Before reading screenshot:**
1. Check smart analysis rules (should we analyze?)
2. If yes, check cache first
3. If not cached, read PNG and update cache
4. If cached, use description (mention it's from cache)

**Example output:**
```
Test passed. Checking screenshots:

1. Listed: 3 screenshots
2. Screenshot 1 (cached): "Homepage with dashboard, no errors"
3. Screenshot 2 (cached): "Issues page with list view"
4. Screenshot 3 (new): Reading... [reads PNG] "Issue detail page with comparison viewer at top"

Cache hits: 2/3 (saved 3400 tokens)
```
