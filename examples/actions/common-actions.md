# Common Action Examples

This file contains examples of commonly used actions for Tsty.

## Authentication

### login.action.json
```json
{
  "type": "form",
  "description": "Login with credentials",
  "actions": [
    {
      "type": "fill",
      "selector": "input[name='email']",
      "value": "test@example.com"
    },
    {
      "type": "fill",
      "selector": "input[name='password']",
      "value": "password123"
    },
    {
      "type": "click",
      "selector": "button[type='submit']"
    },
    {
      "type": "wait",
      "condition": "networkidle"
    }
  ]
}
```

### logout.action.json
```json
{
  "type": "navigation",
  "description": "Logout from the application",
  "actions": [
    {
      "type": "click",
      "selector": "button[aria-label='User menu']"
    },
    {
      "type": "wait",
      "condition": "selector",
      "selector": "[role='menu']"
    },
    {
      "type": "click",
      "selector": "button:has-text('Logout')"
    },
    {
      "type": "wait",
      "condition": "networkidle"
    }
  ]
}
```

## Navigation

### open-menu.action.json
```json
{
  "type": "navigation",
  "description": "Open the navigation menu",
  "actions": [
    {
      "type": "click",
      "selector": "button[aria-label='Open menu']"
    },
    {
      "type": "wait",
      "condition": "selector",
      "selector": "nav[aria-label='Main navigation']"
    }
  ]
}
```

### close-menu.action.json
```json
{
  "type": "navigation",
  "description": "Close the navigation menu",
  "actions": [
    {
      "type": "click",
      "selector": "button[aria-label='Close menu']"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

## Modal Interactions

### open-modal.action.json
```json
{
  "type": "modal",
  "description": "Open a modal dialog",
  "actions": [
    {
      "type": "click",
      "selector": "button:has-text('Open Modal')"
    },
    {
      "type": "wait",
      "condition": "selector",
      "selector": "dialog[open]"
    }
  ]
}
```

### close-modal-cancel.action.json
```json
{
  "type": "modal",
  "description": "Close modal using cancel button",
  "actions": [
    {
      "type": "click",
      "selector": "button:has-text('Cancel')"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

### close-modal-x.action.json
```json
{
  "type": "modal",
  "description": "Close modal using X button",
  "actions": [
    {
      "type": "click",
      "selector": "button[aria-label='Close']"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

### close-modal-escape.action.json
```json
{
  "type": "modal",
  "description": "Close modal using Escape key",
  "actions": [
    {
      "type": "press",
      "key": "Escape"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

## Form Interactions

### fill-search.action.json
```json
{
  "type": "form",
  "description": "Fill and submit search form",
  "actions": [
    {
      "type": "fill",
      "selector": "input[name='search']",
      "value": "test query"
    },
    {
      "type": "press",
      "selector": "input[name='search']",
      "key": "Enter"
    },
    {
      "type": "wait",
      "condition": "networkidle"
    }
  ]
}
```

### submit-empty-form.action.json
```json
{
  "type": "form",
  "description": "Submit form without filling any fields",
  "actions": [
    {
      "type": "click",
      "selector": "button[type='submit']"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 1000
    }
  ]
}
```

### clear-form.action.json
```json
{
  "type": "form",
  "description": "Clear all form fields",
  "actions": [
    {
      "type": "click",
      "selector": "button:has-text('Reset'), button:has-text('Clear')"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

## Dropdown Interactions

### select-option.action.json
```json
{
  "type": "interaction",
  "description": "Select option from dropdown",
  "actions": [
    {
      "type": "click",
      "selector": "select[name='country']"
    },
    {
      "type": "select",
      "selector": "select[name='country']",
      "value": "US"
    }
  ]
}
```

### hover-dropdown.action.json
```json
{
  "type": "interaction",
  "description": "Hover to reveal dropdown menu",
  "actions": [
    {
      "type": "hover",
      "selector": ".dropdown-trigger"
    },
    {
      "type": "wait",
      "condition": "selector",
      "selector": ".dropdown-menu"
    }
  ]
}
```

## Checkbox/Radio Interactions

### check-all.action.json
```json
{
  "type": "interaction",
  "description": "Check all checkboxes",
  "actions": [
    {
      "type": "click",
      "selector": "input[type='checkbox'][name='select-all']"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 300
    }
  ]
}
```

### accept-terms.action.json
```json
{
  "type": "interaction",
  "description": "Accept terms and conditions",
  "actions": [
    {
      "type": "check",
      "selector": "input[type='checkbox'][name='terms']"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 300
    }
  ]
}
```

## Scroll Actions

### scroll-to-bottom.action.json
```json
{
  "type": "interaction",
  "description": "Scroll to bottom of page",
  "actions": [
    {
      "type": "press",
      "key": "End"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 1000
    }
  ]
}
```

### scroll-to-element.action.json
```json
{
  "type": "interaction",
  "description": "Scroll to a specific element",
  "actions": [
    {
      "type": "hover",
      "selector": "#footer"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 500
    }
  ]
}
```

## Wait Actions

### wait-for-loading.action.json
```json
{
  "type": "interaction",
  "description": "Wait for loading spinner to disappear",
  "actions": [
    {
      "type": "wait",
      "condition": "selector",
      "selector": ".loading-spinner"
    },
    {
      "type": "wait",
      "condition": "timeout",
      "timeout": 5000
    }
  ]
}
```

### wait-for-api.action.json
```json
{
  "type": "interaction",
  "description": "Wait for API calls to complete",
  "actions": [
    {
      "type": "wait",
      "condition": "networkidle"
    }
  ]
}
```
