import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  InvestmentPlan,
  ActiveInvestment,
  Transaction,
  PaymentAccount,
  OfficialDepositChannel,
  AppTheme,
  NavTab,
  GatewayType,
  LivePayoutNotification,
  DatabaseStatus,
} from '../types';
import { INITIAL_PLANS, LIVE_PAYOUT_FEED, OFFICIAL_DEPOSIT_CHANNELS } from '../data/mockData';
import { fireConfetti } from '../utils/formatters';

export interface ToastInfo {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  theme: AppTheme;
  toggleTheme: () => void;
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  user: UserProfile;
  isAuthenticated: boolean;
  activeInvestments: ActiveInvestment[];
  plans: InvestmentPlan[];
  officialChannels: OfficialDepositChannel[];
  transactions: Transaction[];
  savedPaymentAccounts: PaymentAccount[];
  livePayouts: LivePayoutNotification[];
  databaseStatus: DatabaseStatus;
  toasts: ToastInfo[];
  removeToast: (id: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Modals state
  isDepositModalOpen: boolean;
  setIsDepositModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  selectedPlanForDetail: InvestmentPlan | null;
  setSelectedPlanForDetail: (plan: InvestmentPlan | null) => void;
  selectedTransactionReceipt: Transaction | null;
  setSelectedTransactionReceipt: (tx: Transaction | null) => void;
  isStreakModalOpen: boolean;
  setIsStreakModalOpen: (open: boolean) => void;
  isAddAccountModalOpen: boolean;
  setIsAddAccountModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingAdminCount: number;

  // Auth & Database Actions
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    securityPin: string;
    referralCode?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  connectPostgresUrl: (url: string) => Promise<{ success: boolean; error?: string; message?: string }>;

  // Financial & Operational Actions
  depositFunds: (amount: number, gateway: GatewayType, refNumber: string, senderPhone?: string, senderTitle?: string) => Promise<boolean>;
  withdrawFunds: (amount: number, gateway: GatewayType, accountTitle: string, accountNumber: string, bankName?: string, pin?: string) => Promise<boolean>;
  investInPlan: (plan: InvestmentPlan, customAmount?: number) => Promise<boolean>;
  claimProfit: (investmentId: string) => Promise<void>;
  claimAllProfits: () => Promise<void>;
  claimReferralBonus: () => Promise<void>;
  claimDailyStreak: () => Promise<void>;
  addPaymentAccount: (account: Omit<PaymentAccount, 'id' | 'addedDate'>) => Promise<void>;
  deletePaymentAccount: (id: string) => Promise<void>;
  updateUserPin: (newPin: string) => void;
  refreshAllData: () => Promise<void>;

  // Computed state
  totalLiveUnclaimedProfit: number;
  hideBalance: boolean;
  toggleHideBalance: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_USER: UserProfile = {
  id: '',
  name: 'Investor Guest',
  phone: '0300XXXXXXX',
  email: '',
  referralCode: 'PAK----',
  referralTier: 1,
  balance: 0,
  investedCapital: 0,
  totalWithdrawn: 0,
  totalEarnedProfit: 0,
  referralEarnings: 0,
  unclaimedReferralEarnings: 0,
  securityPin: '1234',
  is2faEnabled: false,
  dailyStreak: 1,
  notificationsCount: 0,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  isVerified: false,
  isAdmin: false,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('pakinvest_theme');
    return (saved as AppTheme) || 'dark';
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    return localStorage.getItem('pakinvest_hide_balance') === 'true';
  });

  // Auth & User State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pakinvest_jwt_token'));
  const [user, setUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(token));

