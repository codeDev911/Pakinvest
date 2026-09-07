/**
 * Application URL and Referral Link Configuration Helper
 * 
 * Provides the public production / web URL for the application, ensuring that
 * when running inside native mobile containers (Capacitor where origin is https://localhost)
 * or web browsers, invitation and sharing links use the official web domain from .env.
 */

export const getAppBaseUrl = (): string => {
  // 1. Check VITE_APP_URL from environment
  const viteAppUrl = (import.meta as any).env?.VITE_APP_URL;
  if (viteAppUrl && typeof viteAppUrl === 'string' && viteAppUrl.trim().length > 0) {
    return viteAppUrl.trim().replace(/\/+$/, '');
  }

  // 2. Check VITE_PUBLIC_URL from environment
  const vitePublicUrl = (import.meta as any).env?.VITE_PUBLIC_URL;
  if (vitePublicUrl && typeof vitePublicUrl === 'string' && vitePublicUrl.trim().length > 0) {
    return vitePublicUrl.trim().replace(/\/+$/, '');
  }

  // 3. Check VITE_API_BASE_URL (if configured as the remote server URL)
  const viteApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (
    viteApiUrl &&
    typeof viteApiUrl === 'string' &&
    viteApiUrl.trim().length > 0 &&
    !viteApiUrl.includes('localhost') &&
    !viteApiUrl.includes('127.0.0.1')
  ) {
    return viteApiUrl.trim().replace(/\/+$/, '');
  }

  // 4. Injected APP_URL from Cloud Run / container environment
  const envAppUrl = typeof process !== 'undefined' ? (process as any).env?.APP_URL : undefined;
  if (
    envAppUrl &&
    typeof envAppUrl === 'string' &&
    envAppUrl.trim().length > 0 &&
    !envAppUrl.includes('localhost') &&
    !envAppUrl.includes('127.0.0.1')
  ) {
    return envAppUrl.trim().replace(/\/+$/, '');
  }

  // 5. Browser environment: if hosted on a real domain (not localhost / capacitor)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1') &&
      !origin.includes('capacitor://')
    ) {
      return origin.replace(/\/+$/, '');
    }
  }

  // 6. Default Cloud Run deployment URL
  return 'https://ais-pre-wprzecnjv6ps2nlop6pkwv-1020468351467.asia-southeast1.run.app';
};

/**
 * Returns the full invitation signup URL for a given referral code.
 * E.g., https://your-domain.com/join?ref=PAK5957
 */
export const getReferralInviteUrl = (referralCode: string): string => {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/join?ref=${encodeURIComponent(referralCode)}`;
};
