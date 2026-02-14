---
name: tsty
description: "Autonomous E2E testing framework for iterative visual QA, user flow validation, and GitHub issue fixing. AUTONOMOUSLY FIXES GITHUB ISSUES: fetch issue → create test → run → analyze → fix code → verify → mark fixed. Also creates, executes, and autonomously fixes test flows until passing. Use when asked to: (1) fix/handle/resolve GitHub issues; (2) test/verify/validate UI, frontend, web app, or pages; (3) check layout, visual bugs, styling, or design; (4) test accessibility/WCAG/a11y; (5) run E2E/integration/user flow/journey/scenario tests; (6) test form submissions, interactions, or user actions; (7) verify API integrations from frontend; (8) regression test after changes; (9) debug/troubleshoot UI issues; (10) analyze screenshots, console logs, or test reports; (11) automate browser testing with Playwright. Works with ANY tech stack (React, Vue, Next.js, vanilla JS, etc.). CRITICAL: Autonomously iterates (run → analyze → fix code → re-run) until tests pass or issues are fixed. Uses micro-iteration (test ONE step at a time) and fail-fast mode for fastest debugging."
---

# Tsty - Iterative Visual QA Testing Skill

**Autonomous E2E testing framework** that creates flows, runs tests, analyzes results, fixes issues, and re-runs until passing. **AUTONOMOUSLY FIXES GITHUB ISSUES** end-to-end: fetch → create test → run → analyze → fix code → verify → mark fixed. Includes before/after screenshot comparison for visual verification.

## ⚠️ CRITICAL PRINCIPLES (Read These First)

**These are the MOST COMMON failure modes from real testing sessions. Violating these wastes 60+ minutes per session.**

### 1. 👤 Test Like a Human User (NOT test automation engineer)

**ALWAYS ask: "How would a human do this?" Then do exactly that.**

```json
✅ CORRECT (user-like):
{ "type": "click", "selector": "text=Save" }
{ "type": "click", "selector": "text=Focus" }
{ "type": "fill", "selector": "placeholder=Email", "value": "test@test.com" }

❌ WRONG (engineer-like):
{ "type": "dragAndDrop", ... }  // Before trying click!
{ "type": "evaluate", "pageFunction": "..." }  // Before trying UI interaction!
{ "selector": "div:has-text('Focus'):has-text('Focus an element')" }  // Over-complex!
```

**Interaction hierarchy (try in order):**
1. Simple click (`text=`, `placeholder=`, `button:has-text()`)
2. Fill/type for inputs
3. Keyboard shortcuts (if user would use them)
4. Drag-and-drop (ONLY if click fails first)
5. JavaScript evaluate (LAST RESORT - usually means bug!)

**→ Details: [USER-FIRST-TESTING.md](references/USER-FIRST-TESTING.md)**

### 2. 🔧 Fix Bugs, Don't Assume Framework Limitations

**Test passed ✓ + Screenshot unchanged ✗ = FALSE SUCCESS = App bug**

```
DEFAULT ASSUMPTION (from real data):
├─ 70% Application bugs (missing onClick, broken logic)
├─ 25% Wrong test selectors
├─ 4% Timing issues
└─ 1% Framework limitations

When feature doesn't work:
1. Try simple user interaction (text= + click)
2. Still broken? Read the component code
3. Find the bug (missing handler, wrong logic)
4. Fix the application code
5. Re-run test
6. Verify fix worked
```

**NEVER conclude "framework limitation" without:**
- ✅ Trying simple `text=` selector + click
- ✅ Reading component code
- ✅ Verifying event handlers exist
- ✅ Testing 3+ different approaches

**→ Details: [BUG-FIXING-WORKFLOW.md](references/BUG-FIXING-WORKFLOW.md)**

### 3. 🔄 Autonomous Iteration (Don't Just Report)

```
┌─────────────────────────────────────────┐
│ YOU ARE THE TESTER AND THE FIXER        │
│ Don't report failures - FIX them        │
└─────────────────────────────────────────┘

Loop: CREATE → RUN → ANALYZE → FIX → RE-RUN
Exit when: exit code 0 AND screenshots correct
```

**What to fix:**
- Console errors → Fix **application JavaScript**
- Selector timeouts → Fix **test selectors**
- Visual bugs → Fix **application CSS/layout**
- Missing features → **Add them to the app**

**→ Details: [ITERATIVE-WORKFLOW.md](references/ITERATIVE-WORKFLOW.md)**

