/**
 * App Version Configuration
 * 
 * - APP_VERSION: Injected during build time via VITE_APP_VERSION from .env or CI/CD workflow.
 * - Single source of truth for application version across all screens.
 */

export const APP_VERSION = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_VERSION) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_VERSION) ||
  '1.0'
)
  .toString()
  .trim()
  .replace(/^v/i, '');

export function getInstalledAppVersion(): string {
  return APP_VERSION;
}

/**
 * Compare two semver strings: e.g. '1.3' vs '1.2.3'
 * returns > 0 if v1 > v2
 * returns < 0 if v1 < v2
 * returns 0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = (v1 || '').replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);
  const parts2 = (v2 || '').replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);
  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}