  // Dynamic Portfolio States
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>(INITIAL_PLANS);
  const [officialChannels, setOfficialChannels] = useState<OfficialDepositChannel[]>(OFFICIAL_DEPOSIT_CHANNELS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedPaymentAccounts, setSavedPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [livePayouts, setLivePayouts] = useState<LivePayoutNotification[]>(LIVE_PAYOUT_FEED);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    isPostgresConnected: false,
    hasDatabaseUrl: false,
  });
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [pendingAdminCount, setPendingAdminCount] = useState<number>(0);

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState<boolean>(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<InvestmentPlan | null>(null);
  const [selectedTransactionReceipt, setSelectedTransactionReceipt] = useState<Transaction | null>(null);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pakinvest_theme', theme);
  }, [theme]);

  // Auth Headers Helper
  const getAuthHeaders = () => {
    const activeToken = token || localStorage.getItem('pakinvest_jwt_token');
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    };
  };

  // Load all user and server state on startup or token change
  const refreshAllData = async () => {
    try {
      const activeToken = localStorage.getItem('pakinvest_jwt_token');

      // 1. Check database connection status
      const dbRes = await fetch('/api/database/status');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDatabaseStatus(dbData);
      }

      // 2. Fetch plans & deposit channels (public)
      const [plansRes, channelsRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/deposit-channels'),
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success && plansData.plans) {
          setPlans(plansData.plans);
        }
      }

      if (channelsRes.ok) {
        const chanData = await channelsRes.json();
        if (chanData.success && chanData.channels) {
          setOfficialChannels(chanData.channels);
        }
      }

      if (!activeToken) {
        setIsAuthenticated(false);
        setUser(GUEST_USER);
        setActiveInvestments([]);
        setTransactions([]);
        setSavedPaymentAccounts([]);
        return;
      }

      // 3. Fetch authenticated user profile
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          setIsAuthenticated(true);
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('pakinvest_jwt_token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(GUEST_USER);
      }

      // 4. Fetch user's active investments
      const invRes = await fetch('/api/investments', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (invRes.ok) {
        const invData = await invRes.json();
        if (invData.success && invData.investments) {
          setActiveInvestments(invData.investments);
        }
      }

      // 5. Fetch user's transactions
      const txRes = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.success && txData.transactions) {
          setTransactions(txData.transactions);
        }
      }

      // 6. Fetch user's payment accounts
      const accRes = await fetch('/api/payment-accounts', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (accRes.ok) {
        const accData = await accRes.json();
        if (accData.success && accData.accounts) {
          setSavedPaymentAccounts(accData.accounts);
        }
      }
    } catch (err) {
      console.error('API refresh error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [token]);

  // Real-time ticking profit simulator for active investments
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveInvestments((prevInvestments) => {
        if (prevInvestments.length === 0) return prevInvestments;
        return prevInvestments.map((inv) => {
          if (inv.status !== 'active') return inv;
          const tickProfit = (inv.dailyProfitAmount / 86400) * 3;
          return {
            ...inv,
            unclaimedProfit: Number((inv.unclaimedProfit + tickProfit).toFixed(3)),
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Periodic Live Payout ticker
  useEffect(() => {
    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Sialkot', 'Gujranwala', 'Peshawar', 'Quetta', 'Bahawalpur'];
    const names = ['Bilal A.', 'Zubair K.', 'Rashid M.', 'Kamran H.', 'Imran S.', 'Maryam N.', 'Fatima Z.', 'Usman T.', 'Danish Q.', 'Hamza S.'];
    const amounts = [1500, 3000, 4800, 5000, 10000, 15000, 25000, 50000];
    const gateways: GatewayType[] = ['JazzCash', 'EasyPaisa', 'Raast', 'Bank_Transfer'];

    const feedInterval = setInterval(() => {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      const randomGateway = gateways[Math.floor(Math.random() * gateways.length)];
      const randomType: 'withdrawal' | 'deposit' | 'daily_profit' = Math.random() > 0.4 ? 'withdrawal' : 'deposit';

      const newFeed: LivePayoutNotification = {
        id: `feed-${Date.now()}`,
        userName: `${randomName} (${randomCity})`,
        amount: randomAmount,
        gateway: randomGateway,
        timeAgo: 'just now',
        type: randomType,
      };

      setLivePayouts((prev) => [newFeed, ...prev.slice(0, 7)]);
    }, 14000);

    return () => clearInterval(feedInterval);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleHideBalance = () => {
    setHideBalance((prev) => {
      localStorage.setItem('pakinvest_hide_balance', String(!prev));
      return !prev;
    });
  };

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth: Login
  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('pakinvest_jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        await refreshAllData();
        showToast('Login Successful', `Welcome back, ${data.user.name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  // Auth: Register
  const register = async (payload: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    securityPin: string;
    referralCode?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('pakinvest_jwt_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        await refreshAllData();
        fireConfetti();
        showToast('Registration Successful 🎉', `Welcome to PakInvest, ${data.user.name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  // Auth: Logout
  const logout = async () => {
    localStorage.removeItem('pakinvest_jwt_token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(GUEST_USER);
    setActiveInvestments([]);
    setTransactions([]);
    setSavedPaymentAccounts([]);
    showToast('Signed Out', 'You have been signed out from your account.', 'info');
  };

  // PostgreSQL Connection Action
  const connectPostgresUrl = async (databaseUrl: string) => {
    try {
      const res = await fetch('/api/database/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        showToast('Database Connected', 'PostgreSQL with Prisma is now active & synchronized!', 'success');
        return { success: true, message: data.message };
      } else {
        showToast('Connection Failed', data.error || 'Could not connect to PostgreSQL', 'error');
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      showToast('Connection Error', err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Deposit Funds (Submitted as Pending)
  const depositFunds = async (
    amount: number,
    gateway: GatewayType,
    refNumber: string,
    senderPhone?: string,
    senderTitle?: string
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      showToast('Sign In Required', 'Please sign in or register to make a deposit.', 'warning');
      return false;
    }

    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount,
          gateway,
          referenceCode: refNumber,
          senderPhone,
          senderTitle,
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
        fireConfetti();
        showToast(
          'Deposit Submitted (Pending)',
          `Rs. ${amount.toLocaleString()} via ${gateway} is awaiting manual verification. TID: ${refNumber}`,
          'info'
        );
        setSelectedTransactionReceipt(data.transaction);
        await refreshAllData();
        return true;
      } else {
        showToast('Deposit Failed', data.error || 'Unable to submit deposit', 'error');
        return false;
      }
    } catch (err: any) {
      showToast('Connection Error', err.message || 'Failed to submit deposit', 'error');
      return false;
    }
  };

  // Withdraw Funds (Submitted as Pending)
  const withdrawFunds = async (
    amount: number,
    gateway: GatewayType,
    accountTitle: string,
    accountNumber: string,
    bankName?: string,
    pin?: string
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      showToast('Sign In Required', 'Please sign in to withdraw funds.', 'warning');
      return false;
    }

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount,
          gateway,
          accountTitle,
          accountNumber,
          bankName,
          pin,
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setUser((prev) => ({
          ...prev,
          balance: data.balance !== undefined ? data.balance : prev.balance - amount,
        }));
        setTransactions((prev) => [data.transaction, ...prev]);
        showToast(
          'Withdrawal Requested (Pending)',
          `Rs. ${amount.toLocaleString()} payout to ${gateway} (${accountNumber}) is pending manual approval.`,
          'info'
        );
        setSelectedTransactionReceipt(data.transaction);
        await refreshAllData();
        return true;
      } else {
        showToast('Withdrawal Failed', data.error || 'Unable to process withdrawal', 'error');
        return false;
      }
    } catch (err: any) {
      showToast('Connection Error', err.message || 'Failed to process withdrawal', 'error');
      return false;
    }
  };

  // Invest in Plan
  const investInPlan = async (plan: InvestmentPlan, customAmount?: number): Promise<boolean> => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      showToast('Sign In Required', 'Please sign in or create an account to start investing.', 'warning');
      return false;
    }

    const investAmount = customAmount || plan.fixedAmount || plan.minAmount;

    try {
      const res = await fetch('/api/investments/activate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ planId: plan.id, amount: investAmount }),
      });

      const data = await res.json();
      if (data.success && data.investment) {
        setUser((prev) => ({
          ...prev,
          balance: data.user.balance,
          investedCapital: data.user.investedCapital,
        }));
        setActiveInvestments((prev) => [data.investment, ...prev]);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fireConfetti();
        showToast('Plan Activated! 🚀', `Invested Rs. ${investAmount.toLocaleString()} in ${plan.name}. Daily profit is now active!`, 'success');
        return true;
      } else {
        showToast('Activation Failed', data.error || 'Insufficient balance', 'error');
        if (data.error && data.error.includes('Insufficient balance')) {
          setIsDepositModalOpen(true);
        }
        return false;
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to activate plan', 'error');
      return false;
    }
  };

  // Claim single active plan profit
  const claimProfit = async (investmentId: string) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/investments/claim', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ investmentId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          balance: data.balance,
          totalEarnedProfit: data.totalEarnedProfit,
        }));
        setActiveInvestments((prev) =>
          prev.map((i) => (i.id === investmentId ? { ...i, unclaimedProfit: 0 } : i))
        );
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fireConfetti();
        showToast('Profit Claimed! 💰', `Rs. ${Math.round(data.claimedAmount).toLocaleString()} added to your wallet!`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Claim all accumulated profits
  const claimAllProfits = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/investments/claim', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ investmentId: 'all' }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          balance: data.balance,
          totalEarnedProfit: data.totalEarnedProfit,
        }));
        setActiveInvestments((prev) =>
          prev.map((i) => ({ ...i, unclaimedProfit: 0 }))
        );
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fireConfetti();
        showToast('All Profits Claimed! 💰', `Transferred Rs. ${Math.round(data.claimedAmount).toLocaleString()} to your main balance!`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Claim referral bonus
  const claimReferralBonus = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/referrals/claim', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          balance: data.balance,
          unclaimedReferralEarnings: 0,
        }));
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fireConfetti();
        showToast('Commission Claimed!', `Rs. ${data.claimedAmount.toLocaleString()} referral bonus transferred to wallet!`, 'success');
      } else {
        showToast('Claim Info', data.error || 'No pending commission to claim', 'info');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to claim referral bonus', 'error');
    }
  };

  // Claim daily streak
  const claimDailyStreak = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      showToast('Sign In Required', 'Please sign in to claim daily streak rewards.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/streak/checkin', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          balance: data.balance,
          dailyStreak: data.dailyStreak,
          lastCheckInDate: new Date().toISOString().split('T')[0],
        }));
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        fireConfetti();
        showToast('Check-in Bonus Claimed! 🎁', `Earned Rs. ${data.reward} for Day ${data.dailyStreak} streak!`, 'success');
      } else {
        showToast('Already Claimed', data.error || 'Already claimed today', 'info');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to check-in', 'error');
    }
  };

  // Add payment account
  const addPaymentAccount = async (account: Omit<PaymentAccount, 'id' | 'addedDate'>) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/payment-accounts', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(account),
      });
      const data = await res.json();
      if (data.success && data.account) {
        setSavedPaymentAccounts((prev) => [data.account, ...prev]);
        showToast('Payment Method Saved', `${account.gateway} account added.`, 'success');
      }
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Delete payment account
  const deletePaymentAccount = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await fetch(`/api/payment-accounts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setSavedPaymentAccounts((prev) => prev.filter((p) => p.id !== id));
      showToast('Account Removed', 'Payment method removed from your list.', 'info');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const updateUserPin = (newPin: string) => {
    setUser((prev) => ({ ...prev, securityPin: newPin }));
    showToast('PIN Updated', 'Your 4-digit security PIN has been updated.', 'success');
  };

  const totalLiveUnclaimedProfit = activeInvestments.reduce((acc, curr) => acc + curr.unclaimedProfit, 0);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentTab,
        setCurrentTab,
        user,
        isAuthenticated,
        activeInvestments,
        plans,
        officialChannels,
        transactions,
        savedPaymentAccounts,
        livePayouts,
        databaseStatus,
        toasts,
        removeToast,
        showToast,
        isDepositModalOpen,
        setIsDepositModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        selectedPlanForDetail,
        setSelectedPlanForDetail,
        selectedTransactionReceipt,
        setSelectedTransactionReceipt,
        isStreakModalOpen,
        setIsStreakModalOpen,
        isAddAccountModalOpen,
        setIsAddAccountModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingAdminCount,
        login,
        register,
        logout,
        connectPostgresUrl,
        depositFunds,
        withdrawFunds,
        investInPlan,
        claimProfit,
        claimAllProfits,
        claimReferralBonus,
        claimDailyStreak,
        addPaymentAccount,
        deletePaymentAccount,
        updateUserPin,
        refreshAllData,
        totalLiveUnclaimedProfit,
        hideBalance,
        toggleHideBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
