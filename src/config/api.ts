import { Capacitor } from '@capacitor/core';
import { getAppBaseUrl } from './appUrl';

/**
 * API Configuration Module
 * Automatically uses the Backend API URL baked into the application build
 * via VITE_API_BASE_URL or VITE_API_URL.
 * 
 * In standard web hosting, this defaults to same-origin relative URLs (/api/...).
 * In native Android APK builds, it automatically routes to the live backend server.
 */

function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/\/+$/, '');
  // If protocol is missing, default to https
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Strip duplicate trailing /api if user specified e.g. https://my-server.com/api
  if (url.endsWith('/api')) {
    url = url.slice(0, -4).replace(/\/+$/, '');
  }
  return url;
}

const defaultRemoteBackend = getAppBaseUrl();

const rawEnvApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '';

export const isNativePlatform =
  Capacitor.isNativePlatform() ||
  (typeof window !== 'undefined' &&
    (window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'file:' ||
      (window.location.hostname === 'localhost' && typeof (window as any).Capacitor !== 'undefined')));

// Normalized API base URL (e.g. "https://api.yourdomain.com")
export const API_BASE_URL = normalizeUrl(rawEnvApiUrl || (isNativePlatform ? defaultRemoteBackend : ''));

// Direct APK download URL (can be customized via VITE_ANDROID_APK_URL or defaults to /investify.apk)
const envApkUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANDROID_APK_URL) ||
  '';

export const ANDROID_APK_DOWNLOAD_URL = envApkUrl || '/investify.apk';

/**
 * Returns the configured API Base URL
 */
export function getEffectiveApiBaseUrl(): string {
  return API_BASE_URL || normalizeUrl(defaultRemoteBackend);
}

/**
 * Returns the full API URL for a given endpoint path.
 * 
 * @param path Endpoint path, e.g. '/api/auth/login'
 * @returns Fully qualified URL (if base URL configured or on native mobile) or relative path
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In native Capacitor mobile apps (Android/iOS), route to the live backend server
  if (isNativePlatform) {
    const base = API_BASE_URL || normalizeUrl(defaultRemoteBackend);
    return `${base}${normalizedPath}`;
  }

  // In web browsers (desktop, mobile web, preview iframe, Cloud Run container),
  // always use same-origin relative URLs (/api/...) so requests hit the local Express server
  // without cross-origin CORS blocks, DNS failures, or 'Failed to fetch' errors.
  return normalizedPath;
}
