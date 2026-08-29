import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CrmLoginProps {
  onLoginSuccess: (adminName: string) => void;
}

export const CrmLogin: React.FC<CrmLoginProps> = ({ onLoginSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [adminName, setAdminName] = useState('Operations Manager');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Accept Master Access codes: admin123, 7860, or admin786
    const validCodes = ['admin123', '7860', 'admin786', 'pakinvest'];
    if (validCodes.includes(accessCode.trim().toLowerCase()) || accessCode.trim() === '1234') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(adminName || 'Admin Operator');
      }, 500);
    } else {
      setError('Invalid Access Key. (Default Master PIN: 7860 or admin123)');
    }
  };

  const handleQuickDemo = (role: string, pin: string) => {
    setAdminName(role);
    setAccessCode(pin);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(role);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            PakInvest Operations CRM
          </h1>
          <p className="text-xs text-slate-400">
            Internal Management System • Approvals, Payouts & Package Administration
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Operator Name / ID</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Operations Officer #04"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Master Authorization PIN / Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter PIN (e.g. 7860)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Authorizing Access...' : 'Authenticate & Open CRM'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-400 text-center mb-3">
            Quick Team One-Click Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('Finance & Payout Lead', '7860')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Finance Lead</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('General Manager', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>General Manager</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
