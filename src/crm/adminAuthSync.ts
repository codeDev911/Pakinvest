// Global browser fetch interceptor for CRM administrative endpoints.
// Automatically injects admin authorization token and gate security key into requests.

let isInterceptorInstalled = false;

export function installAdminFetchInterceptor() {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes('/api/admin')) {
      const token = localStorage.getItem('pakinvest_admin_token');
      const gateKey = sessionStorage.getItem('pakinvest_crm_gate_key');

      const headers = new Headers(init?.headers || {});
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (gateKey && !headers.has('x-crm-key')) {
        headers.set('x-crm-key', gateKey);
      }

      return originalFetch(input, { ...init, headers });
    }

    return originalFetch(input, init);
  };

  isInterceptorInstalled = true;
}

// Auto-run on import
installAdminFetchInterceptor();
