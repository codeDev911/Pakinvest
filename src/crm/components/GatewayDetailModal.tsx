import React from 'react';
import { OfficialDepositChannel } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  CreditCard,
  X,
  Smartphone,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Layers,
  Copy,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

interface GatewayDetailModalProps {
  channel: OfficialDepositChannel | null;
  onClose: () => void;
  onEdit?: (channel: OfficialDepositChannel) => void;
  onDelete?: (channelId: string) => void;
  onToggleActive?: (channelId: string, currentStatus: boolean) => void;
}

export const GatewayDetailModal: React.FC<GatewayDetailModalProps> = ({
  channel,
  onClose,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  if (!channel) return null;

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
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-black">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">{channel.gateway}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    channel.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {channel.isActive ? 'ACTIVE RECEIVING' : 'DISABLED'}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Channel ID: {channel.id}
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Channel Accumulated Balance & Inflow Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Channel Financial Ledger & Current Balance
              </h4>
              <span className="text-[10px] text-slate-400">Auto-incremented on verified deposits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Current Channel Money:</span>
                <p className="text-xl font-mono font-black text-emerald-400 mt-1">
                  {formatPKR(channel.currentBalance || 0)}
                </p>
                <span className="text-[10px] text-slate-500">Ready in account</span>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Verified Deposits:</span>
                <p className="text-base font-mono font-bold text-white mt-1">
                  {formatPKR(channel.totalDepositsVolume || 0)}
                </p>
                <span className="text-[10px] text-slate-500">{channel.completedDepositsCount || 0} completed transactions</span>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Manual Adjustments:</span>
                <p className={`text-base font-mono font-bold mt-1 ${(channel.manualAdjustment || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(channel.manualAdjustment || 0) > 0 ? '+' : ''}{formatPKR(channel.manualAdjustment || 0)}
                </p>
                <span className="text-[10px] text-slate-500">Error fixes & corrections</span>
              </div>
            </div>
          </div>

          {/* Account Coordinates Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Account Credentials Displayed to Investors
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Account Title:</span>
                <p className="text-sm font-bold text-white mt-0.5">{channel.accountTitle}</p>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Account Number / Till ID:</span>
                <p className="text-sm font-mono font-black text-amber-400 mt-0.5">{channel.accountNumber}</p>
              </div>

              {channel.bankName && (
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Bank / Institution:</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">{channel.bankName}</p>
                </div>
              )}

              {channel.branchCode && (
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Branch Code:</span>
                  <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">{channel.branchCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Limits & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Min Deposit Limit
              </span>
              <p className="text-base font-black text-emerald-400 mt-1">{formatPKR(channel.minDeposit)}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Max Deposit Limit
              </span>
              <p className="text-base font-black text-indigo-400 mt-1">{formatPKR(channel.maxDeposit)}</p>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                SLA Settlement Time
              </span>
              <p className="text-xs font-bold text-slate-200 mt-1.5">{channel.processingTime || '5 - 15 Minutes'}</p>
            </div>
          </div>

          {/* Deposit Instructions */}
          {channel.instructions && (
            <div
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deposit Instructions Rendered in Client Portal
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {channel.instructions}
              </p>
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
            Close Details
          </button>

          <div className="flex items-center gap-2">
            {onToggleActive && (
              <button
                type="button"
                onClick={() => {
                  onToggleActive(channel.id, channel.isActive);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
                  channel.isActive
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                {channel.isActive ? 'Disable Channel' : 'Activate Channel'}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(channel);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(channel.id);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
