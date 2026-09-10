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
import { NotificationModal } from '../components/NotificationModal';
import { AuthModal } from '../components/auth/AuthModal';
import { AuthScreen } from './AuthScreen';
import { TermsAndPoliciesPage } from '../components/pages/TermsAndPoliciesPage';
import { SupportPage } from '../components/pages/SupportPage';
import { LoadingScreen } from '../components/common/LoadingScreen';

export const ClientApp: React.FC = () => {
  const { currentTab, setCurrentTab, isAuthModalOpen, setIsAuthModalOpen, isAuthenticated, isInitialLoading } = useApp();

  // Full-screen loading screen until initial data is fully loaded
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, require user to Login or Register first
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  // Standalone full-screen pages (without standard header and bottom tabs, with top bar and back button)
  if (currentTab === 'terms') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <TermsAndPoliciesPage onBack={() => setCurrentTab('home')} />
        <DepositModal />
        <WithdrawModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentTab === 'support') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        <SupportPage onBack={() => setCurrentTab('home')} />
        <DepositModal />
        <WithdrawModal />
        <ToastContainer />
      </div>
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
      <NotificationModal />
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
