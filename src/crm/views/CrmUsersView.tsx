import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../../types';
import { formatPKR, formatPakistanDateTime } from '../../utils/formatters';
import { getApiUrl } from '../../config/api';
import {
  Users,
  Search,
  KeyRound,
  Coins,
  ShieldCheck,
  Phone,
  Calendar,
  Wallet,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { CrmDataTable, Column, FilterGroup } from '../components/CrmDataTable';
import { UserDetailModal } from '../components/UserDetailModal';
import { useCrmTheme } from '../context/CrmThemeContext';

interface CrmUsersViewProps {
  users?: UserProfile[];
  onAdjustBalance: (userId: string, amount: number, type: 'credit' | 'debit', note: string) => Promise<boolean>;
  onResetPin: (userId: string, newPin: string) => Promise<boolean>;
  onResetPassword?: (userId: string, newPassword: string) => Promise<boolean>;
}

export const CrmUsersView: React.FC<CrmUsersViewProps> = ({
  users: propUsers,
  onAdjustBalance,
  onResetPin,
  onResetPassword,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [usersList, setUsersList] = useState<UserProfile[]>(propUsers || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Tab-specific independent fetch
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/users'));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.users)) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleModalAdjustBalance = async (userId: string, amount: number, type: 'credit' | 'debit', note: string) => {
    const success = await onAdjustBalance(userId, amount, type, note);
    if (success) {
      await fetchUsers();
    }
    return success;
  };

  const handleModalResetPin = async (userId: string, newPin: string) => {
    const success = await onResetPin(userId, newPin);
    if (success) {
      await fetchUsers();
      setSelectedUser((prev) => (prev && prev.id === userId ? { ...prev, securityPin: newPin } : prev));
    }
    return success;
  };

  const handleModalResetPassword = async (userId: string, newPassword: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (data?.success) {
        await fetchUsers();
        setSelectedUser((prev) => (prev && prev.id === userId ? { ...prev, plainPassword: newPassword, password: newPassword } : prev));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter === 'admin' && !u.isAdmin) return false;
    if (roleFilter === 'investor' && u.isAdmin) return false;
    if (statusFilter === 'verified' && !u.isVerified) return false;
    if (statusFilter === 'unverified' && u.isVerified) return false;
    return true;
  });

  const filterGroups: FilterGroup[] = [
    {
      key: 'role',
      label: 'Account Role',
      selectedValue: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: 'All Roles', value: 'all' },
        { label: 'Standard Investors', value: 'investor' },
        { label: 'System Admins', value: 'admin' },
      ],
    },
    {
      key: 'status',
      label: 'Verification',
      selectedValue: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Verification Statuses', value: 'all' },
        { label: 'Verified Accounts', value: 'verified' },
        { label: 'Pending KYC / Unverified', value: 'unverified' },
      ],
    },
  ];

  const columns: Column<UserProfile>[] = [
    {
      key: 'name',
      header: 'Investor Name & Phone',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-xs shrink-0">
            {u.name ? u.name.slice(0, 2).toUpperCase() : 'IN'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight">{u.name}</span>
              {u.isAdmin && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[9px] font-bold">
                  Admin
                </span>
              )}
            </div>
            <div className="font-mono text-[10px] text-slate-400">{u.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'referralCode',
      header: 'Ref Code & Upline',
      render: (u) => (
        <div>
          <div className="font-mono font-bold text-amber-400 text-xs">{u.referralCode}</div>
          <div className="text-[10px] text-slate-400">
            Sponsor: {u.referredBy ? <strong className="text-purple-300 font-mono">{u.referredBy}</strong> : 'None (Direct)'}
          </div>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Wallet Balance',
      align: 'right',
      render: (u) => (
        <div className="font-black text-emerald-400 font-mono text-sm">
          {formatPKR(u.balance)}
        </div>
      ),
    },
    {
      key: 'investedCapital',
      header: 'Locked Capital',
      align: 'right',
      render: (u) => (
        <div className="font-black text-indigo-400 font-mono text-xs">
          {formatPKR(u.investedCapital || 0)}
        </div>
      ),
    },
    {
      key: 'totalWithdrawn',
      header: 'Total Withdrawn',
      align: 'right',
      render: (u) => (
        <div className="font-bold text-amber-400 font-mono text-xs">
          {formatPKR(u.totalWithdrawn || 0)}
        </div>
      ),
    },
    {
      key: 'joinedDate',
      header: 'Joined Date (PKT)',
      render: (u) => (
        <span className="text-[11px] text-slate-300">
          {u.joinedDate ? formatPakistanDateTime(u.joinedDate) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Manage',
      align: 'right',
      sortable: false,
      render: (u) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(u);
          }}
          className="py-1 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[11px] font-bold transition-colors"
        >
          Manage Profile
        </button>
      ),
    },
  ];

  // Summary Metrics
  const totalBalances = usersList.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalLocked = usersList.reduce((sum, u) => sum + (u.investedCapital || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Registered Investor Accounts
          </span>
          <p className="text-2xl font-black text-white tracking-tight mt-1">
            {usersList.length} Users
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Liquid User Balances
          </span>
          <p className="text-2xl font-black text-emerald-500 tracking-tight mt-1">
            {formatPKR(totalBalances)}
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Locked Active Capital
          </span>
          <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">
            {formatPKR(totalLocked)}
          </p>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <CrmDataTable<UserProfile>
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        title="Investor Directory & Balance Adjustments"
        subtitle="Manage investor accounts, inspect ledger histories, credit/debit balances, and reset PINs"
        icon={<Users className="w-5 h-5" />}
        searchPlaceholder="Search by name, Pakistani phone, email, referral code, or User ID..."
        searchFields={[
          (u) => u.name,
          (u) => u.phone,
          (u) => u.email,
          (u) => u.referralCode,
          (u) => u.id,
        ]}
        filterGroups={filterGroups}
        initialPageSize={10}
        onRowClick={(u) => setSelectedUser(u)}
        emptyMessage="No investor accounts found"
        emptySubtext="When users register in the mobile portal, they appear in this directory."
      />

      {/* 3. Entity Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAdjustBalance={handleModalAdjustBalance}
          onResetPin={handleModalResetPin}
          onResetPassword={handleModalResetPassword}
        />
      )}
    </div>
  );
};
