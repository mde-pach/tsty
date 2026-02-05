/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from Playwright's Page API
 * Run 'npm run generate:actions' to regenerate
 */

// ============================================================================
// Base Action Type
// ============================================================================

export type ActionType =
  | 'goto'
  | 'goBack'
  | 'goForward'
  | 'reload'
  | 'click'
  | 'dblclick'
  | 'hover'
  | 'dragAndDrop'
  | 'tap'
  | 'type'
  | 'fill'
  | 'press'
  | 'check'
  | 'uncheck'
  | 'selectOption'
  | 'setInputFiles'
  | 'focus'
  | 'blur'
  | 'dispatchEvent'
  | 'waitForLoadState'
  | 'waitForTimeout'
  | 'waitForSelector'
  | 'waitForFunction'
  | 'waitForURL'
  | 'waitForEvent'
  | 'screenshot'
  | 'content'
  | 'title'
  | 'url'
  | 'evaluate'
  | 'evaluateHandle'
  | 'locator'
  | 'getByRole'
  | 'getByText'
  | 'getByLabel'
  | 'getByPlaceholder'
  | 'getByAltText'
  | 'getByTitle'
  | 'getByTestId'
  | 'setViewportSize'
  | 'viewportSize'
  | 'bringToFront'
  | 'close'
  | 'pdf'
  | 'pause'
  | 'setExtraHTTPHeaders'
  | 'setContent'
  | 'mouse';

export interface BaseAction {
  type: ActionType;
  description?: string;
}

// ============================================================================
// Generated Action Interfaces
// ============================================================================

export interface GotoAction extends BaseAction {
  type: 'goto';
  url: string;
  options?: Record<string, any>;
}

export interface GoBackAction extends BaseAction {
  type: 'goBack';
  options?: Record<string, any>;
}

export interface GoForwardAction extends BaseAction {
  type: 'goForward';
  options?: Record<string, any>;
}

export interface ReloadAction extends BaseAction {
  type: 'reload';
  options?: Record<string, any>;
}

export interface ClickAction extends BaseAction {
  type: 'click';
  selector: string;
  options?: Record<string, any>;
}

export interface DblclickAction extends BaseAction {
  type: 'dblclick';
  selector: string;
  options?: Record<string, any>;
}

export interface HoverAction extends BaseAction {
  type: 'hover';
  selector: string;
  options?: Record<string, any>;
}

export interface DragAndDropAction extends BaseAction {
  type: 'dragAndDrop';
  source: any;
  target: any;
  options?: Record<string, any>;
}

export interface TapAction extends BaseAction {
  type: 'tap';
  selector: string;
  options?: Record<string, any>;
}

export interface TypeAction extends BaseAction {
  type: 'type';
  selector: string;
  text: string;
  options?: Record<string, any>;
}

export interface FillAction extends BaseAction {
  type: 'fill';
  selector: string;
  value: string | string[];
  options?: Record<string, any>;
}

export interface PressAction extends BaseAction {
  type: 'press';
  selector: string;
  key: string;
  options?: Record<string, any>;
}

export interface CheckAction extends BaseAction {
  type: 'check';
  selector: string;
  options?: Record<string, any>;
}

export interface UncheckAction extends BaseAction {
  type: 'uncheck';
  selector: string;
  options?: Record<string, any>;
}

export interface SelectOptionAction extends BaseAction {
  type: 'selectOption';
  selector: string;
  values: string | string[];
  options?: Record<string, any>;
}

export interface SetInputFilesAction extends BaseAction {
  type: 'setInputFiles';
  selector: string;
  files: any;
  options?: Record<string, any>;
}

export interface FocusAction extends BaseAction {
  type: 'focus';
  selector: string;
  options?: Record<string, any>;
}

export interface BlurAction extends BaseAction {
  type: 'blur';
  selector: string;
}

export interface DispatchEventAction extends BaseAction {
  type: 'dispatchEvent';
  selector: string;
  type: any;
  eventInit: any;
  options?: Record<string, any>;
}

export interface WaitForLoadStateAction extends BaseAction {
  type: 'waitForLoadState';
  state: 'load' | 'domcontentloaded' | 'networkidle';
  options?: Record<string, any>;
}

export interface WaitForTimeoutAction extends BaseAction {
  type: 'waitForTimeout';
  timeout: number;
}

export interface WaitForSelectorAction extends BaseAction {
  type: 'waitForSelector';
  selector: string;
  options?: Record<string, any>;
}

