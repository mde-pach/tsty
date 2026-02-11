# Codebase Structure

```
tsty/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Dashboard entry
│   ├── layout.tsx                # App layout with ThemeProvider
│   ├── globals.css               # Global styles + CSS variables
│   ├── api/                      # API routes (flows, actions, reports, run, etc.)
│   ├── flows/                    # Flow editor pages
│   ├── actions/                  # Action editor pages
│   └── runs/                     # Run history pages
├── src/
│   ├── lib/                      # Core utilities
│   │   ├── types.ts              # 27+ interfaces (Flow, Action, Report, etc.)
│   │   ├── generated-actions.ts  # 48 auto-generated Playwright actions
│   │   ├── file-manager.ts       # FileManager class
│   │   ├── config.ts             # Config loader
│   │   ├── variable-interpolator.ts # ${var} + Faker.js
│   │   ├── dependency-validator.ts  # Circular detection + topological sort
│   │   ├── tag-manager.ts, page-extractor.ts, collection-matcher.ts
│   ├── runner/                   # Test execution
│   │   ├── playwright-runner.ts  # PlaywrightRunner class
│   │   └── action-executor.ts    # executeAction/executeActions
│   ├── api/                      # Backend API handlers
│   ├── dashboard/                # React UI (40+ components, hooks, contexts, pages)
│   └── cli/                      # CLI command handlers
├── bin/cli.js                    # CLI entry point
├── scripts/generate-actions.ts   # Playwright action generator
└── .tsty/                        # Test data (self-testing)
```

## Key Classes
- `FileManager` — .tsty/ file operations
- `PlaywrightRunner` — Flow execution with dependency resolution
- `DependencyValidator` — Circular dependency detection
