/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import { ClientApp } from './client/ClientApp';
import { CrmApp } from './crm/CrmApp';
import { CrmLogin } from './crm/CrmLogin';
import { CrmStealthGate } from './crm/CrmStealthGate';
import './crm/adminAuthSync';

function checkIsCrmRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);

  return (
    path === '/crm-control' ||
    path.startsWith('/crm-control/') ||
    hash === '#/crm-control' ||
    hash.startsWith('#/crm-control') ||
    search.get('portal') === 'crm-control'
  );
}

function checkHasAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  const adminToken = localStorage.getItem('pakinvest_admin_token');
  const crmOperator = localStorage.getItem('pakinvest_crm_operator');
  return Boolean((adminToken && adminToken.trim().length > 0) || (crmOperator && crmOperator.trim().length > 0));
}

function extractAndCheckGateAccess(): { hasAccess: boolean; gateKey: string } {
  if (typeof window === 'undefined') return { hasAccess: false, gateKey: '' };

  // Check URL query params for secret link
  const search = new URLSearchParams(window.location.search);
  const urlKey = search.get('key') || search.get('secret') || search.get('access') || search.get('token');

  if (urlKey && urlKey.trim().length > 0) {
    const key = urlKey.trim();
    sessionStorage.setItem('pakinvest_crm_gate_key', key);
    // Sanitize URL bar to remove passkey from visible address & history
    try {
      const cleanUrl = window.location.pathname + (window.location.hash ? window.location.hash : '');
      window.history.replaceState({}, document.title, cleanUrl);
    } catch {
      // Ignore
    }
    return { hasAccess: true, gateKey: key };
  }

  // Check session storage
  const storedGateKey = sessionStorage.getItem('pakinvest_crm_gate_key');
  if (storedGateKey && storedGateKey.trim().length > 0) {
    return { hasAccess: true, gateKey: storedGateKey.trim() };
  }

  // If already logged in with admin session, gate is open
  if (checkHasAdminSession()) {
    return { hasAccess: true, gateKey: '' };
  }

  return { hasAccess: false, gateKey: '' };
}

export default function App() {
  const [isCrm, setIsCrm] = useState<boolean>(checkIsCrmRoute);
  const [hasAdminAuth, setHasAdminAuth] = useState<boolean>(checkHasAdminSession);
  const [gateAccess, setGateAccess] = useState<{ hasAccess: boolean; gateKey: string }>(extractAndCheckGateAccess);

  const syncRouteAndAuth = useCallback(() => {
    setIsCrm(checkIsCrmRoute());
    setHasAdminAuth(checkHasAdminSession());
    setGateAccess(extractAndCheckGateAccess());
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncRouteAndAuth);
    window.addEventListener('hashchange', syncRouteAndAuth);
    window.addEventListener('storage', syncRouteAndAuth);

    return () => {
      window.removeEventListener('popstate', syncRouteAndAuth);
      window.removeEventListener('hashchange', syncRouteAndAuth);
      window.removeEventListener('storage', syncRouteAndAuth);
    };
  }, [syncRouteAndAuth]);

  const handleNavigateToClient = () => {
    window.history.pushState({}, '', '/');
    setIsCrm(false);
  };

  const handleGateUnlocked = (unlockedKey: string) => {
    sessionStorage.setItem('pakinvest_crm_gate_key', unlockedKey);
    setGateAccess({ hasAccess: true, gateKey: unlockedKey });
  };

  const handleAdminLoginSuccess = (_operatorName: string, _adminToken?: string) => {
    setHasAdminAuth(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('pakinvest_admin_token');
    localStorage.removeItem('pakinvest_crm_operator');
    sessionStorage.removeItem('pakinvest_crm_gate_key');
    setHasAdminAuth(false);
    setGateAccess({ hasAccess: false, gateKey: '' });
  };

  return (
    <AppProvider>
      {/* Route Protection: /crm-control isolation & stealth security */}
      {isCrm ? (
        hasAdminAuth ? (
          <CrmApp
            onSwitchToClient={handleNavigateToClient}
            onLogout={handleAdminLogout}
          />
        ) : gateAccess.hasAccess ? (
          <CrmLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToClient={handleNavigateToClient}
            initialGateKey={gateAccess.gateKey}
          />
        ) : (
          <CrmStealthGate
            onUnlock={handleGateUnlocked}
            onBackToClient={handleNavigateToClient}
          />
        )
      ) : (
        <ClientApp />
      )}
    </AppProvider>
  );
}
