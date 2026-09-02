import React, { useState, useEffect } from 'react';
import {
  CrmNavTab,
  CrmStats,
  Transaction,
  UserProfile,
  InvestmentPlan,
  ActiveInvestment,
  OfficialDepositChannel,
} from '../types';
import { CrmLogin } from './CrmLogin';
import { CrmSidebar } from './CrmSidebar';
import { CrmHeader } from './CrmHeader';
import { CrmOverviewView } from './views/CrmOverviewView';
import { CrmDepositsView } from './views/CrmDepositsView';
import { CrmWithdrawalsView } from './views/CrmWithdrawalsView';
import { CrmActivePlansView } from './views/CrmActivePlansView';
import { CrmPlansView } from './views/CrmPlansView';
import { CrmRewardsView } from './views/CrmRewardsView';
import { CrmUsersView } from './views/CrmUsersView';
import { CrmGatewaysView } from './views/CrmGatewaysView';
import { CrmLedgerView } from './views/CrmLedgerView';
import { ToastContainer } from '../components/ToastContainer';
import { useApp } from '../context/AppContext';
import { CrmThemeProvider, useCrmTheme } from './context/CrmThemeContext';
import { getApiUrl } from '../config/api';

interface CrmAppProps {
  onSwitchToClient: () => void;
  onLogout?: () => void;
}

