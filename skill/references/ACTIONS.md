# Action System Documentation

The Tsty Framework includes **48 auto-generated Playwright actions** from Playwright's Page API, plus a reusable action system for composing complex UI interactions.

## Overview

Actions are reusable JSON files stored in `.tsty/actions/` that define sequences of browser interactions. They work like Playwright test automation and get committed to the repository for reuse across the team.

**Key benefits:**
- ✅ **Complete Coverage** - 48 Playwright actions auto-generated from Page API
- ✅ **Dynamic Data** - Faker.js integration for realistic test data
- ✅ **Reusable** - Create once, use across multiple flows
- ✅ **Committed** - Actions live in the repo alongside code
- ✅ **Token efficient** - No need to re-analyze the same flow repeatedly
- ✅ **Team-shared** - Everyone benefits from created actions
- ✅ **Zero Maintenance** - Auto-generated from Playwright, no manual wrappers

## When to Create Actions

Create an action whenever you need to interact with the UI before taking a screenshot:

**Common scenarios:**
1. **Authentication** - Login flows (login.action.json)
2. **Modal/Dialog opening** - Click buttons to open dialogs (open-create-tag-modal.action.json)
3. **Filter application** - Apply search/filter settings
4. **Form filling** - Pre-fill forms to specific states (with dynamic data!)
5. **Navigation sequences** - Multi-step navigation flows
6. **Tab/accordion opening** - Expand collapsed content
7. **Dropdown interactions** - Open and select from dropdowns
8. **Data generation** - Fill forms with Faker.js generated data
9. **Any UI state** - Anything that requires clicking/typing before screenshot

## Action File Format

Actions are JSON files with this structure:

```json
{
  "type": "modal|auth|filter|form|navigation|interaction",
  "description": "Human-readable description of what this does",
  "actions": [
    {
      "type": "<one of 48 Playwright actions>",
      "...": "action-specific properties"
    }
  ],
  "tags": ["optional", "tags"],
  "category": "optional/category",
  "dependencies": ["optional-dependency-action-ids"]
}
```

### Action Types (File Level)

The `type` field categorizes the action's purpose:

- **`auth`** - Authentication flows
- **`modal`** - Opening modals/dialogs
- **`filter`** - Applying filters/search
- **`form`** - Filling forms
- **`navigation`** - Multi-page navigation
- **`interaction`** - Generic UI interactions

## 48 Playwright Action Types

Tsty auto-generates all actions from Playwright's Page API. Here's the complete reference:

### Navigation Actions (5)

#### goto
Navigate to a URL.

```json
{
  "type": "goto",
  "url": "http://localhost:3000/login",
  "options": { "waitUntil": "networkidle" }
}
```

With variables:
```json
{
  "type": "goto",
  "url": "${baseUrl}/dashboard"
}
```

#### goBack
Go back in browser history.

```json
{
  "type": "goBack",
  "options": { "waitUntil": "load" }
}
```

#### goForward
Go forward in browser history.

```json
{
  "type": "goForward"
}
```

#### reload
Reload the current page.

```json
{
  "type": "reload",
  "options": { "waitUntil": "networkidle" }
}
```

#### setContent
Set HTML content directly.

```json
{
  "type": "setContent",
  "html": "<html><body><h1>Test</h1></body></html>"
}
```

### Mouse Actions (5)

#### click
Click an element.

```json
{
  "type": "click",
  "selector": "button[type='submit']",
  "options": { "button": "left", "clickCount": 1 }
}
```

**Selector options:**
- CSS: `button[type='submit']`, `#login-btn`, `.modal-trigger`
- Text: `text=Sign In`, `text=Submit`
- Test ID: `[data-testid="create-button"]`
- Combined: `button:has-text("Create")`

#### dblclick
Double-click an element.

```json
{
  "type": "dblclick",
  "selector": ".file-item"
}
```

#### hover
Hover over an element.

```json
{
  "type": "hover",
  "selector": ".dropdown-trigger"
}
```

#### dragAndDrop
Drag element to target.

```json
{
  "type": "dragAndDrop",
  "source": ".draggable-item",
  "target": ".drop-zone"
}
```

