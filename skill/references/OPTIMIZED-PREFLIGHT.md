# Optimized Pre-Flight Checks

**Goal: Verify server health in <10 seconds without screenshot analysis**

## Quick Health Check (Recommended)

```bash
# 1. Check server running (1 second)
lsof -i :4000 | grep LISTEN || echo "❌ Server not running"

# 2. Check server responds (2 seconds)
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 | grep -q "200" && echo "✅ Server OK" || echo "❌ Server error"

# 3. Check for build errors (3 seconds)
curl -s http://localhost:4000 | grep -q "Runtime Error\|Failed to compile\|ENOENT" && echo "❌ BUILD ERRORS" || echo "✅ No build errors"
```

**Total time: ~6 seconds**
**Screenshot analysis: NONE** (only if curl shows errors)

## When to Use Full Health Check Flow

Only run full health check with screenshot analysis when:
- First time in session
- After major code changes
- Server was just restarted
- Previous quick check failed

**Skip health check screenshots when:**
- Server already verified working
- Running multiple tests in sequence
- Just checking if process is alive
