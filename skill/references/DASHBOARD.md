# Dashboard Features Reference

Complete guide to the Tsty dashboard web interface.

---

## Table of Contents

1. [Overview](#overview)
2. [Starting the Dashboard](#starting-the-dashboard)
3. [Main Views](#main-views)
4. [Organization Features](#organization-features)
5. [Execution Features](#execution-features)
6. [Editor Features](#editor-features)
7. [Tools & Navigation](#tools--navigation)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Use Cases](#use-cases)

---

## Overview

The Tsty dashboard is a Next.js web interface for visual test creation, execution monitoring, and result analysis.

**URL**: http://localhost:4000 (default)

**Features**:
- Visual flow builder with drag-and-drop
- Action composer with 48 Playwright primitives
- Real-time execution monitoring
- Screenshot galleries
- Folder/tag organization
- Run comparison for regression testing

---

## Starting the Dashboard

### Start Server

```bash
# Start on default port (4000)
tsty

# Or explicitly
tsty server

# Custom port
tsty --port 3001

# Custom host
tsty --host 0.0.0.0 --port 4000
```

**Opens automatically in browser**: http://localhost:4000

### Verify Running

```bash
# Check if server is running
curl http://localhost:4000

# Or visit in browser
open http://localhost:4000
```

---

## Main Views

### 1. Tests Card Page (Home)

**URL**: http://localhost:4000/

**Features**:
- Visual card grid of all flows
- Drag-and-drop to folders
- Quick actions (run, edit, delete)
- Folder tree sidebar
- Bulk operations toolbar

**Layout**:
```
┌─────────────────────────────────────────────┐
│ [Sidebar]  │  [Flow Cards Grid]             │
│            │                                 │
│  Folders   │  ┌─────┐  ┌─────┐  ┌─────┐   │
│  - Auth    │  │Flow1│  │Flow2│  │Flow3│   │
│  - E2E     │  └─────┘  └─────┘  └─────┘   │
│  - Visual  │                                 │
│            │  ┌─────┐  ┌─────┐  ┌─────┐   │
│  Tags      │  │Flow4│  │Flow5│  │Flow6│   │
│  • smoke   │  └─────┘  └─────┘  └─────┘   │
│  • critical│                                 │
└─────────────────────────────────────────────┘
```

**Actions per card**:
- ▶️ Run flow
- ✏️ Edit flow
- 👁️ Quick view
- 🗑️ Delete flow
- 📋 Duplicate flow

---

### 2. Test Explorer (List View)

**URL**: http://localhost:4000/explorer

**Features**:
- Traditional list view
- Advanced filters (tags, categories, dependencies)
- Sortable columns
- Bulk selection
- Quick view modal

**Columns**:
- Name
- Category
- Tags
- Steps count
- Last run
- Status
- Actions

**Filters**:
- By tag
- By category
- By folder
- By status (passing/failing)
- By date range

---

### 3. Overview Page (Dashboard)

**URL**: http://localhost:4000/overview

**Features**:
- Test statistics
- Recent runs
- Success rate charts
- Performance metrics
- Quick access to failing tests

**Metrics shown**:
- Total flows
- Total actions
- Total runs
- Success rate
- Average duration
- Recent activity

---

### 4. Actions Library

**URL**: http://localhost:4000/actions

**Features**:
- List of all reusable actions
- Filter by category
- Search by name
- Usage count per action
- Create new actions

**View modes**:
- Card view (visual)
- List view (compact)
- Category grouping

---

### 5. Reports & History

**URL**: http://localhost:4000/runs

**Features**:
- Test run history
- Detailed reports
- Screenshot galleries
- Console logs viewer
- Run comparison

**Per run**:
- Timestamp
- Duration
- Success/failure status
- Steps executed
- Screenshots captured
- Console errors count

---

## Organization Features

### Folders

**Create folder structure**:
1. Click "New Folder" in sidebar
2. Name folder (e.g., "Auth Flows")
3. Drag flows into folder
4. Nest folders (up to 5 levels)

**Features**:
- Drag-and-drop organization
- Collapsible tree view
- Flow count badges
- Color coding
- Rename/delete folders

**Best practices**:
```
.tsty/flows/
├── auth/          → Login, registration, logout
├── e2e/           → Full user journeys
├── visual/        → Screenshot audits
├── regression/    → Baseline comparisons
└── quick-tests/   → Single-action tests
```

---

### Tags

**Create tags**:
1. Go to Tags tab
2. Click "New Tag"
3. Name + choose color
4. Apply to flows

**Built-in tag colors**:
- 🔴 Red - Critical
- 🟠 Orange - Important
- 🟡 Yellow - Warning
- 🟢 Green - Passing
- 🔵 Blue - Info
- 🟣 Purple - Feature

**Usage**:
- Filter flows by tag
- Organize by priority
- Track test types
- Group related tests

---

### Smart Collections

**Create collection**:
1. Go to Collections tab
2. Click "New Collection"
3. Define filter rules
4. Save (auto-updates)

**Filter types**:
- Tag contains
- Category matches
- Name includes
- Has dependencies
- Last run date
- Success/failure status

**Example collections**:
- "Critical Tests" → tag contains "critical"
- "E2E Flows" → category = "e2e"
- "Failing Tests" → status = "failing"
- "Recently Updated" → modified in last 7 days

---

### Page Hierarchy

**Automatically extracted from URLs**:
```
/                        → Root
├── /auth               → Auth pages
│   ├── /auth/login
│   └── /auth/register
├── /dashboard          → Dashboard
└── /settings           → Settings
```

**Features**:
- Auto-generated from flow URLs
- Clickable (filters flows by page)
- Shows flow count per page
- Hierarchical tree view

---

## Execution Features

### Execution Modal

**Opens when running flow from dashboard**

**Features**:
- Real-time progress updates
- Step-by-step execution view
- Live screenshot preview
- Console log streaming
- Stop/pause execution

**Status indicators**:
- ⏳ Pending - Not started
- ▶️ Running - Currently executing
- ✅ Passed - Successfully completed
- ❌ Failed - Error occurred
- ⏹️ Stopped - Manually stopped

---

### Run Comparison

**Compare two test runs**:
1. Go to Runs tab
2. Select two runs
3. Click "Compare"
4. View side-by-side

**Comparison shows**:
- Screenshot diffs
- Duration changes
- New errors
- Status changes
- Console log differences

**Use for**:
- Visual regression testing
- Performance regression
- Debugging failures
- Verifying fixes

---

### Step Navigator

**Browse through test steps**:
- Previous/Next buttons
- Screenshot preview
- Console logs
- Assertions
- Timing data

**Per step**:
- Screenshot thumbnail
- Duration
- Status (passed/failed)
- Console errors count
- Assertions results

---

### Screenshot Gallery

**View all screenshots from run**:

**Organization**: `.tsty/screenshots/run-{flowId}-{timestamp}/`

**Files**: `1-step-name.png`, `2-step-name.png`, etc.

**Gallery features**:
- Thumbnail grid
- Full-size lightbox
- Download individual/all
- Zoom in/out
- Navigate with keyboard

---

## Editor Features

### Flow Builder

**URL**: http://localhost:4000/flows/new

**Create flow visually**:
1. Set name, description, baseUrl
2. Add steps (drag from palette)
3. Configure each step
4. Add assertions
5. Save flow

**Step configuration**:
- Name (required)
- URL (optional - navigate to page)
- Expected URL (validate navigation)
- Actions (reference reusable actions)
- Primitives (inline actions)
- Capture settings
- Assertions
- Timeout

**Features**:
- Drag-and-drop steps
- Reorder steps
- Duplicate steps
- Delete steps
- Collapse/expand steps
- Toggle JSON view

---

### Action Composer

**URL**: http://localhost:4000/actions/new

**Create action from 48 primitives**:
1. Name action
2. Drag primitives from palette (48 Playwright actions)
3. Configure each primitive
4. Test in isolation
5. Save action

**Primitive categories**:
- 🧭 Navigation (5) - goto, goBack, goForward, reload, setContent
- 🖱️ Mouse (5) - click, dblclick, hover, dragAndDrop, tap
- ⌨️ Input (8) - fill, type, press, check, uncheck, selectOption, setInputFiles, focus, blur
- ⏳ Waiting (6) - waitForLoadState, waitForTimeout, waitForSelector, waitForFunction, waitForURL, waitForEvent
- 🔍 Locators (7) - locator, getByRole, getByText, getByLabel, getByPlaceholder, getByAltText, getByTitle, getByTestId
- ℹ️ Information (4) - content, title, url, viewportSize
- 🔧 Other (13) - screenshot, evaluate, etc.

**Features**:
- Color-coded primitives
- Drag-and-drop composition
- Inline selector picker
- Variable interpolation
- Test action before saving

---

### Selector Picker

**Interactive CSS selector helper**:

**Opens when configuring action**:
1. Click "Pick Selector"
2. View 20+ suggestions
3. Select or customize
4. Test selector

**Suggestions**:
- By ID: `#element-id`
- By class: `.class-name`
- By name: `[name='field']`
- By text: `:has-text('Click me')`
- By role: `[role='button']`
- By attribute: `[data-testid='element']`
- By placeholder: `[placeholder='Enter text']`
- Combined: `button.primary:has-text('Submit')`

**Best practice**: Prefer `:has-text()` and semantic selectors (resilient to CSS changes)

---

## Tools & Navigation

### Command Palette

**Keyboard shortcut**: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux)

**Features**:
- Quick navigation
- Search flows/actions
- Run commands
- Create new tests
- Filter and search

**Available commands**:
- `> Run flow` - Execute test
- `> New flow` - Create flow
- `> New action` - Create action
- `> Go to reports` - View history
- `> Go to settings` - Settings
- `Search: <query>` - Find flows/actions

---

### Keyboard Shortcuts

**Press `Cmd+/` to view all shortcuts**

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| `Cmd+/` | Show shortcuts help |
| `Cmd+N` | New flow |
| `Cmd+S` | Save flow |
| `Cmd+E` | Toggle JSON view |
| `Cmd+R` | Run current flow |
| `Esc` | Close modal/palette |
| `←` / `→` | Navigate steps |
| `Space` | Expand/collapse |

---

### Quick View Modal

**Preview flow without navigation**:
1. Hover over flow card
2. Click "Quick View" 👁️
3. View details in modal

**Shows**:
- Flow configuration
- Steps overview
- Recent runs
- Tags and category
- Dependencies

**Actions**:
- Run flow
- Edit flow
- Duplicate flow
- View full details

---

### Bulk Operations

**Select multiple flows**:
1. Click checkboxes on flow cards
2. Toolbar appears
3. Choose action

**Bulk actions**:
- Run all selected
- Add tags
- Move to folder
- Delete selected
- Duplicate selected

---

### Auto-Save

**Automatic draft saving**:
- Saves every 30 seconds
- Uses localStorage
- Restores on page refresh
- Warning on navigation with unsaved changes

**Manual save**: `Cmd+S`

---

### Dark Mode

**Toggle dark mode**:
1. Click theme toggle (sun/moon icon)
2. Or use system preference

**Supported**: All components have dark mode styles

---

## Use Cases

### Use Case 1: Create E2E Test Visually

**Workflow**:
1. Start dashboard: `tsty`
2. Click "New Flow"
3. Set baseUrl: `http://localhost:3000`
4. Add step: "Load page"
   - URL: `/login`
   - Capture screenshot: ✅
5. Add step: "Fill form"
   - Drag "fill" primitive
   - Selector: `input[name='email']`
   - Value: `${credentials.email}`
6. Add step: "Submit"
   - Drag "click" primitive
   - Selector: `button[type='submit']`
   - Expected URL: `/dashboard`
7. Save flow
8. Run from dashboard (▶️ button)
9. Watch execution in modal
10. View screenshots in gallery

---

### Use Case 2: Visual Regression Testing

**Workflow**:
1. Create flow with screenshots
2. Run flow (baseline)
3. Make code changes
4. Run flow again (comparison)
5. Go to Runs tab
6. Select both runs
7. Click "Compare"
8. Review side-by-side diffs

---

### Use Case 3: Organize Test Suite

**Workflow**:
1. Go to Tests Card Page
2. Create folders:
   - "Auth Flows"
   - "E2E Tests"
   - "Visual Audits"
3. Drag flows into folders
4. Create tags:
   - "critical" (red)
   - "smoke" (yellow)
   - "regression" (blue)
5. Apply tags to flows
6. Create smart collection:
   - Name: "Critical Tests"
   - Filter: tag contains "critical"
7. Use collection for CI/CD

---

### Use Case 4: Debug Failing Test

**Workflow**:
1. Go to Runs tab
2. Find failing run
3. Open run details
4. View step-by-step execution
5. Check failed step screenshot
6. Read console errors
7. Identify issue (e.g., wrong selector)
8. Go to Flow Builder
9. Edit flow
10. Update selector
11. Save and re-run
12. Verify fix in execution modal

---

### Use Case 5: Reusable Action Library

**Workflow**:
1. Go to Actions tab
2. Create reusable action:
   - Name: "login"
   - Type: "auth"
   - Primitives: fill email, fill password, click submit
3. Save action
4. Create multiple flows that use "login" action
5. If login changes, update action once
6. All flows automatically updated

---

## Dashboard vs CLI

### When to Use Dashboard

✅ **Use dashboard when**:
- Creating tests for first time
- Visual flow building preferred
- Exploring framework features
- Need drag-and-drop interface
- Want real-time execution view
- Organizing test suite with folders/tags

### When to Use CLI

✅ **Use CLI when**:
- Autonomous iteration and fixing
- CI/CD pipelines
- Headless environments
- Fast iteration cycles
- Scripted testing workflows
- Prefer keyboard over mouse

### Hybrid Approach

**Best of both worlds**:
1. Create flows visually in dashboard
2. Export to `.tsty/flows/` (automatic)
3. Iterate via CLI for faster fixing
4. Return to dashboard for structural changes

---

## Cross-References

- **CLI**: See [CLI-REFERENCE.md](CLI-REFERENCE.md) for command-line usage
- **Flow Structure**: See [FLOW-STRUCTURE.md](FLOW-STRUCTURE.md) for JSON format
- **Examples**: See [EXAMPLES.md](EXAMPLES.md) for common scenarios
- **Actions**: See [ACTIONS.md](ACTIONS.md) for action system

---

**Last Updated**: 2026-02-06