#### tap
Mobile tap gesture.

```json
{
  "type": "tap",
  "selector": ".mobile-button"
}
```

### Input Actions (9)

#### fill
Fill input field (clears first).

```json
{
  "type": "fill",
  "selector": "input[name='email']",
  "value": "test@example.com"
}
```

With dynamic data:
```json
{
  "type": "fill",
  "selector": "input[name='email']",
  "value": "${faker.internet.email}"
}
```

#### type
Type with keystroke delay.

```json
{
  "type": "type",
  "selector": "input[name='search']",
  "text": "search query",
  "options": { "delay": 100 }
}
```

#### press
Press keyboard key.

```json
{
  "type": "press",
  "key": "Enter"
}
```

With selector:
```json
{
  "type": "press",
  "selector": "input[name='search']",
  "key": "Enter"
}
```

#### check
Check checkbox/radio.

```json
{
  "type": "check",
  "selector": "input[type='checkbox']"
}
```

#### uncheck
Uncheck checkbox.

```json
{
  "type": "uncheck",
  "selector": "input[type='checkbox']"
}
```

#### selectOption
Select dropdown option.

```json
{
  "type": "selectOption",
  "selector": "select[name='country']",
  "values": ["US"]
}
```

#### setInputFiles
Upload files.

```json
{
  "type": "setInputFiles",
  "selector": "input[type='file']",
  "files": ["./path/to/file.pdf"]
}
```

#### focus
Focus element.

```json
{
  "type": "focus",
  "selector": "input[name='email']"
}
```

#### blur
Remove focus from element.

```json
{
  "type": "blur",
  "selector": "input[name='email']"
}
```

### Waiting Actions (6)

#### waitForLoadState
Wait for page load state.

```json
{
  "type": "waitForLoadState",
  "options": { "state": "networkidle" }
}
```

States: `load`, `domcontentloaded`, `networkidle`

#### waitForTimeout
Wait for duration.

```json
{
  "type": "waitForTimeout",
  "timeout": 2000
}
```

#### waitForSelector
Wait for element to appear.

```json
{
  "type": "waitForSelector",
  "selector": ".loading-complete",
  "options": { "state": "visible", "timeout": 5000 }
}
```

#### waitForFunction
Wait for JavaScript condition.

```json
{
  "type": "waitForFunction",
  "pageFunction": "() => document.querySelectorAll('.item').length > 5"
}
```

#### waitForURL
Wait for URL pattern.

```json
{
  "type": "waitForURL",
  "url": "**/dashboard",
  "options": { "timeout": 5000 }
}
```

#### waitForEvent
Wait for page event.

```json
{
  "type": "waitForEvent",
  "event": "response"
}
```

### Locator Actions (7)

These create references to elements for subsequent operations:

#### locator
Generic element locator.

```json
{
  "type": "locator",
  "selector": ".item"
}
```

#### getByRole
Find by ARIA role.

```json
{
  "type": "getByRole",
  "role": "button",
  "options": { "name": "Submit" }
}
```

#### getByText
Find by text content.

```json
{
  "type": "getByText",
  "text": "Welcome"
}
```

#### getByLabel
Find by label text.

```json
{
  "type": "getByLabel",
  "text": "Email address"
}
```

#### getByPlaceholder
Find by placeholder.

```json
{
  "type": "getByPlaceholder",
  "text": "Enter email"
}
```

#### getByAltText
Find by alt text (images).

```json
{
  "type": "getByAltText",
  "text": "Profile photo"
}
```

#### getByTitle
Find by title attribute.

```json
{
  "type": "getByTitle",
  "text": "Close dialog"
}
```

#### getByTestId
Find by test ID.

```json
{
  "type": "getByTestId",
  "testId": "submit-button"
}
```

### Information Actions (4)

#### content
Get page HTML.

```json
{
  "type": "content"
}
```

#### title
Get page title.

```json
{
  "type": "title"
}
```

#### url
Get current URL.

```json
{
  "type": "url"
}
```

#### viewportSize
Get viewport dimensions.

```json
{
  "type": "viewportSize"
}
```

