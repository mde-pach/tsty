# Decision Guide for Action Creation

## Quick Decision Tree

```
Need to interact with UI?
  ↓
Is it a single primitive (click, fill, type)?
  ├─ Yes → Use primitive directly in flow step
  └─ No  → Continue
          ↓
Will it be reused in 2+ flows?
  ├─ No  → Use primitives directly in flow step
  └─ Yes → Continue
          ↓
Does it represent a complete user behavior?
  ├─ No  → Reconsider - maybe use primitives directly
  └─ Yes → CREATE ACTION
```

## Detailed Guidelines

### When to Create Actions

| Criteria | Threshold | Example |
|----------|-----------|---------|
| **Reuse** | Used in 2+ flows | Login used in 10 flows → Action |
| **Complexity** | 4+ primitives preferred | Checkout (8 steps) → Action |
| **User-centered** | Complete task | Login (not fill-email) → Action |
| **Dependencies** | Depends on other actions | View-profile needs login → Action |

### When to Use Primitives Directly

| Scenario | Solution | Example |
|----------|----------|---------|
| One-time interaction | Inline in flow | Navigate to /about once |
| 1-3 simple primitives | Inline in flow | Click button, wait |
| Specific to one flow | Inline in flow | This flow's unique steps |
| No reuse needed | Inline in flow | One-off data entry |

## Action Naming Conventions

### ✅ Good Names (user-centered)

**Authentication:**
- login, logout, signup, verify-email, reset-password

**E-commerce:**
- add-to-cart, remove-from-cart, checkout, apply-coupon

**Content:**
- create-post, edit-post, delete-post, publish-post

**Navigation:**
- open-settings-modal, navigate-to-profile, expand-menu

**Forms:**
- submit-contact-form, update-profile, fill-shipping-info

### ❌ Bad Names (technical)

- click-button, fill-form, type-text
- do-login-stuff, handle-checkout
- navigate-to-page, wait-for-element
- submit-button-click, email-input-fill

## Action Type Selection

| Type | When to Use | Examples | Typical Primitives |
|------|-------------|----------|-------------------|
| `auth` | Authentication/authorization | login, logout, signup | goto, fill, click, waitForLoadState |
| `form` | Form submission (non-auth) | contact-form, profile-update | fill (multiple), click, waitForSelector |
| `modal` | Modal/dialog interactions | open-modal, confirm-dialog | click, waitForSelector, fill, click |
| `navigation` | Multi-step navigation | navigate-to-settings | click (multiple), waitForURL |
| `interaction` | UI interactions | add-to-cart, like-post | click, waitForSelector |
| `data` | Data generation/manipulation | fill-with-fake-data | fill (with faker variables) |

## Common Patterns

### Pattern 1: Authentication
```json
{
  "type": "auth",
  "description": "Login to application",
  "primitives": [
    { "type": "goto", "url": "${baseUrl}/login" },
    { "type": "fill", "selector": "#email", "value": "${credentials.email}" },
    { "type": "fill", "selector": "#password", "value": "${credentials.password}" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForLoadState", "options": { "state": "networkidle" } }
  ]
}
```

**Why an action:**
- ✅ Used in many flows
- ✅ 5 primitives
- ✅ Complete user task
- ✅ Clear name (login)

### Pattern 2: Form Submission
```json
{
  "type": "form",
  "description": "Submit contact form",
  "primitives": [
    { "type": "fill", "selector": "#name", "value": "${faker.person.fullName}" },
    { "type": "fill", "selector": "#email", "value": "${faker.internet.email}" },
    { "type": "fill", "selector": "#message", "value": "${faker.lorem.paragraph}" },
    { "type": "click", "selector": "button[type='submit']" },
    { "type": "waitForSelector", "selector": ".success-message" }
  ]
}
```

**Why an action:**
- ✅ Reusable pattern
- ✅ 5 primitives
- ✅ Uses Faker variables
- ✅ Complete submission flow

