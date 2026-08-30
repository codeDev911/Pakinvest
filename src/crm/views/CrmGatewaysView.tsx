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
  Trash2,
  X,
  Plus,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Search,
  Power,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface CrmGatewaysViewProps {
  channels: OfficialDepositChannel[];
  onSaveChannel: (channel: OfficialDepositChannel) => Promise<boolean>;
  onDeleteChannel: (channelId: string) => Promise<boolean>;
}

const GATEWAY_OPTIONS: { type: GatewayType; label: string; sub: string }[] = [
  { type: 'JazzCash', label: 'JazzCash', sub: 'Till / Mobile Account' },
  { type: 'EasyPaisa', label: 'EasyPaisa', sub: 'Merchant / Mobile Account' },
  { type: 'Raast', label: 'Raast P2M / Instant', sub: 'State Bank 0% Fee ID' },
  { type: 'Bank_Transfer', label: 'Commercial Bank IBFT', sub: 'Meezan, HBL, UBL, Alfalah' },
  { type: 'USDT_TRC20', label: 'USDT (TRC20)', sub: 'Binance / Tron Wallet' },
];

const DEFAULT_NEW_CHANNEL: OfficialDepositChannel = {
  id: '',
  gateway: 'JazzCash',
  accountTitle: '',
  accountNumber: '',
  bankName: '',
  branchCode: '',
  instructions: 'Send money to this account and submit the transaction ID (TID) from your confirmation SMS/receipt.',
  minDeposit: 1000,
  maxDeposit: 500000,
  processingTime: '5-15 mins manual verification',
  isActive: true,
};