### Other Actions (13)

#### screenshot
Capture screenshot.

```json
{
  "type": "screenshot",
  "path": "./screenshot.png",
  "options": { "fullPage": true }
}
```

#### evaluate
Execute JavaScript.

```json
{
  "type": "evaluate",
  "pageFunction": "() => window.scrollTo(0, 0)"
}
```

#### evaluateHandle
Execute JS and return handle.

```json
{
  "type": "evaluateHandle",
  "pageFunction": "() => document.querySelector('.container')"
}
```

#### dispatchEvent
Dispatch custom event.

```json
{
  "type": "dispatchEvent",
  "selector": ".target",
  "type": "click"
}
```

#### setViewportSize
Change viewport size.

```json
{
  "type": "setViewportSize",
  "viewportSize": { "width": 1280, "height": 720 }
}
```

#### setExtraHTTPHeaders
Set custom HTTP headers.

```json
{
  "type": "setExtraHTTPHeaders",
  "headers": { "X-Custom-Header": "value" }
}
```

#### bringToFront
Bring page to front.

```json
{
  "type": "bringToFront"
}
```

#### close
Close page/browser.

```json
{
  "type": "close"
}
```

#### pdf
Generate PDF.

```json
{
  "type": "pdf",
  "options": { "path": "./page.pdf", "format": "A4" }
}
```

#### pause
Pause for debugging.

```json
{
  "type": "pause"
}
```

#### mouse
Low-level mouse control.

```json
{
  "type": "mouse",
  "action": "move",
  "x": 100,
  "y": 200
}
```

## Variable Interpolation

All actions support dynamic variables:

### Built-in Variables

```json
{
  "type": "fill",
  "selector": "input[name='timestamp']",
  "value": "${timestamp}"
}
```

Available:
- `${timestamp}` - Unix timestamp
- `${datetime}` - YYYY-MM-DD-HH-mm-ss
- `${date}` - YYYY-MM-DD
- `${time}` - HH-mm-ss
- `${random}` - Random 6-char hex
- `${uuid}` - Short UUID (8 chars)
- `${baseUrl}` - From config
- `${credentials.email}` - From config
- `${credentials.password}` - From config

### Faker.js Variables (300+)

Generate realistic test data:

```json
{
  "type": "fill",
  "selector": "input[name='fullName']",
  "value": "${faker.person.fullName}"
}
```

**Person:**
- `${faker.person.fullName}` - John Doe
- `${faker.person.firstName}` - John
- `${faker.person.lastName}` - Doe
- `${faker.person.jobTitle}` - Software Engineer

**Internet:**
- `${faker.internet.email}` - john.doe@example.com
- `${faker.internet.userName}` - john_doe
- `${faker.internet.password}` - aB3$xY9z
- `${faker.internet.url}` - https://example.com

**Location:**
- `${faker.location.streetAddress}` - 123 Main St
- `${faker.location.city}` - New York
- `${faker.location.country}` - United States
- `${faker.location.zipCode}` - 10001

**Phone & Company:**
- `${faker.phone.number}` - (555) 123-4567
- `${faker.company.name}` - Acme Corp

**Text:**
- `${faker.lorem.sentence}` - Random sentence
- `${faker.lorem.paragraph}` - Random paragraph

**Numbers & Strings:**
- `${faker.number.int}` - 42
- `${faker.string.alphanumeric(10)}` - Random 10-char string

Full API: https://fakerjs.dev/api/

## Complete Examples

### Authentication Action with Dynamic Data

`.tsty/actions/auth/register.action.json`:

```json
{
  "type": "form",
  "description": "Register new user with fake data",
  "actions": [
    { "type": "goto", "url": "${baseUrl}/register" },
    { "type": "fill", "selector": "#firstName", "value": "${faker.person.firstName}" },
    { "type": "fill", "selector": "#lastName", "value": "${faker.person.lastName}" },
    { "type": "fill", "selector": "#email", "value": "${faker.internet.email}" },
    { "type": "fill", "selector": "#phone", "value": "${faker.phone.number}" },
    { "type": "fill", "selector": "#address", "value": "${faker.location.streetAddress}" },
    { "type": "fill", "selector": "#city", "value": "${faker.location.city}" },
    { "type": "fill", "selector": "#password", "value": "${faker.internet.password}" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForLoadState", "options": { "state": "networkidle" } }
  ],
  "tags": ["auth", "registration"],
  "category": "auth"
}
```

