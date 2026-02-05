import { Page } from '@playwright/test';
import { Action, ActionType } from '../lib/types';
import { interpolateAction, InterpolationContext } from '../lib/variable-interpolator';

/**
 * Execute a single action on a Playwright page
 * Uses dynamic method invocation to support all Playwright Page methods
 */
export async function executeAction(
  page: Page,
  action: Action,
  context: InterpolationContext = {}
): Promise<void> {
  // Interpolate variables in the action
  const interpolatedAction = interpolateAction(action, context);
  const actionType = interpolatedAction.type;

  // Special handling for screenshot (handled by runner)
  if (actionType === 'screenshot') {
    return;
  }

  // Check if the method exists on Page
  const pageMethod = (page as any)[actionType];
  if (typeof pageMethod !== 'function') {
    throw new Error(`Unknown or unsupported action type: ${actionType}`);
  }

  // Build arguments array from action properties
  const args = buildMethodArgs(interpolatedAction);

  // Call the Playwright method dynamically
  try {
    await pageMethod.apply(page, args);
  } catch (error) {
    throw new Error(
      `Failed to execute action "${actionType}": ${(error as Error).message}`
    );
  }
}

/**
 * Build method arguments from action properties
 * Converts action object properties into positional arguments for Playwright methods
 */
function buildMethodArgs(action: Action): any[] {
  const args: any[] = [];
  const actionType = action.type;

  // Map action properties to positional arguments based on action type
  // The order matters - it must match Playwright's method signature

  switch (actionType) {
    // Navigation: (url, options?)
    case 'goto':
      args.push((action as any).url, (action as any).options);
      break;

    // Navigation: (options?)
    case 'goBack':
    case 'goForward':
    case 'reload':
      args.push((action as any).options);
      break;

    // Mouse: (selector, options?)
    case 'click':
    case 'dblclick':
    case 'hover':
    case 'tap':
    case 'focus':
      args.push((action as any).selector, (action as any).options);
      break;

    // Mouse: (source, target, options?)
    case 'dragAndDrop':
      args.push(
        (action as any).source,
        (action as any).target,
        (action as any).options
      );
      break;

    // Keyboard: (selector, text, options?)
    case 'type':
      args.push(
        (action as any).selector,
        (action as any).text,
        (action as any).options
      );
      break;

    // Keyboard: (selector, value, options?)
    case 'fill':
      args.push(
        (action as any).selector,
        (action as any).value,
        (action as any).options
      );
      break;

    // Keyboard: (selector, key, options?)
    case 'press':
      args.push(
        (action as any).selector,
        (action as any).key,
        (action as any).options
      );
      break;

    // Form: (selector, options?)
    case 'check':
    case 'uncheck':
      args.push((action as any).selector, (action as any).options);
      break;

    // Form: (selector, values, options?)
    case 'selectOption':
      args.push(
        (action as any).selector,
        (action as any).values,
        (action as any).options
      );
      break;

    // Form: (selector, files, options?)
    case 'setInputFiles':
      args.push(
        (action as any).selector,
        (action as any).files,
        (action as any).options
      );
      break;

    // Element: (selector)
    case 'blur':
      args.push((action as any).selector);
      break;

    // Element: (selector, type, eventInit?, options?)
    case 'dispatchEvent':
      args.push(
        (action as any).selector,
        (action as any).type,
        (action as any).eventInit,
        (action as any).options
      );
      break;

    // Waiting: (state?, options?)
    case 'waitForLoadState':
      args.push((action as any).state, (action as any).options);
      break;

    // Waiting: (timeout)
    case 'waitForTimeout':
      args.push((action as any).timeout);
      break;

    // Waiting: (selector, options?)
    case 'waitForSelector':
      args.push((action as any).selector, (action as any).options);
      break;

    // Waiting: (pageFunction, arg?, options?)
    case 'waitForFunction':
      args.push(
        (action as any).pageFunction,
        (action as any).arg,
        (action as any).options
      );
      break;

    // Waiting: (url, options?)
    case 'waitForURL':
      args.push((action as any).url, (action as any).options);
      break;

    // Waiting: (event, optionsOrPredicate?)
    case 'waitForEvent':
      args.push((action as any).event, (action as any).optionsOrPredicate);
      break;

    // Screenshot: (options?)
    case 'screenshot':
      args.push((action as any).options);
      break;

    // Content: no args
    case 'content':
    case 'title':
    case 'url':
    case 'viewportSize':
    case 'bringToFront':
    case 'pause':
    case 'mouse':
      // No arguments needed
      break;

    // Evaluation: (pageFunction, arg?)
    case 'evaluate':
    case 'evaluateHandle':
      args.push((action as any).pageFunction, (action as any).arg);
      break;

    // Locators: (selector, options?)
    case 'locator':
      args.push((action as any).selector, (action as any).options);
      break;

    // Locators: (role, options?)
    case 'getByRole':
      args.push((action as any).role, (action as any).options);
      break;

    // Locators: (text, options?)
    case 'getByText':
    case 'getByLabel':
    case 'getByPlaceholder':
    case 'getByAltText':
    case 'getByTitle':
      args.push((action as any).text, (action as any).options);
      break;

    // Locators: (testId)
    case 'getByTestId':
      args.push((action as any).testId);
      break;

    // Viewport: (viewportSize)
    case 'setViewportSize':
      args.push((action as any).viewportSize);
      break;

    // Misc: (options?)
    case 'close':
    case 'pdf':
      args.push((action as any).options);
      break;

    // Misc: (headers)
    case 'setExtraHTTPHeaders':
      args.push((action as any).headers);
      break;

    // Misc: (html, options?)
    case 'setContent':
      args.push((action as any).html, (action as any).options);
      break;

    default:
      // Fallback: try to extract common properties
      // This handles any future actions not explicitly mapped
      const commonProps = ['selector', 'url', 'text', 'value', 'options'];
      for (const prop of commonProps) {
        if (prop in action && (action as any)[prop] !== undefined) {
          args.push((action as any)[prop]);
        }
      }
  }

  // Filter out undefined values from the end
  while (args.length > 0 && args[args.length - 1] === undefined) {
    args.pop();
  }

  return args;
}

/**
 * Execute a sequence of actions
 */
export async function executeActions(
  page: Page,
  actions: Action[],
  context: InterpolationContext = {}
): Promise<void> {
  for (const action of actions) {
    await executeAction(page, action, context);
  }
}
