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
  Copy,
  Check,
  Power,
  Clock,
  LayoutGrid,
  List,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { GatewayDetailModal } from '../components/GatewayDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

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

export const CrmGatewaysView: React.FC<CrmGatewaysViewProps> = ({
  channels,
  onSaveChannel,
  onDeleteChannel,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [selectedChannel, setSelectedChannel] = useState<OfficialDepositChannel | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChannel, setEditingChannel] = useState<OfficialDepositChannel>({
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
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (channelId: string, currentStatus: boolean) => {
    const target = channels.find((c) => c.id === channelId);
    if (!target) return;
    const updated = { ...target, isActive: !currentStatus };
    await onSaveChannel(updated);
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingChannel({
      id: `gw-${Date.now().toString().slice(-4)}`,
      gateway: 'JazzCash',
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      branchCode: '',
      instructions: 'Send money to this official till/account and submit the TID in proof form.',
      minDeposit: 1000,
      maxDeposit: 500000,
      processingTime: '5-15 mins manual verification',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: OfficialDepositChannel) => {
    setIsEditing(true);
    setEditingChannel({ ...c });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel.accountTitle || !editingChannel.accountNumber) return;

    setIsSaving(true);
    const success = await onSaveChannel(editingChannel);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const filteredChannels = channels.filter((c) => {
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'disabled' && c.isActive) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Channel Status',
      selectedValue: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Live Active Receiving', value: 'active' },
        { label: 'Disabled Channels', value: 'disabled' },
      ],
    },
  ];

  const columns: Column<OfficialDepositChannel>[] = [
    {
      key: 'gateway',
      header: 'Payment Gateway',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500 text-xs shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white tracking-tight">{c.gateway}</div>
            <div className="text-[10px] text-slate-400 font-mono">ID: {c.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'accountNumber',
      header: 'Account Number / Till ID',
      render: (c) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-amber-400 text-xs">
              {c.accountNumber}
            </span>
            <button
              type="button"
              onClick={(e) => handleCopy(e, c.accountNumber, `c-${c.id}`)}
              className="p-0.5 rounded text-slate-400 hover:text-white"
            >
              {copiedId === `c-${c.id}` ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
            {c.accountTitle}
          </div>
        </div>
      ),
    },
    {
      key: 'bankName',
      header: 'Institution / Branch',
      render: (c) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-200">{c.bankName || 'Mobile Wallet'}</div>
          {c.branchCode && (
            <div className="text-[10px] text-slate-400 font-mono">Branch: {c.branchCode}</div>
          )}
        </div>
      ),
    },
    {
      key: 'minDeposit',
      header: 'Deposit Limits',
      align: 'right',
      render: (c) => (
        <div className="text-xs">
          <div className="font-mono font-bold text-emerald-400">
            {formatPKR(c.minDeposit)} - {formatPKR(c.maxDeposit)}
          </div>
          <div className="text-[10px] text-slate-500">{c.processingTime || '5 - 15 Mins'}</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Live Status',
      align: 'center',
      render: (c) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(c.id, c.isActive);
          }}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
            c.isActive
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
              : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
          }`}
          title="Click to toggle status"
        >
          {c.isActive ? 'ACTIVE' : 'DISABLED'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      sortable: false,
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit Channel"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteChannel(c.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Delete Channel"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <span>Official Receiving Channels & Till Numbers</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure official JazzCash, EasyPaisa and Bank accounts displayed to investors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <CrmDataTable<OfficialDepositChannel>
          data={filteredChannels}
          columns={columns}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search by account title, account number, or gateway..."
          searchFields={[(c) => c.accountTitle, (c) => c.accountNumber, (c) => c.gateway, (c) => c.bankName]}
          filterGroups={filterGroups}
          initialPageSize={10}
          onRowClick={(c) => setSelectedChannel(c)}
          emptyMessage="No payment channels found"
          emptySubtext="Add an official channel using the 'Add Channel' button above."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedChannel(c)}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.gateway}</h3>
                    <p className="text-[10px] text-slate-400">{c.bankName || 'Mobile Account'}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.isActive
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {c.isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Title:</span>
                  <strong className="text-white">{c.accountTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Number / Till:</span>
                  <span className="font-mono font-bold text-amber-400">{c.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Limits:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{formatPKR(c.minDeposit)} - {formatPKR(c.maxDeposit)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                  Click to inspect details →
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteChannel(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Entity Detail Modal */}
      {selectedChannel && (
        <GatewayDetailModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
          onEdit={(c) => handleOpenEdit(c)}
          onDelete={(id) => onDeleteChannel(id)}
          onToggleActive={(id, st) => handleToggleActive(id, st)}
        />
      )}

      {/* 4. Create / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>{isEditing ? 'Edit Official Receiving Channel' : 'Add Official Receiving Channel'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Gateway Type</label>
                  <select
                    value={editingChannel.gateway}
                    onChange={(e) => setEditingChannel({ ...editingChannel, gateway: e.target.value as GatewayType })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                  >
                    {GATEWAY_OPTIONS.map((g) => (
                      <option key={g.type} value={g.type}>
                        {g.label} ({g.sub})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Account Title</label>
                  <input
                    type="text"
                    value={editingChannel.accountTitle}
                    onChange={(e) => setEditingChannel({ ...editingChannel, accountTitle: e.target.value })}
                    placeholder="e.g. PakInvest Official Pvt Ltd"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Account Number / Till ID / IBAN</label>
                  <input
                    type="text"
                    value={editingChannel.accountNumber}
                    onChange={(e) => setEditingChannel({ ...editingChannel, accountNumber: e.target.value })}
                    placeholder="e.g. 03001234567 or Till # 12345"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Bank Name (if applicable)</label>
                  <input
                    type="text"
                    value={editingChannel.bankName || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, bankName: e.target.value })}
                    placeholder="e.g. Meezan Bank, HBL"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Min Deposit Limit (PKR)</label>
                  <input
                    type="number"
                    min="100"
                    value={editingChannel.minDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, minDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Deposit Limit (PKR)</label>
                  <input
                    type="number"
                    min="1000"
                    value={editingChannel.maxDeposit}
                    onChange={(e) => setEditingChannel({ ...editingChannel, maxDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Deposit Instructions (shown to investor)</label>
                <textarea
                  value={editingChannel.instructions}
                  onChange={(e) => setEditingChannel({ ...editingChannel, instructions: e.target.value })}
                  placeholder="Steps the user must follow..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeChannelCheck"
                  checked={editingChannel.isActive}
                  onChange={(e) => setEditingChannel({ ...editingChannel, isActive: e.target.checked })}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <label htmlFor="activeChannelCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Activate channel immediately for receiving client deposits
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-md shadow-amber-950/40"
                >
                  {isSaving ? 'Saving...' : 'Save Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
