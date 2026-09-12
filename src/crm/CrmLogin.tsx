import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, UserCheck, KeyRound, Smartphone, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { getApiUrl } from '../config/api';

interface CrmLoginProps {
  onLoginSuccess: (adminName: string, adminToken?: string) => void;
  onBackToClient?: () => void;
  initialGateKey?: string;
}

export const CrmLogin: React.FC<CrmLoginProps> = ({ onLoginSuccess, onBackToClient, initialGateKey }) => {
  const [authMode, setAuthMode] = useState<'passkey' | 'totp'>('passkey');
  const [operatorName, setOperatorName] = useState('Operations Manager');
  const [passkey, setPasskey] = useState(() => {
    return initialGateKey || (typeof window !== 'undefined' ? sessionStorage.getItem('pakinvest_crm_gate_key') || '' : '');
  });
  const [totpCode, setTotpCode] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialGateKey) {
      setPasskey(initialGateKey);
    }
  }, [initialGateKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const credential = authMode === 'passkey' ? passkey.trim() : totpCode.trim();
    if (!credential) {
      setError(authMode === 'passkey' ? 'Please provide the Master Secret Passkey.' : 'Please enter the 6-digit Google Authenticator code.');
      return;
    }

    if (authMode === 'totp' && !/^\d{6}$/.test(credential)) {
      setError('Google Authenticator code must be exactly 6 digits.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/admin/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorName: operatorName.trim(),
          passkeyOrTotp: credential,
        }),
      });

      const data = await res.json();

      if (data?.success && data?.token) {
        localStorage.setItem('pakinvest_admin_token', data.token);
        localStorage.setItem('pakinvest_crm_operator', data.operatorName || operatorName);
        if (passkey) {
          sessionStorage.setItem('pakinvest_crm_gate_key', passkey.trim());
        }
        onLoginSuccess(data.operatorName || operatorName, data.token);
      } else {
        setError(data?.error || 'Authentication failed. Please verify your team credentials or Google Authenticator.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server connection error during authorization. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {onBackToClient && (
          <button
            type="button"
            onClick={onBackToClient}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Investor Portal</span>
          </button>
        )}

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-emerald-600/30 border border-emerald-500/30 flex items-center justify-center mx-auto bg-emerald-600">
            <img src="/logo.png" alt="Investify" className="w-full h-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Operations Terminal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Investify Operations CRM
          </h1>
          <p className="text-xs text-slate-400">
            Restricted Management Portal • Identity & Cryptographic Verification
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Mode Switch */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('passkey');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'passkey'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Master Passkey</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('totp');
              setError('');
            }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'totp'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Authenticator</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Operator Identifier / Role</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="e.g. Finance Operations Lead"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {authMode === 'passkey' ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">Long Team Passkey / Secret Link</label>
                <span className="text-[10px] text-slate-400">Copy-paste token</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPasskey ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Paste crm_sec_... or full secret link"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                A high-entropy secret token provided to management team members.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">Google Authenticator (2FA)</label>
                <span className="text-[10px] text-emerald-400">RFC 6238 TOTP</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-lg tracking-widest font-mono text-center placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Enter the dynamic 6-digit code currently shown in your Google Authenticator app.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Verifying Security Credentials...' : 'Authenticate & Launch CRM'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500">
            Internal Operations System • All authorization attempts are logged and protected.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
