# Tsty Project Overview (Updated 2026-02-14)

## Purpose
Tsty is a standalone visual QA testing framework that generates and manages `.tsty/` directories for web application testing. It provides a full-featured dashboard UI and CLI for creating, organizing, and running Playwright-based E2E tests. **Now includes GitHub issue integration for autonomous issue-fixing workflows.**

## Tech Stack
- **Runtime**: Node.js / Bun
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18, Tailwind CSS 3.4, next-themes (dark mode)
- **Testing Engine**: Playwright (48 auto-generated actions)
- **Data Generation**: @faker-js/faker
- **Drag-and-drop**: @dnd-kit
- **Command Palette**: cmdk
- **Dependency Graphs**: reactflow
- **Language**: TypeScript 5, strict mode
- **Path Aliases**: `@/*` maps to `./src/*`

## Architecture
1. **Core Library** (`src/lib/`) - Types, file management, config, generated actions, variable interpolation, dependency validation, GitHub issue management, reference management
2. **Runner** (`src/runner/`) - PlaywrightRunner for flow execution, ActionExecutor for individual action dispatch
3. **API** (`src/api/`, `app/api/`) - RESTful handlers for flows, actions, reports, tags, collections, folders, screenshots, **issues**
4. **Dashboard** (`src/dashboard/`) - React UI with visual editors, organization tools, execution monitoring, **screenshot comparison, run comparison**
5. **App Router** (`app/`) - Next.js pages and API routes (including `/issues`, `/compare`)
6. **CLI** (`bin/cli.js`, `src/cli/`) - Command-line interface with issue and reference management

## Key Patterns
- File-based storage in `.tsty/` directory (including `.tsty/issues/` for GitHub issues)
- All new type fields are optional for backward compatibility
- API response format: `{ success: boolean, data?: T, error?: string }`
- Custom hooks: `{ data, loading, error, CRUD methods, refresh }`
- Dark mode with `dark:` Tailwind prefix
- Auto-generated Playwright actions (do not manually add)
- Variable interpolation with `${variable}` syntax + Faker.js
- Circular dependency detection (DFS) with max depth 5

## GitHub Issue Integration (NEW)
- **Workflow**: Fetch issue → Create test flow → Link → Run reference → Analyze screenshots → Fix code → Re-run → Compare visually
- **Status lifecycle**: `pending → linked → testing → fixed/failed`
- **Key insight**: Screenshots are source of truth, not exit codes
- **Reference runs**: Mark baseline, compare before/after screenshots side-by-side
- **Dashboard**: `/issues` (list), `/issues/[number]` (detail + comparison), `/compare` (general)
- **CLI**: `tsty issue fetch|list|link|view|set-reference`, `tsty mark-reference`, `tsty compare-runs`