export interface WaitForFunctionAction extends BaseAction {
  type: 'waitForFunction';
  pageFunction: string | Function;
  arg: any;
  options?: Record<string, any>;
}

export interface WaitForURLAction extends BaseAction {
  type: 'waitForURL';
  url: string;
  options?: Record<string, any>;
}

export interface WaitForEventAction extends BaseAction {
  type: 'waitForEvent';
  event: any;
  optionsOrPredicate: any;
}

export interface ScreenshotAction extends BaseAction {
  type: 'screenshot';
  options?: Record<string, any>;
}

export interface ContentAction extends BaseAction {
  type: 'content';

}

export interface TitleAction extends BaseAction {
  type: 'title';

}

export interface UrlAction extends BaseAction {
  type: 'url';

}

export interface EvaluateAction extends BaseAction {
  type: 'evaluate';
  pageFunction: string | Function;
  arg: any;
}

export interface EvaluateHandleAction extends BaseAction {
  type: 'evaluateHandle';
  pageFunction: string | Function;
  arg: any;
}

export interface LocatorAction extends BaseAction {
  type: 'locator';
  selector: string;
  options?: Record<string, any>;
}

export interface GetByRoleAction extends BaseAction {
  type: 'getByRole';
  role: any;
  options?: Record<string, any>;
}

export interface GetByTextAction extends BaseAction {
  type: 'getByText';
  text: string;
  options?: Record<string, any>;
}

export interface GetByLabelAction extends BaseAction {
  type: 'getByLabel';
  text: string;
  options?: Record<string, any>;
}

export interface GetByPlaceholderAction extends BaseAction {
  type: 'getByPlaceholder';
  text: string;
  options?: Record<string, any>;
}

export interface GetByAltTextAction extends BaseAction {
  type: 'getByAltText';
  text: string;
  options?: Record<string, any>;
}

export interface GetByTitleAction extends BaseAction {
  type: 'getByTitle';
  text: string;
  options?: Record<string, any>;
}

export interface GetByTestIdAction extends BaseAction {
  type: 'getByTestId';
  testId: any;
}

export interface SetViewportSizeAction extends BaseAction {
  type: 'setViewportSize';
  viewportSize: any;
}

export interface ViewportSizeAction extends BaseAction {
  type: 'viewportSize';

}

export interface BringToFrontAction extends BaseAction {
  type: 'bringToFront';

}

export interface CloseAction extends BaseAction {
  type: 'close';
  options?: Record<string, any>;
}

export interface PdfAction extends BaseAction {
  type: 'pdf';
  options?: Record<string, any>;
}

export interface PauseAction extends BaseAction {
  type: 'pause';

}

export interface SetExtraHTTPHeadersAction extends BaseAction {
  type: 'setExtraHTTPHeaders';
  headers: any;
}

export interface SetContentAction extends BaseAction {
  type: 'setContent';
  html: any;
  options?: Record<string, any>;
}

export interface MouseAction extends BaseAction {
  type: 'mouse';

}

// ============================================================================
// Action Union Type
// ============================================================================

export type Action =
  | GotoAction
  | GoBackAction
  | GoForwardAction
  | ReloadAction
  | ClickAction
  | DblclickAction
  | HoverAction
  | DragAndDropAction
  | TapAction
  | TypeAction
  | FillAction
  | PressAction
  | CheckAction
  | UncheckAction
  | SelectOptionAction
  | SetInputFilesAction
  | FocusAction
  | BlurAction
  | DispatchEventAction
  | WaitForLoadStateAction
  | WaitForTimeoutAction
  | WaitForSelectorAction
  | WaitForFunctionAction
  | WaitForURLAction
  | WaitForEventAction
  | ScreenshotAction
  | ContentAction
  | TitleAction
  | UrlAction
  | EvaluateAction
  | EvaluateHandleAction
  | LocatorAction
  | GetByRoleAction
  | GetByTextAction
  | GetByLabelAction
  | GetByPlaceholderAction
  | GetByAltTextAction
  | GetByTitleAction
  | GetByTestIdAction
  | SetViewportSizeAction
  | ViewportSizeAction
  | BringToFrontAction
  | CloseAction
  | PdfAction
  | PauseAction
  | SetExtraHTTPHeadersAction
  | SetContentAction
  | MouseAction;

// ============================================================================
// Method Categories (for discoverability)
// ============================================================================