### 4. 🧪 Micro-Iteration (Test ONE Action at a Time)

```
❌ NEVER:
1. Create 9 actions
2. Create 9-step flow
3. Run → All fail
4. Waste 30+ min debugging

✅ ALWAYS:
1. Create 1 action
2. Test in 2-step flow (15s)
3. Fix if fails
4. Create next action (only after #1 works)
5. Repeat
```

**The Iron Rule:** Never have more than 1 untested action.

**→ Details: [ITERATIVE-WORKFLOW.md](references/ITERATIVE-WORKFLOW.md)**

---

## 🚨 OUTCOME VERIFICATION IS MANDATORY

**⚠️ CRITICAL: "Test passed" ≠ "Feature works"**

```
Exit code 0 means: Playwright didn't crash
Feature works means: A human user can accomplish their goal

ALWAYS VERIFY BOTH
```

### After EVERY Test Run (MANDATORY)

**✅ Verification Checklist:**

□ **Screenshot shows expected UI change?**
  - Button clicked → Something appeared/changed?
  - Form filled → Data visible in UI?
  - Item added → Count increased?

□ **Data created/updated (check files)?**
  - File exists AND has correct content?
  - Database updated with right values?
  - API called with expected payload?

□ **Would a real user be satisfied?**
  - Feature actually usable?
  - No broken UI or partial states?
  - Workflow completes end-to-end?

**If ANY checkbox is unchecked → BUG in application. Investigate immediately.**

### Common False Positives (CRITICAL)

These scenarios report success but feature is broken:

```
❌ Click succeeded → But onClick handler missing
   Test: ✅ Step passed
   Reality: ❌ Nothing happened (screenshot unchanged)

❌ Fill succeeded → But validation blocked save
   Test: ✅ Form filled
   Reality: ❌ Data not saved (check file contents)

❌ Navigation succeeded → But redirect didn't happen
   Test: ✅ Navigated to /save
   Reality: ❌ Still on /edit (check URL/screenshot)

❌ Action completed → But feature half-broken
   Test: ✅ All steps passed
   Reality: ❌ UI shows error state (check screenshot)
```

**Default assumption: If screenshot shows no change → Application bug, not test issue.**

**→ Complete verification guide: [VERIFICATION-CHECKLIST.md](references/VERIFICATION-CHECKLIST.md)**

---

## Quick Start

1. **Initialize:** `tsty init`
2. **Create discovery flow** to capture HTML: [E2E-TESTING-GUIDE.md](references/E2E-TESTING-GUIDE.md)
3. **Extract selectors** from HTML (use exact `placeholder=`, `text=` from captured HTML)
4. **Create action** with simple selectors
5. **Test immediately:** `tsty run flow-name --fail-fast`
6. **Verify outcome:** Check screenshot shows expected change (not just exit code 0)
7. **If doesn't work:** Read code → Fix bug → Re-test

**→ Full workflow: [E2E-TESTING-GUIDE.md](references/E2E-TESTING-GUIDE.md)**

---

## 🖥️ Testing Development Servers

**Dev servers have expected errors** that should NOT fail tests:

```
Expected in dev mode:
✓ HMR (Hot Module Reload) messages
✓ 404s for source maps (*.map files)
✓ React DevTools notifications
✓ Fast Refresh rebuilding logs
✓ Next.js compilation warnings
```

### When to Disable Console Monitoring

**Use `--no-monitor` flag for:**

1. **Local development servers** (default for tsty framework itself)
   ```bash
   tsty run my-flow --fail-fast --no-monitor
   ```

2. **Testing a framework that tests itself** (meta-testing)
   ```bash
   # When testing tsty's own dashboard
   tsty run test-dashboard-feature --no-monitor
   ```

3. **Any dev server with expected console noise**

### When to Enable Console Monitoring

**Use `monitorConsole: true` for:**

1. **Production builds in CI/CD**
   ```json
   {
     "monitorConsole": true,
     "failFast": true
   }
   ```

2. **Testing user-facing applications** (not dev infrastructure)

3. **Strict quality gates** where ANY console error should fail

### Configuration Examples

**Dev environment** (lenient):
```json
{
  "name": "Test Feature",
  "baseUrl": "http://localhost:3000",
  "monitorConsole": false,
  "failFast": true
}
```

