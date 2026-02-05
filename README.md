# Tsty Framework

> Visual QA testing framework with a beautiful dashboard. Test web applications with Playwright using drag-and-drop interfaces and auto-generated actions.

[![npm version](https://img.shields.io/npm/v/@vipro/qa-framework.svg)](https://www.npmjs.com/package/@vipro/qa-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎨 Visual Test Builder
- **Drag-and-drop flow editor** - Build test flows visually with no code
- **Action composer** - Create reusable actions with an intuitive interface
- **Selector picker** - Interactive CSS selector helper with 20+ suggestions
- **48 Playwright actions** - Auto-generated from Playwright's Page API
- **Live execution preview** - Watch tests run in real-time with progress tracking

### 🔄 Powerful Organization
- **Folders & categories** - Organize tests by feature, page, or team
- **Tags & collections** - Flexible labeling and smart dynamic grouping
- **Page hierarchy tree** - Auto-extracted page structure from test URLs
- **Dependency management** - Define test prerequisites with circular detection
- **Bulk operations** - Move, tag, or delete multiple items at once
- **Quick view modal** - Fast preview without leaving the current page

### 📊 Rich Reporting & Execution
- **Screenshot capture** - Automatic screenshots organized by test run
- **Detailed reports** - Pass/fail status, errors, console logs, network activity
- **Run history** - Track test execution over time with metrics
- **Run comparison** - Compare results across multiple test runs
- **Execution modal** - Real-time progress with step-by-step updates
- **Step navigator** - Browse through test steps with detailed views

### 🚀 Developer Experience
- **Zero configuration** - Works out of the box with sensible defaults
- **Framework agnostic** - Test any web application (Next.js, React, Vue, etc.)
- **TypeScript first** - Full type safety throughout
- **CLI included** - Run tests from command line or CI/CD
- **Auto-save** - Never lose work with automatic draft saving
- **Variable interpolation** - Dynamic test data with `${variable}` and Faker.js

### 🎯 Advanced Features
- **48 Playwright actions** - Complete coverage of Playwright's Page API
- **Faker.js integration** - Generate realistic test data on the fly
- **Multi-viewport testing** - Test desktop, tablet, and mobile simultaneously
- **Command palette** - Power user productivity (Cmd+K)
- **Keyboard shortcuts** - Fast navigation and actions
- **Dark mode** - Beautiful UI in light or dark theme
- **Action templates** - Quick-start with pre-built action patterns
- **Organize guide** - Built-in help for organizing large test suites

## 📦 Installation

```bash
# Install globally (recommended)
npm install -g @vipro/qa-framework

# Or use in your project
npm install --save-dev @vipro/qa-framework

# Or run without installing
npx @vipro/qa-framework
```

## 🚀 Quick Start

### 1. Start the Dashboard

```bash
# Navigate to your project
cd my-project

# Start Tsty (uses 'tsty' or 'qa' command)
tsty

# Or with npx
npx qa-framework

# Opens at http://localhost:4000
```

The framework auto-creates `.tsty/` directory if it doesn't exist.

### 2. Create Your First Test Flow

1. Open http://localhost:4000
2. Click **"New Flow"** in the Flows tab
3. Drag actions from the palette to the canvas
4. Configure each step with selectors and assertions
5. Click **"Run Flow"** to execute and watch real-time progress

### 3. Build Reusable Actions

1. Go to the **Actions** tab
2. Click **"New Action"**
3. Drag primitive actions (click, fill, type, etc.) to compose sequences
4. Use the **Selector Picker** to find the right CSS selectors
5. Save and reference in flows with `["action-name"]`

## 📖 Core Concepts

### Actions vs Action Types

- **Action Types** (48 primitives): Auto-generated from Playwright's Page API
  - Navigation: `goto`, `goBack`, `goForward`, `reload`
  - Mouse: `click`, `dblclick`, `hover`, `dragAndDrop`
  - Input: `fill`, `type`, `press`, `check`, `uncheck`, `selectOption`
  - Waiting: `waitForLoadState`, `waitForSelector`, `waitForTimeout`, `waitForURL`
  - Locators: `locator`, `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`
  - And 30+ more...

- **Actions** (user-defined): Sequences of action types tailored to your app
  - Examples: "login", "add-to-cart", "checkout", "create-post"
  - Stored in `.tsty/actions/[category]/*.action.json`

### File Structure

```
your-project/
├── .tsty/                              # Test root (auto-created)
│   ├── config.json                     # Test configuration
│   ├── folders.json                    # Folder organization
│   ├── tags.json                       # Tag definitions
│   ├── collections.json                # Smart collections
│   ├── actions/                        # Reusable actions
│   │   └── [category]/                 # Optional categorization
│   │       └── *.action.json
│   ├── flows/                          # Test flows
│   │   └── [category]/                 # Optional categorization
│   │       └── *.json
│   ├── reports/                        # Test reports
│   │   └── flow-{id}-{timestamp}.json
│   └── screenshots/                    # Screenshots by run
│       └── run-{flowId}-{timestamp}/
│           ├── 1-step-name.png
│           ├── 2-step-name.png
│           └── ...
```

## 🎯 Usage Examples

### Basic Flow

```json
{
  "name": "Login Test",
  "description": "Test user login flow",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Navigate to login",
      "url": "/auth/login",
      "capture": { "screenshot": true }
    },
    {
      "name": "Login",
      "actions": ["login"],
      "assertions": [
        { "type": "url", "expected": "/dashboard" }
      ]
    }
  ],
  "tags": ["auth", "critical"],
  "dependencies": []
}
```

### Reusable Action with Variables

```json
{
  "type": "form",
  "description": "Login with dynamic credentials",
  "actions": [
    {
      "type": "fill",
      "selector": "input[name='email']",
      "value": "${faker.internet.email}"
    },
    {
      "type": "fill",
      "selector": "input[name='password']",
      "value": "${faker.internet.password}"
    },
    {
      "type": "click",
      "selector": "button[type='submit']"
    },
    {
      "type": "waitForLoadState",
      "options": { "state": "networkidle" }
    }
  ]
}
```

### Configuration

Create `.tsty/config.json`:

```json
{
  "baseUrl": "http://localhost:3000",
  "credentials": {
    "email": "test@example.com",
    "password": "password123"
  },
  "viewports": {
    "desktop": { "width": 1920, "height": 1080 },
    "tablet": { "width": 768, "height": 1024 },
    "mobile": { "width": 375, "height": 667 }
  },
  "playwright": {
    "headless": true,
    "timeout": 30000,
    "slowMo": 100
  }
}
```

## 🛠️ CLI Commands

```bash
# Start dashboard (default)
tsty
tsty server

# Initialize .tsty directory
tsty init

# Run specific flow
tsty run homepage-test
tsty run homepage-test --device mobile

# List all flows
tsty list
tsty list flows

# List all actions
tsty list actions

# List all reports
tsty list reports
tsty list reports homepage-test

# List available Playwright actions
tsty actions:playwright
tsty actions:playwright mouse

# Validate flow dependencies
tsty validate homepage-test

# Custom port
tsty --port 5000

# Show help
tsty --help
```

## 🎨 Variable Interpolation

Tsty supports dynamic variables using `${variable}` syntax:

### Built-in Variables

```
${timestamp}            - Current Unix timestamp
${datetime}             - Current date/time (YYYY-MM-DD-HH-mm-ss)
${date}                 - Current date (YYYY-MM-DD)
${time}                 - Current time (HH-mm-ss)
${random}               - Random 6-character alphanumeric
${uuid}                 - Short UUID (8 characters)
${baseUrl}              - From config
${credentials.email}    - From config
${credentials.password} - From config
```

### Faker.js Integration (300+ variables)

```
# Person
${faker.person.fullName}      - John Doe
${faker.person.firstName}     - John
${faker.person.lastName}      - Doe
${faker.person.jobTitle}      - Software Engineer

# Internet
${faker.internet.email}       - john.doe@example.com
${faker.internet.userName}    - john_doe
${faker.internet.password}    - aB3$xY9z
${faker.internet.url}         - https://example.com

# Location
${faker.location.streetAddress}  - 123 Main St
${faker.location.city}           - New York
${faker.location.country}        - United States
${faker.location.zipCode}        - 10001

# Phone & Company
${faker.phone.number}         - (555) 123-4567
${faker.company.name}         - Acme Corp

# Text Generation
${faker.lorem.sentence}       - Random sentence
${faker.lorem.paragraph}      - Random paragraph

# Numbers & Strings
${faker.number.int}           - 42
${faker.string.alphanumeric(10)} - Random 10-char string

# See full API: https://fakerjs.dev/api/
```

## 📚 48 Playwright Actions

### Navigation (5 actions)
- `goto` - Navigate to URL
- `goBack` - Browser back button
- `goForward` - Browser forward button
- `reload` - Refresh page
- `setContent` - Set HTML content

### Mouse Actions (5 actions)
- `click` - Click element
- `dblclick` - Double-click element
- `hover` - Hover over element
- `dragAndDrop` - Drag element to target
- `tap` - Mobile tap gesture

### Input Actions (8 actions)
- `fill` - Fill input field (clears first)
- `type` - Type with keystroke delay
- `press` - Press keyboard key
- `check` - Check checkbox/radio
- `uncheck` - Uncheck checkbox
- `selectOption` - Select dropdown option
- `setInputFiles` - Upload files
- `focus` - Focus element
- `blur` - Remove focus

### Waiting Actions (6 actions)
- `waitForLoadState` - Wait for page load state
- `waitForTimeout` - Wait for duration
- `waitForSelector` - Wait for element
- `waitForFunction` - Wait for JS condition
- `waitForURL` - Wait for URL pattern
- `waitForEvent` - Wait for page event

### Locator Actions (7 actions)
- `locator` - Generic element locator
- `getByRole` - Find by ARIA role
- `getByText` - Find by text content
- `getByLabel` - Find by label text
- `getByPlaceholder` - Find by placeholder
- `getByAltText` - Find by alt text
- `getByTitle` - Find by title attribute
- `getByTestId` - Find by test ID

### Information Actions (4 actions)
- `content` - Get page HTML
- `title` - Get page title
- `url` - Get current URL
- `viewportSize` - Get viewport dimensions

### Other Actions (13 actions)
- `screenshot` - Capture screenshot
- `evaluate` - Execute JavaScript
- `evaluateHandle` - Execute JS (returns handle)
- `dispatchEvent` - Dispatch custom event
- `setViewportSize` - Change viewport
- `setExtraHTTPHeaders` - Set custom headers
- `bringToFront` - Bring tab to front
- `close` - Close page/browser
- `pdf` - Generate PDF
- `pause` - Pause for debugging
- `mouse` - Low-level mouse control

## 🎯 Assertions

| Assertion | Description | Example |
|-----------|-------------|---------|
| `visible` | Element is visible | `{ "type": "visible", "selector": "h1" }` |
| `hidden` | Element is hidden | `{ "type": "hidden", "selector": ".error" }` |
| `text` | Text content matches | `{ "type": "text", "selector": "h1", "expected": "Welcome" }` |
| `count` | Element count | `{ "type": "count", "selector": ".item", "expected": 5 }` |
| `value` | Input value | `{ "type": "value", "selector": "input", "expected": "test" }` |
| `attribute` | Attribute value | `{ "type": "attribute", "selector": "button", "attribute": "disabled", "expected": "true" }` |
| `url` | Current URL | `{ "type": "url", "expected": "/dashboard" }` |

## 🔧 Programmatic Usage

```typescript
import { PlaywrightRunner, FileManager } from '@vipro/qa-framework';

// Run a flow
const runner = new PlaywrightRunner();
const report = await runner.runFlow('homepage-test', 'desktop');

console.log(`Passed: ${report.passed}/${report.totalSteps}`);

// Manage files
const fileManager = new FileManager();
const flows = await fileManager.listFlows();
const flow = await fileManager.getFlow('homepage-test');

// Create new flow
await fileManager.saveFlow('new-flow', {
  name: 'New Test',
  description: 'A new test flow',
  baseUrl: 'http://localhost:3000',
  steps: [/* ... */]
});
```

## 🎨 Dashboard Features

### Main Views

**Tests Card Page** (Home)
- Visual card grid of all flows and actions
- Drag-and-drop into folders
- Quick actions (run, edit, delete)
- Bulk selection and operations

**Test Explorer Page**
- Traditional list view with filters
- Advanced search and sorting
- Multi-select with bulk toolbar
- Quick view modal for fast preview

**Overview Page**
- Quick stats dashboard
- Recent test runs with results
- Pass rate charts and metrics
- Quick action buttons

### Organization Tools

**Folder Tree**
- Hierarchical folder structure
- Drag-and-drop organization
- Create, rename, delete folders
- Folder-specific filters

**Page Hierarchy**
- Auto-extracted from test URLs
- Click to filter by page
- Shows test count per page
- Collapsible tree structure

**Tags Manager**
- Create, edit, delete tags
- Color-coded categories
- Usage counts
- Bulk tag operations

**Smart Collections**
- Dynamic test grouping
- Rule-based filtering
- Live preview
- Save custom collections

**Category Manager**
- Organize by feature area
- Nested categories
- Batch categorization
- Category-based navigation

### Execution Features

**Execution Modal**
- Real-time progress tracking
- Step-by-step updates
- Live screenshot preview
- Console logs and errors
- Cancel running tests

**Run Comparison**
- Compare multiple test runs
- Visual diff of results
- Screenshot comparison
- Identify regressions

**Step Navigator**
- Browse test steps
- Detailed step information
- Screenshot gallery
- Assertion results

### UI Components

**Command Palette** (`Cmd+K`)
- Quick navigation
- Search flows, actions, reports
- Execute commands
- Keyboard-first workflow

**Shortcuts Help** (`Cmd+/`)
- All keyboard shortcuts
- Categorized by function
- Search shortcuts
- Visual reference

**Quick View Modal**
- Preview without navigation
- Flow/action details
- Edit in place
- Fast workflow

**Bulk Action Toolbar**
- Multi-select operations
- Batch move to folder
- Batch tag assignment
- Batch delete

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + S` | Save current editor |
| `Cmd/Ctrl + /` | Show keyboard shortcuts |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + N` | New flow/action |
| `Cmd/Ctrl + F` | Focus search |
| `Esc` | Close modals/dropdowns |
| `Enter` | Confirm action |
| `Space` | Toggle selection (in lists) |
| `↑/↓` | Navigate items |

## 🤖 Claude Code Skill

Tsty includes a Claude Code skill that enables AI-assisted testing workflows. The skill helps Claude Code understand when and how to use Tsty for visual testing, E2E testing, and QA automation.

### Installation

```bash
# Install the skill for Claude Code
npm run install:skill

# Or manually
./scripts/install-skill.sh
```

After installation, restart Claude Code to load the skill.

### Usage in Claude Code

Once installed, Claude Code can automatically help you with:

- **Visual testing**: "Test the dashboard visually"
- **E2E flows**: "Create a test for the checkout process"
- **Bug finding**: "Find layout issues on the settings page"
- **Accessibility**: "Check accessibility on this page"
- **Screenshot capture**: "Capture screenshots of all pages"

The skill provides Claude Code with:
- Complete understanding of Primitives vs Actions
- Decision guidance for when to create actions
- Knowledge of all 48 Playwright primitives
- Best practices for test organization
- Visual analysis methodology

### Skill Development

The skill lives in `/skill/` and follows the [skill-creator](https://github.com/anthropics/skill-creator) best practices:

- **SKILL.md**: Main skill documentation loaded when skill triggers
- **references/**: Detailed guides loaded as needed (decision trees, visual analysis, etc.)
- **assets/**: Example actions and templates

To update the skill after changes:
```bash
npm run update:skill
```

## 🤝 Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/mde-pach/tsty).

## 📄 License

MIT © ViPro Team

## 🔗 Links

- [GitHub Repository](https://github.com/mde-pach/tsty)
- [Issue Tracker](https://github.com/mde-pach/tsty/issues)
- [NPM Package](https://www.npmjs.com/package/@vipro/qa-framework)
- [Playwright Documentation](https://playwright.dev)
- [Faker.js API Reference](https://fakerjs.dev/api/)