export const ACTION_CATEGORIES = {
  "navigation": [
    "goto",
    "goBack",
    "goForward",
    "reload"
  ],
  "mouse": [
    "click",
    "dblclick",
    "hover",
    "dragAndDrop",
    "tap"
  ],
  "keyboard": [
    "type",
    "fill",
    "press"
  ],
  "form": [
    "check",
    "uncheck",
    "selectOption",
    "setInputFiles"
  ],
  "element": [
    "focus",
    "blur",
    "dispatchEvent"
  ],
  "waiting": [
    "waitForLoadState",
    "waitForTimeout",
    "waitForSelector",
    "waitForFunction",
    "waitForURL",
    "waitForEvent"
  ],
  "screenshot": [
    "screenshot"
  ],
  "content": [
    "content",
    "title",
    "url"
  ],
  "evaluation": [
    "evaluate",
    "evaluateHandle"
  ],
  "locator": [
    "locator",
    "getByRole",
    "getByText",
    "getByLabel",
    "getByPlaceholder",
    "getByAltText",
    "getByTitle",
    "getByTestId"
  ],
  "viewport": [
    "setViewportSize",
    "viewportSize"
  ],
  "misc": [
    "bringToFront",
    "close",
    "pdf",
    "pause",
    "setExtraHTTPHeaders",
    "setContent"
  ],
  "scroll": [
    "mouse"
  ]
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getActionCategory(actionType: ActionType): string {
  for (const [category, methods] of Object.entries(ACTION_CATEGORIES)) {
    if ((methods as string[]).includes(actionType)) {
      return category;
    }
  }
  return 'misc';
}

export function getMethodsByCategory(category: string): string[] {
  return ACTION_CATEGORIES[category as keyof typeof ACTION_CATEGORIES] || [];
}

export function getAllMethods(): string[] {
  return Object.keys({"goto":{"category":"navigation","args":["url","options"]},"goBack":{"category":"navigation","args":["options"]},"goForward":{"category":"navigation","args":["options"]},"reload":{"category":"navigation","args":["options"]},"click":{"category":"mouse","args":["selector","options"]},"dblclick":{"category":"mouse","args":["selector","options"]},"hover":{"category":"mouse","args":["selector","options"]},"dragAndDrop":{"category":"mouse","args":["source","target","options"]},"tap":{"category":"mouse","args":["selector","options"]},"type":{"category":"keyboard","args":["selector","text","options"]},"fill":{"category":"keyboard","args":["selector","value","options"]},"press":{"category":"keyboard","args":["selector","key","options"]},"check":{"category":"form","args":["selector","options"]},"uncheck":{"category":"form","args":["selector","options"]},"selectOption":{"category":"form","args":["selector","values","options"]},"setInputFiles":{"category":"form","args":["selector","files","options"]},"focus":{"category":"element","args":["selector","options"]},"blur":{"category":"element","args":["selector"]},"dispatchEvent":{"category":"element","args":["selector","type","eventInit","options"]},"waitForLoadState":{"category":"waiting","args":["state","options"]},"waitForTimeout":{"category":"waiting","args":["timeout"]},"waitForSelector":{"category":"waiting","args":["selector","options"]},"waitForFunction":{"category":"waiting","args":["pageFunction","arg","options"]},"waitForURL":{"category":"waiting","args":["url","options"]},"waitForEvent":{"category":"waiting","args":["event","optionsOrPredicate"]},"screenshot":{"category":"screenshot","args":["options"]},"content":{"category":"content","args":[]},"title":{"category":"content","args":[]},"url":{"category":"content","args":[]},"evaluate":{"category":"evaluation","args":["pageFunction","arg"]},"evaluateHandle":{"category":"evaluation","args":["pageFunction","arg"]},"locator":{"category":"locator","args":["selector","options"]},"getByRole":{"category":"locator","args":["role","options"]},"getByText":{"category":"locator","args":["text","options"]},"getByLabel":{"category":"locator","args":["text","options"]},"getByPlaceholder":{"category":"locator","args":["text","options"]},"getByAltText":{"category":"locator","args":["text","options"]},"getByTitle":{"category":"locator","args":["text","options"]},"getByTestId":{"category":"locator","args":["testId"]},"setViewportSize":{"category":"viewport","args":["viewportSize"]},"viewportSize":{"category":"viewport","args":[]},"bringToFront":{"category":"misc","args":[]},"close":{"category":"misc","args":["options"]},"pdf":{"category":"misc","args":["options"]},"pause":{"category":"misc","args":[]},"setExtraHTTPHeaders":{"category":"misc","args":["headers"]},"setContent":{"category":"misc","args":["html","options"]},"mouse":{"category":"scroll","args":[]}});
}