const CrmAppContent: React.FC<CrmAppProps> = ({ onSwitchToClient, onLogout }) => {
  const { showToast } = useApp();
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [adminName, setAdminName] = useState<string | null>(() => {
    return localStorage.getItem('pakinvest_crm_operator');
  });

  const [currentTab, setCurrentTab] = useState<CrmNavTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live CRM State
  const [stats, setStats] = useState<CrmStats>({
    totalDeposited: 0,
    totalWithdrawn: 0,
    pendingDepositsCount: 0,
    pendingDepositsVolume: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsVolume: 0,
    totalUsersCount: 0,
    activeInvestmentsCount: 0,
    totalLockedCapital: 0,
    totalPaidProfits: 0,
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allPlans, setAllPlans] = useState<InvestmentPlan[]>([]);
  const [allActiveInvestments, setAllActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [allChannels, setAllChannels] = useState<OfficialDepositChannel[]>([]);

  // Safe parse helper for robust networking
  const safeJson = async (res: Response) => {
    try {
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return { success: false, error: `Server response ${res.status}: ${res.statusText}` };
    }
  };

  // Fetch initial CRM Data (Stats, Pending Queue, Users, Plans, Gateways - No heavy bulk transaction array)
  const loadCrmData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, pendingRes, usersRes, plansRes, activeInvRes, channelsRes] = await Promise.all([
        fetch(getApiUrl('/api/admin/stats')),
        fetch(getApiUrl('/api/admin/pending')),
        fetch(getApiUrl('/api/admin/users')),
        fetch(getApiUrl('/api/admin/plans')),
        fetch(getApiUrl('/api/admin/active-investments')),
        fetch(getApiUrl('/api/admin/deposit-channels')),
      ]);

      const [statsData, pendingData, usersData, plansData, activeInvData, channelsData] = await Promise.all([
        safeJson(statsRes),
        safeJson(pendingRes),
        safeJson(usersRes),
        safeJson(plansRes),
        safeJson(activeInvRes),
        safeJson(channelsRes),
      ]);

      if (statsData?.success && statsData?.stats) setStats(statsData.stats);
      if (pendingData?.success && pendingData?.pending) setAllTransactions(pendingData.pending);
      if (usersData?.success && usersData?.users) setAllUsers(usersData.users);
      if (plansData?.success && plansData?.plans) setAllPlans(plansData.plans);
      if (activeInvData?.success && activeInvData?.activeInvestments) setAllActiveInvestments(activeInvData.activeInvestments);
      if (channelsData?.success && channelsData?.channels) setAllChannels(channelsData.channels);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (adminName) {
      loadCrmData();
    }
  }, [adminName]);

  const handleLoginSuccess = (name: string, token?: string) => {
    setAdminName(name);
    localStorage.setItem('pakinvest_crm_operator', name);
    if (token) {
      localStorage.setItem('pakinvest_admin_token', token);
    } else if (!localStorage.getItem('pakinvest_admin_token')) {
      const generatedToken = `adm_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('pakinvest_admin_token', generatedToken);
    }
    showToast('CRM Authenticated', `Welcome back, ${name}. Live session initialized.`, 'success');
  };

  const handleLogout = () => {
    setAdminName(null);
    localStorage.removeItem('pakinvest_crm_operator');
    localStorage.removeItem('pakinvest_admin_token');
    showToast('CRM Locked', 'Operator logged out securely.', 'info');
    if (onLogout) {
      onLogout();
    }
  };

  // Deposit Actions
  const handleApproveDeposit = async (txId: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/approve-deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Deposit Approved', 'User wallet credited & 3-tier commissions distributed.', 'success');
        await loadCrmData();
      } else {
        showToast('Approval Failed', data?.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to approve deposit.', 'error');
    }
  };

  const handleDeclineDeposit = async (txId: string, reason: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/decline-deposit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId, reason }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Deposit Declined', 'Request marked declined with reason.', 'info');
        await loadCrmData();
      } else {
        showToast('Action Failed', data?.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to decline deposit.', 'error');
    }
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = async (txId: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/approve-withdrawal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Withdrawal Dispatched', 'Marked settled in ledger.', 'success');
        await loadCrmData();
      } else {
        showToast('Action Failed', data?.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to approve withdrawal.', 'error');
    }
  };

  const handleDeclineWithdrawal = async (txId: string, reason: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/decline-withdrawal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId, reason }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Withdrawal Declined', 'Funds auto-refunded to user wallet.', 'warning');
        await loadCrmData();
      } else {
        showToast('Action Failed', data?.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to decline withdrawal.', 'error');
    }
  };

  // Active Contract Cancellation
  const handleCancelInvestment = async (invId: string, reason: string, refundPrincipal: boolean) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/active-investments/cancel'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentId: invId, reason, refundPrincipal }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Contract Cancelled', 'Investment contract closed and ledger updated.', 'info');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to cancel contract.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error cancelling contract.', 'error');
      return false;
    }
  };

  // Plan Actions
  const handleSavePlan = async (plan: InvestmentPlan) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/plans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Package Saved', `Plan "${plan.name}" updated successfully.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to save plan.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error saving plan.', 'error');
      return false;
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/plans/${planId}`), { method: 'DELETE' });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Package Deleted', 'Investment package removed.', 'info');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to delete plan.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error deleting plan.', 'error');
      return false;
    }
  };

  // User Actions
  const handleAdjustBalance = async (userId: string, amount: number, type: 'credit' | 'debit', note: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users/adjust-balance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, type, note }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Balance Adjusted', `User balance updated: ${type === 'credit' ? '+' : '-'}Rs. ${amount.toLocaleString()}`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to adjust balance.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error adjusting balance.', 'error');
      return false;
    }
  };

  const handleResetPin = async (userId: string, newPin: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/users/reset-pin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPin }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('PIN Reset', `Security PIN reset to ${newPin}.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to reset PIN.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error resetting PIN.', 'error');
      return false;
    }
  };

  // Channel Actions
  const handleSaveChannel = async (channel: OfficialDepositChannel) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/deposit-channels'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Channel Saved', `Payment channel "${channel.gateway}" saved successfully.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to save channel.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error saving channel.', 'error');
      return false;
    }
  };

  const handleAdjustChannel = async (channelId: string, gateway: string, amount: number, type: 'increase' | 'decrease', reason: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/deposit-channels/adjust'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, gateway, amount, type, reason }),
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Channel Adjusted', data.message || `Channel balance updated: ${type === 'increase' ? '+' : '-'}Rs. ${amount.toLocaleString()}`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to adjust channel.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error adjusting channel balance.', 'error');
      return false;
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/deposit-channels/${encodeURIComponent(channelId)}`), {
        method: 'DELETE',
      });
      const data = await safeJson(res);
      if (data?.success) {
        showToast('Channel Deleted', 'Payment channel removed successfully.', 'info');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data?.error || 'Failed to delete channel.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error deleting channel.', 'error');
      return false;
    }
  };

  // If not logged in as admin operator, show login screen
  if (!adminName) {
    return <CrmLogin onLoginSuccess={handleLoginSuccess} onBackToClient={onSwitchToClient} />;
  }

  const pendingTransactions = allTransactions.filter((t) => t.status === 'pending');

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <CrmOverviewView
            stats={stats}
            pendingTransactions={pendingTransactions}
            onApproveDeposit={handleApproveDeposit}
            onDeclineDeposit={(txId) => handleDeclineDeposit(txId, 'Declined by Administrator')}
            onApproveWithdrawal={handleApproveWithdrawal}
            onDeclineWithdrawal={(txId) => handleDeclineWithdrawal(txId, 'Declined by Administrator')}
            onNavigate={(t) => setCurrentTab(t)}
          />
        );
      case 'deposits':
        return (
          <CrmDepositsView
            deposits={allTransactions.filter((t) => t.type === 'deposit')}
            onApproveDeposit={handleApproveDeposit}
            onDeclineDeposit={handleDeclineDeposit}
          />
        );
      case 'withdrawals':
        return (
          <CrmWithdrawalsView
            withdrawals={allTransactions.filter((t) => t.type === 'withdrawal')}
            onApproveWithdrawal={handleApproveWithdrawal}
            onDeclineWithdrawal={handleDeclineWithdrawal}
          />
        );
      case 'active-plans':
        return (
          <CrmActivePlansView
            activeInvestments={allActiveInvestments}
            onCancelInvestment={handleCancelInvestment}
          />
        );
      case 'plans':
        return (
          <CrmPlansView
            plans={allPlans}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
          />
        );
      case 'rewards':
        return (
          <CrmRewardsView
            onRefresh={loadCrmData}
            showToast={showToast}
          />
        );
      case 'users':
        return (
          <CrmUsersView
            users={allUsers}
            onAdjustBalance={handleAdjustBalance}
            onResetPin={handleResetPin}
          />
        );
      case 'gateways':
        return (
          <CrmGatewaysView
            channels={allChannels}
            onSaveChannel={handleSaveChannel}
            onAdjustChannel={handleAdjustChannel}
            onDeleteChannel={handleDeleteChannel}
          />
        );
      case 'ledger':
        return (
          <CrmLedgerView />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <CrmSidebar
          currentTab={currentTab}
          onTabChange={(t) => setCurrentTab(t)}
          pendingDepositsCount={stats.pendingDepositsCount}
          pendingWithdrawalsCount={stats.pendingWithdrawalsCount}
          adminName={adminName}
          onLogout={handleLogout}
          onSwitchToClient={onSwitchToClient}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <CrmHeader
          currentTab={currentTab}
          onRefresh={loadCrmData}
          isRefreshing={isRefreshing}
          pendingDepositsCount={stats.pendingDepositsCount}
          pendingWithdrawalsCount={stats.pendingWithdrawalsCount}
          onNavigate={(t) => setCurrentTab(t)}
          onSwitchToClient={onSwitchToClient}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Mobile Sidebar Dropdown */}
        {isMobileMenuOpen && (
          <div
            className={`md:hidden border-b p-4 space-y-2 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {[
              { id: 'overview', label: 'Dashboard & Metrics' },
              { id: 'deposits', label: `Deposit Approvals (${stats.pendingDepositsCount})` },
              { id: 'withdrawals', label: `Withdrawal Payouts (${stats.pendingWithdrawalsCount})` },
              { id: 'active-plans', label: `Active Contracts (${stats.activeInvestmentsCount})` },
              { id: 'plans', label: 'Investment Packages' },
              { id: 'rewards', label: 'Rewards & Streaks' },
              { id: 'users', label: 'Investors Directory' },
              { id: 'gateways', label: 'Payment Channels' },
              { id: 'ledger', label: 'Master Financial Ledger' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id as CrmNavTab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold ${
                  currentTab === item.id
                    ? 'bg-emerald-600 text-white'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className={`pt-2 border-t flex justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={onSwitchToClient}
                className="text-xs text-emerald-500 font-bold"
              >
                Switch to Investor App
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-500 font-bold"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export const CrmApp: React.FC<CrmAppProps> = (props) => {
  return (
    <CrmThemeProvider>
      <CrmAppContent {...props} />
    </CrmThemeProvider>
  );
};

export default CrmApp;
