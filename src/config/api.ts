import { Capacitor } from '@capacitor/core';

/**
 * API Configuration Module
 * Supports configurable API Base URL via Vite environment variables:
 * - VITE_API_BASE_URL (or VITE_API_URL)
 * 
 * In standard web hosting, VITE_API_BASE_URL can be left empty
 * to use same-origin relative URLs (`/api/...`).
 * 
 * When building the client as a standalone Android .apk or mobile application,
 * VITE_API_BASE_URL is loaded from env to point to your live hosted backend.
 */

const envApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '';

// Default live backend fallback if running on Android native platform without an explicit env url
const DEFAULT_FALLBACK_URL = 'https://ais-dev-wprzecnjv6ps2nlop6pkwv-1020468351467.asia-southeast1.run.app';

export const isNativePlatform = Capacitor.isNativePlatform();

export const API_BASE_URL = envApiUrl
  ? String(envApiUrl).replace(/\/+$/, '')
  : (isNativePlatform ? DEFAULT_FALLBACK_URL : '');

/**
 * Returns the full API URL for a given endpoint path.
 * 
 * @param path Endpoint path, e.g. '/api/auth/login'
 * @returns Fully qualified URL (if API_BASE_URL is configured or on native) or relative path
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}
