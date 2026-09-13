/**
 * Shared Error Utilities
 * Ensures objects like { code, message } are safely stringified before
 * rendering into React JSX to eliminate Minified React error #31.
 */

export function stringifyError(val: any, fallback = 'An unexpected error occurred'): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    // If it has code and message (e.g. { code: 403, message: '...' })
    if (typeof val.message === 'string' && val.message) {
      if (val.code !== undefined) {
        return `[${val.code}] ${val.message}`;
      }
      return val.message;
    }
    // If it has nested error property
    if (val.error) {
      const nested = stringifyError(val.error, '');
      if (nested) return nested;
    }
    if (typeof val.msg === 'string' && val.msg) return val.msg;
    if (typeof val.statusText === 'string' && val.statusText) return val.statusText;
    try {
      const serialized = JSON.stringify(val);
      if (serialized && serialized !== '{}') return serialized;
    } catch {
      // ignore
    }
  }
  return fallback;
}
