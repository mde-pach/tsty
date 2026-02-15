# Code Style and Conventions (Updated 2026-02-14)

## TypeScript
- Strict mode enabled
- Explicit types (avoid `any`)
- All new fields optional for backward compatibility
- Path alias: `@/*` → `./src/*`

## Naming
- **Files**: kebab-case (`flow-builder.tsx`, `github-issue-manager.ts`)
- **Components**: PascalCase (`FlowBuilder`, `ScreenshotComparison`)
- **Functions**: camelCase (`executeFlow`, `markReference`)
- **Types/Interfaces**: PascalCase (`FlowFile`, `ActionDefinition`, `GitHubIssue`)
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
- Screenshot comparison: blue border = BEFORE/reference, green border = AFTER/current

## API Endpoints
- Response: `{ success: boolean, data?: T, error?: string }`
- Handlers in `src/api/*.ts`, routes in `app/api/*/route.ts`
- GitHub issues API: `/api/issues` (GET list, GET?number=N, POST fetch, PUT update, DELETE)

## Key Type Additions (Recent)
- `GitHubIssue` — number, title, body, state, labels, status lifecycle
- `Flow.referenceRunId` — baseline run for comparison (optional)
- `Flow.issueNumber` — linked GitHub issue (optional)
- `TestReport.isReference` — marks baseline reports (optional)
