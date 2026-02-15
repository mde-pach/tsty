# Codebase Structure (Updated 2026-02-14)

```
tsty/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard entry
│   ├── layout.tsx                # App layout with ThemeProvider
│   ├── globals.css               # Global styles + CSS variables
│   ├── api/                      # API routes
│   │   ├── flows/route.ts        # Flow CRUD
│   │   ├── actions/route.ts      # Action CRUD
│   │   ├── reports/route.ts      # Report queries
│   │   ├── run/route.ts          # Test execution
│   │   ├── issues/route.ts       # GitHub issue management (NEW)
│   │   └── ...                   # tags, collections, folders, screenshots
│   ├── flows/                    # Flow editor pages
│   ├── actions/                  # Action editor pages
│   ├── runs/                     # Run history pages
│   ├── issues/                   # GitHub issue pages (NEW)
│   │   ├── page.tsx              # Issue list with fetch modal
│   │   └── [number]/page.tsx     # Issue detail + screenshot comparison
│   └── compare/page.tsx          # Run comparison page (NEW)
├── src/
│   ├── lib/                      # Core utilities
│   │   ├── types.ts              # 30+ interfaces (Flow, Action, Report, GitHubIssue, etc.)
│   │   ├── generated-actions.ts  # 48 auto-generated Playwright actions
│   │   ├── file-manager.ts       # FileManager class
│   │   ├── config.ts             # Config loader
│   │   ├── variable-interpolator.ts # ${var} + Faker.js
│   │   ├── dependency-validator.ts  # Circular detection + topological sort
│   │   ├── github-issue-manager.ts  # GitHub issue fetch/store/lifecycle (NEW)
│   │   ├── reference-manager.ts     # Reference run marking for comparisons (NEW)
│   │   ├── tag-manager.ts, page-extractor.ts, collection-matcher.ts
│   ├── runner/                   # Test execution
│   │   ├── playwright-runner.ts  # PlaywrightRunner class
│   │   └── action-executor.ts    # executeAction/executeActions
│   ├── api/                      # Backend API handlers
│   ├── dashboard/                # React UI (40+ components)
│   │   ├── components/
│   │   │   ├── screenshot-comparison.tsx    # Side-by-side viewer with zoom (NEW)
│   │   │   ├── run-comparison-viewer.tsx    # Full run comparison display (NEW)
│   │   │   ├── dashboard-layout.tsx         # Nav: Tests, Results, Compare, Issues, Library
│   │   │   └── ...                          # 35+ other components
│   │   ├── hooks/                # Custom hooks (useFlows, useActions, etc.)
│   │   ├── contexts/             # Editor state contexts
│   │   └── pages/                # Main page components
│   └── cli/                      # CLI command handlers
│       ├── commands.ts           # All CLI commands (expanded with issue/reference cmds)
│       └── runner.ts             # CLI runner with command routing
├── bin/cli.js                    # CLI entry point
├── scripts/
│   ├── generate-actions.ts       # Playwright action generator
│   └── fetch-github-issue.sh     # GitHub issue fetcher via gh CLI (NEW)
├── skill/                        # Claude skill definition
│   ├── SKILL.md                  # Main skill instructions (optimized)
│   └── references/               # Reference docs (analysis, testing, decisions, etc.)
└── .tsty/                        # Test data (self-testing)
    ├── issues/                   # Fetched GitHub issues (NEW)
    └── ...                       # flows, actions, reports, screenshots
```

## Key Classes
- `FileManager` — .tsty/ file operations
- `PlaywrightRunner` — Flow execution with dependency resolution
- `DependencyValidator` — Circular dependency detection
- `GitHubIssueManager` — GitHub issue fetch/store/lifecycle management (NEW)
- `ReferenceManager` — Reference run marking for before/after comparison (NEW)

## Navigation (Dashboard)
Tests → Results → Compare → Issues → Library
