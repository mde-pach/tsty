/**
 * API exports for Next.js route handlers
 *
 * Usage in host project:
 *
 * // src/app/api/qa-testing/flows/route.ts
 * export { GET, POST, PUT, DELETE } from '@/qa-framework/api/flows';
 *
 * // src/app/api/qa-testing/actions/route.ts
 * export { GET, POST, PUT, DELETE } from '@/qa-framework/api/actions';
 *
 * // src/app/api/qa-testing/reports/route.ts
 * export { GET, DELETE } from '@/qa-framework/api/reports';
 *
 * // src/app/api/qa-testing/run/route.ts
 * export { POST } from '@/qa-framework/api/run';
 *
 * // src/app/api/qa-testing/screenshots/route.ts
 * export { GET } from '@/qa-framework/api/screenshots';
 */

export * as actions from "./actions";
export * as flows from "./flows";
export * as reports from "./reports";
export * as run from "./run";
export * as screenshots from "./screenshots";
