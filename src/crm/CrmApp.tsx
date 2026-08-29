import React, { useState, useEffect } from 'react';
import {
  CrmNavTab,
  CrmStats,
  Transaction,
  UserProfile,
  InvestmentPlan,
  OfficialDepositChannel,
  DatabaseStatus,
} from '../types';
import { CrmLogin } from './CrmLogin';
import { CrmSidebar } from './CrmSidebar';
import { CrmHeader } from './CrmHeader';
import { CrmOverviewView } from './views/CrmOverviewView';
import { CrmDepositsView } from './views/CrmDepositsView';
import { CrmWithdrawalsView } from './views/CrmWithdrawalsView';
import { CrmPlansView } from './views/CrmPlansView';
import { CrmUsersView } from './views/CrmUsersView';
import { CrmGatewaysView } from './views/CrmGatewaysView';
import { CrmLedgerView } from './views/CrmLedgerView';
import { ToastContainer } from '../components/ToastContainer';
import { useApp } from '../context/AppContext';

interface CrmAppProps {
  onSwitchToClient: () => void;
}

export const CrmApp: React.FC<CrmAppProps> = ({ onSwitchToClient }) => {
  const { showToast } = useApp();
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
  const [allChannels, setAllChannels] = useState<OfficialDepositChannel[]>([]);

  // Fetch all CRM Data
  const loadCrmData = async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, txRes, usersRes, plansRes, channelsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/users'),
        fetch('/api/admin/plans'),
        fetch('/api/admin/deposit-channels'),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success && d.stats) setStats(d.stats);
      }

      if (txRes.ok) {
        const d = await txRes.json();
        if (d.success && d.transactions) setAllTransactions(d.transactions);
      }

      if (usersRes.ok) {
        const d = await usersRes.json();
        if (d.success && d.users) setAllUsers(d.users);
      }

      if (plansRes.ok) {
        const d = await plansRes.json();
        if (d.success && d.plans) setAllPlans(d.plans);
      }

      if (channelsRes.ok) {
        const d = await channelsRes.json();
        if (d.success && d.channels) setAllChannels(d.channels);
      }
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


  const handleLoginSuccess = (name: string) => {
    setAdminName(name);
    localStorage.setItem('pakinvest_crm_operator', name);
    showToast('CRM Authenticated', `Welcome back, ${name}. Live session initialized.`, 'success');
  };

  const handleLogout = () => {
    setAdminName(null);
    localStorage.removeItem('pakinvest_crm_operator');
    showToast('CRM Locked', 'Operator logged out securely.', 'info');
  };

  // Deposit Actions
  const handleApproveDeposit = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/approve-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Deposit Approved', 'User wallet credited & 3-tier commissions distributed.', 'success');
        await loadCrmData();
      } else {
        showToast('Approval Failed', data.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to approve deposit.', 'error');
    }
  };

  const handleDeclineDeposit = async (txId: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/decline-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Deposit Declined', 'Request marked declined with reason.', 'info');
        await loadCrmData();
      } else {
        showToast('Action Failed', data.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to decline deposit.', 'error');
    }
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = async (txId: string) => {
    try {
      const res = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Withdrawal Dispatched', 'Marked settled in ledger.', 'success');
        await loadCrmData();
      } else {
        showToast('Action Failed', data.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to approve withdrawal.', 'error');
    }
  };

  const handleDeclineWithdrawal = async (txId: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/decline-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, transactionId: txId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Withdrawal Declined', 'Funds auto-refunded to user wallet.', 'warning');
        await loadCrmData();
      } else {
        showToast('Action Failed', data.error || 'Server error', 'error');
      }
    } catch (err) {
      showToast('Error', 'Failed to decline withdrawal.', 'error');
    }
  };

  // Plan Actions
  const handleSavePlan = async (plan: InvestmentPlan) => {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Package Saved', `Plan "${plan.name}" updated successfully.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data.error || 'Failed to save plan.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error saving plan.', 'error');
      return false;
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Package Deleted', 'Investment package removed.', 'info');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data.error || 'Failed to delete plan.', 'error');
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
      const res = await fetch('/api/admin/users/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, type, note }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Balance Adjusted', `User balance updated: ${type === 'credit' ? '+' : '-'}Rs. ${amount.toLocaleString()}`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data.error || 'Failed to adjust balance.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error adjusting balance.', 'error');
      return false;
    }
  };

  const handleResetPin = async (userId: string, newPin: string) => {
    try {
      const res = await fetch('/api/admin/users/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('PIN Reset', `Security PIN reset to ${newPin}.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data.error || 'Failed to reset PIN.', 'error');
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
      const res = await fetch('/api/admin/deposit-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Channel Updated', `Payment channel "${channel.gateway}" saved.`, 'success');
        await loadCrmData();
        return true;
      } else {
        showToast('Error', data.error || 'Failed to save channel.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error', 'Network error saving channel.', 'error');
      return false;
    }
  };

  // If not logged in as admin operator, show login screen
  if (!adminName) {
    return <CrmLogin onLoginSuccess={handleLoginSuccess} />;
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
      case 'plans':
        return (
          <CrmPlansView
            plans={allPlans}
            onSavePlan={handleSavePlan}
            onDeletePlan={handleDeletePlan}
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
          />
        );
      case 'ledger':
        return (
          <CrmLedgerView transactions={allTransactions} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
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
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard & Metrics' },
              { id: 'deposits', label: `Deposit Approvals (${stats.pendingDepositsCount})` },
              { id: 'withdrawals', label: `Withdrawal Payouts (${stats.pendingWithdrawalsCount})` },
              { id: 'plans', label: 'Investment Packages' },
              { id: 'users', label: 'Investors Directory' },
              { id: 'gateways', label: 'Payment Channels' },
              { id: 'ledger', label: 'Master Ledger' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentTab(item.id as CrmNavTab);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold ${
                  currentTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-800 flex justify-between">
              <button
                type="button"
                onClick={onSwitchToClient}
                className="text-xs text-emerald-400 font-bold"
              >
                Switch to Client App
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-400 font-bold"
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


export default CrmApp;
