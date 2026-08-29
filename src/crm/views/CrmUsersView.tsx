import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  Users,
  Search,
  KeyRound,
  Coins,
  ShieldCheck,
  Phone,
  Calendar,
  DollarSign,
  PlusCircle,
  MinusCircle,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CrmUsersViewProps {
  users: UserProfile[];
  onAdjustBalance: (userId: string, amount: number, type: 'credit' | 'debit', note: string) => Promise<boolean>;
  onResetPin: (userId: string, newPin: string) => Promise<boolean>;
}

export const CrmUsersView: React.FC<CrmUsersViewProps> = ({
  users,
  onAdjustBalance,
  onResetPin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Balance Adjustment Modal
  const [adjustModalUser, setAdjustModalUser] = useState<UserProfile | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustNote, setAdjustNote] = useState('');
  const [isProcessingAdjust, setIsProcessingAdjust] = useState(false);

  // Reset PIN Modal
  const [pinModalUser, setPinModalUser] = useState<UserProfile | null>(null);
  const [newPin, setNewPin] = useState('1234');
  const [isProcessingPin, setIsProcessingPin] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.referralCode?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || adjustAmount <= 0) return;
    setIsProcessingAdjust(true);
    const success = await onAdjustBalance(
      adjustModalUser.id,
      adjustAmount,
      adjustType,
      adjustNote || `Admin manual ${adjustType}`
    );
    setIsProcessingAdjust(false);
    if (success) {
      setAdjustModalUser(null);
      setAdjustNote('');
    }
  };

  const handleConfirmResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalUser || newPin.length !== 4) return;
    setIsProcessingPin(true);
    const success = await onResetPin(pinModalUser.id, newPin);
    setIsProcessingPin(false);
    if (success) {
      setPinModalUser(null);
      setNewPin('1234');
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Registered Investors Directory</span>
          </h2>
          <p className="text-xs text-slate-400">
            View investor portfolios, manual wallet balance adjustments & PIN resets
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="text-slate-400">Total Investors:</span>
          <strong className="text-purple-400">{users.length} Accounts</strong>
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Investor Name, Phone Number, or Referral Code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* 3. Users List / Cards */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Profile Details */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-300 font-bold text-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{user.name}</span>
                    {user.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                        Admin
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono">
                      Ref: {user.referralCode}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {user.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Joined: {user.joinedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustModalUser(user);
                    setAdjustAmount(1000);
                    setAdjustType('credit');
                    setAdjustNote('');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-700 text-slate-200 hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Adjust Balance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPinModalUser(user);
                    setNewPin('1234');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-700 text-slate-200 hover:text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Reset PIN</span>
                </button>
              </div>
            </div>

            {/* Financial Ledger Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 font-mono text-[10px] block">Wallet Balance:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{formatPKR(user.balance)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 font-mono text-[10px] block">Active Capital:</span>
                <span className="text-sm font-bold text-blue-400 font-mono">{formatPKR(user.investedCapital)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 font-mono text-[10px] block">Total Withdrawn:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">{formatPKR(user.totalWithdrawn)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 font-mono text-[10px] block">Total Profit Earned:</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">{formatPKR(user.totalEarnedProfit)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adjust Balance Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Coins className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Adjust Wallet Balance: {adjustModalUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400">Current Balance:</span>
                <p className="text-base font-bold text-white font-mono">{formatPKR(adjustModalUser.balance)}</p>
              </div>

              {/* Credit / Debit Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Credit (+) Funds</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    adjustType === 'debit'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Debit (-) Funds</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Amount (PKR)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="5000"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Adjustment Audit Reason</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Compensation for bank delay / manual deposit credit"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingAdjust}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  {isProcessingAdjust ? 'Applying...' : 'Apply Balance Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {pinModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Reset PIN: {pinModalUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPinModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetPin} className="space-y-4">
              <p className="text-xs text-slate-400">
                Set a new 4-digit security PIN for investor account <strong>{pinModalUser.phone}</strong>.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">New 4-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1234"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-center text-lg tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalUser(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPin || newPin.length !== 4}
                  className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/40"
                >
                  {isProcessingPin ? 'Resetting...' : 'Confirm New PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
