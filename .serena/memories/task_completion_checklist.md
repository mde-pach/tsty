# Task Completion Checklist

1. **Type check**: Run `bun run type-check`
2. **Backward compatibility**: New type fields must be optional
3. **Dark mode**: New UI components must include `dark:` classes
4. **API format**: Responses follow `{ success, data?, error? }` pattern
5. **Dependencies**: Validate circular refs with `DependencyValidator` (max depth 5)
6. **Actions**: Never manually add primitives; use `npm run generate:actions`
7. **File ops**: Always use `FileManager` class, never raw `fs`
