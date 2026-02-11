/**
 * Core type definitions for Tsty
 * Based on .tsty format
 */

// ============================================================================
// Primitives (Auto-generated from Playwright API)
// ============================================================================

/**
 * Primitives are the 48 framework-provided Playwright operations.
 * These are the building blocks for creating Actions.
 *
 * Examples: click, fill, type, goto, waitForSelector
 *
 * DO NOT create .action.json files for single primitives.
 * Primitives should be composed into Actions (user behaviors).
 */

// Re-export all generated primitive types from Playwright API
export type {
  ActionType as PrimitiveType,
  BaseAction as BasePrimitive,
  Action as Primitive,
  // Generated primitive interfaces (48 total)
  GotoAction as GotoPrimitive,
  GoBackAction as GoBackPrimitive,
  GoForwardAction as GoForwardPrimitive,
  ReloadAction as ReloadPrimitive,
  ClickAction as ClickPrimitive,
  DblclickAction as DblclickPrimitive,
  HoverAction as HoverPrimitive,
  DragAndDropAction as DragAndDropPrimitive,
  TapAction as TapPrimitive,
  TypeAction as TypePrimitive,
  FillAction as FillPrimitive,
  PressAction as PressPrimitive,
  CheckAction as CheckPrimitive,
  UncheckAction as UncheckPrimitive,
  SelectOptionAction as SelectOptionPrimitive,
  SetInputFilesAction as SetInputFilesPrimitive,
  FocusAction as FocusPrimitive,
  BlurAction as BlurPrimitive,
  DispatchEventAction as DispatchEventPrimitive,
  WaitForLoadStateAction as WaitForLoadStatePrimitive,
  WaitForTimeoutAction as WaitForTimeoutPrimitive,
  WaitForSelectorAction as WaitForSelectorPrimitive,
  WaitForFunctionAction as WaitForFunctionPrimitive,
  WaitForURLAction as WaitForURLPrimitive,
  WaitForEventAction as WaitForEventPrimitive,
  ScreenshotAction as ScreenshotPrimitive,
  ContentAction as ContentPrimitive,
  TitleAction as TitlePrimitive,
  UrlAction as UrlPrimitive,
  EvaluateAction as EvaluatePrimitive,
  EvaluateHandleAction as EvaluateHandlePrimitive,
  LocatorAction as LocatorPrimitive,
  GetByRoleAction as GetByRolePrimitive,
  GetByTextAction as GetByTextPrimitive,
  GetByLabelAction as GetByLabelPrimitive,
  GetByPlaceholderAction as GetByPlaceholderPrimitive,
  GetByAltTextAction as GetByAltTextPrimitive,
  GetByTitleAction as GetByTitlePrimitive,
  GetByTestIdAction as GetByTestIdPrimitive,
  SetViewportSizeAction as SetViewportSizePrimitive,
  ViewportSizeAction as ViewportSizePrimitive,
  BringToFrontAction as BringToFrontPrimitive,
  CloseAction as ClosePrimitive,
  PdfAction as PdfPrimitive,
  PauseAction as PausePrimitive,
  SetExtraHTTPHeadersAction as SetExtraHTTPHeadersPrimitive,
  SetContentAction as SetContentPrimitive,
  MouseAction as MousePrimitive,
} from './generated-actions';

export {
  ACTION_CATEGORIES as PRIMITIVE_CATEGORIES,
  getActionCategory as getPrimitiveCategory,
  getMethodsByCategory as getPrimitivesByCategory,
  getAllMethods as getAllPrimitives,
} from './generated-actions';

// Re-export original names for backward compatibility in generated-actions.ts
export type { Action, ActionType } from './generated-actions';

// ============================================================================
// Action Definition (Reusable user behavior)
// ============================================================================

/**
 * Actions are user-centered behaviors composed of primitives.
 *
 * Examples: login, checkout, add-to-cart, create-post
 *
 * Actions should:
 * - Represent complete user tasks/journeys
 * - Be reusable across multiple flows
 * - Be named from user perspective (login, not fill-login-form)
 * - Compose multiple primitives into meaningful behavior
 *
 * Stored in: .tsty/actions/*.action.json
 */
export interface ActionDefinition {
  type: 'auth' | 'modal' | 'form' | 'navigation' | 'interaction' | 'data';
  description: string;
  primitives: Primitive[];  // Building blocks that compose this action
  tags?: string[]; // Optional: Tags for organization
  dependencies?: string[]; // Optional: IDs of other actions this depends on
  category?: string; // Optional: Category for organization
  metadata?: Record<string, unknown>; // Optional: Additional metadata
}

// ============================================================================
// Flow Types
// ============================================================================

export interface FlowAssertion {
  type: 'visible' | 'hidden' | 'text' | 'count' | 'value' | 'attribute' | 'url';
  selector?: string;
  expected?: string | number | boolean;
  attribute?: string;
}

