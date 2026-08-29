export type AppTheme = 'dark' | 'light';

export type NavTab = 'home' | 'plans' | 'transactions' | 'wallet' | 'referral' | 'settings';

export type GatewayType = 'JazzCash' | 'EasyPaisa' | 'Raast' | 'Bank_Transfer' | 'USDT_TRC20';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'daily_profit'
  | 'referral_bonus'
  | 'plan_investment'
  | 'streak_reward'
  | 'admin_adjustment';

export type TransactionStatus = 'completed' | 'processing' | 'pending' | 'failed' | 'declined';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  referralCode: string;
  referredBy?: string;
  referralTier: number;
  balance: number; // Available Balance in PKR (Rs.)
  investedCapital: number; // Currently locked in active plans
  totalWithdrawn: number;
  totalEarnedProfit: number;
  referralEarnings: number;
  unclaimedReferralEarnings: number;
  securityPin: string;
  is2faEnabled: boolean;
  dailyStreak: number;
  lastCheckInDate?: string;
  notificationsCount: number;
  avatar: string;
  joinedDate: string;
  isVerified: boolean;
  isAdmin?: boolean;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  category: 'Starter' | 'Solar Energy' | 'Agro Yield' | 'Tech Venture' | 'Real Estate' | 'CPEC Logistics' | 'VIP Bluechip';
  icon: string;
  badge?: string;
  minAmount: number; // in Rs.
  maxAmount: number; // in Rs.
  fixedAmount?: number; // if fixed price package
  dailyProfitPercent: number; // e.g. 3.5%
  dailyProfitAmount: number; // based on minAmount/fixed
  durationDays: number; // e.g. 15, 30, 45, 60 days
  totalRoiPercent: number; // e.g. 152.5%
  totalReturnAmount: number;
  payoutFrequency: 'hourly' | 'daily';
  capitalReturnPolicy: 'Capital returned on maturity' | 'Principal included in daily payout';
  description: string;
  highlights: string[];
  popular?: boolean;
  accentColor: string;
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  planCategory: string;
  accentColor: string;
  investedAmount: number; // in Rs.
  dailyProfitPercent: number;
  dailyProfitAmount: number;
  hourlyProfitAmount: number;
  totalExpectedReturn: number;
  earnedSoFar: number;
  durationDays: number;
  daysRemaining: number;
  hoursRemaining: number;
  startDate: string;
  endDate: string;
  nextPayoutTime: string;
  status: 'active' | 'completed';
  lastClaimTimestamp: number;
  unclaimedProfit: number;
}

export interface Transaction {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  type: TransactionType;
  amount: number; // in Rs.
  fee: number;
  netAmount: number;
  status: TransactionStatus;
  gateway?: GatewayType | 'System_Balance';
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  txHash?: string;
  senderPhone?: string;
  senderTitle?: string;
  referenceCode: string;
  timestamp: string;
  notes?: string;
  planName?: string;
}

export interface ReferralMember {
  id: string;
  name: string;
  phoneMasked: string;
  joinedDate: string;
  status: 'Active' | 'Registered' | 'Pending Deposit';
  totalDeposited: number;
  commissionEarned: number;
  tier: 1 | 2 | 3;
}

export interface PaymentAccount {
  id: string;
  userId?: string;
  gateway: GatewayType;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
  addedDate: string;
}

export interface OfficialDepositChannel {
  id?: string;
  gateway: GatewayType;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  branchCode?: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
  processingTime: string;
  isActive?: boolean;
}

export interface LivePayoutNotification {
  id: string;
  userName: string;
  amount: number;
  gateway: GatewayType;
  timeAgo: string;
  type: 'withdrawal' | 'deposit' | 'daily_profit';
}

export interface DatabaseStatus {
  isPostgresConnected: boolean;
  hasDatabaseUrl: boolean;
  databaseUrlMasked?: string | null;
  error?: string | null;
}

export type CrmNavTab =
  | 'overview'
  | 'deposits'
  | 'withdrawals'
  | 'plans'
  | 'users'
  | 'gateways'
  | 'ledger';

export interface CrmStats {
  totalDeposited: number;
  totalWithdrawn: number;
  pendingDepositsCount: number;
  pendingDepositsVolume: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsVolume: number;
  totalUsersCount: number;
  activeInvestmentsCount: number;
  totalLockedCapital: number;
  totalPaidProfits: number;
}
