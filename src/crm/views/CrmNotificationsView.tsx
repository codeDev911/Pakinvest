import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Send,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Clock,
  Trash2,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Gift,
  Coins,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  UserCheck,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';
import { getApiUrl } from '../../config/api';
import {
  NotificationFilterTarget,
  NotificationAudienceFilter,
  CrmNotificationBroadcast,
  MatchedUserSummary,
  NavTab,
} from '../../types';
import { formatPKR } from '../../utils/formatters';

interface CrmNotificationsViewProps {
  adminName?: string;
  showToast: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

const PRESET_TARGETS: {
  id: NotificationFilterTarget;
  label: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
}[] = [
  {
    id: 'all',
    label: 'All Registered Users',
    description: 'Broadcast to every registered user in the database',
    icon: <Users className="w-4 h-4 text-blue-500" />,
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'active_investors',
    label: 'Active Investors',
    description: 'Users with at least one active, running investment package',
    icon: <Zap className="w-4 h-4 text-emerald-500" />,
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'non_investors',
    label: 'Inactive / Non-Investors',
    description: 'Registered users who have zero active investment plans',
    icon: <UserCheck className="w-4 h-4 text-amber-500" />,
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'balance_range',
    label: 'Wallet Balance Filter',
    description: 'Users whose current balance falls within a PKR range',
    icon: <Coins className="w-4 h-4 text-indigo-500" />,
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'pending_deposits',
    label: 'Pending Deposits',
    description: 'Users awaiting payment verification on submitted deposits',
    icon: <ArrowDownLeft className="w-4 h-4 text-teal-500" />,
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'pending_withdrawals',
    label: 'Pending Withdrawals',
    description: 'Users with cashout requests currently pending dispatch',
    icon: <ArrowUpRight className="w-4 h-4 text-purple-500" />,
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'top_earners',
    label: 'Top Earners / VIPs',
    description: 'High-performing investors with total profit above threshold',
    icon: <Gift className="w-4 h-4 text-rose-500" />,
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'specific_users',
    label: 'Specific Picked Users',
    description: 'Search and hand-pick individual users by phone or name',
    icon: <Search className="w-4 h-4 text-cyan-500" />,
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  },
];

const NOTIFICATION_TEMPLATES = [
  {
    title: 'Weekend 10% Deposit Bonus Live! 🎉',
    message: 'Deposit Rs. 1,000 or more this weekend to get an instant 10% cash bonus credited directly to your wallet.',
    type: 'promo' as const,
    actionTab: 'deposit' as NavTab,
  },
  {
    title: 'Daily Yield Profits Credited ⚡',
    message: 'Today’s guaranteed earnings from your active investment packages have been distributed to your wallet balance.',
    type: 'profit_unlocked' as const,
    actionTab: 'home' as NavTab,
  },
  {
    title: 'High-Yield Solar Grid Package Now Open ☀️',
    message: 'A new tranche of the Punjab Commercial Solar Initiative is now open. Earn 6.0% daily with 100% capital guarantee.',
    type: 'broadcast' as const,
    actionTab: 'invest' as NavTab,
  },
  {
    title: 'Instant Cashout Processing Active 💸',
    message: 'All withdrawal requests for JazzCash and EasyPaisa are being processed with 0% gateway transfer fee.',
    type: 'system' as const,
    actionTab: 'wallet' as NavTab,
  },
  {
    title: 'Security Alert: Protect Your 4-Digit PIN 🔒',
    message: 'Investify staff will never ask for your 4-digit Transaction PIN or OTP. Only use official app deposit accounts.',
    type: 'alert' as const,
    actionTab: 'none' as const,
  },
];

export const CrmNotificationsView: React.FC<CrmNotificationsViewProps> = ({
  adminName = 'CRM Operator',
  showToast,
}) => {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  // Active Main Tab inside Notifications view
  const [activeSubTab, setActiveSubTab] = useState<'composer' | 'history'>('composer');

  // Filter State
  const [filterTarget, setFilterTarget] = useState<NotificationFilterTarget>('all');
  const [minBalance, setMinBalance] = useState<number | ''>('');
  const [maxBalance, setMaxBalance] = useState<number | ''>('');
  const [minProfit, setMinProfit] = useState<number>(2000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [registrationDays, setRegistrationDays] = useState<number>(0); // 0 = all time
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Notification Content State
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [notifType, setNotifType] = useState<'system' | 'broadcast' | 'promo' | 'alert' | 'profit_unlocked'>('broadcast');
  const [actionTab, setActionTab] = useState<NavTab | 'none'>('plans');
  const [bonusAmount, setBonusAmount] = useState<number | ''>('');

  // Audience Preview State
  const [isCalculatingAudience, setIsCalculatingAudience] = useState<boolean>(false);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [filterSummary, setFilterSummary] = useState<string>('All Registered Users');
  const [sampleUsers, setSampleUsers] = useState<MatchedUserSummary[]>([]);

  // User Picker (for specific_users mode)
  const [availableUsers, setAvailableUsers] = useState<MatchedUserSummary[]>([]);
  const [userPickerSearch, setUserPickerSearch] = useState<string>('');

  // Sending State & Modals
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // History State
  const [historyList, setHistoryList] = useState<CrmNotificationBroadcast[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // 1. Fetch available users list for user picker
  const loadUsersForPicker = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users'));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.users)) {
        setAvailableUsers(data.users);
      }
    } catch (e) {
      console.warn('Failed to load users for picker:', e);
    }
  }, []);

  // 2. Fetch Broadcast History
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/notifications/history'));
      const data = await res.json();
      if (data?.success && Array.isArray(data?.history)) {
        setHistoryList(data.history);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadUsersForPicker();
    loadHistory();
  }, [loadUsersForPicker, loadHistory]);

  // 3. Dynamic Audience Preview Calculation (with debounce)
  const currentFilterPayload = useMemo<NotificationAudienceFilter>(() => {
    return {
      target: filterTarget,
      minBalance: typeof minBalance === 'number' ? minBalance : undefined,
      maxBalance: typeof maxBalance === 'number' && maxBalance > 0 ? maxBalance : undefined,
      minProfit: filterTarget === 'top_earners' ? minProfit : undefined,
      specificUserIds: filterTarget === 'specific_users' ? selectedUserIds : undefined,
      searchQuery: searchQuery.trim() || undefined,
      registrationDays: registrationDays > 0 ? registrationDays : undefined,
    };
  }, [filterTarget, minBalance, maxBalance, minProfit, selectedUserIds, searchQuery, registrationDays]);

  const calculateAudiencePreview = useCallback(async (filter: NotificationAudienceFilter) => {
    setIsCalculatingAudience(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/notifications/preview-audience'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter }),
      });
      const data = await res.json();
      if (data?.success) {
        setMatchedCount(data.count);
        setTotalUsersCount(data.totalUsers);
        setFilterSummary(data.filterSummary || '');
        if (Array.isArray(data.sampleUsers)) {
          setSampleUsers(data.sampleUsers);
        }
      }
    } catch (err) {
      console.error('Audience preview error:', err);
    } finally {
      setIsCalculatingAudience(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateAudiencePreview(currentFilterPayload);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentFilterPayload, calculateAudiencePreview]);

  // Apply Template
  const handleApplyTemplate = (tmpl: typeof NOTIFICATION_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setNotifType(tmpl.type);
    setActionTab(tmpl.actionTab);
    showToast('Template Applied', tmpl.title, 'info');
  };

  // Toggle User Selection in Specific User Mode
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Filtered list for the user picker modal/box
  const filteredUsersForPicker = useMemo(() => {
    if (!userPickerSearch.trim()) return availableUsers.slice(0, 50);
    const q = userPickerSearch.toLowerCase();
    return availableUsers
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }, [availableUsers, userPickerSearch]);

  // Handle Dispatch Broadcast
  const handleSendBroadcast = async () => {
    if (!title.trim()) {
      showToast('Validation Error', 'Please enter a notification title.', 'warning');
      return;
    }
    if (!message.trim()) {
      showToast('Validation Error', 'Please enter a notification message.', 'warning');
      return;
    }
    if (matchedCount === 0) {
      showToast('No Recipients', 'No users match your selected filter criteria.', 'error');
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/notifications/broadcast'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type: notifType,
          actionTab: actionTab !== 'none' ? actionTab : undefined,
          amount: typeof bonusAmount === 'number' ? bonusAmount : undefined,
          filter: currentFilterPayload,
          adminName,
        }),
      });

      const data = await res.json();
      if (data?.success) {
        showToast(
          'Broadcast Delivered! 🚀',
          `Alert successfully sent to ${data.count} targeted user(s).`,
          'success'
        );
        setShowConfirmModal(false);
        // Refresh history
        await loadHistory();
        // Clear message fields
        setTitle('');
        setMessage('');
        setBonusAmount('');
      } else {
        showToast('Dispatch Error', data?.error || 'Failed to dispatch notification', 'error');
      }
    } catch (err: any) {
      showToast('Network Error', 'Failed to connect to backend server.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Delete Campaign from History
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/notifications/history/${campaignId}`), {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data?.success) {
        setHistoryList((prev) => prev.filter((c) => c.id !== campaignId));
        showToast('History Updated', 'Campaign record removed.', 'info');
      }
    } catch (err) {
      showToast('Error', 'Failed to delete history record', 'error');
    }
  };

  // Reuse past campaign in composer
  const handleReuseCampaign = (c: CrmNotificationBroadcast) => {
    setTitle(c.title);
    setMessage(c.message);
    setNotifType(c.type as any);
    if (c.actionTab && c.actionTab !== 'none') {
      setActionTab(c.actionTab as NavTab);
    }
    if (c.filterTarget) {
      setFilterTarget(c.filterTarget);
    }
    setActiveSubTab('composer');
    showToast('Loaded Campaign', `"${c.title}" loaded into composer.`, 'info');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Overview KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Push & In-App Broadcast Center
            </h1>
          </div>
          <p className={`text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Target, filter, and instantly dispatch customized alerts, bonuses, and announcements to investors.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div
          className={`flex items-center p-1 rounded-xl border self-start sm:self-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveSubTab('composer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'composer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Campaign History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black">{totalUsersCount.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Database registered accounts</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Target Audience</span>
            <div className="flex items-center gap-1">
              {isCalculatingAudience ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {matchedCount.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-slate-400">
              ({totalUsersCount > 0 ? Math.round((matchedCount / totalUsersCount) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 truncate mt-0.5 block">
            {filterSummary}
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Campaigns Sent</span>
            <Send className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black">{historyList.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Logged in CRM audit logs</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Delivered</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">
            {historyList.reduce((sum, c) => sum + (c.recipientsCount || 0), 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Lifetime delivered notifications</span>
        </div>
      </div>

      {activeSubTab === 'composer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Audience Filter Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Target Audience Selection */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <h3 className="font-bold text-sm md:text-base">Select Target Audience Filter</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  {matchedCount} Users Matched
                </span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {PRESET_TARGETS.map((preset) => {
                  const isSelected = filterTarget === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setFilterTarget(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : isDark
                          ? 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            {preset.icon}
                          </div>
                          <span className="text-xs font-bold">{preset.label}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Sub-Filter Options Based on Selected Target */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Refine Audience Filters</span>
                </div>

                {/* Specific User Search & Select Mode */}
                {filterTarget === 'specific_users' && (
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={userPickerSearch}
                        onChange={(e) => setUserPickerSearch(e.target.value)}
                        placeholder="Search investor by Name, Phone, or Email..."
                        className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>

                    <div
                      className={`max-h-48 overflow-y-auto rounded-xl border p-1 space-y-1 ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      {filteredUsersForPicker.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">No users found</div>
                      ) : (
                        filteredUsersForPicker.map((u) => {
                          const isChecked = selectedUserIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleUserSelection(u.id)}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                  : isDark
                                  ? 'hover:bg-slate-800'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="rounded text-emerald-600 focus:ring-0"
                                />
                                <div className="truncate">
                                  <div className="font-bold truncate">{u.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {u.phone} • {formatPKR(u.balance)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                {u.activePackagesCount || 0} plans
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{selectedUserIds.length} users manually selected</span>
                      {selectedUserIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedUserIds([])}
                          className="text-rose-500 hover:underline font-bold"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Balance Threshold Filters */}
                {(filterTarget === 'balance_range' || filterTarget === 'all' || filterTarget === 'active_investors') && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Min Balance (PKR)
                      </label>
                      <input
                        type="number"
                        value={minBalance}
                        onChange={(e) => setMinBalance(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 1000"
                        className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Max Balance (PKR)
                      </label>
                      <input
                        type="number"
                        value={maxBalance}
                        onChange={(e) => setMaxBalance(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Leave empty for unlimited"
                        className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Top Earners Threshold */}
                {filterTarget === 'top_earners' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Minimum Total Profit (PKR)
                    </label>
                    <input
                      type="number"
                      value={minProfit}
                      onChange={(e) => setMinProfit(Number(e.target.value))}
                      placeholder="e.g. 5000"
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none font-mono ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                )}

                {/* Registration Date Window */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Joined Date Range
                  </label>
                  <div className="flex gap-2">
                    {[
                      { days: 0, label: 'All Time' },
                      { days: 7, label: 'Last 7 Days' },
                      { days: 30, label: 'Last 30 Days' },
                    ].map((btn) => (
                      <button
                        key={btn.days}
                        type="button"
                        onClick={() => setRegistrationDays(btn.days)}
                        className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all ${
                          registrationDays === btn.days
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Audience Preview Chips */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-500">
                    Sample Matched Recipients ({sampleUsers.length} shown of {matchedCount})
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Live Verified
                  </span>
                </div>

                {sampleUsers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl">
                    No users match this filter combination. Try loosening your criteria.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {sampleUsers.map((u) => (
                      <div
                        key={u.id}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                        title={`Balance: Rs. ${u.balance.toLocaleString()} | Active Plans: ${u.activePackagesCount || 0}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium truncate max-w-[110px]">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {u.phone.slice(-4)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Notification Composer Studio (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <h3 className="font-bold text-sm md:text-base">Compose Notification</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">In-App & Push</span>
              </div>

              {/* Quick Template Picker */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  1-Click Quick Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {NOTIFICATION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tmpl.title.split(' ')[0]} {tmpl.title.split(' ')[1]}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Category */}
              <div className="mb-3.5">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Category Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'broadcast', label: 'Broadcast', icon: <Bell className="w-3.5 h-3.5 text-blue-500" /> },
                    { id: 'promo', label: 'Special Promo', icon: <Gift className="w-3.5 h-3.5 text-purple-500" /> },
                    { id: 'profit_unlocked', label: 'Profit Yield', icon: <Sparkles className="w-3.5 h-3.5 text-teal-500" /> },
                    { id: 'system', label: 'System Notice', icon: <Info className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'alert', label: 'Urgent Alert', icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNotifType(cat.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        notifType === cat.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : isDark
                          ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.icon}
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-500">
                    Notification Title *
                  </label>
                  <span className="text-[10px] text-slate-400">{title.length}/60</span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend 10% Deposit Bonus Live! 🎉"
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none font-semibold ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Message Body Field */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-500">
                    Notification Message Body *
                  </label>
                  <span className="text-[10px] text-slate-400">{message.length}/250</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write message content delivered to user app notification center and mobile notifications..."
                  className={`w-full p-3 text-xs rounded-xl border outline-none leading-relaxed ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Deep Link Action Tab & Optional Bonus Amount */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Action Deep-Link Tab
                  </label>
                  <select
                    value={actionTab}
                    onChange={(e) => setActionTab(e.target.value as any)}
                    className={`w-full px-2.5 py-2 text-xs rounded-xl border outline-none ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="none">None (Notification Only)</option>
                    <option value="invest">Invest Packages Tab</option>
                    <option value="deposit">Deposit Cashier Screen</option>
                    <option value="rewards">Daily Streak / Rewards</option>
                    <option value="team">Referral Network Hub</option>
                    <option value="wallet">Wallet Cashout Screen</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Bonus Tag Amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 500"
                    className={`w-full px-2.5 py-2 text-xs rounded-xl border outline-none font-mono ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Live Mobile Preview Card */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mobile Notification Live Preview</span>
                </div>
                <div
                  className={`p-3.5 rounded-2xl border shadow-xs relative ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Investify App • Now
                        </span>
                        {bonusAmount && (
                          <span className="text-[10px] font-black text-emerald-600 font-mono">
                            +Rs. {Number(bonusAmount).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {title.trim() || 'Your Notification Title Here'}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 mt-0.5">
                        {message.trim() || 'This is how your notification message body will display to users.'}
                      </p>
                      {actionTab !== 'none' && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Tap to open {actionTab.toUpperCase()}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <button
                type="button"
                disabled={isSending || matchedCount === 0 || !title.trim() || !message.trim()}
                onClick={() => setShowConfirmModal(true)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  matchedCount > 0 && title.trim() && message.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.98]'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {matchedCount === 0
                    ? 'No Recipients Matched'
                    : `Dispatch Broadcast to ${matchedCount.toLocaleString()} User(s)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Sent Campaigns History Sub-Tab */
        <div
          className={`p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-bold text-base">Broadcast Campaigns Audit Log</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Record of all mass notifications sent through the CRM filter system.
              </p>
            </div>
            <button
              onClick={loadHistory}
              className={`px-3 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 font-bold self-start ${
                isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {historyList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-semibold">No broadcast campaigns sent yet.</p>
              <p className="text-xs text-slate-500">
                Use the "Send Broadcast" tab to dispatch your first filtered notification.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <th className="py-3 px-3 font-bold">Campaign & Title</th>
                    <th className="py-3 px-3 font-bold">Target Audience</th>
                    <th className="py-3 px-3 font-bold">Delivered</th>
                    <th className="py-3 px-3 font-bold">Action Link</th>
                    <th className="py-3 px-3 font-bold">Sent Time (PKT)</th>
                    <th className="py-3 px-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {historyList.map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors`}
                    >
                      <td className="py-3 px-3 max-w-[280px]">
                        <div className="font-bold truncate text-slate-900 dark:text-white">
                          {c.title}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.message}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {c.filterSummary}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {c.recipientsCount?.toLocaleString() || 0} users
                      </td>
                      <td className="py-3 px-3">
                        {c.actionTab && c.actionTab !== 'none' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                            <span>{c.actionTab.toUpperCase()}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {c.sentAt}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReuseCampaign(c)}
                            title="Duplicate into Composer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCampaign(c.id)}
                            title="Delete History Record"
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black">Confirm Notification Dispatch</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are about to broadcast this alert to real users across Pakistan.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Target Group:</span>
                <span className="font-bold text-right">{filterSummary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient Count:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {matchedCount.toLocaleString()} Users
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="font-bold text-right truncate max-w-[200px]">{title}</span>
              </div>
              {actionTab !== 'none' && (
                <div className="flex justify-between">
                  <span className="text-slate-400">App Deep Link:</span>
                  <span className="font-bold text-blue-500 uppercase">{actionTab}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleSendBroadcast}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