**Production/CI** (strict):
```json
{
  "name": "Test Feature",
  "baseUrl": "https://app.example.com",
  "monitorConsole": true,
  "failFast": true
}
```

**Rule of thumb**: If testing shows 404s or HMR messages → Use `--no-monitor`

---

## 🔄 Autonomous GitHub Issue Fixing

**CRITICAL**: When GitHub issues are mentioned, use **AUTONOMOUS WORKFLOW** - don't just track, actually FIX them.

### Autonomous Workflow (Primary)

**User says:** "Fix issue #42" or "Handle this GitHub issue"

**You autonomously:**

1. **Fetch & Understand**
   ```bash
   tsty issue fetch 42 --repo owner/repo
   ```
   - Read issue description, labels, comments
   - Understand what's broken or missing

2. **Create Test Flow Automatically**
   - Analyze issue to identify affected feature
   - Write test flow that reproduces the bug
   - Save to `.tsty/flows/issue-42-<slug>.json`
   - Link: `tsty issue link 42 --flow issue-42-<slug>`

3. **Run Test to Confirm Issue**
   ```bash
   tsty run issue-42-<slug> --fail-fast --no-monitor
   ```
   - Test should FAIL (confirming bug exists)
   - Capture reference: `tsty issue set-reference 42 --run <runId>`

4. **Analyze Failure & Fix Code**
   - Read test report and screenshots
   - Identify root cause (missing handler, broken logic, etc.)
   - Use Edit tool to fix the code
   - Apply fix to relevant component/page files

5. **Verify Fix Works**
   ```bash
   tsty run issue-42-<slug> --fail-fast --no-monitor
   ```
   - Test should PASS (issue fixed!)
   - If fails: iterate (analyze → fix → test) up to 3 times

6. **Mark as Fixed**
   - Update issue status to 'fixed'
   - Before/After comparison available in dashboard
   - Report: "Issue #42 fixed! View comparison at /issues/42"

**→ Complete guide: [AUTONOMOUS-ISSUE-FIXING.md](references/AUTONOMOUS-ISSUE-FIXING.md)**

### When to Use Autonomous Workflow

- ✅ User says "fix issue #X" → Full autonomous workflow
- ✅ User says "handle this GitHub issue" → Full autonomous workflow
- ✅ User mentions bug from GitHub → Fetch and offer to fix
- ⚠️ User says "test issue #X" → Create test but ask before fixing
- ❌ User just wants to track issues → Use manual workflow below

### Manual Workflow (Fallback)

For cases where autonomous fixing isn't appropriate (e.g., complex architectural changes):

1. Fetch: `tsty issue fetch <number> --repo owner/repo`
2. Link: `tsty issue link <number> --flow existing-flow`
3. Reference: `tsty issue set-reference <number> --run <runId>`
4. View comparison in dashboard at `/issues/<number>`

### Features

**Issue Management:**
- Fetch issues from any GitHub repo
- Store locally with tsty-specific metadata
- Link to test flows for automated verification
- Track testing timeline (fetch → link → reference → latest)

**Reference Run System:**
- Mark any test run as a baseline
- Compare subsequent runs to baseline
- Stored in flow JSON and report JSON
- Clear reference when no longer needed

**Visual Comparison:**
- Side-by-side screenshots (before/after)
- Blue border for reference, green for current
- Step selector with changed step indicators
- Keyboard navigation (← → arrows)
- "Full Screen" button for detailed comparison

**Use Cases:**
- Verify bug fixes visually
- Track feature changes over time
- Document issue resolution with screenshots
- Regression detection (did fix break something else?)

**Dashboard Pages:**
- `/issues` - List all fetched issues
- `/issues/<number>` - Issue detail with timeline and comparison
- `/compare` - Full-screen comparison view

---

## When to Read What

**Working with GitHub issues:**
- [AUTONOMOUS-ISSUE-FIXING.md](references/AUTONOMOUS-ISSUE-FIXING.md) - ⭐ **PRIMARY WORKFLOW** - Fetch → Test → Fix → Verify

**Starting your first test:**
- [E2E-TESTING-GUIDE.md](references/E2E-TESTING-GUIDE.md) - HTML-first approach
- [USER-FIRST-TESTING.md](references/USER-FIRST-TESTING.md) - User-like interactions

**After EVERY test run:**
- [VERIFICATION-CHECKLIST.md](references/VERIFICATION-CHECKLIST.md) - Step-by-step validation

