# Integrating Tsty with Next.js App Router

This guide shows how to integrate Tsty into a Next.js project using the App Router.

## Step 1: Install the Framework

This package is not published on npm. Install directly from GitHub:

```bash
bun add -d https://github.com/mde-pach/tsty.git
# or
npm install --save-dev https://github.com/mde-pach/tsty.git
```

## Step 2: Create Configuration

Create `qa.config.js` in your project root:

```javascript
module.exports = {
  testDir: './.tsty',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  auth: {
    loginUrl: '/auth/login',
    credentials: {
      email: process.env.QA_TEST_EMAIL || 'test@example.com',
      password: process.env.QA_TEST_PASSWORD || 'password123'
    }
  },
  viewports: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 }
  }
};
```

## Step 3: Create API Routes

### `src/app/api/tsty/flows/route.ts`
```typescript
export { GET, POST, PUT, DELETE } from 'tsty/api/flows';
```

### `src/app/api/tsty/actions/route.ts`
```typescript
export { GET, POST, PUT, DELETE } from 'tsty/api/actions';
```

### `src/app/api/tsty/reports/route.ts`
```typescript
export { GET, DELETE } from 'tsty/api/reports';
```

### `src/app/api/tsty/run/route.ts`
```typescript
export { POST } from 'tsty/api/run';
```

### `src/app/api/tsty/screenshots/route.ts`
```typescript
export { GET } from 'tsty/api/screenshots';
```

## Step 4: Create Dashboard Page

### `src/app/(dashboard)/tsty/page.tsx`

```typescript
import { QADashboard } from 'tsty/dashboard';

export const metadata = {
  title: 'Tsty Testing',
  description: 'Automated testing dashboard'
};

export default function TstyPage() {
  return <QADashboard />;
}
```

## Step 5: Optional - Protect the Dashboard

If you want to restrict access to admins only:

### `src/app/(dashboard)/tsty/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { QADashboard } from 'tsty/dashboard';

export default async function TstyPage() {
  const session = await getServerSession(authOptions);

  // Restrict to admin users only
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return <QADashboard />;
}
```

## Step 6: Create Test Directory Structure

```bash
mkdir -p .tsty/{actions,flows,reports,screenshots}
```

## Step 7: Add to .gitignore

```
# Tsty Testing
.tsty/reports/
.tsty/screenshots/
```

Keep flows and actions in version control, but ignore reports and screenshots.

## Step 8: Create Your First Test

Create `.tsty/actions/login.action.json`:

```json
{
  "type": "form",
  "description": "Login with test credentials",
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

Create `.tsty/flows/smoke-test.json`:

```json
{
  "name": "Smoke Test",
  "description": "Basic functionality test",
  "baseUrl": "http://localhost:3000",
  "steps": [
    {
      "name": "Homepage loads",
      "url": "/",
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "visible",
          "selector": "h1"
        }
      ]
    },
    {
      "name": "Login works",
      "url": "/auth/login",
      "actions": ["login"],
      "capture": {
        "screenshot": true
      },
      "assertions": [
        {
          "type": "url",
          "expected": "/dashboard"
        }
      ]
    }
  ]
}
```

## Step 9: Run Tests

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/tsty`
3. Click "Run Test" on your flow
4. View the results in the Reports tab

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution issues, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "paths": {
      "tsty": ["./node_modules/tsty/src"]
    }
  }
}
```

### API Routes Not Found

Ensure all API route files are created and properly export the handlers.

### Dashboard Styling Issues

The framework uses Tailwind classes. Ensure your Tailwind configuration includes:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/tsty/**/*.{js,ts,jsx,tsx}'
  ]
};
```

## Next Steps

- Create more actions for common interactions
- Build comprehensive test flows
- Run tests as part of CI/CD pipeline
- Monitor test results over time