export const CrmGatewaysView: React.FC<CrmGatewaysViewProps> = ({
  channels,
  onSaveChannel,
  onDeleteChannel,
}) => {
  const [editingChannel, setEditingChannel] = useState<OfficialDepositChannel | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [channelToDelete, setChannelToDelete] = useState<OfficialDepositChannel | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGateway, setFilterGateway] = useState<string>('all');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getGatewayIcon = (gw: GatewayType | string) => {
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
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleOpenAddModal = () => {
    setIsAddingNew(true);
    setEditingChannel({
      ...DEFAULT_NEW_CHANNEL,
      id: `ch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    });
  };

  const handleOpenEditModal = (channel: OfficialDepositChannel) => {
    setIsAddingNew(false);
    setEditingChannel({ ...channel });
  };

  const handleQuickToggleActive = async (channel: OfficialDepositChannel) => {
    const updated = { ...channel, isActive: !channel.isActive };
    await onSaveChannel(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    if (!editingChannel.accountTitle.trim() || !editingChannel.accountNumber.trim()) {
      return;
    }

    setIsSaving(true);
    const success = await onSaveChannel(editingChannel);
    setIsSaving(false);
    if (success) {
      setEditingChannel(null);
      setIsAddingNew(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!channelToDelete) return;
    const targetId = channelToDelete.id || channelToDelete.gateway;
    setIsDeleting(true);
    const success = await onDeleteChannel(targetId);
    setIsDeleting(false);
    if (success) {
      setChannelToDelete(null);
    }
  };

  const filteredChannels = channels.filter((c) => {
    const matchesSearch =
      c.accountTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gateway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.bankName && c.bankName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGateway = filterGateway === 'all' || c.gateway === filterGateway;

    return matchesSearch && matchesGateway;
  });

  const activeCount = channels.filter((c) => c.isActive).length;

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Official Payment Channels & Receiving Tills</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300 font-bold">
                  {channels.length} Configured
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage JazzCash, EasyPaisa, Raast, Bank IBFT, and Crypto accounts displayed to users for deposit
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span>Live Channels:</span>
            <strong className="text-emerald-400 font-bold">
              {activeCount} / {channels.length}
            </strong>
          </div>

          <button
            type="button"
            id="btn-add-payment-channel"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Channel</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by account title, number, bank, or gateway..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterGateway('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterGateway === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            All ({channels.length})
          </button>
          {GATEWAY_OPTIONS.map((opt) => {
            const count = channels.filter((c) => c.gateway === opt.type).length;
            if (count === 0 && filterGateway !== opt.type) return null;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setFilterGateway(opt.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  filterGateway === opt.type
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Gateways List Grid */}
      {filteredChannels.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Payment Channels Match Your Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'Try adjusting your search query or reset filters.'
                : 'There are no payment channels configured yet. Add your first receiving account.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Channel</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChannels.map((channel) => {
            const channelKey = channel.id || `${channel.gateway}_${channel.accountNumber}`;
            return (
              <div
                key={channelKey}
                className={`p-5 rounded-3xl bg-slate-900 border transition-all space-y-4 relative flex flex-col justify-between ${
                  channel.isActive
                    ? 'border-slate-800 hover:border-slate-700/80 shadow-md'
                    : 'border-rose-900/30 bg-slate-900/60 opacity-80'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {getGatewayIcon(channel.gateway)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">
                            {channel.gateway.replace('_', ' ')}
                          </h3>
                          {channel.isActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold shrink-0 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold shrink-0">
                              Disabled
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-semibold truncate mt-0.5">
                          {channel.accountTitle}
                        </p>
                      </div>
                    </div>

                    {/* Quick Active Toggle */}
                    <button
                      type="button"
                      title={channel.isActive ? 'Click to Disable Channel' : 'Click to Enable Channel'}
                      onClick={() => handleQuickToggleActive(channel)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                        channel.isActive
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-800'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-800'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account Details Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500 text-[11px]">Account / Till / IBAN:</span>
                      <div className="flex items-center gap-1.5 max-w-[65%]">
                        <strong className="text-amber-300 font-bold text-xs truncate">
                          {channel.accountNumber}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(channel.accountNumber, channelKey)}
                          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
                          title="Copy Account Number"
                        >
                          {copiedId === channelKey ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {channel.bankName && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 text-[11px]">Bank / Institution:</span>
                        <span className="font-medium truncate max-w-[60%]">{channel.bankName}</span>
                      </div>
                    )}

                    {channel.branchCode && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 text-[11px]">Branch / Swift Code:</span>
                        <span className="font-mono">{channel.branchCode}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-900">
                      <span className="text-slate-500 text-[11px]">Allowed Deposit Range:</span>
                      <span className="text-emerald-400 font-bold text-xs">
                        {formatPKR(channel.minDeposit)} - {formatPKR(channel.maxDeposit)}
                      </span>
                    </div>

                    {channel.processingTime && (
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Estimated Time:</span>
                        </span>
                        <span className="text-slate-300 font-medium">{channel.processingTime}</span>
                      </div>
                    )}
                  </div>

                  {channel.instructions && (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50 text-[11px] text-slate-400 italic leading-relaxed">
                      "{channel.instructions}"
                    </div>
                  )}
                </div>

                {/* Card Actions (Edit & Delete) */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(channel)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Channel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannelToDelete(channel)}
                    className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Channel Modal */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {isAddingNew ? 'Add New Payment Channel' : `Edit Channel: ${editingChannel.gateway}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingChannel(null);
                  setIsAddingNew(false);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Gateway Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Gateway / Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GATEWAY_OPTIONS.map((gw) => {
                    const isSelected = editingChannel.gateway === gw.type;
                    return (
                      <button
                        key={gw.type}
                        type="button"
                        onClick={() => setEditingChannel({ ...editingChannel, gateway: gw.type })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getGatewayIcon(gw.type)}
                          <span className="text-xs font-bold text-white truncate">{gw.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{gw.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Account Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Official Account Title</label>
                <input
                  type="text"
                  value={editingChannel.accountTitle}
                  onChange={(e) => setEditingChannel({ ...editingChannel, accountTitle: e.target.value })}
                  placeholder="e.g. PAKINVEST DIGITAL ENTERPRISES PVT"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Account Number / Till / IBAN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Account Number / Mobile Wallet / Till ID / IBAN / Crypto Address
                </label>
                <input
                  type="text"
                  value={editingChannel.accountNumber}
                  onChange={(e) => setEditingChannel({ ...editingChannel, accountNumber: e.target.value })}
                  placeholder="e.g. 03049876543 or PK82MEZN0102030405060708"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              {/* Bank Name & Branch Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Bank Name (Optional)</label>
                  <input
                    type="text"
                    value={editingChannel.bankName || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, bankName: e.target.value })}
                    placeholder="Meezan Bank Ltd."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Branch Code / Swift (Optional)</label>
                  <input
                    type="text"
                    value={editingChannel.branchCode || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, branchCode: e.target.value })}
                    placeholder="0204 (Gulberg Branch)"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Min & Max Deposit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Min Deposit (PKR)</label>
                  <input
                    type="number"
                    min="100"
                    value={editingChannel.minDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, minDeposit: Number(e.target.value) })}
                    placeholder="1000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Max Deposit (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    value={editingChannel.maxDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, maxDeposit: Number(e.target.value) })}
                    placeholder="1000000"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Processing Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Processing Time Note</label>
                <input
                  type="text"
                  value={editingChannel.processingTime}
                  onChange={(e) => setEditingChannel({ ...editingChannel, processingTime: e.target.value })}
                  placeholder="e.g. 5-15 mins manual verification or Instant via Raast"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Instructions Note */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Deposit Instructions for User</label>
                <textarea
                  value={editingChannel.instructions || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, instructions: e.target.value })}
                  placeholder="Explain step-by-step how users should make transfer & submit TID."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editingChannel.isActive}
                  onChange={(e) => setEditingChannel({ ...editingChannel, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                  Make this account active and available for investor deposits immediately
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingChannel(null);
                    setIsAddingNew(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Channel...' : isAddingNew ? 'Create Channel' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {channelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">Delete Payment Channel?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove the{' '}
                <strong className="text-white">{channelToDelete.gateway.replace('_', ' ')}</strong> receiving account (
                <span className="text-amber-400 font-mono font-bold">{channelToDelete.accountNumber}</span> -{' '}
                <span className="text-slate-200">{channelToDelete.accountTitle}</span>)?
              </p>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-300 mt-2 text-left">
                ⚠️ Investors will immediately no longer be able to select or deposit to this account.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Channel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
