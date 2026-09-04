import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  ShieldCheck,
  Lock,
  Smartphone,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Fingerprint,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    theme,
    toggleTheme,
    user,
    isAuthenticated,
    updateUserPin,
    changePassword,
    showToast,
    setIsAuthModalOpen,
    logout,
  } = useApp();

  // PIN update state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [is2fa, setIs2fa] = useState(user.is2faEnabled);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Password update state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      showToast('Invalid PIN', 'PIN must be exactly 4 digits.', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('Mismatch', 'PIN and confirmation do not match.', 'error');
      return;
    }
    updateUserPin(newPin);
    setIsChangingPin(false);
    setNewPin('');
    setConfirmPin('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordError('New password cannot be the same as your current password.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await changePassword(oldPassword, newPassword, confirmPassword);
      if (res.success) {
        setPasswordSuccess(res.message || 'Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(null);
        }, 2500);
      } else {
        setPasswordError(res.error || 'Failed to update password. Please check your current password.');
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const faqs = [
    {
      q: 'How do daily profit payouts work?',
      a: 'Once you activate an investment package (e.g. Solar Energy, Agro Yield), profits accrue continuously in real time. You can claim profits to your wallet anytime and withdraw them directly to your JazzCash or EasyPaisa account.',
    },
    {
      q: 'What is the minimum withdrawal amount?',
      a: 'The minimum withdrawal limit is Rs. 500. Withdrawals are processed 24/7 with zero to 1% nominal gateway settlement fees.',
    },
    {
      q: 'How does the 3-Tier Referral System work?',
      a: 'You earn 10% direct commission on Level 1 friends who invest, 4% on Level 2 sub-referrals, and 1% on Level 3 network referrals. Commissions are credited instantly in Rs.',
    },
    {
      q: 'What payment methods are supported in Pakistan?',
      a: 'Investify supports JazzCash, EasyPaisa, Raast Instant ID, Meezan/HBL/UBL Bank transfers, and USDT (TRC20).',
    },
  ];

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-3.5 sm:px-4 pt-2 sm:pt-3">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          Account & App Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Profile security, theme preferences, and 24/7 Pakistani customer support
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden ring-2 ring-emerald-500/40 shrink-0 bg-emerald-700">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {isAuthenticated ? user.name : 'Guest User'}
              </h3>
              {isAuthenticated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {isAuthenticated ? `${user.phone} • ${user.email || 'Investify Member'}` : 'Sign in to access personalized portfolio'}
            </p>
            {isAuthenticated && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                Member since {user.joinedDate} • Referral Code: <strong className="font-mono text-emerald-500">{user.referralCode}</strong>
              </p>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-xs"
          >
            Sign In / Register
          </button>
        )}
      </div>

      {/* Theme Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">

        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          <span>Display Theme</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xs font-bold block">Light Theme</span>
                <span className="text-[10px] text-slate-400">Crisp high-contrast</span>
              </div>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            type="button"
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs font-bold block">Dark Theme</span>
                <span className="text-[10px] text-slate-400">Deep obsidian & emerald</span>
              </div>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Security & Authorization</span>
        </h3>

        <div className="space-y-3">
          {/* Security PIN item */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  4-Digit Withdrawal PIN
                </span>
                <span className="text-[11px] text-slate-400">
                  Required for authorizing withdrawals to JazzCash/EasyPaisa
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsChangingPin(!isChangingPin)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            >
              {isChangingPin ? 'Cancel' : 'Change PIN'}
            </button>
          </div>

          {/* Change PIN Form */}
          {isChangingPin && (
            <form onSubmit={handlePinUpdate} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Set New 4-Digit Security PIN
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="New 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-center font-bold"
                />
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-center font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
              >
                Save New PIN
              </button>
            </form>
          )}

          {/* Account Login Password item */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Account Login Password
                </span>
                <span className="text-[11px] text-slate-400">
                  Update your credentials with current password verification
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {/* Change Password Form (Old, New, Confirm) */}
          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-300/80 dark:border-emerald-700/80 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  Change Account Password
                </h4>
                <span className="text-[10px] text-slate-400">Min 6 characters</span>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {/* Old Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Current (Old) Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="New password (min 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}

          {/* 2FA Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Fingerprint className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Biometric & 2FA Login Protection
                </span>
                <span className="text-[11px] text-slate-400">
                  Authenticate high-value withdrawals
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIs2fa(!is2fa);
                showToast('Updated', `2-Factor Authentication ${!is2fa ? 'Enabled' : 'Disabled'}`, 'info');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                is2fa ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  is2fa ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 24/7 Pakistani Support */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>24/7 Pakistani Customer Support</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              window.open('https://api.whatsapp.com/send?phone=923001234567&text=Hello%20Investify%20Support,%20I%20need%20assistance', '_blank');
            }}
            className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left flex items-center justify-between hover:bg-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                  Official WhatsApp Support
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  Urdu & English • 24/7 Live
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          </button>

          <button
            onClick={() => {
              showToast('Telegram Channel', 'Opening official announcement telegram channel: @InvestifyOfficial', 'info');
            }}
            className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left flex items-center justify-between hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                  Telegram VIP Channel
                </span>
                <span className="text-[10px] text-blue-700 dark:text-blue-400">
                  Daily Payout Proofs & Updates
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Frequently Asked Questions (FAQs)</span>
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-3 text-left text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-emerald-500' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            logout();
            showToast('Logged Out', 'You have been safely signed out.', 'info');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <span>Log Out of Account</span>
        </button>
      </div>

      <div className="pt-2 text-center">
        <p className="text-[10px] text-slate-400">
          Investify v3.2.0 • Secured & SSL Encrypted for Pakistan
        </p>
      </div>
    </div>
  );
};
