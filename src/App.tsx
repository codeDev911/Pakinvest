/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import { ClientApp } from './client/ClientApp';
import { CrmApp } from './crm/CrmApp';
import { CrmLogin } from './crm/CrmLogin';

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

export default function App() {
  const [isCrm, setIsCrm] = useState<boolean>(checkIsCrmRoute);
  const [hasAdminAuth, setHasAdminAuth] = useState<boolean>(checkHasAdminSession);

  const syncRouteAndAuth = useCallback(() => {
    setIsCrm(checkIsCrmRoute());
    setHasAdminAuth(checkHasAdminSession());
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

  const handleAdminLoginSuccess = (_operatorName: string, _adminToken?: string) => {
    setHasAdminAuth(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('pakinvest_admin_token');
    localStorage.removeItem('pakinvest_crm_operator');
    setHasAdminAuth(false);
  };

  return (
    <AppProvider>
      {/* Route Protection: /crm-control isolation & dedicated CRM authentication */}
      {isCrm ? (
        hasAdminAuth ? (
          <CrmApp
            onSwitchToClient={handleNavigateToClient}
            onLogout={handleAdminLogout}
          />
        ) : (
          <CrmLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToClient={handleNavigateToClient}
          />
        )
      ) : (
        <ClientApp />
      )}
    </AppProvider>
  );
}

