/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ClientApp } from './client/ClientApp';
import { CrmApp } from './crm/CrmApp';
import { ShieldCheck, Smartphone } from 'lucide-react';

type AppPortalMode = 'client' | 'crm';

export default function App() {
  const [portalMode, setPortalMode] = useState<AppPortalMode>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'crm') return 'crm';
    const saved = localStorage.getItem('pakinvest_portal_mode');
    return (saved as AppPortalMode) || 'client';
  });

  const handleSwitchMode = (mode: AppPortalMode) => {
    setPortalMode(mode);
    localStorage.setItem('pakinvest_portal_mode', mode);
  };

  return (
    <AppProvider>
      {/* Dynamic Portal Environment */}
      {portalMode === 'crm' ? (
        <CrmApp onSwitchToClient={() => handleSwitchMode('client')} />
      ) : (
        <ClientApp />
      )}

      {/* Floating Team Operations Switcher (Available during web preview) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={() => handleSwitchMode(portalMode === 'client' ? 'crm' : 'client')}
          className={`px-3.5 py-2 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border ${
            portalMode === 'client'
              ? 'bg-slate-900/90 hover:bg-slate-900 text-amber-300 border-amber-500/40 backdrop-blur-md shadow-amber-950/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-950/40'
          }`}
          title={portalMode === 'client' ? 'Open Management CRM' : 'Open Client App Preview'}
        >
          {portalMode === 'client' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Team CRM</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-white" />
              <span>Client App</span>
            </>
          )}
        </button>
      </div>
    </AppProvider>
  );
}
