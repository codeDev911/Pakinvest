import React, { useState } from 'react';
import { OfficialDepositChannel, GatewayType } from '../../types';
import { formatPKR } from '../../utils/formatters';
import {
  CreditCard,
  Smartphone,
  Building2,
  Coins,
  Sparkles,
  Edit2,
  CheckCircle2,
  X,
  Plus,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface CrmGatewaysViewProps {
  channels: OfficialDepositChannel[];
  onSaveChannel: (channel: OfficialDepositChannel) => Promise<boolean>;
}

export const CrmGatewaysView: React.FC<CrmGatewaysViewProps> = ({
  channels,
  onSaveChannel,
}) => {
  const [editingChannel, setEditingChannel] = useState<OfficialDepositChannel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGatewayIcon = (gw: GatewayType) => {
    switch (gw) {
      case 'JazzCash':
        return <Smartphone className="w-5 h-5 text-amber-500" />;
      case 'EasyPaisa':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'Raast':
        return <Sparkles className="w-5 h-5 text-orange-500" />;
      case 'Bank_Transfer':
        return <Building2 className="w-5 h-5 text-blue-500" />;
      case 'USDT_TRC20':
        return <Coins className="w-5 h-5 text-teal-400" />;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    setIsSaving(true);
    const success = await onSaveChannel(editingChannel);
    setIsSaving(false);
    if (success) {
      setEditingChannel(null);
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>Official Pakistani Deposit Accounts & Tills</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure JazzCash, EasyPaisa, Raast and Bank accounts shown to investors on the deposit screen
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <span>Active Channels:</span>
          <strong className="text-emerald-400">{channels.filter((c) => c.isActive).length} / {channels.length}</strong>
        </div>
      </div>

      {/* 2. Gateways List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`p-5 rounded-3xl bg-slate-900 border transition-all space-y-4 ${
              channel.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/40 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                  {getGatewayIcon(channel.gateway)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{channel.gateway.replace('_', ' ')}</span>
                    {channel.isActive ? (
                      <span className="px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
                        Disabled
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{channel.accountTitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingChannel({ ...channel })}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Account Details Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Account / Till / IBAN:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-amber-300 font-bold text-xs">{channel.accountNumber}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(channel.accountNumber, channel.id)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedId === channel.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {channel.bankName && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Bank Name:</span>
                  <span className="text-slate-300">{channel.bankName}</span>
                </div>
              )}

              {channel.branchCode && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Branch Code:</span>
                  <span className="text-slate-300">{channel.branchCode}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                <span className="text-slate-500 text-[11px]">Min - Max Deposit:</span>
                <span className="text-emerald-400 font-bold">
                  {formatPKR(channel.minDeposit)} - {formatPKR(channel.maxDeposit)}
                </span>
              </div>
            </div>

            {channel.instructions && (
              <p className="text-[11px] text-slate-400 italic">
                Note to Users: {channel.instructions}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Channel Modal */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  Edit Payment Account: {editingChannel.gateway}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Account Title</label>
                <input
                  type="text"
                  value={editingChannel.accountTitle}
                  onChange={(e) => setEditingChannel({ ...editingChannel, accountTitle: e.target.value })}
                  placeholder="e.g. PAKINVEST VENTURES PVT"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Account Number / Mobile Wallet / IBAN / USDT Address</label>
                <input
                  type="text"
                  value={editingChannel.accountNumber}
                  onChange={(e) => setEditingChannel({ ...editingChannel, accountNumber: e.target.value })}
                  placeholder="e.g. 03001234567"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Bank Name (If Bank)</label>
                  <input
                    type="text"
                    value={editingChannel.bankName || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, bankName: e.target.value })}
                    placeholder="Meezan Bank Ltd."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Branch Code / Swift</label>
                  <input
                    type="text"
                    value={editingChannel.branchCode || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, branchCode: e.target.value })}
                    placeholder="0102"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Min Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editingChannel.minDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, minDeposit: Number(e.target.value) })}
                    placeholder="1500"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Max Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editingChannel.maxDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, maxDeposit: Number(e.target.value) })}
                    placeholder="1000000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">User Deposit Instructions Note</label>
                <textarea
                  value={editingChannel.instructions || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, instructions: e.target.value })}
                  placeholder="Send exact amount to this JazzCash number and submit 12 digit TID."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editingChannel.isActive}
                  onChange={(e) => setEditingChannel({ ...editingChannel, isActive: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Account is Active & Available for Deposits
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  {isSaving ? 'Saving...' : 'Save Channel Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
