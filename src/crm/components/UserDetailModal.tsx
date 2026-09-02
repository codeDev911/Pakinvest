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
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface UserDetailModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onAdjustBalance: (userId: string, amount: number, type: 'credit' | 'debit', note: string) => Promise<boolean>;
  onResetPin: (userId: string, newPin: string) => Promise<boolean>;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  onClose,
  onAdjustBalance,
  onResetPin,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'adjust-balance' | 'reset-pin'>('overview');
  
  // Balance adjustment state
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustNote, setAdjustNote] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // PIN reset state
  const [newPin, setNewPin] = useState<string>('');
  const [isResettingPin, setIsResettingPin] = useState(false);

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
    if (!newPin.trim() || newPin.length < 4) return;

    setIsResettingPin(true);
    const success = await onResetPin(user.id, newPin);
    setIsResettingPin(false);
    if (success) {
      setNewPin('');
      setActiveTab('overview');
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
            onClick={() => setActiveTab('reset-pin')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reset-pin'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Reset Security PIN</span>
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
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Security PIN:</span>
                    <span className="font-mono font-bold text-slate-300">•••• ({user.securityPin || '1234'})</span>
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

          {activeTab === 'reset-pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Reset the user's 4-digit security PIN for withdrawal authorisations.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">New 4-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center tracking-widest text-lg font-black focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isResettingPin}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/40"
              >
                {isResettingPin ? 'Updating PIN...' : 'Save New Security PIN'}
              </button>
            </form>
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
