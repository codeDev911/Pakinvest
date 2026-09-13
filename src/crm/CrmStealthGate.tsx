import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, KeyRound, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../config/api';
import { safeFetchJson, stringifyError } from './utils/safeFetch';

interface CrmStealthGateProps {
  onUnlock: (gateKey: string) => void;
  onBackToClient: () => void;
}

export const CrmStealthGate: React.FC<CrmStealthGateProps> = ({ onUnlock, onBackToClient }) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [candidateKey, setCandidateKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateKey.trim()) return;

    setError('');
    setIsVerifying(true);

    try {
      let key = candidateKey.trim();
      // If full URL was pasted, parse parameter
      if (key.includes('?')) {
        try {
          const url = new URL(key, window.location.origin);
          key = url.searchParams.get('key') || url.searchParams.get('secret') || key;
        } catch {
          // Continue with raw key
        }
      }

      const res = await safeFetchJson(getApiUrl('/api/admin/auth/verify-gate-key'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (res.ok && res.data?.success && (res.data?.verified || res.data?.valid)) {
        sessionStorage.setItem('pakinvest_crm_gate_key', key);
        onUnlock(key);
      } else {
        const rawErr = res.error || res.data?.error || res.data?.message;
        setError(stringifyError(rawErr, 'Invalid security passkey or access link. Direct access rejected.'));
      }
    } catch (err: any) {
      setError(stringifyError(err, 'Verification connection failed. Please try again.'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 selection:bg-emerald-500/30">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
      >
        {/* Subtle Icon */}
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
          <ShieldAlert className="w-8 h-8 text-slate-400" />
        </div>

        {/* 404 / Restricted Message */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs font-semibold">
            HTTP 404 • Not Found
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Page Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page or route you requested does not exist or requires authorized access permissions.
          </p>
        </div>

        {/* Return Button */}
        <div>
          <button
            type="button"
            onClick={onBackToClient}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Return to Investor Portal</span>
          </button>
        </div>

        {/* Discreet Team Portal Access Area */}
        <div className="pt-4 border-t border-slate-800/70">
          {!showKeyInput ? (
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Team Internal Portal Access</span>
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleVerify}
              className="space-y-3 text-left"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  Paste Master Access Link or Key
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowKeyInput(false);
                    setError('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-400"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{stringifyError(error)}</span>
                </div>
              )}

              <input
                type="text"
                value={candidateKey}
                onChange={(e) => setCandidateKey(e.target.value)}
                placeholder="Paste secret link (e.g. ?key=...) or crm_sec_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                autoFocus
                required
              />

              <button
                type="submit"
                disabled={isVerifying || !candidateKey.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying Key...' : 'Unlock CRM Portal'}
              </button>
              <p className="text-[10px] text-slate-500 text-center">
                Access is monitored and restricted strictly to authorized operations management.
              </p>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
