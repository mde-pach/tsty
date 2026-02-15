# Task Completion Checklist (Updated 2026-02-14)

1. **Type check**: Run `bun run type-check`
2. **Backward compatibility**: New type fields must be optional
3. **Dark mode**: New UI components must include `dark:` classes
4. **API format**: Responses follow `{ success, data?, error? }` pattern
5. **Dependencies**: Validate circular refs with `DependencyValidator` (max depth 5)
6. **Actions**: Never manually add primitives; use `npm run generate:actions`
7. **File ops**: Always use `FileManager` class, never raw `fs`
8. **Screenshots**: Organize by run directory (`run-{flowId}-{timestamp}/`)
9. **Issue status**: Respect lifecycle: `pending → linked → testing → fixed/failed`
10. **Reference runs**: Update both flow JSON (referenceRunId) and report JSON (isReference)
