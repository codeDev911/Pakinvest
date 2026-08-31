/**
 * API Configuration Module
 * Supports configurable API Base URL via Vite environment variables:
 * - VITE_API_BASE_URL (or VITE_API_URL)
 * 
 * In standard web hosting (e.g. on Vercel), VITE_API_BASE_URL is left empty
 * to use same-origin relative URLs (`/api/...`).
 * 
 * When building the client as a standalone Android .apk or mobile application,
 * set VITE_API_BASE_URL to your hosted backend (e.g. `https://your-app.vercel.app`)
 * so all client API requests reach the live server.
 */

const rawBaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  '';

export const API_BASE_URL = rawBaseUrl ? String(rawBaseUrl).replace(/\/+$/, '') : '';

/**
 * Returns the full API URL for a given endpoint path.
 * 
 * @param path Endpoint path, e.g. '/api/auth/login'
 * @returns Fully qualified URL (if API_BASE_URL is configured) or relative path
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}
