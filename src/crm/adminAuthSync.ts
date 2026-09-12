// Global browser fetch interceptor for CRM administrative endpoints.
// Automatically injects admin authorization token and gate security key into requests.

let isInterceptorInstalled = false;

export function installAdminFetchInterceptor() {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.includes('/api/admin')) {
      let token = localStorage.getItem('pakinvest_admin_token');
      const crmOperator = localStorage.getItem('pakinvest_crm_operator');
      const gateKey = sessionStorage.getItem('pakinvest_crm_gate_key');

      // If operator session is active but token is absent, seed fallback token
      if (!token && crmOperator) {
        token = `adm_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        try {
          localStorage.setItem('pakinvest_admin_token', token);
        } catch {
          // ignore
        }
      }

      const headers = new Headers(init?.headers || {});
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
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
