/**
 * API exports for Next.js route handlers
 *
 * Usage in host project:
 *
 * // src/app/api/tsty/flows/route.ts
 * export { GET, POST, PUT, DELETE } from '@/tsty/api/flows';
 *
 * // src/app/api/tsty/actions/route.ts
 * export { GET, POST, PUT, DELETE } from '@/tsty/api/actions';
 *
 * // src/app/api/tsty/reports/route.ts
 * export { GET, DELETE } from '@/tsty/api/reports';
 *
 * // src/app/api/tsty/run/route.ts
 * export { POST } from '@/tsty/api/run';
 *
 * // src/app/api/tsty/screenshots/route.ts
 * export { GET } from '@/tsty/api/screenshots';
 */

export * as actions from "./actions";
export * as flows from "./flows";
export * as reports from "./reports";
export * as run from "./run";
export * as screenshots from "./screenshots";
