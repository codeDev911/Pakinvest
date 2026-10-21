import React, { useState, useEffect } from 'react';
import { UserProfile, Transaction } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  Users,
  X,
  Wallet,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Key,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  PlusCircle,
  MinusCircle,
  Check,
  Clock,
  Sparkles,
  Receipt,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  Send,
  Flame,
  Eye,
  EyeOff,
  Copy,
  Lock,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface UserDetailModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onAdjustBalance: (userId: string, amount: number, type: 'credit' | 'debit', note: string) => Promise<boolean>;
  onResetPin: (userId: string, newPin: string) => Promise<boolean>;
  onResetPassword?: (userId: string, newPassword: string) => Promise<boolean>;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onAdjustBalance,
  onResetPin,
  onResetPassword,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'adjust-balance' | 'streak' | 'reset-pin' | 'send-notification'>('overview');
  
  // Notification state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifCategory, setNotifCategory] = useState<'system' | 'promo' | 'alert' | 'profit_unlocked'>('system');
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);
  
  // Balance adjustment state
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Streak adjustment state
  const [userStreak, setUserStreak] = useState<number>(user?.dailyStreak || 0);
  const [streakAction, setStreakAction] = useState<'add' | 'subtract' | 'set' | 'reset'>('add');
  const [streakDaysInput, setStreakDaysInput] = useState<string>('1');
  const [creditStreakBonus, setCreditStreakBonus] = useState<boolean>(true);
  const [customBonusAmount, setCustomBonusAmount] = useState<string>('');
  const [streakReason, setStreakReason] = useState<string>('Loyalty Milestone Incentive');
  const [isAdjustingStreak, setIsAdjustingStreak] = useState(false);
  const [streakFeedback, setStreakFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // PIN & Password reset states
  const [newPin, setNewPin] = useState<string>('');
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [pinFeedback, setPinFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [copiedField, setCopiedField] = useState<'password' | 'pin' | null>(null);

  const handleCopyText = (text: string, field: 'password' | 'pin') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // User Ledger Transactions state (fast on-demand fetching)
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const txLimit = 10;

  useEffect(() => {
    if (activeTab === 'ledger' && user?.id) {
      fetchUserLedger(user.id, txPage);
    }
  }, [activeTab, user?.id, txPage]);

  const fetchUserLedger = async (userId: string, pageNum: number) => {
    setIsLoadingTx(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${userId}/transactions?page=${pageNum}&limit=${txLimit}`));
      const data = await res.json();
      if (data?.success) {
        setUserTransactions(data.transactions || []);
        setTxTotal(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch user transactions:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  if (!user) return null;

  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(adjustAmount);
    if (isNaN(amt) || amt <= 0) return;

    setIsAdjusting(true);
    const success = await onAdjustBalance(user.id, amt, adjustType, adjustNote);
    setIsAdjusting(false);
    if (success) {
      setAdjustAmount('');
      setAdjustNote('');
      setActiveTab('overview');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4 || !user?.id) return;

    setIsResettingPin(true);
    setPinFeedback(null);
    const success = await onResetPin(user.id, newPin);
    setIsResettingPin(false);
    if (success) {
      setPinFeedback({ type: 'success', message: `Security PIN updated to ${newPin}!` });
      setNewPin('');
    } else {
      setPinFeedback({ type: 'error', message: 'Failed to update security PIN.' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 4 || !user?.id) return;

    setIsResettingPassword(true);
    setPasswordFeedback(null);
    try {
      if (onResetPassword) {
        const success = await onResetPassword(user.id, newPassword.trim());
        if (success) {
          setPasswordFeedback({ type: 'success', message: `Password updated to "${newPassword.trim()}" successfully!` });
          setNewPassword('');
        } else {
          setPasswordFeedback({ type: 'error', message: 'Failed to update password.' });
        }
      } else {
        const res = await fetch(getApiUrl('/api/admin/users/reset-password'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, newPassword: newPassword.trim() }),
        });
        const data = await res.json();
        if (data?.success) {
          setPasswordFeedback({ type: 'success', message: `Password updated to "${newPassword.trim()}" successfully!` });
          setNewPassword('');
        } else {
          setPasswordFeedback({ type: 'error', message: data?.error || 'Failed to update password.' });
        }
      }
    } catch {
      setPasswordFeedback({ type: 'error', message: 'Network error resetting password.' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleStreakSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsAdjustingStreak(true);
    setStreakFeedback(null);

    try {
      const res = await fetch(getApiUrl('/api/admin/users/adjust-streak'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: streakAction,
          streakDays: Number(streakDaysInput) || 1,
          creditBonus: creditStreakBonus,
          bonusAmount: customBonusAmount ? Number(customBonusAmount) : undefined,
          reason: streakReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newStreakVal = data.user?.dailyStreak ?? userStreak;
        setUserStreak(newStreakVal);
        if (user) {
          user.dailyStreak = newStreakVal;
          if (data.user?.balance !== undefined) {
            user.balance = data.user.balance;
          }
        }
        setStreakFeedback({
          type: 'success',
          message: data.message || `Streak successfully updated to Day ${newStreakVal}!`,
        });
      } else {
        setStreakFeedback({
          type: 'error',
          message: data.error || 'Failed to adjust streak days',
        });
      }
    } catch (err: any) {
      setStreakFeedback({
        type: 'error',
        message: err?.message || 'Network error updating streak',
      });
    } finally {
      setIsAdjustingStreak(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl my-8 overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-900/30">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{user.name}</h3>
                {user.isVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
                {user.isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
                    Admin
                  </span>
                )}
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Phone: {user.phone} • Ref Code: <strong className="text-amber-400">{user.referralCode}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigator */}
        <div
          className={`px-5 pt-3 border-b flex items-center gap-2 ${
            isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Account Overview
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ledger');
              setTxPage(1);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ledger Transactions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjust-balance')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'adjust-balance'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Adjust Balance</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('streak');
              setStreakFeedback(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'streak'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Adjust Streak Days</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('reset-pin');
              setPinFeedback(null);
              setPasswordFeedback(null);
            }}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reset-pin'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Reset PIN & Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('send-notification')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'send-notification'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Send In-App Alert</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Available Balance
                  </span>
                  <p className="text-lg font-black text-emerald-400 tracking-tight mt-1">
                    {formatPKR(user.balance)}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Locked Capital
                  </span>
                  <p className="text-lg font-black text-indigo-400 tracking-tight mt-1">
                    {formatPKR(user.investedCapital || 0)}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Total Withdrawn
                  </span>
                  <p className="text-lg font-black text-amber-400 tracking-tight mt-1">
                    {formatPKR(user.totalWithdrawn || 0)}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Total Yield Profit
                  </span>
                  <p className="text-lg font-black text-cyan-400 tracking-tight mt-1">
                    {formatPKR(user.totalEarnedProfit || 0)}
                  </p>
                </div>
              </div>

              {/* Profile Details List */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Investor Registration Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>User ID:</span>
                    <span className="font-mono">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Phone:</span>
                    <span className="font-mono font-bold text-white">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Referral Code:</span>
                    <span className="font-mono font-bold text-amber-400">{user.referralCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sponsor / Upline:</span>
                    <span className="font-mono font-bold text-purple-400">{user.referredBy || 'Direct (None)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Registration Date:</span>
                    <span>{user.joinedDate || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Daily Check-In Streak:</span>
                    <span className="font-bold text-orange-400">{user.dailyStreak || 0} Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Security PIN:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {showPin ? (
                        <span className="font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-xs">
                          {user.securityPin || '1234'}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-300">
                          •••• ({user.securityPin || '1234'})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        title={showPin ? 'Hide PIN' : 'Show PIN'}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(user.securityPin || '1234', 'pin')}
                        title="Copy PIN"
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        {copiedField === 'pin' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>User Password:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      {showPassword ? (
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-xs">
                          {user.plainPassword || (user.password && !user.password.startsWith('$2') ? user.password : '••••••••')}
                        </span>
                      ) : (
                        <span className="font-bold text-slate-300">
                          •••• ({user.plainPassword || (user.password && !user.password.startsWith('$2') ? user.password : '••••••••')})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyText(user.plainPassword || (user.password && !user.password.startsWith('$2') ? user.password : ''), 'password')}
                        title="Copy password"
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        {copiedField === 'password' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Team Commissions Claimed:</span>
                    <span className="font-bold text-emerald-400">{formatPKR(user.referralEarnings || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-indigo-400" />
                    Investor Ledger & Audit Trail
                  </h4>
                  <p className="text-xs text-slate-400">
                    Showing {txTotal > 0 ? `${(txPage - 1) * txLimit + 1}–${Math.min(txPage * txLimit, txTotal)} of ${txTotal}` : '0'} transactions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchUserLedger(user.id, txPage)}
                  disabled={isLoadingTx}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingTx ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>Loading ledger records from database...</span>
                </div>
              ) : userTransactions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-950/40 text-slate-400 text-xs">
                  No ledger transactions recorded for this investor yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {userTransactions.map((tx) => {
                    const isPositive = tx.type === 'deposit' || tx.type === 'daily_profit' || tx.type === 'referral_bonus';
                    return (
                      <div
                        key={tx.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          isDark ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-xl text-xs ${
                                tx.type === 'deposit'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                  : tx.type === 'withdrawal'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                  : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800'
                              }`}
                            >
                              {tx.type === 'deposit' ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : tx.type === 'withdrawal' ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <Receipt className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white truncate">{tx.id}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    tx.status === 'completed'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : tx.status === 'pending'
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {tx.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="uppercase font-semibold text-indigo-400">{tx.type.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{tx.timestamp}</span>
                                {tx.referenceCode && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-amber-400 truncate max-w-[120px]">{tx.referenceCode}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right whitespace-nowrap">
                            <div
                              className={`font-mono font-black text-sm ${
                                isPositive ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {isPositive ? '+' : '-'}
                              {formatPKR(tx.amount)}
                            </div>
                            {tx.gateway && (
                              <div className="text-[10px] text-slate-500 capitalize">{tx.gateway}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination Bar */}
                  {Math.ceil(txTotal / txLimit) > 1 && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-400">
                      <span>
                        Page {txPage} of {Math.ceil(txTotal / txLimit)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={txPage === 1 || isLoadingTx}
                          onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={txPage >= Math.ceil(txTotal / txLimit) || isLoadingTx}
                          onClick={() => setTxPage((p) => p + 1)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'adjust-balance' && (
            <form onSubmit={handleBalanceSubmit} className="space-y-4">
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Perform bank-grade credit or debit adjustments directly to the investor's balance with an immutable ledger audit trail entry.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    adjustType === 'credit'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Credit (+) Add Balance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    adjustType === 'debit'
                      ? 'bg-rose-950 border-rose-500 text-rose-400 shadow-md shadow-rose-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Debit (-) Deduct Balance</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Adjustment Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Reason / Audit Log Note</label>
                <textarea
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Compensation bonus, Manual deposit correction, Promotional dividend..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAdjusting}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                  adjustType === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                }`}
              >
                {isAdjusting
                  ? 'Applying Adjustment...'
                  : `Confirm ${adjustType === 'credit' ? 'Credit (+)' : 'Debit (-)'} Rs. ${Number(adjustAmount || 0).toLocaleString()}`}
              </button>
            </form>
          )}

          {activeTab === 'streak' && (
            <form onSubmit={handleStreakSubmit} className="space-y-4">
              {/* Summary Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Active Check-in Streak
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black text-orange-400 flex items-center gap-1">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      Day {userStreak}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {userStreak > 0 ? `${userStreak} Consecutive Days` : 'Inactive Streak'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Last Check-In
                  </span>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    {user?.lastCheckInDate || 'Never Checked In'}
                  </p>
                </div>
              </div>

              {streakFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    streakFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{streakFeedback.message}</span>
                </div>
              )}

              {/* Action Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Streak Action</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'add', label: '+ Add Streak Days', icon: PlusCircle, color: 'border-orange-500 bg-orange-950/40 text-orange-300' },
                    { id: 'subtract', label: '- Subtract Days', icon: MinusCircle, color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                    { id: 'set', label: '= Set Specific Day', icon: Sparkles, color: 'border-blue-500 bg-blue-950/40 text-blue-300' },
                    { id: 'reset', label: '↺ Reset to Day 0', icon: RefreshCw, color: 'border-rose-500 bg-rose-950/40 text-rose-300' },
                  ].map((act) => {
                    const Icon = act.icon;
                    const isSelected = streakAction === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          setStreakAction(act.id as any);
                          setStreakFeedback(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? act.color
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Days Input (hidden for reset) */}
              {streakAction !== 'reset' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      {streakAction === 'add'
                        ? 'Number of Days to Add'
                        : streakAction === 'subtract'
                        ? 'Number of Days to Remove'
                        : 'Set Target Streak Day'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Resulting Streak: <strong className="text-orange-400">Day {
                        streakAction === 'add'
                          ? userStreak + (Number(streakDaysInput) || 1)
                          : streakAction === 'subtract'
                          ? Math.max(0, userStreak - (Number(streakDaysInput) || 1))
                          : Math.max(0, Number(streakDaysInput) || 0)
                      }</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={streakDaysInput}
                    onChange={(e) => setStreakDaysInput(e.target.value)}
                    placeholder="Enter days count (e.g. 1, 3, 7)"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400">Quick Picks:</span>
                    {['1', '2', '3', '5', '7'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setStreakDaysInput(d)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                      >
                        {streakAction === 'add' ? `+${d} Day${Number(d) > 1 ? 's' : ''}` : `Day ${d}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bonus Awarding Options */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Award Cash Bonus with Streak</h4>
                      <p className="text-[10px] text-slate-400">Credit loyalty bonus to wallet balance and log ledger entry</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creditStreakBonus}
                      onChange={(e) => setCreditStreakBonus(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {creditStreakBonus && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        Custom Bonus Amount (PKR) <span className="text-[10px] font-normal text-slate-400">(Optional — defaults to configured streak tier amount)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={customBonusAmount}
                        onChange={(e) => setCustomBonusAmount(e.target.value)}
                        placeholder="e.g. 250, 500, 1000 (Defaults to configured tier bonus)"
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Adjustment Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Admin Audit Reason / Note</label>
                <input
                  type="text"
                  value={streakReason}
                  onChange={(e) => setStreakReason(e.target.value)}
                  placeholder="e.g. Milestone incentive, compensation, VIP upgrade"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAdjustingStreak}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-white" />
                {isAdjustingStreak
                  ? 'Updating Streak & Bonus...'
                  : streakAction === 'add'
                  ? `Confirm Add ${streakDaysInput || 1} Streak Day${Number(streakDaysInput) > 1 ? 's' : ''}${creditStreakBonus ? ' with Bonus' : ''}`
                  : streakAction === 'subtract'
                  ? `Confirm Remove ${streakDaysInput || 1} Streak Day${Number(streakDaysInput) > 1 ? 's' : ''}`
                  : streakAction === 'set'
                  ? `Confirm Set Streak to Day ${streakDaysInput || 1}${creditStreakBonus ? ' with Bonus' : ''}`
                  : 'Confirm Reset Streak to Day 0'}
              </button>
            </form>
          )}

          {activeTab === 'reset-pin' && (
            <div className="space-y-6">
              {/* Security PIN Section */}
              <form onSubmit={handlePinSubmit} className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      4-Digit Security PIN
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Current: <strong className="text-slate-200 font-bold">{user.securityPin || '1234'}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  The security PIN protects fund withdrawals and payment gateway additions.
                </p>

                {pinFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                    pinFeedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    {pinFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>{pinFeedback.message}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Set New Security PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="e.g. 1234 or 5678"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-center tracking-widest text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResettingPin}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/40 disabled:opacity-50"
                >
                  {isResettingPin ? 'Updating PIN...' : 'Save New Security PIN'}
                </button>
              </form>

              {/* Account Password Section */}
              <form onSubmit={handlePasswordSubmit} className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      User Login Password
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Current: <strong className="text-emerald-400 font-bold">{user.plainPassword || (user.password && !user.password.startsWith('$2') ? user.password : 'Encrypted')}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Reset the investor's mobile portal sign-in password directly.
                </p>

                {passwordFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}>
                    {passwordFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Set New Password (min 4 characters)</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (e.g. Pass@123)"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  {isResettingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'send-notification' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Deliver a personalized in-app push notification directly to{' '}
                <strong className="text-emerald-400">{user?.name}</strong> ({user?.phone}).
              </div>

              {notifSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Notification successfully sent to user's device!</span>
                </div>
              )}

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Notification Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'system', label: 'System Notice' },
                    { id: 'promo', label: 'Promotion' },
                    { id: 'alert', label: 'Security Alert' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNotifCategory(cat.id as any)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        notifCategory === cat.id
                          ? 'border-blue-500 bg-blue-950/50 text-blue-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick templates */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">Quick Templates</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { t: 'Payment Received', m: 'Your payment has been successfully confirmed and credited to your wallet balance.' },
                    { t: 'Account Verified', m: 'Your investor account has been verified. You now have full withdrawal access.' },
                    { t: 'Special Bonus Credited', m: 'A special VIP investor bonus has been credited directly to your account.' },
                  ].map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNotifTitle(tmpl.t);
                        setNotifMessage(tmpl.m);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900"
                    >
                      {tmpl.t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Notification Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Deposit Credited Successfully"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Notification Message</label>
                <textarea
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type the message body to display on the user's phone..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  required
                />
              </div>

              <button
                type="button"
                disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                onClick={async () => {
                  if (!user?.id || !notifTitle.trim() || !notifMessage.trim()) return;
                  setIsSendingNotif(true);
                  setNotifSuccess(false);
                  try {
                    const res = await fetch(getApiUrl('/api/admin/notifications/broadcast'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: notifTitle.trim(),
                        message: notifMessage.trim(),
                        type: notifCategory,
                        filter: {
                          target: 'specific_users',
                          specificUserIds: [user.id],
                        },
                        adminName: 'Admin Operator',
                      }),
                    });
                    const data = await res.json();
                    if (data?.success) {
                      setNotifSuccess(true);
                      setNotifTitle('');
                      setNotifMessage('');
                      setTimeout(() => setNotifSuccess(false), 5000);
                    }
                  } catch (err) {
                    console.error('Failed to send direct notification:', err);
                  } finally {
                    setIsSendingNotif(false);
                  }
                }}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  notifTitle.trim() && notifMessage.trim()
                    ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-950/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingNotif ? 'Delivering Alert...' : `Send Notification to ${user?.name}`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-5 border-t flex items-center justify-between ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
