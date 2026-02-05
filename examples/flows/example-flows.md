# Example Test Flows

This file contains examples of common test flow patterns for the QA Framework.

## Basic Smoke Test

### smoke-test.json
```json
{
  "name": "Smoke Test",
  "description": "Basic functionality check",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Homepage loads",
      "url": "/",
      "capture": {
        "screenshot": true,
        "html": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "h1"
        },
        {
          "type": "visible",
          "selector": "nav"
        }
      ]
    },
    {
      "name": "About page loads",
      "url": "/about",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/about"
        }
      ]
    }
  ]
}
```

## Authentication Flow

### login-flow.json
```json
{
  "name": "Login Flow",
  "description": "Test user authentication",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Navigate to login",
      "url": "/auth/login",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "form"
        },
        {
          "type": "visible",
          "selector": "input[name='email']"
        },
        {
          "type": "visible",
          "selector": "input[name='password']"
        }
      ]
    },
    {
      "name": "Submit login form",
      "url": "/auth/login",
      "actions": ["login"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/dashboard"
        },
        {
          "type": "visible",
          "selector": "nav[aria-label='Main navigation']"
        }
      ]
    },
    {
      "name": "Logout",
      "url": "/dashboard",
      "actions": ["logout"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/"
        }
      ]
    }
  ]
}
```

## Form Validation Flow

### form-validation-flow.json
```json
{
  "name": "Form Validation Flow",
  "description": "Test form validation logic",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Navigate to form",
      "url": "/contact",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "form"
        }
      ]
    },
    {
      "name": "Submit empty form",
      "url": "/contact",
      "actions": ["submit-empty-form"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": ".error-message"
        },
        {
          "type": "count",
          "selector": ".error-message",
          "expected": 3
        }
      ]
    },
    {
      "name": "Fill form with invalid data",
      "url": "/contact",
      "actions": ["fill-invalid-email"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": ".error-message"
        },
        {
          "type": "text",
          "selector": ".error-message",
          "expected": "Invalid email address"
        }
      ]
    },
    {
      "name": "Submit valid form",
      "url": "/contact",
      "actions": ["fill-valid-form", "submit-form"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": ".success-message"
        },
        {
          "type": "hidden",
          "selector": ".error-message"
        }
      ]
    }
  ]
}
```

## Modal Interaction Flow

### modal-flow.json
```json
{
  "name": "Modal Interaction Flow",
  "description": "Test modal dialog functionality",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Navigate to page with modal",
      "url": "/products",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "button:has-text('Add Product')"
        }
      ]
    },
    {
      "name": "Open modal",
      "url": "/products",
      "actions": ["open-create-product-modal"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "dialog[open]"
        },
        {
          "type": "visible",
          "selector": "h2:has-text('Add Product')"
        }
      ]
    },
    {
      "name": "Close modal with cancel",
      "url": "/products",
      "actions": ["close-modal-cancel"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "hidden",
          "selector": "dialog[open]"
        }
      ]
    },
    {
      "name": "Reopen modal",
      "url": "/products",
      "actions": ["open-create-product-modal"],
      "assertions": [
        {
          "type": "visible",
          "selector": "dialog[open]"
        }
      ]
    },
    {
      "name": "Close modal with X",
      "url": "/products",
      "actions": ["close-modal-x"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "hidden",
          "selector": "dialog[open]"
        }
      ]
    },
    {
      "name": "Reopen and close with Escape",
      "url": "/products",
      "actions": ["open-create-product-modal", "close-modal-escape"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "hidden",
          "selector": "dialog[open]"
        }
      ]
    }
  ]
}
```

## Multi-Device Flow

### responsive-test.json
```json
{
  "name": "Responsive Design Test",
  "description": "Test responsive layout on different devices",
  "baseUrl": "http://localhost:3000",
  "devices": ["desktop", "mobile"],
  "steps": [
    {
      "name": "Homepage responsive check",
      "url": "/",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "nav"
        },
        {
          "type": "visible",
          "selector": "main"
        }
      ]
    },
    {
      "name": "Mobile menu test",
      "url": "/",
      "actions": ["open-menu"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "nav[aria-label='Main navigation']"
        }
      ]
    }
  ]
}
```

## E-commerce Checkout Flow

### checkout-flow.json
```json
{
  "name": "Checkout Flow",
  "description": "Complete checkout process",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Browse products",
      "url": "/products",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "count",
          "selector": ".product-card",
          "expected": 12
        }
      ]
    },
    {
      "name": "Add product to cart",
      "url": "/products",
      "actions": ["add-first-product-to-cart"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": ".cart-badge"
        },
        {
          "type": "text",
          "selector": ".cart-badge",
          "expected": "1"
        }
      ]
    },
    {
      "name": "View cart",
      "url": "/cart",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "count",
          "selector": ".cart-item",
          "expected": 1
        },
        {
          "type": "visible",
          "selector": "button:has-text('Checkout')"
        }
      ]
    },
    {
      "name": "Proceed to checkout",
      "url": "/cart",
      "actions": ["click-checkout"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/checkout"
        },
        {
          "type": "visible",
          "selector": "form[name='checkout']"
        }
      ]
    },
    {
      "name": "Fill checkout form",
      "url": "/checkout",
      "actions": ["fill-shipping-info", "fill-payment-info"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "button:has-text('Place Order')"
        }
      ]
    },
    {
      "name": "Place order",
      "url": "/checkout",
      "actions": ["submit-checkout"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/order/confirmation"
        },
        {
          "type": "visible",
          "selector": ".success-message"
        }
      ]
    }
  ]
}
```