**When feature doesn't work:**
- [BUG-DETECTION-CHECKLIST.md](references/BUG-DETECTION-CHECKLIST.md) - ⭐ **START HERE** - Systematic bug finding
- [BUG-FIXING-WORKFLOW.md](references/BUG-FIXING-WORKFLOW.md) - Investigation & fixing

**Building complex flows:**
- [FLOW-STRUCTURE.md](references/FLOW-STRUCTURE.md) - JSON schema
- [EXAMPLES.md](references/EXAMPLES.md) - 11 real-world patterns

**Need reference:**
- [ACTIONS.md](references/ACTIONS.md) - 48 Playwright primitives
- [VARIABLES.md](references/VARIABLES.md) - Dynamic variables & Faker
- [CLI-REFERENCE.md](references/CLI-REFERENCE.md) - All commands
- [CONFIG.md](references/CONFIG.md) - Configuration options

**Troubleshooting:**
- [ANALYSIS-METHODS.md](references/ANALYSIS-METHODS.md) - Analyzing reports/screenshots
- [FAIL-FAST-GUIDE.md](references/FAIL-FAST-GUIDE.md) - Stopping on first failure

**Using dashboard:**
- [DASHBOARD.md](references/DASHBOARD.md) - Visual editors

---

## Essential CLI Commands

```bash
# Setup
tsty init                          # Create .tsty/ directory

# Running tests (ALWAYS use --fail-fast during development)
tsty run <flow> --fail-fast        # Stop on first failure (60-78% faster)
tsty run <flow> --device mobile    # Test on mobile viewport
tsty run <flow> --mark-reference   # Run and mark as reference baseline

# Listing
tsty list                          # List flows
tsty list actions                  # List user actions
tsty primitives                    # List 48 primitives
tsty primitives mouse              # List mouse primitives

# Reference Runs (Before/After Comparison)
tsty mark-reference <runId> [--flow <flowId>]  # Mark run as reference baseline
tsty clear-reference <flowId>                  # Clear reference for flow
tsty list-references                           # List all reference runs

# GitHub Issue Integration
tsty issue fetch <number> [--repo owner/repo]  # Fetch issue from GitHub (via gh CLI)
tsty issue list                                # List all fetched issues
tsty issue link <number> --flow <flowId>       # Link issue to test flow
tsty issue set-reference <number> --run <runId> # Set reference run for issue
tsty issue view <number>                       # View issue details

# Dashboard
tsty                               # Start visual dashboard (localhost:4000)
```

**→ Full reference: [CLI-REFERENCE.md](references/CLI-REFERENCE.md)**

---

## Prerequisites

**⚠️ CRITICAL: Before anything, initialize:**

```bash
tsty init  # Creates .tsty/ directory with config, subdirectories
```

**If you see "No configuration file found"** → Run `tsty init` first.

---

## Workflow Approaches

**CLI-Only (Recommended for Autonomous Testing)**
- Create flows as JSON in `.tsty/flows/`
- Run via CLI: `tsty run flow-name --fail-fast`
- Fastest iteration for autonomous fixing
- **⚠️ CRITICAL: ALWAYS use headless mode (`headless: true`) for autonomous/agentic testing**
  - Prevents browser windows from appearing
  - Faster execution
  - Lower resource usage
  - Essential for background/automated workflows

**Dashboard (For Interactive Editing)**
- Start: `tsty` → http://localhost:4000
- Visual flow builder with drag-and-drop
- Still iterate: run → fix → re-run
- Can use `headless: false` for manual debugging only

**Tsty tests ANY web application** - your apps, third-party sites, local servers, etc.

---

## Core Iteration Loop

**Phase 1: Setup & Run**
```bash
tsty run my-test --fail-fast
```

**Phase 2: Analysis (CRITICAL)**

**CRITICAL FIRST QUESTION: Did the outcome make sense?**

**Outcome Verification Checklist:**
- [ ] Does the screenshot show the expected UI change?
- [ ] Is the created file/data functional (not just exists)?
- [ ] Would a real user be satisfied with this result?
- [ ] Did EVERY step achieve its intended outcome?

**If ANY checkbox is unchecked → Investigate and FIX the bug**

**Then analyze ALL data sources:**
1. **Report** (`.tsty/reports/`): `success`, `error`, `consoleErrors`
2. **Screenshots** (`.tsty/screenshots/run-*/`): Visual changes
3. **Console Logs** (`steps[].console`): JS errors
4. **Assertions** (`steps[].assertions`): Failed assertions

