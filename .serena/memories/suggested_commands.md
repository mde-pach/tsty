# Suggested Commands (Updated 2026-02-14)

## Development
- `bun run dev` — Start Next.js dev server on port 4000
- `bun run build` — Production build
- `bun run start` — Start production server on port 4000

## CLI - Basic
- `bun run qa` — Start the QA dashboard
- `bun run qa run <flow>` — Run a specific test flow
- `bun run qa run <flow> --fail-fast` — Stop on first failure
- `bun run qa run <flow> --mark-reference` — Run and mark as baseline
- `bun run qa list` — List all flows
- `bun run qa list actions` — List all actions
- `bun run qa validate <flow>` — Validate flow dependencies
- `bun run qa init` — Initialize `.tsty/` directory

## CLI - GitHub Issues (NEW)
- `bun run qa issue fetch <number> [--repo owner/repo]` — Fetch issue from GitHub
- `bun run qa issue list` — List fetched issues
- `bun run qa issue link <number> --flow <flow-id>` — Link issue to flow
- `bun run qa issue view <number>` — View issue details
- `bun run qa issue set-reference <number> --run <run-id>` — Set reference run

## CLI - Reference & Comparison (NEW)
- `bun run qa mark-reference <run-id> [--flow <flow-id>]` — Mark run as baseline
- `bun run qa clear-reference <flow>` — Clear reference
- `bun run qa list-references` — List flows with references
- `bun run qa compare-runs <before-id> <after-id>` — Compare two runs
- `bun run qa analyze-screenshots <run-id>` — Analyze screenshots

## Code Quality
- `bun run type-check` — TypeScript type checking (`tsc --noEmit`)
- `bun run test` — Run Playwright tests

## Code Generation
- `npm run generate:actions` — Regenerate 48 Playwright action types

## System Utilities (macOS/Darwin)
- `git` — Version control
- `bun` — Package manager and runtime (preferred over npm)
