/**
 * Safe Fetch & JSON Parsing Utility
 * Prevents "Unexpected token '<', 'A server e'... is not valid JSON" errors
 * by validating response content-types, catching non-JSON server responses (HTML, 500, 502, 503),
 * and returning typed, human-friendly error messages.
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

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    let parsed: any = null;
    const isJsonLikely =
      contentType.includes('application/json') ||
      (text.trim().startsWith('{') && text.trim().endsWith('}')) ||
      (text.trim().startsWith('[') && text.trim().endsWith(']'));

    if (isJsonLikely) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    if (res.ok) {
      if (parsed !== null) {
        return { ok: true, status: res.status, data: parsed };
      }
      return { ok: true, status: res.status, data: text as any };
    }

    // Response is HTTP 4xx or 5xx
    let errorMsg = '';
    if (parsed && typeof parsed === 'object') {
      if (typeof parsed.error === 'string') {
        errorMsg = parsed.error;
      } else if (parsed.error && typeof parsed.error === 'object') {
        errorMsg = stringifyError(parsed.error);
      } else if (typeof parsed.message === 'string') {
        errorMsg = parsed.message;
      } else if (parsed.message && typeof parsed.message === 'object') {
        errorMsg = stringifyError(parsed.message);
      } else {
        errorMsg = stringifyError(parsed);
      }
    }

    if (!errorMsg) {
      const cleanText = text.trim();
      if (cleanText.length > 0 && cleanText.length < 180 && !cleanText.includes('<html') && !cleanText.includes('<!DOCTYPE')) {
        errorMsg = cleanText;
      } else if (res.status === 401) {
        errorMsg = 'Unauthorized: Admin session expired or master key missing. Please log in or verify credentials.';
      } else if (res.status === 403) {
        errorMsg = 'Access Forbidden: Insufficient administrative privileges.';
      } else if (res.status === 404) {
        errorMsg = 'The requested endpoint was not found on the server (404).';
      } else if (res.status >= 500) {
        errorMsg = `Server error (${res.status}): The server encountered a temporary issue. Please try again.`;
      } else {
        errorMsg = `Request failed with status ${res.status}: ${res.statusText || 'Unknown error'}`;
      }
    }

    return { ok: false, status: res.status, data: parsed, error: errorMsg };
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: stringifyError(netErr, 'Network connection error. Please verify server connectivity.'),
    };
  }
}

export async function safeParseResponse<T = any>(
  res: Response
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }

    if (res.ok && json) {
      return { success: json.success !== false, data: json, error: stringifyError(json.error, '') };
    }

    let err = '';
    if (json?.error) {
      err = stringifyError(json.error);
    } else if (json?.message) {
      err = stringifyError(json.message);
    } else if (text.length < 180 && !text.includes('<html') && !text.includes('<!DOCTYPE')) {
      err = text.trim();
    } else {
      err = `Server error (${res.status}): ${res.statusText}`;
    }
    return { success: false, error: err };
  } catch (err: any) {
    return { success: false, error: stringifyError(err, 'Error processing server response') };
  }
}