**→ See [ANALYSIS-METHODS.md](references/ANALYSIS-METHODS.md) for complete guide.**

**Phase 3: Fix & Re-run (ITERATE)**

**Identify what to fix:**
- **Console errors** → Fix **application code** (JS bugs in .tsx/.ts/.jsx/.js files)
- **Selector timeouts** → Fix **test selectors** (wrong selector in flow/action JSON)
- **Failed assertions** → Fix **test assertions** or **app behavior**
- **Visual bugs** → Fix **application code** (CSS/layout in .css/.tsx files)
- **Missing elements** → Fix **application code** (component rendering)

**Apply fixes:**
1. Use Read tool to examine relevant files
2. Use Edit tool to fix issues
3. Re-run: `tsty run my-test --fail-fast`
4. Repeat Phase 2 (analyze)
5. Continue until: exit 0, screenshots correct, no errors

**→ See [ITERATIVE-WORKFLOW.md](references/ITERATIVE-WORKFLOW.md) for detailed patterns.**

---

## Decision Tree: STOP or CONTINUE?

**After EVERY test run:**

```
Exit code 0?
├─ YES → View screenshots → Issues? → Note as UX improvements → DONE
└─ NO → consoleErrors > 0?
   ├─ YES → 🚨 FIX APP CODE (JS bug) → Re-run
   └─ NO → Selector timeout?
      ├─ YES → Check screenshot → Fix selector or app → Re-run
      └─ NO → Read error → Fix → Re-run
```

**Key principles:**
- **Console errors** = Fix **app code** (JavaScript bugs)
- **Selector errors** = Fix **test selectors** (wrong selector)
- **Exit 0 + screenshots OK** = DONE (create next test)

**→ See [QUICK-DECISIONS.md](references/QUICK-DECISIONS.md) for complete decision trees.**

---

## Flow Structure

**Minimal example:**

```json
{
  "name": "Test",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "steps": [{
    "name": "Homepage",
    "url": "/",
    "capture": { "screenshot": true },
    "primitives": [{ "type": "click", "selector": "button" }]
  }]
}
```

**Key fields:** `url` (navigate), `primitives` (actions), `expectedUrl` (verify), `capture` (screenshots/HTML)

**→ See [FLOW-STRUCTURE.md](references/FLOW-STRUCTURE.md) for complete schema.**

---

## 48 Playwright Primitives

**Primitives** are framework-provided building blocks (auto-generated from Playwright).
**Actions** are user-created behaviors (composed from primitives).

**48 primitives across 7 categories**: Navigation (5), Mouse (5), Input (8), Waiting (6), Locators (7), Info (4), Other (13)

```bash
tsty primitives           # List all 48 primitives
tsty primitives mouse     # List by category
```

**→ See [ACTIONS.md](references/ACTIONS.md) for complete primitive reference and examples.**

---

## Variable Interpolation

**Syntax:** `${variable}`

**Built-in:** `${timestamp}`, `${datetime}`, `${baseUrl}`, `${credentials.email}`

**Faker.js (300+):**
```
${faker.person.fullName}
${faker.internet.email}
${faker.location.city}
${faker.company.name}
${faker.lorem.sentence}
```

**→ See [VARIABLES.md](references/VARIABLES.md) for complete reference.**

---

## Configuration

`.tsty/config.json`:

```json
{
  "baseUrl": "http://localhost:3000",
  "credentials": { "email": "test@example.com", "password": "pass" },
  "playwright": { "headless": true, "timeout": 30000 }
}
```

**⚠️ CRITICAL for Autonomous/Agentic Testing:**
- **ALWAYS set `"headless": true`** (default, but verify!)
- Only use `"headless": false` for manual debugging with visible browser
- Headless mode prevents browser windows during autonomous iteration

**→ See [CONFIG.md](references/CONFIG.md) for complete guide.**

---

## Troubleshooting

**Common issues:**
- "No configuration file" → Run `tsty init`
- Port conflict → `tsty --port 3001`
- Flow not found → Check `tsty list` or `ls .tsty/flows/`
- Playwright not installed → `npx playwright install chromium`
- Timeout errors → Check selectors and page load state

**Note:** Playwright launches isolated browser instances. Dev server must be running before tests.

**→ See [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) for complete guide.**

---

## Reference Documentation

**Load as needed for detailed information.**

### 🎯 Core Workflows (Read First)