### Pattern 3: Modal Interaction
```json
{
  "type": "modal",
  "description": "Open and fill create post modal",
  "primitives": [
    { "type": "click", "selector": "button.create-post" },
    { "type": "waitForSelector", "selector": ".modal.open" },
    { "type": "fill", "selector": ".modal input[name='title']", "value": "${faker.lorem.sentence}" },
    { "type": "fill", "selector": ".modal textarea", "value": "${faker.lorem.paragraphs(2)}" },
    { "type": "click", "selector": ".modal button[type='submit']" },
    { "type": "waitForSelector", "selector": ".modal", "options": { "state": "hidden" } }
  ]
}
```

**Why an action:**
- ✅ 6 primitives
- ✅ Complete modal workflow
- ✅ Reusable across features

### Anti-Pattern: Too Granular

❌ **Don't do this:**
```json
// .tsty/actions/click-submit.action.json
{
  "type": "interaction",
  "description": "Click submit button",
  "primitives": [
    { "type": "click", "selector": "button[type='submit']" }
  ]
}
```

**Why it's bad:**
- ❌ Only 1 primitive
- ❌ Too technical
- ❌ Not a complete task
- ❌ Should use primitive directly in flow

✅ **Instead, in your flow:**
```json
{
  "steps": [
    {
      "name": "Submit form",
      "url": "/contact",
      "primitives": [
        { "type": "fill", "selector": "#email", "value": "test@example.com" },
        { "type": "click", "selector": "button[type='submit']" }
      ]
    }
  ]
}
```

## Action Dependencies

Actions can depend on other actions:

```json
{
  "type": "interaction",
  "description": "Add product to wishlist",
  "dependencies": ["login"],  // Must be logged in
  "primitives": [
    { "type": "goto", "url": "${baseUrl}/products/${productId}" },
    { "type": "click", "selector": ".add-to-wishlist" },
    { "type": "waitForSelector", "selector": ".wishlist-badge" }
  ]
}
```

**When to use dependencies:**
- Action requires authenticated state
- Action needs data from another action
- Action builds on previous setup

**Validation:**
- Circular dependencies detected automatically
- Max depth: 5 levels
- Framework handles execution order

## Checklist Before Creating Action

Before creating `.tsty/actions/*.action.json`, verify:

- [ ] Represents complete user behavior (not just 1-2 primitives)?
- [ ] Named from user perspective (login, not fill-login-form)?
- [ ] Will be reused in 2+ flows?
- [ ] Has 2+ primitives (preferably 4+)?
- [ ] Could this be primitives directly in flow instead?

If **all yes** → Create action
If **mostly no** → Use primitives directly in flow

## Real-World Examples

### E-Commerce Site

**Actions to create:**
- `login` - Auth flow (5 primitives, used everywhere)
- `add-to-cart` - Shopping (3 primitives, reused)
- `checkout` - Purchase (8 primitives, complex)
- `filter-by-category` - Browse (4 primitives, reused)

**Primitives to use directly:**
- View product details (1-2 primitives, varies per product)
- Click footer links (1 primitive, simple)
- Change quantity (2 primitives, inline is fine)

### Blog Platform

**Actions to create:**
- `login` - Auth (5 primitives)
- `create-post` - Content creation (6 primitives)
- `publish-post` - Publishing (4 primitives with modal)
- `add-comment` - Interaction (3 primitives, reused)

**Primitives to use directly:**
- Navigate to About page (1 primitive)
- Click like button (1 primitive)
- Search (2 primitives, inline)

### SaaS Dashboard

**Actions to create:**
- `login` - Auth (5 primitives)
- `create-workspace` - Setup (7 primitives with form)
- `invite-user` - Admin (5 primitives with modal)
- `generate-report` - Feature (6 primitives with waits)

**Primitives to use directly:**
- Switch workspace (2 primitives)
- Open settings (1 primitive)
- Update single field (2 primitives)

## Summary

**Golden rules:**
1. Actions = user behaviors (reusable journeys)
2. Primitives = building blocks (use directly for one-offs)
3. 4+ primitives + reuse = probably an action
4. Name from user perspective
5. When in doubt, start with primitives in flow - convert to action when you use it twice
