# Tsty Framework - Claude Code Instructions

## Project Overview

Tsty is a **standalone visual QA testing framework** that generates and manages `.tsty/` directories for web application testing. This project is the framework itself - the tool that creates and manages test environments for other projects.

**Current Status**: Production-ready with 48 auto-generated Playwright actions, visual editors, and comprehensive organization features. The project is self-testing (uses its own framework to test itself).

## Testing Philosophy (CRITICAL FOR TEST DEVELOPMENT)

**When developing E2E tests for this framework, follow these principles:**

### 1. Test Like a Human User

**Always interact the way a real user would:**

```json
✅ GOOD - User-like selectors:
{ "type": "click", "selector": "text=Save" }
{ "type": "click", "selector": "text=Focus" }
{ "type": "fill", "selector": "placeholder=Action name", "value": "Test" }

❌ BAD - Over-engineered selectors:
{ "type": "click", "selector": "div.card:nth-child(3) > button" }
{ "type": "click", "selector": "div:has-text('Focus'):has-text('Focus an element')" }
```

**Interaction hierarchy:**
1. Try simple click first (`text=Element`)
2. Then try fill/type for inputs
3. Only try drag-and-drop if click doesn't work
4. JavaScript evaluate is LAST RESORT (usually means there's a bug)

### 2. Fix Bugs Found During Testing

**When tests reveal bugs → FIX THEM immediately, don't work around them.**

**Common scenario:**
```
Test passes ✓ BUT screenshot shows feature didn't work ✗
→ This is a FALSE SUCCESS
→ Investigate the code
→ Find the bug (missing onClick, broken logic, etc.)
→ Fix the application code
→ Re-run test to verify fix
```

**Example from @dnd-kit drag-and-drop:**
- **Bug**: Primitive cards only have useDraggable, no onClick handler
- **Symptom**: Clicking does nothing (but Playwright thinks it worked)
- **Fix**: Add onClick handler to PrimitiveActionCard component
- **Result**: Simple click now adds primitives to sequence

**DO NOT assume Playwright/library limitations until you've:**
1. Tried simple user interaction (click, type)
2. Read the component code
3. Verified the event handler exists and works
4. Tested multiple approaches

### 3. Micro-Iteration for Test Development

**Build tests incrementally:**

```bash
# Test 1: Fill action name
echo '...' > .tsty/actions/fill-name.action.json
tsty run test-fill-name --fail-fast  # 15 seconds
# Works? → Continue
# Fails? → Fix immediately

# Test 2: Fill description (ONLY after test 1 works)
echo '...' > .tsty/actions/fill-description.action.json
tsty run test-fill-description --fail-fast  # Builds on test 1
```

**NEVER:**
- Create 10 actions before testing any
- Create complex flows before validating each step
- Assume limitations without investigation

### 4. Skeptical Testing Mindset

**Test passed ≠ Feature works**

After EVERY test step, verify:
1. Screenshot shows expected UI change
2. Files contain expected data (not just exist)
3. Feature is actually usable by humans

If any answer is "no" → Investigate and fix the bug.

## Architecture

### Core Components

1. **Test Runner** (`src/runner/`)
   - `playwright-runner.ts` - Executes flows with Playwright, handles dependencies
   - `action-executor.ts` - Executes individual actions with 48 Playwright methods
   - Handles topological sorting for dependencies, screenshots per run, reporting

2. **File Management** (`src/lib/`)
   - `file-manager.ts` - Read/write operations for `.tsty/` directory
   - `config.ts` - Configuration loader with fallbacks (`.tsty/` or `.qa-testing/`)
   - `types.ts` - TypeScript definitions (Flow, Action, Report, etc.)
   - `generated-actions.ts` - **48 auto-generated Playwright action types**
   - `variable-interpolator.ts` - **Dynamic variable system with Faker.js**
   - `dependency-validator.ts` - Circular dependency detection (max depth 5)
   - `tag-manager.ts` - Tag CRUD operations
   - `page-extractor.ts` - Extract page hierarchy from test URLs
   - `collection-matcher.ts` - Smart collection filtering

3. **Dashboard** (`src/dashboard/`)
   - Next.js 15 + React 18 + Tailwind CSS
   - **Visual flow builder** with drag-and-drop (@dnd-kit)
   - **Action composer** with 48 primitive actions
   - **Execution modal** with real-time progress
   - **Run comparison** for regression detection
   - **Folder tree** with drag-and-drop organization
   - **Command palette** (Cmd+K) for power users
   - **Auto-save** with localStorage backup
   - Dark mode support (next-themes)

4. **API Layer** (`src/api/`, `app/api/`)
   - RESTful endpoints for flows, actions, reports, tags, collections, folders
   - Consistent response format: `{ success: boolean, data?: T, error?: string }`
   - Uses Next.js App Router API routes
   - Stream API for real-time test execution updates

5. **CLI** (`bin/cli.js`, `src/cli/`)
   - Commands: `tsty`, `tsty run <flow>`, `tsty list`, `tsty validate <flow>`
   - Starts dashboard on port 4000 by default
   - Color-coded terminal output
   - Initializes `.tsty/` directory automatically

## Key Concepts

### Directory Structure

```
.tsty/                                    # Test root (created by framework)
├── config.json                           # Test configuration
├── folders.json                          # Folder organization
├── tags.json                             # Tag definitions
├── collections.json                      # Smart collections
├── actions/[category]/*.action.json      # Reusable actions
├── flows/[category]/*.json               # Test flows
├── reports/flow-{id}-{timestamp}.json    # Test reports
└── screenshots/run-{id}-{ts}/            # Screenshots organized by run
    ├── 1-step-name.png                   # Numbered screenshots
    ├── 2-step-name.png
    └── ...
```

### Action Types vs Actions

**CRITICAL DISTINCTION** (avoid confusion):

- **Action Types** (48 primitives auto-generated from Playwright):
  - Navigation: `goto`, `goBack`, `goForward`, `reload`, `setContent`
  - Mouse: `click`, `dblclick`, `hover`, `dragAndDrop`, `tap`
  - Input: `fill`, `type`, `press`, `check`, `uncheck`, `selectOption`, `setInputFiles`, `focus`, `blur`
  - Waiting: `waitForLoadState`, `waitForSelector`, `waitForTimeout`, `waitForFunction`, `waitForURL`, `waitForEvent`
  - Locators: `locator`, `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`
  - Info: `content`, `title`, `url`, `viewportSize`
  - Other: `screenshot`, `evaluate`, `evaluateHandle`, `dispatchEvent`, `setViewportSize`, `setExtraHTTPHeaders`, `bringToFront`, `close`, `pdf`, `pause`, `mouse`
  - **Auto-generated** from Playwright's Page API
  - Run `npm run generate:actions` to regenerate
  - Defined in `src/lib/generated-actions.ts`

- **Actions** (user-defined sequences):
  - App-specific combinations of action types
  - Example: "login" action = `[fill email, fill password, click submit, waitForLoadState]`
  - Stored in `.tsty/actions/*.action.json`
  - NOT portable between projects (use app-specific selectors)

### Variable Interpolation

**NEW FEATURE**: Dynamic variables with `${variable}` syntax

Built-in variables:
```typescript
${timestamp}              // Unix timestamp
${datetime}               // YYYY-MM-DD-HH-mm-ss
${date}                   // YYYY-MM-DD
${time}                   // HH-mm-ss
${random}                 // 6-char hex
${uuid}                   // 8-char hex
${baseUrl}                // From config
${credentials.email}      // From config
${credentials.password}   // From config
```

Faker.js integration (300+ variables):
```typescript
${faker.person.fullName}
${faker.internet.email}
${faker.phone.number}
${faker.location.city}
${faker.company.name}
${faker.lorem.sentence}
${faker.number.int}
${faker.string.alphanumeric(10)}
// See full API: https://fakerjs.dev/api/
```

Implementation in `src/lib/variable-interpolator.ts`:
- `interpolateString()` - Replace variables in strings
- `interpolateObject()` - Recursively replace in objects
- `interpolateAction()` - Process action definitions
- Supports Faker method calls with arguments

### Type System

**Important**: All optional fields for backward compatibility:
- `Flow`: `tags?: string[]`, `dependencies?: string[]`, `category?: string`, `metadata?: Record<string, unknown>`
- `ActionDefinition`: Same optional fields
- Never break existing `.tsty/` files

### Screenshot Organization (2026-02-05)

**Updated system**:
- Screenshots organized by run: `.tsty/screenshots/run-{flowId}-{timestamp}/`
- Numbered sequentially: `1-step-name.png`, `2-step-name.png`
- TestReport includes `runId` and `screenshotDir` fields
- Makes it easy to find and display screenshots for specific test runs

### Fail-Fast & Console Monitoring (2026-02-06)

**NEW FEATURE**: Intelligent test execution stopping

The framework now supports fail-fast mode to stop execution immediately when critical failures occur, saving time and making debugging easier.

#### FlowStep Enhancements

```typescript
interface FlowStep {
  name: string;
  url?: string; // Optional: If omitted, stays on current page
  actions?: string[]; // References to action files
  primitives?: Primitive[]; // NEW: Inline primitives (alternative to actions)
  expectedUrl?: string; // NEW: Expected URL after this step (for validation)
  capture?: { screenshot?: boolean; html?: boolean; console?: boolean };
  assertions?: FlowAssertion[];
  timeout?: number;
}
```

#### Flow Configuration

```typescript
interface Flow {
  name: string;
  description: string;
  baseUrl: string;
  steps: FlowStep[];
  failFast?: boolean; // NEW: Stop on first failed step (default: false)
  monitorConsole?: boolean; // NEW: Monitor console errors (default: true)
  // ... other fields
}
```

#### CLI Options

Override flow configuration with CLI flags:

```bash
# Enable fail-fast mode (stops on first failure)
tsty run my-flow --fail-fast

# Disable console monitoring
tsty run my-flow --no-monitor

# Combine with other options
tsty run my-flow --device mobile --fail-fast
```

#### How Fail-Fast Works

1. **Step Failure Detection**:
   - Step failed to pass
   - Navigation didn't reach expected URL
   - Console errors detected on navigation steps
   - Assertions failed

2. **Automatic Stopping**:
   - Remaining steps are skipped
   - Report shows `stoppedEarly: true` and `stopReason`
   - Clear error message printed to console

3. **Console Monitoring**:
   - **Always captures console logs** (not just when requested)
   - Counts errors per step (`consoleErrors` field)
   - On navigation steps: stops if console errors detected
   - Helps catch JavaScript bugs immediately

#### Example Flow with Fail-Fast

```json
{
  "name": "Login Flow",
  "baseUrl": "http://localhost:3000",
  "failFast": true,
  "monitorConsole": true,
  "steps": [
    {
      "name": "Load login page",
      "url": "/login",
      "expectedUrl": "/login",
      "capture": { "screenshot": true }
    },
    {
      "name": "Fill credentials",
      "primitives": [
        { "type": "fill", "selector": "input[name='email']", "value": "test@example.com" },
        { "type": "fill", "selector": "input[name='password']", "value": "password123" }
      ]
    },
    {
      "name": "Submit form",
      "expectedUrl": "/dashboard",
      "primitives": [
        { "type": "click", "selector": "button[type='submit']" },
        { "type": "waitForLoadState", "options": { "state": "networkidle" } }
      ],
      "assertions": [
        { "type": "visible", "selector": "h1:has-text('Dashboard')" }
      ]
    }
  ]
}
```

If step 2 fails (e.g., selector not found), the flow stops immediately instead of continuing with step 3.

#### Benefits

- **Faster debugging**: Stop at root cause, not after cascading failures
- **Clearer errors**: See exact failure point without noise
- **Time savings**: Don't waste 20+ seconds on useless steps
- **Better reports**: `stopReason` explains why flow stopped

#### When to Use Fail-Fast

**Enable (`failFast: true`) when**:
- Developing new flows (iterate faster)
- Debugging failing tests (find root cause quickly)
- CI/CD pipelines (fail fast on regression)

**Disable (`failFast: false`) when**:
- Want to see all failures in one run
- Testing multiple independent features
- Need complete test coverage report

**Default**: `false` for backward compatibility

## Development Patterns

### 1. File Operations

Always use `FileManager` for consistency:

```typescript
import { FileManager } from '@/lib/file-manager';

const fm = new FileManager();
const flows = await fm.listFlows(); // Returns FlowFile[]
const flow = await fm.getFlow('flow-id'); // Returns FlowFile | null
await fm.saveFlow('flow-id', flowData); // Saves to .tsty/flows/

// Folder operations
const folders = await fm.listFolders();
await fm.saveFolder(folderId, folderData);
```

**Never** directly use `fs` operations - use FileManager abstraction.

### 2. API Endpoints

Pattern from `src/api/flows.ts`:

```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'list') {
    const flows = await fileManager.listFlows();
    return NextResponse.json({ success: true, data: flows });
  }

  return NextResponse.json({ success: false, error: 'Invalid action' });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Validate, process, return consistent format
  return NextResponse.json({ success: true, data: result });
}
```

### 3. React Components

**UI Components Location**: `src/dashboard/components/`

Key patterns:
- Use `next-themes` for dark mode: `dark:bg-gray-800 dark:text-white`
- Use `@dnd-kit` for drag-and-drop (see `flow-canvas.tsx`, `action-sequence-editor.tsx`)
- Custom hooks in `src/dashboard/hooks/use-*.ts`
- Context for editor state (`action-editor-context.tsx`, `flow-editor-context.tsx`)

Component categories:
- **Editors**: `flow-builder.tsx`, `action-composer.tsx`, `selector-picker.tsx`
- **Lists**: `flow-list.tsx`, `action-library.tsx`, `reports-list.tsx`
- **Cards**: `flow-card.tsx`, `action-card.tsx`, `flow-step-card.tsx`
- **Organization**: `folder-tree.tsx`, `page-tree-view.tsx`, `tag-manager.tsx`, `category-manager.tsx`
- **Execution**: `execution-modal.tsx`, `execution-progress.tsx`, `run-comparison.tsx`
- **Navigation**: `command-palette.tsx`, `shortcuts-help.tsx`, `adaptive-sidebar.tsx`
- **Modals**: `quick-view-modal.tsx`, `organize-modal.tsx`
- **UI Primitives**: `src/dashboard/components/ui/` (button, card, modal, badge, input, spinner, etc.)

### 4. Dependencies & Validation

**CRITICAL**: Always validate dependencies for circular references:

```typescript
import { DependencyValidator } from '@/lib/dependency-validator';

const validator = new DependencyValidator();
const validation = validator.validate(
  flowId,
  dependencies,
  dependencyMap,
  'flow' // or 'action'
);

if (!validation.valid) {
  console.error(validation.errors);
  // ERROR: circular dependency or max depth exceeded
}
```

Max depth: 5 levels (enforced in `dependency-validator.ts`).
Uses DFS for circular detection, Kahn's algorithm for topological sort.

### 5. Auto-Generated Actions

**System**: Actions are auto-generated from Playwright's Page API

Generation script: `scripts/generate-actions.ts`
- Analyzes Playwright's Page interface
- Generates TypeScript types for all methods
- Creates `ACTION_CATEGORIES` object
- Outputs to `src/lib/generated-actions.ts`

To regenerate:
```bash
npm run generate:actions
```

Action executor in `src/runner/action-executor.ts`:
- Dynamic method invocation based on action type
- Type-safe with generated interfaces
- Supports all 48 Playwright methods

### 6. Variable Interpolation

Usage in action executor:

```typescript
import { interpolateAction } from '@/lib/variable-interpolator';

const context = {
  config: await loadConfig(),
  customVars: { customVar: 'value' },
  seed: 12345 // Optional for reproducible Faker data
};

const interpolated = interpolateAction(action, context);
// All ${variables} replaced with actual values
```

## Common Tasks

### Adding a New Primitive Action

**Don't do this manually!** Actions are auto-generated.

If Playwright adds a new method:
1. Update dependencies: `npm install @playwright/test@latest`
2. Regenerate actions: `npm run generate:actions`
3. Actions automatically available in executor and palette

### Adding a New Dashboard Tab/Page

1. Create page component in `src/dashboard/pages/`
2. Add route in `app/` directory (e.g., `app/new-tab/page.tsx`)
3. Update navigation in `src/dashboard/components/dashboard-layout.tsx`
4. Add to command palette in `src/dashboard/components/command-palette.tsx`

### Modifying API Endpoints

1. Update handler in `src/api/*.ts` or `app/api/*/route.ts`
2. Maintain consistent response format: `{ success, data?, error? }`
3. Update corresponding hook in `src/dashboard/hooks/use-*.ts`
4. Update TypeScript types if needed

### Adding Organization Features

Existing organization systems:
- **Folders**: `folders.json`, `src/api/folders.ts`, `folder-tree.tsx`
- **Tags**: `tags.json`, `src/lib/tag-manager.ts`, `tag-manager.tsx`
- **Collections**: `collections.json`, `src/lib/collection-matcher.ts`, `smart-collection-builder.tsx`
- **Categories**: Built into Flow/Action types, `category-manager.tsx`
- **Page Hierarchy**: `src/lib/page-extractor.ts`, `page-tree-view.tsx`

Follow existing patterns for consistency.

## Dashboard Pages

### Main Pages

1. **Tests Card Page** (`src/dashboard/pages/tests-card-page.tsx`)
   - Home page (default view)
   - Visual card grid with drag-and-drop
   - Folder tree sidebar
   - Bulk operations toolbar

2. **Test Explorer Page** (`src/dashboard/pages/test-explorer-page.tsx`)
   - Traditional list view
   - Advanced filters
   - Quick view modal
   - Bulk selection

3. **Overview Page** (`src/dashboard/pages/overview-page.tsx`)
   - Stats dashboard
   - Recent runs
   - Metrics and charts

### Editor Pages

Located in `app/` directory:

- `app/flows/new/page.tsx` - Create new flow
- `app/flows/[id]/edit/page.tsx` - Edit flow
- `app/flows/[id]/page.tsx` - View flow details
- `app/actions/new/page.tsx` - Create new action
- `app/actions/[id]/edit/page.tsx` - Edit action
- `app/actions/[id]/page.tsx` - View action details

### Execution Pages

- `app/runs/` - Test run history
- `app/test-execution/` - Real-time execution view
- `app/test-sse/` - Server-sent events for live updates

## Testing Strategy

This project tests itself:
- `.tsty/` directory contains framework's own tests
- Tests verify dashboard UI, action creation, flow execution
- E2E tests for visual editors
- Self-hosting demonstrates framework capabilities

Example test flow in `.tsty/flows/e2e/`:
- Test action creation via UI
- Test flow builder drag-and-drop
- Test execution modal
- Test screenshot capture

## Important Files

### Core Logic
- `src/lib/types.ts` - All TypeScript definitions
- `src/lib/generated-actions.ts` - **48 auto-generated Playwright actions**
- `src/lib/file-manager.ts` - File operations
- `src/lib/variable-interpolator.ts` - **Dynamic variable system**
- `src/runner/playwright-runner.ts` - Test execution engine
- `src/runner/action-executor.ts` - Action execution with dynamic dispatch

### UI Entry Points
- `src/dashboard/index.tsx` - Main dashboard exports
- `src/dashboard/pages/tests-card-page.tsx` - Home page
- `app/page.tsx` - Next.js root page
- `app/layout.tsx` - App layout with ThemeProvider

### Configuration
- `package.json` - Dependencies, scripts, metadata
- `tailwind.config.js` - Tailwind + dark mode config
- `tsconfig.json` - TypeScript configuration
- `next.config.mjs` - Next.js configuration

### Key Scripts
- `scripts/generate-actions.ts` - **Generate Playwright actions**
- `bin/cli.js` - CLI entry point

## Code Style

### TypeScript
- Always use explicit types (avoid `any`)
- Leverage existing types from `src/lib/types.ts`
- Optional fields for backward compatibility
- Use generated action types from `generated-actions.ts`

### React
- Prefer function components with hooks
- Use TypeScript interfaces for props
- Keep components focused (single responsibility)
- Use custom hooks for shared logic (`use-*.ts`)

### Naming
- Files: kebab-case (`flow-builder.tsx`)
- Components: PascalCase (`FlowBuilder`)
- Functions: camelCase (`executeFlow`)
- Types: PascalCase (`FlowFile`, `ActionDefinition`)
- Hooks: `use` prefix (`useFlows`, `useActions`)

### Comments
- Document complex logic (dependency resolution, circular detection)
- Add JSDoc for public APIs
- Avoid obvious comments
- Explain "why" not "what"

## Features Summary

### Organization Features
- ✅ Folders with drag-and-drop
- ✅ Tags with color coding
- ✅ Smart collections with filters
- ✅ Categories for broad grouping
- ✅ Page hierarchy from URLs
- ✅ Bulk operations
- ✅ Organize modal with guide

### Execution Features
- ✅ Real-time execution modal
- ✅ Progress tracking
- ✅ Run comparison
- ✅ Screenshot galleries by run
- ✅ Step navigator
- ✅ Detailed step views
- ✅ Console logs and errors

### Editor Features
- ✅ Visual flow builder
- ✅ Action composer
- ✅ Selector picker
- ✅ Drag-and-drop palettes
- ✅ Auto-save with localStorage
- ✅ Undo/redo
- ✅ JSON toggle

### UI/UX Features
- ✅ Command palette (Cmd+K)
- ✅ Keyboard shortcuts
- ✅ Dark mode
- ✅ Quick view modal
- ✅ Adaptive sidebar
- ✅ Shortcuts help
- ✅ Action templates
- ✅ Flow metrics

### Data Features
- ✅ 48 Playwright actions
- ✅ Variable interpolation
- ✅ Faker.js integration
- ✅ Dependencies with validation
- ✅ Multi-viewport support
- ✅ Screenshot organization

## Known Limitations

1. **Single User**: No collaboration features (local files only)
2. **No Auth**: Dashboard has no authentication
3. **No Scheduling**: Manual execution only
4. **Browser Support**: Playwright browsers only (Chromium, Firefox, WebKit)
5. **Screenshot Storage**: Can grow large (no automatic cleanup)
6. **No Cloud Sync**: All data stored locally in `.tsty/`

## Debugging Tips

### Flow Execution Issues
1. Check `.tsty/reports/` for detailed error messages
2. Verify selectors with browser DevTools
3. Run with `headless: false` in config
4. Check console logs in report JSON
5. View screenshots in organized run directory

### Dashboard Issues
1. Check browser console for React errors
2. Verify API responses in Network tab
3. Check file permissions on `.tsty/` directory
4. Ensure Next.js dev server is running on port 4000
5. Clear localStorage if state is corrupted

### Dependency Errors
1. Run `detectCircularDependencies()` manually
2. Check execution order with topological sort
3. Max depth is 5 (configurable in validator)
4. Visualize with dependency graph component

### Variable Interpolation Issues
1. Check variable syntax: `${variable}` not `{{variable}}`
2. Verify Faker expression: `${faker.person.fullName}` not `${faker.fullName}`
3. Use `previewInterpolation()` for debugging
4. Check config for missing credentials

## Directory Migration (2026-02-05)

**`.qa-testing` → `.tsty`**:
- All references updated to use `.tsty`
- Config loader still checks `.qa-testing` as fallback for backward compatibility
- When updating, always use `.tsty` for new code
- CLI commands reference `.tsty` in output

## Best Practices

1. **Always** use FileManager for file operations
2. **Always** validate dependencies before saving
3. **Always** maintain backward compatibility for types
4. **Never** break existing `.tsty/` files
5. **Never** use `any` type (leverage existing types)
6. **Always** follow API response format: `{ success, data?, error? }`
7. **Always** add dark mode classes for new UI components
8. **Always** use auto-generated actions (don't manually add primitives)
9. **Always** test variable interpolation with Faker edge cases
10. **Always** organize screenshots by run (not flat directory)

## Quick Reference

### Run Tests
```bash
bun run qa       # Start dashboard
bun run dev      # Next.js dev mode
bun run build    # Production build
npm run generate:actions  # Regenerate Playwright actions
```

### Project Structure
```
src/
├── lib/          # Core utilities
│   ├── types.ts                  # All type definitions
│   ├── generated-actions.ts      # 48 Playwright actions (auto-generated)
│   ├── variable-interpolator.ts  # Dynamic variables + Faker
│   ├── file-manager.ts           # File operations
│   ├── dependency-validator.ts   # Circular detection
│   ├── tag-manager.ts            # Tag operations
│   ├── page-extractor.ts         # Page hierarchy
│   └── collection-matcher.ts     # Smart collections
├── runner/       # Test execution
│   ├── playwright-runner.ts      # Flow execution
│   └── action-executor.ts        # Action execution (48 methods)
├── api/          # Backend API handlers
├── dashboard/    # React UI
│   ├── components/               # UI components
│   ├── hooks/                    # Custom hooks
│   ├── pages/                    # Main pages
│   └── contexts/                 # Editor state
└── cli/          # CLI commands

app/              # Next.js App Router
├── api/          # API routes
├── actions/      # Action editor pages
├── flows/        # Flow editor pages
├── runs/         # Run history
└── page.tsx      # Dashboard entry

scripts/
└── generate-actions.ts  # Generate Playwright actions
```

### Key Dependencies
- **Next.js 15** - App Router + React Server Components
- **React 18** - UI library
- **Playwright** - Browser automation (48 actions)
- **@faker-js/faker** - Dynamic test data generation
- **@dnd-kit** - Drag-and-drop
- **next-themes** - Dark mode
- **reactflow** - Dependency graphs
- **cmdk** - Command palette

### CLI Commands Reference
```bash
tsty                    # Start dashboard
tsty init               # Initialize .tsty directory
tsty run <flow>         # Run flow
tsty list               # List flows
tsty list actions       # List actions
tsty list reports       # List reports
tsty actions:playwright # List 48 Playwright actions
tsty validate <flow>    # Validate dependencies
```

## When in Doubt

1. Check existing patterns in similar files
2. Refer to `src/lib/types.ts` for type definitions
3. Check `src/lib/generated-actions.ts` for action types (don't add manually!)
4. Look at `src/api/flows.ts` for API patterns
5. Review `src/lib/variable-interpolator.ts` for variable syntax
6. Test changes against `.tsty/` directory structure
7. Verify backward compatibility with existing files

---

**Remember**: This project creates the `.tsty/` directory. We're building the tool that generates test environments for other projects. The framework must be robust, feature-rich, and well-documented. The 48 auto-generated Playwright actions and variable interpolation system are key differentiators.