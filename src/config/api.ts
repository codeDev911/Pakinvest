import { Capacitor } from '@capacitor/core';

/**
 * API Configuration Module
 * Automatically uses the Backend API URL baked into the application build
 * via VITE_API_BASE_URL or VITE_API_URL.
 * 
 * In standard web hosting, this can be empty to use same-origin relative URLs (/api/...).
 * In native Android builds, VITE_API_BASE_URL is provided during workflow dispatch.
 */

const envApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '';

export const isNativePlatform = Capacitor.isNativePlatform();

// Strips any trailing slashes from the API base URL
export const API_BASE_URL = envApiUrl ? String(envApiUrl).replace(/\/+$/, '') : '';

// Direct APK download URL (can be customized via VITE_ANDROID_APK_URL or defaults to /investify.apk)
const envApkUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANDROID_APK_URL) ||
  '';

export const ANDROID_APK_DOWNLOAD_URL = envApkUrl || '/investify.apk';

/**
 * Returns the configured API Base URL
 */
export function getEffectiveApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Returns the full API URL for a given endpoint path.
 * 
 * @param path Endpoint path, e.g. '/api/auth/login'
 * @returns Fully qualified URL (if base URL configured) or relative path
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}
