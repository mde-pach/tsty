# GitHub Issues: Autonomous Fixing Workflow

When a user mentions a GitHub issue, don't just track it -- autonomously create a test, run it, analyze, fix, and verify.

## 1. Autonomous Workflow Overview

The full 7-step process:

1. **Fetch** issue from GitHub
2. **Store** locally in `.tsty/issues/`
3. **Pre-flight** -- analyze issue type (bug, feature, UI, interaction)
4. **Create flow** at `.tsty/flows/issue-{number}-{slug}.json`
5. **Run reference** with `--issue` flag -- automatically links flow to issue and sets reference run
6. **Analyze & Fix** -- read ALL screenshots, identify root cause, apply code changes
7. **Re-run & Compare** -- run again with `--issue` flag, read screenshots from BOTH runs, verify improvement

## 2. Phase 1: Fetch & Understand

```bash
gh issue view <number> --repo <owner/repo> --json title,body,labels,number
```

Save output to `.tsty/issues/<number>.json`.

Read the saved file and classify the issue:
- **Bug report** -- create test that reproduces the bug
- **Feature request** -- create test for expected behavior
- **UI issue** -- create visual test with screenshots
- **Interaction issue** -- create user flow test

## 3. Phase 2: Create Flow

**Naming convention:** `issue-{number}-{slug}.json`
**Location:** `.tsty/flows/issue-{number}-{slug}.json`

Template:

```json
{
  "name": "Issue #{number}: {title}",
  "description": "Test to reproduce issue #{number} - {description}",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "monitorConsole": false,
  "steps": [
    {
      "name": "Navigate to affected page",
      "url": "/path",
      "capture": { "screenshot": true }
    },
    {
      "name": "Reproduce the issue",
      "primitives": [
        { "type": "fill", "selector": "input[name='field']", "value": "test" },
        { "type": "click", "selector": "button:has-text('Submit')" },
        { "type": "waitForTimeout", "timeout": 1000 }
      ],
      "capture": { "screenshot": true }
    },
    {
      "name": "Verify expected behavior",
      "capture": { "screenshot": true },
      "assertions": [
        { "type": "visible", "selector": "text=Success" }
      ]
    }
  ]
}
```

Always set `failFast: true` and `monitorConsole: false` for issue flows.

## 4. Phase 3: Run with --issue flag (auto-links + sets reference)

The `--issue` flag automates linking and reference marking in a single command:

```bash
tsty run issue-{number}-{slug} --fail-fast --no-monitor --issue {number}
```

This automatically:
1. **Links** the flow to the issue (`linkedFlowId` + `status: linked`)
2. **Sets the reference run** (`referenceRunId` + `status: testing`)

No manual JSON editing needed. The CLI output will confirm:

```
🔗 Auto-linked issue #42 to flow: issue-42-checkout-submit
📌 Auto-set reference run for issue #42: issue-42-checkout-submit-1771094164532
   Status: testing
   Next: fix the code, then re-run to compare before/after
```

**Expected:** Test should FAIL (confirming the issue exists).

If test passes:
- Check screenshots -- do they actually show the issue?
- Re-analyze issue description and adjust the flow
- Re-run

If test fails: issue confirmed. Proceed to Phase 4.

> **Manual alternative**: You can still link and set reference separately with `tsty issue link` and `tsty issue set-reference` if needed.

## 5. Phase 4: Analyze & Fix

### Read screenshots (mandatory, do not skip)

```bash
ls -1 .tsty/screenshots/<runId>/*.png
```

Then read EVERY screenshot:
```
Read .tsty/screenshots/<runId>/1-step-name.png
Read .tsty/screenshots/<runId>/2-step-name.png
```

### Technical analysis

1. Read report: `.tsty/reports/flow-issue-{number}-*.json`
2. Check console errors in report
3. Identify failure type:
   - Selector timeout -- element missing or wrong selector
   - Assertion failed -- expected behavior not happening
   - Console error -- JavaScript bug
   - Visual issue -- CSS/layout problem

### Fix the code

Based on visual + technical analysis, identify the affected files and apply fixes using the Edit tool.

Iterate if needed: fix, re-run, analyze, fix again (up to 3 attempts).

## 6. Phase 5: Verify Fix

### Re-run

```bash
tsty run issue-{number}-{slug} --fail-fast --no-monitor --issue {number}
```

On subsequent runs, the `--issue` flag detects the reference already exists and tells you to compare:

### Compare before/after screenshots

```bash
# List BEFORE screenshots
ls -1 .tsty/screenshots/<referenceRunId>/*.png

# List AFTER screenshots
ls -1 .tsty/screenshots/<newRunId>/*.png
```

Read screenshots from BOTH runs and compare:

```
# BEFORE
Read .tsty/screenshots/<referenceRunId>/1-step-name.png

# AFTER
Read .tsty/screenshots/<newRunId>/1-step-name.png
```

### Visual verification checklist

- What was wrong in BEFORE?
- What changed in AFTER?
- Is the issue fixed visually?
- Would a user see the improvement?

**If passes AND screenshots show improvement:** Issue fixed. Ready for commit/PR.

**If passes BUT screenshots show no change:** Fix didn't work visually. Re-analyze and fix the actual issue.

**If still fails:** Analyze failure, apply additional fixes, re-run.

## 7. Issue Status Progression

| Status | Meaning | Fields Set |
|---|---|---|
| `pending` | Fetched from GitHub, not linked yet | `number`, `title`, `body` |
| `linked` | Linked to test flow, no reference run | + `linkedFlowId` |
| `testing` | Reference run captured, actively testing | + `referenceRunId` |

## 8. Decision Tree

**User says "fix issue #X":**
Full workflow -- fetch, create flow, run with `--issue X` (auto-links + sets reference), analyze, fix, re-run with `--issue X`, compare.

**User says "test issue #X":**
Partial workflow -- fetch, create flow, run with `--issue X`, analyze. Stop before fixing.

**User says "fetch issue #X":**
Fetch only, then ask: "Should I also create a test flow and attempt to fix it?"

## 9. Troubleshooting

### No comparison data on issue page

Check:
- Is `linkedFlowId` set in `.tsty/issues/{number}.json`?
- Is `referenceRunId` set?
- Does the flow exist at `.tsty/flows/{linkedFlowId}.json`?
- Does the reference run report exist in `.tsty/reports/`?
- Is there at least one additional run after the reference run?

### Screenshots not found

Check:
- Directory exists: `.tsty/screenshots/{runId}/`
- Files exist: `ls .tsty/screenshots/{runId}/*.png`
- RunId format is correct: `run-{flowId}-{timestamp}`

### Test creation fails

- Issue description unclear -- ask user for clarification
- Can't identify affected page/component -- ask user

### Fix doesn't work after 3 attempts

- Provide detailed analysis of findings
- Ask user for guidance on where to look

### Test passes but shouldn't

- Screenshots might show the issue exists but test assertions are wrong
- Re-analyze issue description and adjust the flow assertions
- A passing test does NOT mean the issue is fixed -- always check screenshots