### Modal Opening Action

`.tsty/actions/modals/open-create-modal.action.json`:

```json
{
  "type": "modal",
  "description": "Open create item modal",
  "actions": [
    { "type": "click", "selector": "button:has-text('Create')" },
    { "type": "waitForSelector", "selector": ".modal.open", "options": { "state": "visible" } }
  ],
  "tags": ["modal"],
  "category": "modals"
}
```

### Multi-Step Navigation

`.tsty/actions/navigation/settings-flow.action.json`:

```json
{
  "type": "navigation",
  "description": "Navigate to settings and open profile tab",
  "actions": [
    { "type": "click", "selector": "[data-testid='user-menu']" },
    { "type": "click", "selector": "text=Settings" },
    { "type": "waitForURL", "url": "**/settings" },
    { "type": "click", "selector": "[role='tab'][name='Profile']" },
    { "type": "waitForSelector", "selector": ".profile-form", "options": { "state": "visible" } }
  ],
  "tags": ["navigation", "settings"],
  "category": "navigation"
}
```

### Form Filling with Faker

`.tsty/actions/forms/contact-form.action.json`:

```json
{
  "type": "form",
  "description": "Fill contact form with fake data",
  "actions": [
    { "type": "fill", "selector": "#name", "value": "${faker.person.fullName}" },
    { "type": "fill", "selector": "#email", "value": "${faker.internet.email}" },
    { "type": "fill", "selector": "#company", "value": "${faker.company.name}" },
    { "type": "fill", "selector": "#message", "value": "${faker.lorem.paragraph}" },
    { "type": "check", "selector": "#agree-terms" },
    { "type": "click", "selector": "button:has-text('Submit')" }
  ],
  "tags": ["form", "contact"],
  "category": "forms"
}
```

## Using Actions in Flows

Reference actions in flow steps:

```json
{
  "name": "User Registration Flow",
  "steps": [
    {
      "name": "Register",
      "url": "/register",
      "actions": ["register"],
      "capture": { "screenshot": true }
    },
    {
      "name": "Dashboard after registration",
      "url": "/dashboard",
      "capture": { "screenshot": true },
      "assertions": [
        { "type": "visible", "selector": ".welcome-message" }
      ]
    }
  ]
}
```

## Creating Actions in Dashboard

1. Go to **Actions** tab
2. Click **"New Action"**
3. Drag **48 primitive actions** from palette
4. Configure each action's properties
5. Use **Selector Picker** for CSS selectors
6. Add variables with `${variable}` syntax
7. Save and reference in flows

## CLI: List Available Actions

```bash
# List all 48 Playwright actions by category
tsty primitives

# List specific category
tsty primitives mouse
tsty primitives input
tsty primitives waiting

# List user-created actions
tsty list actions
```

## Best Practices

1. **Use Faker for test data** - Avoid hardcoding test data
2. **Organize by category** - Use `category` field for folder structure
3. **Add tags** - Make actions searchable
4. **Descriptive names** - Clear action file names (e.g., `register-user.action.json`)
5. **Wait after interactions** - Use `waitForLoadState` after clicks/submissions
6. **Use test IDs** - `[data-testid="..."]` for stable selectors
7. **Reuse actions** - DRY principle for common sequences
8. **Dependencies** - Declare action dependencies explicitly

## Auto-Generated Actions

Actions are **auto-generated** from Playwright's Page API. To regenerate:

```bash
npm run generate:actions
```

This ensures:
- ✅ Always up-to-date with latest Playwright features
- ✅ No manual maintenance required
- ✅ Complete API coverage
- ✅ Type-safe execution

## Further Reading

- Playwright API: https://playwright.dev/docs/api/class-page
- Faker.js API: https://fakerjs.dev/api/
- Framework docs: https://github.com/mde-pach/tsty