- **[ITERATIVE-WORKFLOW.md](references/ITERATIVE-WORKFLOW.md)** - ⭐ CRITICAL: Iteration loop with examples
- **[E2E-TESTING-GUIDE.md](references/E2E-TESTING-GUIDE.md)** - ⭐ CRITICAL: HTML-first approach
- **[VERIFICATION-CHECKLIST.md](references/VERIFICATION-CHECKLIST.md)** - ⭐ CRITICAL: Step-by-step validation
- **[ANALYSIS-METHODS.md](references/ANALYSIS-METHODS.md)** - Analyzing reports/screenshots/logs
- **[USER-FIRST-TESTING.md](references/USER-FIRST-TESTING.md)** - ⭐ User-like interactions & common mistakes
- **[BUG-FIXING-WORKFLOW.md](references/BUG-FIXING-WORKFLOW.md)** - ⭐ Investigation & bug fixing

### 📚 Technical References

- **[FLOW-STRUCTURE.md](references/FLOW-STRUCTURE.md)** - Flow JSON schema with examples
- **[ACTIONS.md](references/ACTIONS.md)** - 48 Playwright primitives
- **[VARIABLES.md](references/VARIABLES.md)** - Variable interpolation & Faker.js
- **[CONFIG.md](references/CONFIG.md)** - Configuration options
- **[CLI-REFERENCE.md](references/CLI-REFERENCE.md)** - All CLI commands

### 🎨 Features & Guides

- **[DASHBOARD.md](references/DASHBOARD.md)** - Dashboard features
- **[FAIL-FAST-GUIDE.md](references/FAIL-FAST-GUIDE.md)** - Fail-fast mode details
- **[EXAMPLES.md](references/EXAMPLES.md)** - 11 real-world examples

### 📐 Standards & Analysis

- **[VISUAL-ANALYSIS-GUIDE.md](references/VISUAL-ANALYSIS-GUIDE.md)** - Visual analysis methodology
- **[ANALYSIS-CHECKLIST.md](references/ANALYSIS-CHECKLIST.md)** - Quick checklist
- **[accessibility-standards.md](references/accessibility-standards.md)** - WCAG AA standards
- **[ux-production-analysis.md](references/ux-production-analysis.md)** - UX patterns
- **[framework-fixes.md](references/framework-fixes.md)** - Framework-specific fixes
- **[common-ux-issues.md](references/common-ux-issues.md)** - Common anti-patterns
- **[layout-patterns.md](references/layout-patterns.md)** - Layout best practices

### 🛠️ For Maintainers

- **[DESIGN-PHILOSOPHY.md](references/DESIGN-PHILOSOPHY.md)** - Design principles & extension guidelines

---

## When to Use This Skill

**Auto-trigger (proactive):**
- User implements UI features → Test with Tsty
- User updates pages → Verify no regressions
- User makes layout changes → Check visual correctness

**Explicit requests:**
- "Test the dashboard visually"
- "Check accessibility"
- "Run E2E tests"
- "Find layout issues"

**Proactive suggestions:**
- User: "Added modal" → You: "Let me test it"
- User: "Updated layout" → You: "I'll run regression tests"

---

## Key Principles

### Technical
- **Directory**: `.tsty/`
- **Commands**: `tsty` or `npx qa` (never run scripts directly)
- **Primitives**: 48 auto-generated from Playwright's Page API
- **Actions**: User-created behaviors composed from primitives
- **Variables**: Faker.js for dynamic data (300+)
- **Screenshots**: `run-{flowId}-{timestamp}/` per run

### Workflow
- **ITERATE**: Run → Analyze → Fix → Re-run (don't stop after one run)
- **ANALYZE ALL**: Reports + screenshots + logs + assertions
- **FIX AUTONOMOUSLY**: Apply fixes immediately
- **VERIFY FIXES**: Always re-run after fixes

### Analysis
- **Visible only**: Analyze what's in screenshots/logs
- **Priority**: Errors → Critical bugs → Assertions → Visual → UX
- **Two-tier**: Critical issues + UX improvements
- **Concise**: 1-2 lines per issue

---

## Framework Info

- **Package**: `tsty` (install from GitHub: `bun install -g https://github.com/mde-pach/tsty.git`)
- **GitHub**: https://github.com/mde-pach/tsty
- **Playwright**: https://playwright.dev
- **Faker.js**: https://fakerjs.dev/api/
