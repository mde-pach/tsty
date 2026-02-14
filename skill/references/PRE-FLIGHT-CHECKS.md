# Pre-Flight Checks

**MANDATORY before running ANY test flow.**

## Why Pre-Flight Checks Matter

```
Test passed ✓ + Error page in screenshot = Wasted time
Server not running = False positive tests
Build errors = Tests run against broken app
```

**Real failure example:**
- Test: `tsty run issue-1-comparison-layout --fail-fast`
- Exit code: 0 (passed)
- Screenshot: Next.js error page "ENOENT: no such file or directory"
- Root cause: Server was running but had build errors
- Time wasted: 60+ minutes chasing wrong issues

## Pre-Flight Checklist

**Before EVERY test run, execute these checks:**

### 1. Check if Server is Running

```bash
# Check if port 4000 is listening
lsof -i :4000 || curl -s http://localhost:4000 > /dev/null
```

**If not running:**
```bash
# Start the server in background
tsty > /tmp/tsty-dashboard.log 2>&1 &
echo $!  # Save PID

# Wait for server to start
sleep 5
```

### 2. Verify Server Responds Correctly

**Don't assume running = working. Test a known endpoint:**

```bash
# Fetch homepage and check for error markers
curl -s http://localhost:4000 | grep -q "Runtime Error\|Failed to compile\|ENOENT" && echo "SERVER HAS ERRORS" || echo "SERVER OK"
```

**If errors found:**
- Read the curl output to understand the error
- Fix build/runtime errors BEFORE running tests
- Common issues:
  - TypeScript compilation errors
  - Missing dependencies
  - Build failures

### 3. Check Build Status (if applicable)

For Next.js/React apps with separate build step:

```bash
# Check if .next directory exists and is recent
if [ -d ".next" ]; then
  # Check if source files are newer than build
  newer_files=$(find src app -type f -newer .next -name "*.tsx" -o -name "*.ts" 2>/dev/null | head -5)
  if [ -n "$newer_files" ]; then
    echo "Source files modified since last build - rebuild needed"
  fi
fi
```

**If rebuild needed:**
```bash
npm run build
# OR for dev mode
npm run dev &
```

### 4. Test a Simple Navigation

**Before running your actual test, verify basic navigation works:**

```bash
# Create a minimal health-check flow
cat > .tsty/flows/_health-check.json << 'EOF'
{
  "name": "Health Check",
  "baseUrl": "http://localhost:4000",
  "failFast": true,
  "monitorConsole": false,
  "playwright": { "headless": true, "timeout": 10000 },
  "steps": [{
    "name": "Homepage loads",
    "url": "/",
    "capture": { "screenshot": true },
    "primitives": [
      { "type": "waitForLoadState", "options": { "state": "networkidle" } }
    ]
  }]
}
EOF

# Run health check
tsty run _health-check --fail-fast --no-monitor
```

**After health check:**
```bash
# List screenshot
ls -1 .tsty/screenshots/run-_health-check-*/1-*.png | tail -1

# Read the screenshot with Read tool
# Verify it shows the expected homepage, NOT an error page
```

**If health check fails or shows error page:**
- STOP - Don't run actual tests yet
- Fix the server/build issues first
- Re-run health check
- Only proceed when health check screenshot shows working app

## Pre-Flight Check Template

**Use this template before EVERY autonomous issue fix:**

```bash
#!/bin/bash
# Pre-flight checks for tsty testing

echo "🔍 Running pre-flight checks..."

# 1. Check server
if ! lsof -i :4000 > /dev/null 2>&1; then
  echo "❌ Server not running on port 4000"
  echo "Starting server..."
  tsty > /tmp/tsty-dashboard.log 2>&1 &
  sleep 5
fi

# 2. Verify server health
response=$(curl -s http://localhost:4000)
if echo "$response" | grep -q "Runtime Error\|Failed to compile\|ENOENT"; then
  echo "❌ Server has errors:"
  echo "$response" | grep -A5 "Error"
  exit 1
fi

# 3. Run health check flow
echo "Running health check flow..."
tsty run _health-check --fail-fast --no-monitor

# 4. Verify health check screenshot
latest_screenshot=$(ls -1t .tsty/screenshots/run-_health-check-*/1-*.png 2>/dev/null | head -1)
if [ -z "$latest_screenshot" ]; then
  echo "❌ Health check failed - no screenshot captured"
  exit 1
fi

echo "✅ Pre-flight checks passed"
echo "Screenshot: $latest_screenshot"
echo "NEXT: Read this screenshot with Read tool to verify it shows working app"
```

## When to Skip Pre-Flight Checks

**Never skip for autonomous issue fixing.**

You MAY skip only when:
- User explicitly says server is already running and working
- You just ran a test successfully in the same session
- Testing a static site (no server needed)

**Default: Always run pre-flight checks.**

## Error Page Detection

**Common error page markers to check for in screenshots:**

After reading a screenshot, look for these visual indicators:

1. **Next.js error overlay:**
   - Red "Runtime Error" or "Failed to compile" banner
   - Call stack traces
   - File paths in error messages

2. **404 / Not Found:**
   - "404" text
   - "Page not found"
   - "This page could not be found"

3. **Build errors:**
   - "ENOENT: no such file or directory"
   - "Module not found"
   - "Cannot find module"

4. **Empty/blank page:**
   - Completely white page
   - No content visible
   - Only background color

**If ANY of these appear → Server/build issue, NOT test failure.**

## Integration with Autonomous Workflow

**Updated autonomous issue-fixing workflow:**

```
1. ✅ Fetch issue from GitHub
2. ✅ Store locally in .tsty/issues/
3. 🆕 RUN PRE-FLIGHT CHECKS (new step)
   a. Check server running
   b. Verify server health
   c. Run health-check flow
   d. Read health-check screenshot
   e. Verify no error pages
4. ✅ AUTO-CREATE test flow
5. ✅ AUTO-LINK flow to issue
6. ✅ AUTO-RUN and mark as reference
7. ✅ AUTO-ANALYZE screenshots (MANDATORY)
8. ✅ Apply fixes
9. ✅ AUTO-RE-RUN
10. ✅ AUTO-COMPARE before/after
```

**Pre-flight checks happen at step 3, before creating any test flows.**
