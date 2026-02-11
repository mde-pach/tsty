# Tsty Project Overview

## Purpose
Tsty is a standalone visual QA testing framework that generates and manages `.tsty/` directories for web application testing. It provides a full-featured dashboard UI and CLI for creating, organizing, and running Playwright-based E2E tests.

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
1. **Core Library** (`src/lib/`) - Types, file management, config, generated actions, variable interpolation, dependency validation, tags, pages, collections
2. **Runner** (`src/runner/`) - PlaywrightRunner for flow execution, ActionExecutor for individual action dispatch
3. **API** (`src/api/`) - RESTful handlers for flows, actions, reports, tags, collections, folders, screenshots
4. **Dashboard** (`src/dashboard/`) - React UI with visual editors, organization tools, execution monitoring
5. **App Router** (`app/`) - Next.js pages and API routes
6. **CLI** (`bin/cli.js`) - Command-line interface

## Key Patterns
- File-based storage in `.tsty/` directory
- All new type fields are optional for backward compatibility
- API response format: `{ success: boolean, data?: T, error?: string }`
- Custom hooks: `{ data, loading, error, CRUD methods, refresh }`
- Dark mode with `dark:` Tailwind prefix
- Auto-generated Playwright actions (do not manually add)
- Variable interpolation with `${variable}` syntax + Faker.js
- Circular dependency detection (DFS) with max depth 5
