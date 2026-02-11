# Code Style and Conventions

## TypeScript
- Strict mode enabled
- Explicit types (avoid `any`)
- All new fields optional for backward compatibility
- Path alias: `@/*` → `./src/*`

## Naming
- **Files**: kebab-case (`flow-builder.tsx`)
- **Components**: PascalCase (`FlowBuilder`)
- **Functions**: camelCase (`executeFlow`)
- **Types/Interfaces**: PascalCase (`FlowFile`, `ActionDefinition`)
- **Hooks**: `use` prefix (`useFlows`, `useActions`)

## React
- Function components with hooks
- TypeScript interfaces for props
- Custom hooks in `src/dashboard/hooks/use-*.ts`
- Context for editor state in `src/dashboard/contexts/`

## CSS / Styling
- Tailwind CSS with `dark:` prefix for dark mode
- `darkMode: 'class'` in tailwind.config.js
- Design system: primary (blue), success (green), warning (amber), error (red), info (purple)

## API Endpoints
- Response: `{ success: boolean, data?: T, error?: string }`
- Handlers in `src/api/*.ts`, routes in `app/api/*/route.ts`