export interface FlowStep {
  name: string;
  url?: string; // Optional: If omitted, stays on current page
  actions?: string[]; // References to action definition files
  primitives?: Primitive[]; // Inline primitives (alternative to actions)
  capture?: {
    screenshot?: boolean;
    html?: boolean;
    console?: boolean;
  };
  assertions?: FlowAssertion[];
  timeout?: number;
  expectedUrl?: string; // Expected URL after this step (for validation)
}

export interface Flow {
  name: string;
  description: string;
  baseUrl: string;
  steps: FlowStep[];
  devices?: ('desktop' | 'mobile')[];
  tags?: string[]; // Optional: Tags for organization
  dependencies?: string[]; // Optional: IDs of flows that must run before this one
  metadata?: Record<string, unknown>; // Optional: Additional metadata
  failFast?: boolean; // Optional: Stop execution on first failed step (default: false)
  monitorConsole?: boolean; // Optional: Monitor console for errors and stop on critical errors (default: true)
}

// ============================================================================
// Report Types
// ============================================================================

export interface AssertionResult extends FlowAssertion {
  passed: boolean;
  error?: string;
  actual?: unknown;
}

export interface ConsoleMessage {
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  text: string;
  location?: string;
  timestamp: string;
}

export interface StepResult {
  name: string;
  url: string;
  passed: boolean;
  duration?: number;
  assertions: AssertionResult[];
  screenshots: string[];
  html: string | null;
  console?: string[] | ConsoleMessage[]; // Support both legacy string[] and new structured format
  errors: string[];
  navigationFailed?: boolean; // Flag if expected URL navigation didn't occur
  consoleErrors?: number; // Count of console errors
}

export interface TestReport {
  flow: string;
  timestamp: string;
  device: 'desktop' | 'mobile';
  duration?: number;
  steps: StepResult[];
  passed: number;
  failed: number;
  totalSteps: number;
  browserInfo?: {
    name: string;
    version: string;
  };
  stoppedEarly?: boolean; // True if fail-fast stopped execution
  stopReason?: string; // Reason for early stop (e.g., "Console errors detected", "Navigation failed")
  runId?: string; // Run identifier
  screenshotDir?: string; // Screenshot directory for this run
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface Viewport {
  width: number;
  height: number;
}

export interface AuthConfig {
  email: string;
  password: string;
}

export interface TestConfig {
  credentials?: AuthConfig;
  baseUrl: string;
  viewports: {
    desktop: Viewport;
    mobile: Viewport;
  };
}

export interface TstyConfig {
  testDir: string;
  screenshotsDir: string;
  reportsDir: string;
  actionsDir: string;
  flowsDir: string;
  baseUrl: string;
  auth?: {
    loginUrl: string;
    credentials: AuthConfig;
  };
  viewports: Record<string, Viewport>;
  playwright?: {
    headless?: boolean;
    slowMo?: number;
    timeout?: number;
  };
}

// ============================================================================
// File System Types
// ============================================================================

export interface ActionFile {
  id: string;
  name: string;
  path: string;
  definition: ActionDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface FlowFile {
  id: string;
  name: string;
  path: string;
  flow: Flow;
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
  lastRunStatus?: 'passed' | 'failed';
}

export interface ReportFile {
  id: string;
  flowId: string;
  flowName: string;
  path: string;
  report: TestReport;
  createdAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Tagging System Types
// ============================================================================

export interface Tag {
  id: string;
  name: string;
  category?: string; // e.g., 'feature', 'priority', 'environment'
  color?: string; // Hex color code
  createdAt: string;
  updatedAt: string;
}

export interface TagUsage {
  tagId: string;
  flowCount: number;
  actionCount: number;
  flows: string[]; // Flow IDs
  actions: string[]; // Action IDs
}

// ============================================================================
// Page Hierarchy Types
// ============================================================================

export interface PageNode {
  path: string; // e.g., '/dashboard/settings'
  name: string; // e.g., 'Settings'
  children: PageNode[];
  flows: string[]; // Flow IDs that visit this page
}

// ============================================================================
// Smart Collections Types
// ============================================================================

export type CollectionFilterOperator =
  | 'equals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'hasTag'
  | 'hasDevice'
  | 'lastRunStatus';

export interface CollectionFilter {
  field: 'name' | 'description' | 'tags' | 'devices' | 'lastRunStatus';
  operator: CollectionFilterOperator;
  value: string | string[];
}

export interface SmartCollection {
  id: string;
  name: string;
  description?: string;
  filters: CollectionFilter[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Dependency Management Types
// ============================================================================

export interface DependencyNode {
  id: string;
  name: string;
  type: 'flow' | 'action';
  dependencies: string[]; // IDs of dependencies
  dependents: string[]; // IDs of items that depend on this one
}

export interface DependencyValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  circularPaths?: string[][]; // Circular dependency paths if detected
}

// ============================================================================
// Visual Editor Types
// ============================================================================

export interface EditorState {
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  lastSaved?: string;
}

export interface FlowEditorState extends EditorState {
  flow: Flow;
  selectedStepIndex?: number;
}

export interface ActionEditorState extends EditorState {
  definition: ActionDefinition;
  selectedActionIndex?: number;
}
