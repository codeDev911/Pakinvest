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
  userId?: string;
  userName?: string;
  userPhone?: string;
  planId: string;
  planName: string;
  planCategory: string;
  accentColor: string;
  investedAmount: number; // in Rs.
  dailyProfitPercent: number;
  dailyProfitAmount: number;
  hourlyProfitAmount: number;
  totalExpectedReturn: number;
  earnedSoFar: number; // Total claimed profit so far
  durationDays: number;
  daysRemaining: number;
  hoursRemaining: number;
  startTimestamp?: number;
  startTimeFormatted?: string; // e.g. "02:33 PM"
  startDate: string;
  endDate: string;
  nextPayoutTime: string; // e.g. "Daily at 02:33 PM"
  nextClaimTimestamp: number; // Epoch timestamp for 24h completion
  status: 'active' | 'completed';
  lastClaimTimestamp: number;
  unclaimedProfit: number;
}

export type LedgerEntryType = 'DEBIT' | 'CREDIT';
export type LedgerAccountType =
  | 'USER_WALLET'
  | 'TREASURY_ESCROW'
  | 'YIELD_RESERVE'
  | 'REFERRAL_POOL'
  | 'LOYALTY_POOL'
  | 'INVESTMENT_CAPITAL'
  | 'SYSTEM_REVENUE';
export type FraudAuditStatus = 'CLEARED' | 'SUSPICIOUS_FLAGGED' | 'BLOCKED';

export interface LedgerAuditRecord {
  ledgerId: string; // e.g. "LDG-20260830-10452"
  journalSeq: number; // Sequential monotonic ledger entry number
  entryType: LedgerEntryType; // DEBIT / CREDIT
  accountType: LedgerAccountType;
  counterpartyAccount?: string;
  balanceBefore: number; // User balance immediately before transaction
  balanceAfter: number; // User balance immediately after transaction
  deltaAmount: number; // Signed mutation (+ / -)
  idempotencyKey: string; // Unique deduplication token preventing double deductions
  antiDoubleSpendLock: boolean; // Atomic lock clearance
  fraudRiskScore: number; // 0 to 100 (0-15 = Low/Safe, 16-50 = Medium, >50 = High)
  fraudAuditStatus: FraudAuditStatus;
  fraudChecks: {
    duplicateTidCheck: 'PASSED' | 'FAILED';
    velocityCheck: 'PASSED' | 'FLAGGED';
    balanceIntegrityCheck: 'PASSED' | 'FAILED';
    pinVerification?: 'PASSED' | 'FAILED' | 'BYPASSED';
  };
  cryptoChecksum: string; // SHA-256 tamper-evident cryptographic hash signature
  reconciliationStatus: 'MATCHED' | 'DISCREPANCY_FLAGGED';
  authorizedBy: 'SYSTEM_AUTOPILOT' | 'ADMIN_OFFICER' | 'USER_AUTHENTICATED';
  timestamp: string;
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
  // Bank-Grade Ledger & Fraud Prevention properties
  ledger?: LedgerAuditRecord;
  ledgerId?: string;
  journalSeq?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  idempotencyKey?: string;
  fraudRiskScore?: number;
  cryptoChecksum?: string;
  reconciliationStatus?: 'MATCHED' | 'DISCREPANCY_FLAGGED';
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

export interface ReferralNetworkData {
  referralCode: string;
  referralTier: number;
  referralEarnings: number;
  unclaimedReferralEarnings: number;
  totalTeamMembers: number;
  totalTeamVolume: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  members: ReferralMember[];
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
  currentBalance?: number;
  manualAdjustment?: number;
  totalDeposited?: number;
  totalDepositsVolume?: number;
  completedDepositsCount?: number;
  totalWithdrawn?: number;
  totalWithdrawalsVolume?: number;
  completedWithdrawalsCount?: number;
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

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'deposit_approved'
    | 'deposit_declined'
    | 'withdrawal_approved'
    | 'withdrawal_declined'
    | 'profit_unlocked'
    | 'profit_claimed'
    | 'referral_reward'
    | 'system';
  amount?: number;
  read: boolean;
  timestamp: string;
  createdAt: number;
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
  | 'active-plans'
  | 'rewards'
  | 'users'
  | 'gateways'
  | 'ledger';

export interface DailyRewardTier {
  day: number;
  reward: number; // in Rs.
  title?: string;
  badge?: string;
  description?: string;
  isActive?: boolean;
}

export interface CrmRewardsSummary {
  totalRewardsGiven: number;
  streakRewardsCount: number;
  streakRewardsTotal: number;
  referralBonusesCount: number;
  referralBonusesTotal: number;
  dailyYieldDividendsTotal: number;
  adminBonusesTotal: number;
  recentRewardsTransactions: Transaction[];
  dailyTiers: DailyRewardTier[];
}

export interface CrmChannelBalanceSummary {
  gateway: GatewayType | string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string | null;
  balance: number;
  manualAdjustment: number;
  totalDeposited: number;
  completedCount: number;
  isActive: boolean;
}

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
  totalChannelsBalance?: number;
  channelBalances?: CrmChannelBalanceSummary[];
  // Rewards & Promotional Inflows/Outflows Tracking
  totalRewardsGiven?: number;
  streakRewardsTotal?: number;
  referralBonusesTotal?: number;
  dailyYieldDividendsTotal?: number;
  adminBonusesTotal?: number;
  rewardsSummary?: CrmRewardsSummary;
}
