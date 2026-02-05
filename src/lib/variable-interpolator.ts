/**
 * Variable Interpolation System with Faker.js
 * Supports dynamic variables in actions and flows
 *
 * Available variables:
 *
 * Basic:
 * - ${timestamp} - Current Unix timestamp
 * - ${datetime} - Current date/time (YYYY-MM-DD-HH-mm-ss)
 * - ${date} - Current date (YYYY-MM-DD)
 * - ${time} - Current time (HH-mm-ss)
 * - ${random} - Random 6-character alphanumeric string
 * - ${uuid} - Short UUID (8 characters)
 * - ${baseUrl} - From config
 * - ${credentials.email} - From config
 * - ${credentials.password} - From config
 *
 * Faker.js (data generation):
 * - ${faker.person.fullName} - Full name
 * - ${faker.person.firstName} - First name
 * - ${faker.person.lastName} - Last name
 * - ${faker.internet.email} - Email address
 * - ${faker.internet.userName} - Username
 * - ${faker.internet.password} - Password
 * - ${faker.phone.number} - Phone number
 * - ${faker.location.streetAddress} - Street address
 * - ${faker.location.city} - City
 * - ${faker.location.country} - Country
 * - ${faker.company.name} - Company name
 * - ${faker.lorem.sentence} - Random sentence
 * - ${faker.lorem.paragraph} - Random paragraph
 * - ${faker.number.int} - Random integer
 * - ${faker.string.alphanumeric(10)} - Random string with length
 * - ${faker.datatype.boolean} - Random boolean
 *
 * See full Faker.js API: https://fakerjs.dev/api/
 */

import { faker } from '@faker-js/faker';
import { randomBytes } from 'crypto';

export interface InterpolationContext {
  config?: {
    baseUrl?: string;
    credentials?: {
      email?: string;
      password?: string;
    };
  };
  customVars?: Record<string, string>;
  seed?: number; // Optional seed for reproducible Faker data
}

/**
 * Evaluate Faker expression
 * Supports nested properties like: faker.person.fullName
 * Supports method calls like: faker.string.alphanumeric(10)
 */
function evaluateFakerExpression(expression: string, seed?: number): string {
  try {
    // Set seed for reproducibility if provided
    if (seed !== undefined) {
      faker.seed(seed);
    }

    // Parse the expression (e.g., "person.fullName" or "string.alphanumeric(10)")
    const parts = expression.split('.');
    let current: any = faker;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // Check if this part has a method call
      const methodMatch = part.match(/^(\w+)\((.*)?\)$/);
      if (methodMatch) {
        const methodName = methodMatch[1];
        const argsString = methodMatch[2] || '';

        // Parse arguments
        const args = argsString ? JSON.parse(`[${argsString}]`) : [];

        // Call the method
        if (typeof current[methodName] === 'function') {
          return String(current[methodName](...args));
        } else {
          throw new Error(`Method ${methodName} not found`);
        }
      } else {
        // Navigate to property
        current = current[part];
        if (current === undefined) {
          throw new Error(`Property ${part} not found`);
        }

        // If this is the last part and it's a function, call it
        if (i === parts.length - 1 && typeof current === 'function') {
          return String(current());
        }
      }
    }

    return String(current);
  } catch (error) {
    console.warn(`Failed to evaluate faker expression "${expression}":`, error);
    return `\${faker.${expression}}`;
  }
}

/**
 * Generate dynamic variable values
 */
function generateVariableValue(varName: string, context: InterpolationContext): string {
  const now = new Date();

  // Handle Faker variables
  if (varName.startsWith('faker.')) {
    const fakerExpression = varName.slice(6); // Remove "faker." prefix
    return evaluateFakerExpression(fakerExpression, context.seed);
  }

  // Handle built-in variables
  switch (varName) {
    case 'timestamp':
      return Date.now().toString();

    case 'datetime':
      return now.toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19); // YYYY-MM-DD-HH-mm-ss

    case 'date':
      return now.toISOString().slice(0, 10); // YYYY-MM-DD

    case 'time':
      return now.toISOString()
        .slice(11, 19)
        .replace(/:/g, '-'); // HH-mm-ss

    case 'random':
      return randomBytes(3).toString('hex'); // 6-character hex

    case 'uuid':
      return randomBytes(4).toString('hex'); // 8-character hex

    case 'baseUrl':
      return context.config?.baseUrl || '';

    case 'credentials.email':
      return context.config?.credentials?.email || '';

    case 'credentials.password':
      return context.config?.credentials?.password || '';

    default:
      // Check custom variables
      if (context.customVars && varName in context.customVars) {
        return context.customVars[varName];
      }

      // Return as-is if not found (will leave ${varName} in string)
      return `\${${varName}}`;
  }
}

/**
 * Interpolate variables in a string
 * Replaces ${varName} with actual values
 */
export function interpolateString(
  str: string,
  context: InterpolationContext = {}
): string {
  if (typeof str !== 'string') {
    return str;
  }

  // Match ${variableName} patterns
  return str.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    return generateVariableValue(varName.trim(), context);
  });
}

/**
 * Recursively interpolate variables in an object
 * Walks through all string values and replaces variables
 */
export function interpolateObject<T>(
  obj: T,
  context: InterpolationContext = {}
): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return interpolateString(obj, context) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, context)) as any;
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

/**
 * Interpolate variables in an action
 * Processes all string fields in the action
 */
export function interpolateAction(
  action: any,
  context: InterpolationContext = {}
): any {
  return interpolateObject(action, context);
}

/**
 * Interpolate variables in multiple actions
 */
export function interpolateActions(
  actions: any[],
  context: InterpolationContext = {}
): any[] {
  return actions.map((action) => interpolateAction(action, context));
}

/**
 * Generate a unique ID (useful for testing)
 */
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = randomBytes(2).toString('hex');
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Get all available variable categories
 */
export function getAvailableVariables(): Record<string, string[]> {
  return {
    'Basic Variables': [
      'timestamp',
      'datetime',
      'date',
      'time',
      'random',
      'uuid',
      'baseUrl',
      'credentials.email',
      'credentials.password',
    ],
    'Person': [
      'faker.person.fullName',
      'faker.person.firstName',
      'faker.person.lastName',
      'faker.person.middleName',
      'faker.person.jobTitle',
    ],
    'Internet': [
      'faker.internet.email',
      'faker.internet.userName',
      'faker.internet.password',
      'faker.internet.url',
      'faker.internet.domainName',
    ],
    'Location': [
      'faker.location.streetAddress',
      'faker.location.city',
      'faker.location.state',
      'faker.location.country',
      'faker.location.zipCode',
    ],
    'Phone': [
      'faker.phone.number',
    ],
    'Company': [
      'faker.company.name',
      'faker.company.catchPhrase',
    ],
    'Lorem': [
      'faker.lorem.word',
      'faker.lorem.sentence',
      'faker.lorem.paragraph',
    ],
    'Number': [
      'faker.number.int',
      'faker.number.float',
    ],
    'String': [
      'faker.string.alphanumeric(10)',
      'faker.string.numeric(5)',
      'faker.string.alpha(8)',
    ],
    'Date': [
      'faker.date.recent',
      'faker.date.past',
      'faker.date.future',
    ],
  };
}

/**
 * Preview interpolation (useful for debugging)
 */
export function previewInterpolation(
  str: string,
  context: InterpolationContext = {}
): { original: string; interpolated: string; variables: string[] } {
  const variables: string[] = [];
  const regex = /\$\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(str)) !== null) {
    variables.push(match[1].trim());
  }

  return {
    original: str,
    interpolated: interpolateString(str, context),
    variables,
  };
}
