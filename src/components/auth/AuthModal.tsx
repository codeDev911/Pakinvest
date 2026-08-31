import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Smartphone,
  Lock,
  Mail,
  User,
  Gift,
  KeyRound,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, isAuthenticated } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Login states
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Register states
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('');
  const [regReferralCode, setRegReferralCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('pakinvest_ref_code');
      if (saved) return saved;
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || params.get('invite') || params.get('referral') || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your mobile number/username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identifier.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please verify your credentials.');
      } else {
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName.trim() || !regPhone.trim() || !regPassword.trim()) {
      setErrorMsg('Please enter your full name, mobile number, and password.');
      return;
    }

    if (regPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit Security PIN for withdrawal protection.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
        securityPin: regPin,
        referralCode: regReferralCode.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isAuthenticated ? onClose : undefined}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 440, mass: 0.4 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden z-10"
        >
          {/* Close button if authenticated or dismissible */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Drag Indicator */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-5 pb-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
              {mode === 'login' ? 'Sign In to PakInvest' : 'Create Investor Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login'
                ? 'Access your PKR wallet balance, active investments & daily yields'
                : 'Register your mobile number to start earning daily profits in Rs.'}
            </p>

            {/* Mode Switcher */}
            <div className="flex p-1 mt-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Register New
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mx-5 mb-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="p-5 pt-0 overflow-y-auto space-y-4 flex-1">
            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number, Username, or Email
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 03001234567 or username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-400 pt-2">
                  Don’t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Register New Account
                  </button>
                </p>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Usman Tariq"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pakistani Mobile Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@gmail.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      4-Digit Withdrawal PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={regPin}
                        onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="4 digits"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Gift className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regReferralCode}
                      onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                      placeholder="e.g. PAK1234"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Enter inviter code to link 3-tier commission rewards
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Register Account</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-400 pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
