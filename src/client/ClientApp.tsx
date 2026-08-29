import React from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { ToastContainer } from '../components/ToastContainer';
import { HomeTab } from '../components/tabs/HomeTab';
import { PlansTab } from '../components/tabs/PlansTab';
import { TransactionsTab } from '../components/tabs/TransactionsTab';
import { WalletTab } from '../components/tabs/WalletTab';
import { ReferralTab } from '../components/tabs/ReferralTab';
import { SettingsTab } from '../components/tabs/SettingsTab';

// Client-facing Down-to-Up Interactive Modals
import { DepositModal } from '../components/modals/DepositModal';
import { WithdrawModal } from '../components/modals/WithdrawModal';
import { PlanDetailModal } from '../components/modals/PlanDetailModal';
import { TransactionReceiptModal } from '../components/modals/TransactionReceiptModal';
import { ClaimRewardsModal } from '../components/modals/ClaimRewardsModal';
import { AddAccountModal } from '../components/modals/AddAccountModal';
import { AuthModal } from '../components/auth/AuthModal';
import { AuthScreen } from './AuthScreen';

export const ClientApp: React.FC = () => {
  const { currentTab, isAuthModalOpen, setIsAuthModalOpen, isAuthenticated } = useApp();

  // If not authenticated, require user to Login or Register first
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab />;
      case 'plans':
        return <PlansTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'wallet':
        return <WalletTab />;
      case 'referral':
        return <ReferralTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Client Mobile/Tablet Header */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-0 sm:px-2">
        {renderActiveTab()}
      </main>

      {/* Floating Bottom Nav */}
      <BottomNav />

      {/* Client Interactive Modals */}
      <DepositModal />
      <WithdrawModal />
      <PlanDetailModal />
      <TransactionReceiptModal />
      <ClaimRewardsModal />
      <AddAccountModal />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default ClientApp;
