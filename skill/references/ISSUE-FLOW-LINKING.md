# Issue-Flow Linking Guide

**Purpose**: Technical details for linking test flows to GitHub issues and capturing reference runs for before/after comparison.

## Overview

The tsty framework supports linking GitHub issues to test flows to enable:
- Automated tracking of which flows test which issues
- Before/after screenshot comparison on the issue detail page
- Visual verification of fixes

## Linking a Flow to an Issue

After creating a test flow for an issue, link them together.

### Step 1: Create the Flow

Create your test flow at `.tsty/flows/issue-{number}-{slug}.json` (see AUTONOMOUS-ISSUE-FIXING.md Phase 2).

### Step 2: Link Flow to Issue

**Method: Direct JSON Edit (Recommended - Fast and Simple)**

```bash
# Read the current issue data
cat .tsty/issues/{number}.json

# Edit .tsty/issues/{number}.json to update these fields:
{
  ...existing fields (number, title, body, etc.)...,
  "linkedFlowId": "issue-{number}-{slug}",  # ADD THIS
  "status": "linked"                         # UPDATE THIS
}
```

**Example:**
```json
{
  "number": 42,
  "title": "Button doesn't save form",
  "body": "When clicking save...",
  "state": "open",
  "labels": [...],
  "url": "https://github.com/...",
  "createdAt": "2026-02-14T00:00:00Z",
  "updatedAt": "2026-02-14T00:00:00Z",
  "author": { "login": "user" },
  "assignees": [],
  "fetchedAt": "2026-02-14T18:00:00Z",
  "repository": "owner/repo",
  "linkedFlowId": "issue-42-checkout-submit",  ← ADD THIS
  "status": "linked"                           ← UPDATE THIS
}
```

### Verification

After linking:
1. Navigate to `http://localhost:4000/issues/{number}` in the dashboard
2. Should see "Linked to Flow" event in the Testing Timeline
3. Actions sidebar should show flow-related buttons

## Setting a Reference Run

After running the test flow for the first time, capture the runId to establish a BEFORE baseline.

### Step 1: Run the Flow

```bash
tsty run issue-{number}-{slug} --fail-fast --no-monitor
```

### Step 2: Extract runId from Output

The test output includes the screenshot directory path:

```
✅ Test Passed (or Failed)
Screenshots saved to: .tsty/screenshots/run-issue-42-slug-1771094164532/
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your runId
```

**Pattern:** `run-{flowId}-{timestamp}`

### Step 3: Link Reference Run to Issue

```bash
# Edit .tsty/issues/{number}.json to update these fields:
{
  ...existing fields...,
  "referenceRunId": "run-issue-42-slug-1771094164532",  # ADD THIS
  "status": "testing"                                    # UPDATE THIS
}
```

**Complete example:**
```json
{
  "number": 42,
  "title": "Button doesn't save form",
  ...other fields...,
  "linkedFlowId": "issue-42-checkout-submit",
  "referenceRunId": "run-issue-42-checkout-submit-1771094164532",  ← ADD THIS
  "status": "testing"                                               ← UPDATE THIS
}
```

### Verification

After setting reference run:
1. Navigate to `http://localhost:4000/issues/{number}`
2. Should see "Reference Captured (Before)" event in Testing Timeline
3. Timestamp should match the run
4. Should show button to view reference run

## Before/After Comparison

Once both `linkedFlowId` and `referenceRunId` are set, run the flow again to create a comparison.

### Step 1: Apply Your Fix

Edit the application code to fix the issue.

### Step 2: Run Flow Again

```bash
tsty run issue-{number}-{slug} --fail-fast --no-monitor
```

This creates a new run (the AFTER state).

### Step 3: View Comparison

1. Navigate to `http://localhost:4000/issues/{number}`
2. Should see "Latest Run (After)" event in Testing Timeline
3. **"Before/After Comparison" section should appear** showing:
   - Side-by-side screenshot comparison
   - BEFORE/AFTER labels (large, bold, color-coded)
   - Size comparison panel (dimensions, megapixels, delta)
   - Step selector to navigate through different screenshots
   - Visual hierarchy with thick borders and shadows

### Step 4: Verify Visually

**MANDATORY: Read screenshots from BOTH runs**

```bash
# List screenshots from reference run (BEFORE)
ls -1 .tsty/screenshots/{referenceRunId}/*.png

# List screenshots from latest run (AFTER)
ls -1 .tsty/screenshots/{latestRunId}/*.png

# Read ALL screenshots from BOTH runs
Read .tsty/screenshots/{referenceRunId}/1-step.png
Read .tsty/screenshots/{latestRunId}/1-step.png
# Continue for all steps
```

**Compare visually:**
- What was wrong in BEFORE?
- What changed in AFTER?
- Is the issue fixed?
- Would a user see the improvement?

## Alternative: Using GitHubIssueManager (Advanced)

If you need to use the TypeScript API instead of direct JSON editing:

### Linking Flow

```typescript
import { GitHubIssueManager } from '@/lib/github-issue-manager';

const issueManager = new GitHubIssueManager('.tsty/issues');
await issueManager.linkToFlow(42, 'issue-42-checkout-submit');
```

### Setting Reference Run

```typescript
await issueManager.setReferenceRun(42, 'run-issue-42-checkout-submit-1771094164532');
```

## Status Progression

Issues progress through these statuses during the autonomous workflow:

1. **pending** - Fetched from GitHub, not linked to flow yet
2. **linked** - Linked to test flow, no reference run yet
3. **testing** - Reference run captured, actively testing/fixing

## Troubleshooting

### Issue page shows "No comparison data"

**Check:**
- Is `linkedFlowId` set in `.tsty/issues/{number}.json`?
- Is `referenceRunId` set?
- Does the flow exist at `.tsty/flows/{linkedFlowId}.json`?
- Does the reference run report exist in `.tsty/reports/`?

### Comparison section doesn't appear

**Requires:**
- `linkedFlowId` must be set
- `referenceRunId` must be set
- At least ONE additional run after the reference run

### Screenshots not found

**Check:**
- Screenshot directory exists: `.tsty/screenshots/{runId}/`
- Screenshot files exist: `ls .tsty/screenshots/{runId}/*.png`
- Correct runId format: `run-{flowId}-{timestamp}`

## Summary

**Quick checklist for autonomous workflow:**

- [ ] Create flow at `.tsty/flows/issue-{number}-{slug}.json`
- [ ] Edit `.tsty/issues/{number}.json` to add `linkedFlowId` and `status: "linked"`
- [ ] Run flow: `tsty run issue-{number}-{slug} --fail-fast --no-monitor`
- [ ] Extract runId from output
- [ ] Edit `.tsty/issues/{number}.json` to add `referenceRunId` and `status: "testing"`
- [ ] List and read ALL screenshots from reference run
- [ ] Apply fixes to code
- [ ] Run flow again
- [ ] List and read ALL screenshots from both runs
- [ ] Compare visually and verify improvement
