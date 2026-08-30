import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'pakinvest_jwt_secret_key_2025_prod';

interface DBUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password: string;
  securityPin: string;
  referralCode: string;
  referredBy?: string;
  referralTier: number;
  balance: number;
  investedCapital: number;
  totalWithdrawn: number;
  totalEarnedProfit: number;
  referralEarnings: number;
  unclaimedReferralEarnings: number;
  is2faEnabled: boolean;
  dailyStreak: number;
  lastCheckInDate?: string;
  notificationsCount: number;
  avatar: string;
  joinedDate: string;
  isVerified: boolean;
  isAdmin: boolean;
}

interface DBInvestmentPlan {
  id: string;
  name: string;
  category: string;
  icon: string;
  badge?: string;
  minAmount: number;
  maxAmount: number;
  fixedAmount?: number;
  dailyProfitPercent: number;
  dailyProfitAmount: number;
  durationDays: number;
  totalRoiPercent: number;
  totalReturnAmount: number;
  payoutFrequency: string;
  capitalReturnPolicy: string;
  description: string;
  highlights: string[];
  popular?: boolean;
  accentColor: string;
}

interface DBActiveInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planCategory: string;
  accentColor: string;
  investedAmount: number;
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

interface DBTransaction {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  type: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'completed' | 'processing' | 'pending' | 'failed' | 'declined';
  gateway?: string;
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  senderPhone?: string;
  senderTitle?: string;
  referenceCode: string;
  timestamp: string;
  notes?: string;
  planName?: string;
}

interface DBPaymentAccount {
  id: string;
  userId: string;
  gateway: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  isDefault: boolean;
  addedDate: string;
}

// 6 Official Investment Plans Catalog
const INITIAL_PLANS: DBInvestmentPlan[] = [
  {
    id: 'starter-1000',
    name: 'Pak Starter Spark',
    category: 'Starter',
    icon: 'Zap',
    badge: 'Popular for Beginners',
    minAmount: 1000,
    maxAmount: 1000,
    fixedAmount: 1000,
    dailyProfitPercent: 5.0,
    dailyProfitAmount: 50,
    durationDays: 30,
    totalRoiPercent: 150,
    totalReturnAmount: 2500,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'Perfect entry package for Pakistani retail investors. Low threshold with daily instant PKR yield payouts to JazzCash / EasyPaisa.',
    highlights: ['Guaranteed Rs. 50/day profit', 'Low Rs. 1,000 entry point', '100% Capital refund after 30 days', 'Instant daily auto-credit'],
    popular: true,
    accentColor: '#10b981',
  },
  {
    id: 'solar-5000',
    name: 'Punjab Solar Farm Initiative',
    category: 'Solar Energy',
    icon: 'Sun',
    badge: 'High Demand Clean Energy',
    minAmount: 5000,
    maxAmount: 5000,
    fixedAmount: 5000,
    dailyProfitPercent: 6.0,
    dailyProfitAmount: 300,
    durationDays: 30,
    totalRoiPercent: 180,
    totalReturnAmount: 14000,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'Invest in distributed commercial solar grid setups across Punjab and Sindh industrial zones generating clean commercial tariff revenue.',
    highlights: ['Earn Rs. 300 daily (Rs. 9,000/mo)', 'Clean green energy asset backing', 'Government NEPRA grid revenue linked', 'Bi-weekly bonus compounding'],
    popular: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'agro-10000',
    name: 'Sindh Agri Yield & Cotton Export',
    category: 'Agro Yield',
    icon: 'Sprout',
    badge: 'High Yield Agritech',
    minAmount: 10000,
    maxAmount: 10000,
    fixedAmount: 10000,
    dailyProfitPercent: 7.0,
    dailyProfitAmount: 700,
    durationDays: 45,
    totalRoiPercent: 315,
    totalReturnAmount: 41500,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'Support verified modern drip-irrigation cotton and wheat crop cultivation with guaranteed harvest commodity off-take contracts.',
    highlights: ['Earn Rs. 700/day guaranteed', 'Export commodity backed yield', '45 days cycle with 315% total return', 'VIP Priority Withdrawal Status'],
    accentColor: '#22c55e',
  },
  {
    id: 'cpec-25000',
    name: 'CPEC Logistics & Fleet Expansion',
    category: 'CPEC Logistics',
    icon: 'Truck',
    badge: 'High Volume Freight',
    minAmount: 25000,
    maxAmount: 25000,
    fixedAmount: 25000,
    dailyProfitPercent: 8.0,
    dailyProfitAmount: 2000,
    durationDays: 60,
    totalRoiPercent: 480,
    totalReturnAmount: 145000,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'Fleet leasing and container freight routing between Gwadar Port, Karachi Port Trust, and northern corridor trade hubs.',
    highlights: ['Rs. 2,000 credited every 24 hours', 'CPEC commercial transit contracts', 'Highest daily dividend rate (8.0%)', 'Dedicated 24/7 Account Officer'],
    accentColor: '#3b82f6',
  },
  {
    id: 'estate-50000',
    name: 'Islamabad Capital Commercial Real Estate',
    category: 'Real Estate',
    icon: 'Building2',
    badge: 'Bluechip Real Asset',
    minAmount: 50000,
    maxAmount: 50000,
    fixedAmount: 50000,
    dailyProfitPercent: 9.0,
    dailyProfitAmount: 4500,
    durationDays: 60,
    totalRoiPercent: 540,
    totalReturnAmount: 320000,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'Premium fractional commercial development in Blue Area & Gulberg Islamabad with high-yield retail tenancy agreements.',
    highlights: ['Rs. 4,500 daily passive revenue', 'Capital real-estate asset collateral', 'Unlimited withdrawal allowance', 'Instant VIP bank settlement'],
    accentColor: '#8b5cf6',
  },
  {
    id: 'vip-100000',
    name: 'Executive Wealth Crown VIP',
    category: 'VIP Bluechip',
    icon: 'ShieldCheck',
    badge: 'Exclusive VIP Tier',
    minAmount: 100000,
    maxAmount: 100000,
    fixedAmount: 100000,
    dailyProfitPercent: 10.0,
    dailyProfitAmount: 10000,
    durationDays: 90,
    totalRoiPercent: 900,
    totalReturnAmount: 1000000,
    payoutFrequency: 'daily',
    capitalReturnPolicy: 'Capital returned on maturity',
    description: 'The premier institutional package delivering Rs. 10,000 daily. Direct treasury bond and bluechip portfolio allocation.',
    highlights: ['Rs. 10,000 cash dividend daily', 'Total Rs. 1,000,000 payout over 90 days', '0% withdrawal fee on all gateways', 'Personal wealth advisor assigned'],
    accentColor: '#eab308',
  },
];

// Clean In-Memory Store (Starts empty with NO fake user data as requested)
let memoryUsers: DBUser[] = [];
let memoryInvestments: DBActiveInvestment[] = [];
let memoryTransactions: DBTransaction[] = [];
let memoryPaymentAccounts: DBPaymentAccount[] = [];
let memoryPlans: DBInvestmentPlan[] = [...INITIAL_PLANS];

export interface DBOfficialChannel {
  gateway: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  branchCode?: string;
  instructions: string;
  minDeposit: number;
  maxDeposit: number;
  processingTime: string;
  isActive: boolean;
}

let memoryDepositChannels: DBOfficialChannel[] = [
  {
    gateway: 'JazzCash',
    accountTitle: 'PakInvest Digital Operations',
    accountNumber: '03049876543',
    instructions: 'Send money via JazzCash App or *786# to Till/Mobile account. Copy the 12-digit TID from SMS/App and submit it below.',
    minDeposit: 1000,
    maxDeposit: 500000,
    processingTime: '5-15 mins manual verification',
    isActive: true,
  },
  {
    gateway: 'EasyPaisa',
    accountTitle: 'PakInvest Treasury',
    accountNumber: '03451234890',
    instructions: 'Transfer via EasyPaisa App to EasyPaisa Account. Enter the 11-digit TRX ID received via 3737 in the field below.',
    minDeposit: 1000,
    maxDeposit: 500000,
    processingTime: '5-15 mins manual verification',
    isActive: true,
  },
  {
    gateway: 'Raast',
    accountTitle: 'PakInvest Instant Escrow',
    accountNumber: '03009988776',
    bankName: 'State Bank Raast Gateway',
    instructions: 'Instant zero-fee transfer via any Pakistani banking app using Raast Mobile ID or IBAN.',
    minDeposit: 1000,
    maxDeposit: 1000000,
    processingTime: 'Instant 24/7 verification',
    isActive: true,
  },
  {
    gateway: 'Bank_Transfer',
    accountTitle: 'PakInvest Global Technologies Ltd',
    accountNumber: '01020304050607',
    bankName: 'Meezan Bank Ltd (Islamic Banking)',
    branchCode: '0204 (Main Blue Area, Islamabad)',
    instructions: 'Transfer via Inter-Bank Fund Transfer (IBFT) from any Pakistani commercial bank (HBL, Meezan, UBL, Alfalah).',
    minDeposit: 5000,
    maxDeposit: 2500000,
    processingTime: '10-30 mins manual verification',
    isActive: true,
  },
  {
    gateway: 'USDT_TRC20',
    accountTitle: 'TRC-20 Treasury Wallet',
    accountNumber: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    bankName: 'Binance / Tron Network (TRC20)',
    instructions: 'Send USDT (TRC-20). 1 USDT = Rs. 280 PKR fixed conversion rate.',
    minDeposit: 2800,
    maxDeposit: 5000000,
    processingTime: '1-3 blockchain confirmations',
    isActive: true,
  },
];

// Prisma Client Instance
let prisma: PrismaClient | null = null;
let isPostgresConnected = false;
let dbConnectionError: string | null = null;

async function syncFromPrisma() {
  if (!isPostgresConnected || !prisma) return;
  try {
    // 1. Check & Seed Plans
    const plansCount = await prisma.investmentPlan.count();
    if (plansCount === 0) {
      for (const p of INITIAL_PLANS) {
        await prisma.investmentPlan.create({
          data: {
            id: p.id,
            name: p.name,
            category: p.category,
            icon: p.icon,
            badge: p.badge,
            minAmount: p.minAmount,
            maxAmount: p.maxAmount,
            fixedAmount: p.fixedAmount,
            dailyProfitPercent: p.dailyProfitPercent,
            dailyProfitAmount: p.dailyProfitAmount,
            durationDays: p.durationDays,
            totalRoiPercent: p.totalRoiPercent,
            totalReturnAmount: p.totalReturnAmount,
            payoutFrequency: p.payoutFrequency,
            capitalReturnPolicy: p.capitalReturnPolicy,
            description: p.description,
            highlights: p.highlights,
            popular: Boolean(p.popular),
            accentColor: p.accentColor,
          },
        });
      }
    }

    // 2. Check & Seed Deposit Channels
    const channelsCount = await prisma.depositChannel.count();
    if (channelsCount === 0) {
      for (const c of memoryDepositChannels) {
        await prisma.depositChannel.create({
          data: {
            gateway: c.gateway,
            accountTitle: c.accountTitle,
            accountNumber: c.accountNumber,
            bankName: c.bankName,
            branchCode: c.branchCode,
            instructions: c.instructions,
            minDeposit: c.minDeposit,
            maxDeposit: c.maxDeposit,
            processingTime: c.processingTime,
            isActive: c.isActive,
          },
        });
      }
    }

    // 3. Load DB records into memory caches for instant reactivity
    const dbUsers = await prisma.user.findMany();
    if (dbUsers.length > 0) {
      memoryUsers = dbUsers.map((u) => ({
        ...u,
        email: u.email || undefined,
        referredBy: u.referredBy || undefined,
        lastCheckInDate: u.lastCheckInDate || undefined,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      }));
    }

    const dbPlans = await prisma.investmentPlan.findMany();
    if (dbPlans.length > 0) {
      memoryPlans = dbPlans.map((p) => ({
        ...p,
        badge: p.badge || undefined,
        fixedAmount: p.fixedAmount || undefined,
      }));
    }

    const dbChannels = await prisma.depositChannel.findMany();
    if (dbChannels.length > 0) {
      memoryDepositChannels = dbChannels.map((c) => ({
        ...c,
        bankName: c.bankName || undefined,
        branchCode: c.branchCode || undefined,
      }));
    }

    const dbInvs = await prisma.activeInvestment.findMany();
    if (dbInvs.length > 0) {
      memoryInvestments = dbInvs.map((i) => ({
        ...i,
        lastClaimTimestamp: Number(i.lastClaimTimestamp),
        status: i.status as 'active' | 'completed',
      }));
    }

    const dbTx = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
    if (dbTx.length > 0) {
      memoryTransactions = dbTx.map((t) => ({
        ...t,
        userId: t.userId || '',
        userName: t.userName || undefined,
        userPhone: t.userPhone || undefined,
        gateway: t.gateway || undefined,
        accountTitle: t.accountTitle || undefined,
        accountNumber: t.accountNumber || undefined,
        bankName: t.bankName || undefined,
        senderPhone: t.senderPhone || undefined,
        senderTitle: t.senderTitle || undefined,
        notes: t.notes || undefined,
        planName: t.planName || undefined,
        status: t.status as any,
      }));
    }

    const dbAccs = await prisma.paymentAccount.findMany();
    if (dbAccs.length > 0) {
      memoryPaymentAccounts = dbAccs.map((a) => ({
        ...a,
        bankName: a.bankName || undefined,
      }));
    }
  } catch (err) {
    console.error('[Prisma Sync Error]:', err);
  }
}

async function tryConnectPrisma(customUrl?: string) {
  const url = customUrl || process.env.DATABASE_URL;
  if (!url || url.trim() === '' || url.includes('localhost:5432/mydb')) {
    console.log('[Prisma] No active DATABASE_URL provided. Operating in in-memory state.');
    isPostgresConnected = false;
    return false;
  }

  try {
    if (prisma) {
      await prisma.$disconnect();
    }
    prisma = new PrismaClient({
      datasources: {
        db: { url: url.trim() },
      },
    });
    await prisma.$connect();
    isPostgresConnected = true;
    dbConnectionError = null;
    console.log('[Prisma] Connected successfully to PostgreSQL database!');
    await syncFromPrisma();
    return true;
  } catch (err: any) {
    console.error('[Prisma] Database connection error:', err?.message || err);
    dbConnectionError = err?.message || 'Could not connect to PostgreSQL';
    isPostgresConnected = false;
    prisma = null;
    return false;
  }
}

// Format timestamp helper
const getFormattedNow = () => {
  const d = new Date();
  return (
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
};

// Mask phone helper
const maskPhone = (phone: string) => {
  if (phone.length < 8) return phone;
  return phone.slice(0, 4) + '•••' + phone.slice(-3);
};

async function persistUserUpdate(userId: string, data: any) {
  if (isPostgresConnected && prisma) {
    try {
      await prisma.user.update({ where: { id: userId }, data });
    } catch (e) {
      console.error('[Prisma User Update Error]:', e);
    }
  }
}

async function persistTx(tx: DBTransaction) {
  if (isPostgresConnected && prisma) {
    try {
      await prisma.transaction.create({
        data: {
          id: tx.id,
          userId: tx.userId,
          userName: tx.userName,
          userPhone: tx.userPhone,
          type: tx.type,
          amount: tx.amount,
          fee: tx.fee,
          netAmount: tx.netAmount,
          status: tx.status,
          gateway: tx.gateway,
          accountTitle: tx.accountTitle,
          accountNumber: tx.accountNumber,
          bankName: tx.bankName,
          senderPhone: tx.senderPhone,
          senderTitle: tx.senderTitle,
          referenceCode: tx.referenceCode,
          timestamp: tx.timestamp,
          notes: tx.notes,
          planName: tx.planName,
        },
      });
    } catch (e) {
      console.error('[Prisma Tx Create Error]:', e);
    }
  }
}

async function persistTxUpdate(txId: string, status: string, notes?: string) {
  if (isPostgresConnected && prisma) {
    try {
      await prisma.transaction.update({
        where: { id: txId },
        data: { status, notes },
      });
    } catch (e) {
      console.error('[Prisma Tx Update Error]:', e);
    }
  }
}

async function persistInvestment(inv: DBActiveInvestment) {
  if (isPostgresConnected && prisma) {
    try {
      await prisma.activeInvestment.create({
        data: {
          id: inv.id,
          userId: inv.userId,
          planId: inv.planId,
          planName: inv.planName,
          planCategory: inv.planCategory,
          accentColor: inv.accentColor,
          investedAmount: inv.investedAmount,
          dailyProfitPercent: inv.dailyProfitPercent,
          dailyProfitAmount: inv.dailyProfitAmount,
          hourlyProfitAmount: inv.hourlyProfitAmount,
          totalExpectedReturn: inv.totalExpectedReturn,
          earnedSoFar: inv.earnedSoFar,
          durationDays: inv.durationDays,
          daysRemaining: inv.daysRemaining,
          hoursRemaining: inv.hoursRemaining,
          startDate: inv.startDate,
          endDate: inv.endDate,
          nextPayoutTime: inv.nextPayoutTime,
          status: inv.status,
          lastClaimTimestamp: BigInt(inv.lastClaimTimestamp),
          unclaimedProfit: inv.unclaimedProfit,
        },
      });
    } catch (e) {
      console.error('[Prisma Investment Create Error]:', e);
    }
  }
}

async function persistInvestmentUpdate(invId: string, data: any) {
  if (isPostgresConnected && prisma) {
    try {
      await prisma.activeInvestment.update({
        where: { id: invId },
        data: {
          ...data,
          lastClaimTimestamp: data.lastClaimTimestamp !== undefined ? BigInt(data.lastClaimTimestamp) : undefined,
        },
      });
    } catch (e) {
      console.error('[Prisma Investment Update Error]:', e);
    }
  }
}

export const app = express();
app.use(express.json());

let dbInitPromise: Promise<boolean> | null = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = tryConnectPrisma();
  }
  await dbInitPromise;
  next();
});

// Auth Middleware
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in to your account.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Look up user
      let user: DBUser | null = null;
      if (isPostgresConnected && prisma) {
        try {
          const dbU = await prisma.user.findUnique({ where: { id: decoded.userId } });
          if (dbU) {
            user = {
              ...dbU,
              email: dbU.email || undefined,
              referredBy: dbU.referredBy || undefined,
              lastCheckInDate: dbU.lastCheckInDate || undefined,
              avatar: dbU.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            };
          }
        } catch {
          // fallback to memory
        }
      }

      if (!user) {
        user = memoryUsers.find((u) => u.id === decoded.userId) || null;
      }

      if (!user) {
        return res.status(401).json({ error: 'User session expired or not found. Please log in again.' });
      }

      (req as any).user = user;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }
  };

  // ----------------------------------------------------
  // DATABASE STATUS (Read-only from environment)
  // ----------------------------------------------------
  app.get('/api/database/status', (req, res) => {
    res.json({
      success: true,
      isPostgresConnected,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''),
      databaseUrlMasked: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:\/\/.*@/, '://****:****@')
        : null,
      error: dbConnectionError,
    });
  });

  // ----------------------------------------------------
  // AUTH API (Phone, Username, Password, PIN)
  // ----------------------------------------------------

  // Register with strict unique mobile phone verification
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, phone, email, password, securityPin, referralCode } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ error: 'Full name, mobile number, and password are required.' });
      }

      // Strict normalization for Pakistani mobile numbers (e.g. +923001234567 -> 03001234567)
      let cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('92') && cleanPhone.length === 12) {
        cleanPhone = '0' + cleanPhone.slice(2);
      } else if (cleanPhone.startsWith('0092') && cleanPhone.length === 14) {
        cleanPhone = '0' + cleanPhone.slice(4);
      } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('0')) {
        cleanPhone = '0' + cleanPhone;
      }

      if (cleanPhone.length !== 11 || !cleanPhone.startsWith('03')) {
        return res.status(400).json({
          error: 'Please enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567).',
        });
      }

      // Check unique phone number across PostgreSQL and in-memory store
      let existingUser = memoryUsers.find((u) => u.phone === cleanPhone);
      if (!existingUser && isPostgresConnected && prisma) {
        try {
          const dbU = await prisma.user.findFirst({ where: { phone: cleanPhone } });
          if (dbU) existingUser = dbU as any;
        } catch (e) {
          console.error('[Prisma Unique Phone Check Error]:', e);
        }
      }

      if (existingUser) {
        return res.status(409).json({
          error: `The mobile number (${cleanPhone}) is already registered with an existing account. Please sign in or use a different number.`,
        });
      }

      // Check unique email if provided
      if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        let existingEmailUser = memoryUsers.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
        if (!existingEmailUser && isPostgresConnected && prisma) {
          try {
            const dbEmailU = await prisma.user.findFirst({ where: { email: cleanEmail } });
            if (dbEmailU) existingEmailUser = dbEmailU as any;
          } catch {}
        }
        if (existingEmailUser) {
          return res.status(409).json({
            error: `An account is already registered with this email (${cleanEmail}).`,
          });
        }
      }

      // Validate upline referral code if provided
      let validReferredBy: string | undefined = undefined;
      if (referralCode && referralCode.trim()) {
        const cleanRef = referralCode.trim().toUpperCase();
        const parent = memoryUsers.find((u) => u.referralCode === cleanRef);
        if (parent) {
          validReferredBy = parent.referralCode;
        } else if (isPostgresConnected && prisma) {
          try {
            const dbParent = await prisma.user.findUnique({ where: { referralCode: cleanRef } });
            if (dbParent) validReferredBy = dbParent.referralCode;
          } catch {}
        }
      }

      const newRefCode = 'PAK' + Math.floor(1000 + Math.random() * 9000);
      const hashedPassword = bcrypt.hashSync(password, 10);
      const joinedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const newUser: DBUser = {
        id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim() : undefined,
        password: hashedPassword,
        securityPin: securityPin ? String(securityPin) : '1234',
        referralCode: newRefCode,
        referredBy: validReferredBy,
        referralTier: 1,
        balance: 0,
        investedCapital: 0,
        totalWithdrawn: 0,
        totalEarnedProfit: 0,
        referralEarnings: 0,
        unclaimedReferralEarnings: 0,
        is2faEnabled: false,
        dailyStreak: 1,
        lastCheckInDate: undefined,
        notificationsCount: 1,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        joinedDate,
        isVerified: true,
        isAdmin: false,
      };

      // Save to Postgres via Prisma if connected
      if (isPostgresConnected && prisma) {
        try {
          await prisma.user.create({
            data: {
              id: newUser.id,
              name: newUser.name,
              phone: newUser.phone,
              email: newUser.email,
              password: newUser.password,
              securityPin: newUser.securityPin,
              referralCode: newUser.referralCode,
              referredBy: newUser.referredBy,
              referralTier: newUser.referralTier,
              balance: 0,
              investedCapital: 0,
              totalWithdrawn: 0,
              totalEarnedProfit: 0,
              referralEarnings: 0,
              unclaimedReferralEarnings: 0,
              is2faEnabled: false,
              dailyStreak: 1,
              notificationsCount: 1,
              avatar: newUser.avatar,
              joinedDate: newUser.joinedDate,
              isVerified: true,
              isAdmin: false,
            },
          });
        } catch (dbErr: any) {
          console.error('[Prisma Error on Register]:', dbErr);
        }
      }

      memoryUsers.push(newUser);

      // Create default JazzCash payment account
      const defaultAccount: DBPaymentAccount = {
        id: `acc_${Date.now()}`,
        userId: newUser.id,
        gateway: 'JazzCash',
        accountTitle: newUser.name,
        accountNumber: newUser.phone,
        isDefault: true,
        addedDate: newUser.joinedDate,
      };
      memoryPaymentAccounts.push(defaultAccount);

      // Sign JWT
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

      const { password: _, ...safeUser } = newUser;
      res.json({
        success: true,
        token,
        user: safeUser,
        message: 'Account created successfully! Welcome to PakInvest.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error during registration' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Please enter your mobile number/email and password.' });
      }

      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      const cleanLower = identifier.trim().toLowerCase();

      let user: DBUser | null = null;

      // Look in PostgreSQL if connected
      if (isPostgresConnected && prisma) {
        try {
          const dbU = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: cleanPhone },
                { email: cleanLower },
                { name: identifier.trim() },
              ],
            },
          });
          if (dbU) {
            user = {
              ...dbU,
              email: dbU.email || undefined,
              referredBy: dbU.referredBy || undefined,
              lastCheckInDate: dbU.lastCheckInDate || undefined,
              avatar: dbU.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            };
          }
        } catch (dbErr) {
          console.error('[Prisma Login Error]:', dbErr);
        }
      }

      if (!user) {
        user =
          memoryUsers.find(
            (u) =>
              u.phone === cleanPhone ||
              (u.email && u.email.toLowerCase() === cleanLower) ||
              u.name.toLowerCase() === cleanLower
          ) || null;
      }

      if (!user) {
        return res.status(401).json({ error: 'No account found with this phone number or email. Please register.' });
      }

      // Check password (bcrypt or fallback)
      const isPasswordValid =
        bcrypt.compareSync(password, user.password) || user.password === password;

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...safeUser } = user;

      res.json({
        success: true,
        token,
        user: safeUser,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error during login' });
    }
  });

  // Get Current Session Profile
  app.get('/api/auth/me', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ----------------------------------------------------
  // PLANS & INVESTMENTS API
  // ----------------------------------------------------
  app.get('/api/plans', (req, res) => {
    res.json({ success: true, plans: memoryPlans });
  });

  app.get('/api/deposit-channels', (req, res) => {
    res.json({ success: true, channels: memoryDepositChannels.filter((c) => c.isActive) });
  });

  app.get('/api/investments', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const userInvestments = memoryInvestments.filter((inv) => inv.userId === user.id);
    res.json({ success: true, investments: userInvestments });
  });

  app.post('/api/investments/activate', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const { planId, amount } = req.body;

    const plan = memoryPlans.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'Investment plan not found' });

    const investAmount = Number(amount) || plan.fixedAmount || plan.minAmount;

    if (user.balance < investAmount) {
      return res.status(400).json({
        error: `Insufficient balance! You need Rs. ${investAmount.toLocaleString()} but currently have Rs. ${user.balance.toLocaleString()}. Please make a deposit first.`,
      });
    }

    user.balance -= investAmount;
    user.investedCapital += investAmount;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const dailyProfit = (investAmount * plan.dailyProfitPercent) / 100;
    const hourlyProfit = dailyProfit / 24;

    const newInvestment: DBActiveInvestment = {
      id: `inv_${Date.now()}`,
      userId: user.id,
      planId: plan.id,
      planName: plan.name,
      planCategory: plan.category,
      accentColor: plan.accentColor,
      investedAmount: investAmount,
      dailyProfitPercent: plan.dailyProfitPercent,
      dailyProfitAmount: dailyProfit,
      hourlyProfitAmount: hourlyProfit,
      totalExpectedReturn: dailyProfit * plan.durationDays + investAmount,
      earnedSoFar: 0,
      durationDays: plan.durationDays,
      daysRemaining: plan.durationDays,
      hoursRemaining: 24,
      startDate: startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      nextPayoutTime: '00:00 AM (Daily)',
      status: 'active',
      lastClaimTimestamp: Date.now(),
      unclaimedProfit: 0,
    };

    memoryInvestments.unshift(newInvestment);

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'plan_investment',
      amount: investAmount,
      fee: 0,
      netAmount: investAmount,
      status: 'completed',
      planName: plan.name,
      referenceCode: `INV-${Date.now().toString().slice(-6)}`,
      timestamp: getFormattedNow(),
      notes: `Activated ${plan.name} (${plan.dailyProfitPercent}% Daily ROI)`,
    };
    memoryTransactions.unshift(tx);

    // Persist to PostgreSQL if connected
    persistUserUpdate(user.id, { balance: user.balance, investedCapital: user.investedCapital });
    persistInvestment(newInvestment);
    persistTx(tx);

    res.json({
      success: true,
      investment: newInvestment,
      user: { balance: user.balance, investedCapital: user.investedCapital },
      transaction: tx,
    });
  });

  app.post('/api/investments/claim', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const { investmentId } = req.body;

    let claimedTotal = 0;
    const updatedInvs: DBActiveInvestment[] = [];

    if (investmentId === 'all') {
      const userInvs = memoryInvestments.filter((inv) => inv.userId === user.id && inv.status === 'active');
      for (const inv of userInvs) {
        const yieldAmt = inv.unclaimedProfit > 0 ? inv.unclaimedProfit : (inv.dailyProfitAmount / 24) * 2;
        claimedTotal += yieldAmt;
        inv.earnedSoFar += yieldAmt;
        inv.unclaimedProfit = 0;
        inv.lastClaimTimestamp = Date.now();
        updatedInvs.push(inv);
      }
    } else {
      const inv = memoryInvestments.find((i) => i.id === investmentId && i.userId === user.id);
      if (!inv) return res.status(404).json({ error: 'Investment not found' });
      const yieldAmt = inv.unclaimedProfit > 0 ? inv.unclaimedProfit : (inv.dailyProfitAmount / 24) * 2;
      claimedTotal = yieldAmt;
      inv.earnedSoFar += yieldAmt;
      inv.unclaimedProfit = 0;
      inv.lastClaimTimestamp = Date.now();
      updatedInvs.push(inv);
    }

    if (claimedTotal <= 0) claimedTotal = 50;

    user.balance += claimedTotal;
    user.totalEarnedProfit += claimedTotal;

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'daily_profit',
      amount: Math.round(claimedTotal),
      fee: 0,
      netAmount: Math.round(claimedTotal),
      status: 'completed',
      referenceCode: `CLAIM-${Date.now().toString().slice(-6)}`,
      timestamp: getFormattedNow(),
      notes: 'Real-time profit yield payout claimed directly to wallet',
    };
    memoryTransactions.unshift(tx);

    // Persist to PostgreSQL
    persistUserUpdate(user.id, { balance: user.balance, totalEarnedProfit: user.totalEarnedProfit });
    for (const inv of updatedInvs) {
      persistInvestmentUpdate(inv.id, {
        earnedSoFar: inv.earnedSoFar,
        unclaimedProfit: inv.unclaimedProfit,
        lastClaimTimestamp: inv.lastClaimTimestamp,
      });
    }
    persistTx(tx);

    res.json({
      success: true,
      claimedAmount: claimedTotal,
      balance: user.balance,
      totalEarnedProfit: user.totalEarnedProfit,
      transaction: tx,
    });
  });

  // ----------------------------------------------------
  // TRANSACTIONS & DEPOSIT / WITHDRAWAL API
  // ----------------------------------------------------
  app.get('/api/transactions', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const userTx = memoryTransactions.filter((t) => t.userId === user.id);
    res.json({ success: true, transactions: userTx });
  });

  // Deposit Request -> Status is PENDING
  app.post('/api/deposit', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const { amount, gateway, referenceCode, senderPhone, senderTitle } = req.body;

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount < 500) {
      return res.status(400).json({ error: 'Minimum deposit is Rs. 500' });
    }
    if (!referenceCode || !referenceCode.trim()) {
      return res.status(400).json({ error: 'Please enter transaction ID / Reference TID proof from your payment app.' });
    }

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'deposit',
      amount: depositAmount,
      fee: 0,
      netAmount: depositAmount,
      status: 'pending',
      gateway: gateway || 'JazzCash',
      senderPhone: senderPhone || user.phone,
      senderTitle: senderTitle || user.name,
      referenceCode: referenceCode.trim(),
      timestamp: getFormattedNow(),
      notes: `Deposit submitted via ${gateway}. Awaiting verification.`,
    };

    memoryTransactions.unshift(tx);
    persistTx(tx);

    res.json({
      success: true,
      message: 'Deposit submitted! Your transaction is currently Pending. It will be credited once verified.',
      transaction: tx,
    });
  });

  // Withdrawal Request -> Status is PENDING
  app.post('/api/withdraw', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const { amount, gateway, accountTitle, accountNumber, bankName, pin } = req.body;

    if (!pin || pin !== user.securityPin) {
      return res.status(400).json({ error: 'Incorrect 4-digit Security PIN. Please enter your valid PIN.' });
    }

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 500) {
      return res.status(400).json({ error: 'Minimum withdrawal is Rs. 500' });
    }

    if (user.balance < withdrawAmount) {
      return res.status(400).json({
        error: `Insufficient withdrawable balance! Requested Rs. ${withdrawAmount.toLocaleString()}, but available is Rs. ${user.balance.toLocaleString()}.`,
      });
    }

    user.balance -= withdrawAmount;

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'withdrawal',
      amount: withdrawAmount,
      fee: 0,
      netAmount: withdrawAmount,
      status: 'pending',
      gateway: gateway || 'JazzCash',
      accountTitle: accountTitle || user.name,
      accountNumber: accountNumber || user.phone,
      bankName: bankName,
      referenceCode: `WD-${Date.now().toString().slice(-6)}`,
      timestamp: getFormattedNow(),
      notes: `Withdrawal to ${gateway} (${accountNumber}). Awaiting disbursement approval.`,
    };

    memoryTransactions.unshift(tx);
    persistUserUpdate(user.id, { balance: user.balance });
    persistTx(tx);

    res.json({
      success: true,
      message: 'Withdrawal request submitted! Status is Pending approval.',
      transaction: tx,
      balance: user.balance,
    });
  });

  // ----------------------------------------------------
  // REFERRAL NETWORK API (3 Tiers)
  // ----------------------------------------------------
  app.get('/api/referrals', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;

    // Tier 1
    const tier1Users = memoryUsers.filter((u) => u.referredBy === user.referralCode);
    const tier1Members = tier1Users.map((u) => {
      const deposits = memoryTransactions
        .filter((t) => t.userId === u.id && t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: (deposits > 0 ? 'Active' : 'Registered') as 'Active' | 'Registered',
        totalDeposited: deposits,
        commissionEarned: deposits * 0.1,
        tier: 1 as const,
      };
    });

    // Tier 2
    const tier1RefCodes = tier1Users.map((u) => u.referralCode);
    const tier2Users = memoryUsers.filter((u) => u.referredBy && tier1RefCodes.includes(u.referredBy));
    const tier2Members = tier2Users.map((u) => {
      const deposits = memoryTransactions
        .filter((t) => t.userId === u.id && t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: (deposits > 0 ? 'Active' : 'Registered') as 'Active' | 'Registered',
        totalDeposited: deposits,
        commissionEarned: deposits * 0.04,
        tier: 2 as const,
      };
    });

    // Tier 3
    const tier2RefCodes = tier2Users.map((u) => u.referralCode);
    const tier3Users = memoryUsers.filter((u) => u.referredBy && tier2RefCodes.includes(u.referredBy));
    const tier3Members = tier3Users.map((u) => {
      const deposits = memoryTransactions
        .filter((t) => t.userId === u.id && t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: (deposits > 0 ? 'Active' : 'Registered') as 'Active' | 'Registered',
        totalDeposited: deposits,
        commissionEarned: deposits * 0.01,
        tier: 3 as const,
      };
    });

    const allMembers = [...tier1Members, ...tier2Members, ...tier3Members];
    const totalTeamVolume = allMembers.reduce((sum, m) => sum + m.totalDeposited, 0);

    res.json({
      success: true,
      referralCode: user.referralCode,
      referralTier: user.referralTier,
      referralEarnings: user.referralEarnings,
      unclaimedReferralEarnings: user.unclaimedReferralEarnings,
      totalTeamMembers: allMembers.length,
      totalTeamVolume,
      tier1Count: tier1Members.length,
      tier2Count: tier2Members.length,
      tier3Count: tier3Members.length,
      members: allMembers,
    });
  });

  app.post('/api/referrals/claim', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const unclaimed = user.unclaimedReferralEarnings;
    if (unclaimed <= 0) {
      return res.status(400).json({ error: 'No unclaimed referral commission available at this time.' });
    }

    user.balance += unclaimed;
    user.unclaimedReferralEarnings = 0;

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'referral_bonus',
      amount: unclaimed,
      fee: 0,
      netAmount: unclaimed,
      status: 'completed',
      referenceCode: `REF-CLAIM-${Date.now().toString().slice(-6)}`,
      timestamp: getFormattedNow(),
      notes: 'Multi-tier team commission claimed to main wallet balance',
    };
    memoryTransactions.unshift(tx);

    persistUserUpdate(user.id, { balance: user.balance, unclaimedReferralEarnings: 0 });
    persistTx(tx);

    res.json({
      success: true,
      claimedAmount: unclaimed,
      balance: user.balance,
      unclaimedReferralEarnings: 0,
      transaction: tx,
    });
  });

  // ----------------------------------------------------
  // DAILY CHECK-IN / STREAK API
  // ----------------------------------------------------
  app.post('/api/streak/checkin', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastCheckInDate === todayStr) {
      return res.status(400).json({ error: 'You have already checked in today! Come back tomorrow for your next reward.' });
    }

    user.dailyStreak = (user.dailyStreak % 7) + 1;
    user.lastCheckInDate = todayStr;

    const bonusAmounts: Record<number, number> = {
      1: 250,
      2: 300,
      3: 350,
      4: 400,
      5: 450,
      6: 500,
      7: 1000,
    };
    const reward = bonusAmounts[user.dailyStreak] || 250;

    user.balance += reward;
    user.totalEarnedProfit += reward;

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'streak_reward',
      amount: reward,
      fee: 0,
      netAmount: reward,
      status: 'completed',
      referenceCode: `STREAK-D${user.dailyStreak}`,
      timestamp: getFormattedNow(),
      notes: `Day ${user.dailyStreak} Loyalty Check-in Cash Bonus`,
    };
    memoryTransactions.unshift(tx);

    persistUserUpdate(user.id, {
      balance: user.balance,
      totalEarnedProfit: user.totalEarnedProfit,
      dailyStreak: user.dailyStreak,
      lastCheckInDate: user.lastCheckInDate,
    });
    persistTx(tx);

    res.json({
      success: true,
      dailyStreak: user.dailyStreak,
      reward,
      balance: user.balance,
      transaction: tx,
    });
  });

  // ----------------------------------------------------
  // PAYMENT ACCOUNTS API
  // ----------------------------------------------------
  app.get('/api/payment-accounts', authenticate, (req, res) => {
    const user = (req as any).user as DBUser;
    const userAccs = memoryPaymentAccounts.filter((a) => a.userId === user.id);
    res.json({ success: true, accounts: userAccs });
  });

  app.post('/api/payment-accounts', authenticate, async (req, res) => {
    const user = (req as any).user as DBUser;
    const { gateway, accountTitle, accountNumber, bankName, isDefault } = req.body;

    if (isDefault) {
      memoryPaymentAccounts.forEach((a) => {
        if (a.userId === user.id) a.isDefault = false;
      });
      if (isPostgresConnected && prisma) {
        try {
          await prisma.paymentAccount.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
          });
        } catch {}
      }
    }

    const newAcc: DBPaymentAccount = {
      id: `acc_${Date.now()}`,
      userId: user.id,
      gateway,
      accountTitle,
      accountNumber,
      bankName,
      isDefault: Boolean(isDefault),
      addedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    memoryPaymentAccounts.push(newAcc);
    if (isPostgresConnected && prisma) {
      try {
        await prisma.paymentAccount.create({ data: newAcc });
      } catch (e) {
        console.error('[Prisma Payment Account Create Error]:', e);
      }
    }

    res.json({ success: true, account: newAcc });
  });

  app.delete('/api/payment-accounts/:id', authenticate, async (req, res) => {
    const user = (req as any).user as DBUser;
    const { id } = req.params;
    memoryPaymentAccounts = memoryPaymentAccounts.filter((a) => a.id !== id || a.userId !== user.id);
    if (isPostgresConnected && prisma) {
      try {
        await prisma.paymentAccount.deleteMany({ where: { id, userId: user.id } });
      } catch (e) {
        console.error('[Prisma Payment Account Delete Error]:', e);
      }
    }
    res.json({ success: true });
  });

  // ----------------------------------------------------
  // ADMIN MANUAL APPROVALS / AUDIT WORKFLOW
  // ----------------------------------------------------
  app.get('/api/admin/pending', (req, res) => {
    const pendingTransactions = memoryTransactions.filter((t) => t.status === 'pending');
    res.json({
      success: true,
      pending: pendingTransactions,
      allUsers: memoryUsers.map(({ password, ...u }) => u),
    });
  });

  app.post('/api/admin/approve-deposit', (req, res) => {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === 'string' ? rawId.trim() : rawId ? String(rawId) : '';
    if (!txId) {
      return res.status(400).json({ error: 'Transaction ID is required for approval' });
    }

    const tx = memoryTransactions.find(
      (t) =>
        (t.id === txId ||
          t.id.toLowerCase() === txId.toLowerCase() ||
          t.referenceCode === txId ||
          t.referenceCode?.toLowerCase() === txId.toLowerCase()) &&
        t.type === 'deposit'
    );
    if (!tx) return res.status(404).json({ error: 'Deposit transaction not found' });

    if (tx.status === 'completed') {
      return res.status(400).json({ error: 'Transaction is already completed' });
    }

    const user = memoryUsers.find((u) => u.id === tx.userId);
    if (!user) return res.status(404).json({ error: 'User associated with transaction not found' });

    tx.status = 'completed';
    tx.notes = `Deposit verified & approved (${tx.gateway} TID: ${tx.referenceCode})`;
    user.balance += tx.amount;

    persistTxUpdate(tx.id, 'completed', tx.notes);
    persistUserUpdate(user.id, { balance: user.balance });

    // Distribute 3-tier upline commissions
    if (user.referredBy) {
      const tier1User = memoryUsers.find((u) => u.referralCode === user.referredBy);
      if (tier1User) {
        const comm1 = Math.round(tx.amount * 0.1);
        tier1User.unclaimedReferralEarnings += comm1;
        tier1User.referralEarnings += comm1;

        const tx1: DBTransaction = {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: tier1User.id,
          userName: tier1User.name,
          userPhone: tier1User.phone,
          type: 'referral_bonus',
          amount: comm1,
          fee: 0,
          netAmount: comm1,
          status: 'completed',
          referenceCode: `COMM-T1-${user.referralCode}`,
          timestamp: getFormattedNow(),
          notes: `Tier 1 (10%) referral commission from ${user.name}'s Rs. ${tx.amount.toLocaleString()} deposit`,
        };
        memoryTransactions.unshift(tx1);
        persistUserUpdate(tier1User.id, {
          unclaimedReferralEarnings: tier1User.unclaimedReferralEarnings,
          referralEarnings: tier1User.referralEarnings,
        });
        persistTx(tx1);

        if (tier1User.referredBy) {
          const tier2User = memoryUsers.find((u) => u.referralCode === tier1User.referredBy);
          if (tier2User) {
            const comm2 = Math.round(tx.amount * 0.04);
            tier2User.unclaimedReferralEarnings += comm2;
            tier2User.referralEarnings += comm2;

            const tx2: DBTransaction = {
              id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
              userId: tier2User.id,
              userName: tier2User.name,
              userPhone: tier2User.phone,
              type: 'referral_bonus',
              amount: comm2,
              fee: 0,
              netAmount: comm2,
              status: 'completed',
              referenceCode: `COMM-T2-${user.referralCode}`,
              timestamp: getFormattedNow(),
              notes: `Tier 2 (4%) team commission from ${user.name}'s deposit`,
            };
            memoryTransactions.unshift(tx2);
            persistUserUpdate(tier2User.id, {
              unclaimedReferralEarnings: tier2User.unclaimedReferralEarnings,
              referralEarnings: tier2User.referralEarnings,
            });
            persistTx(tx2);

            if (tier2User.referredBy) {
              const tier3User = memoryUsers.find((u) => u.referralCode === tier2User.referredBy);
              if (tier3User) {
                const comm3 = Math.round(tx.amount * 0.01);
                tier3User.unclaimedReferralEarnings += comm3;
                tier3User.referralEarnings += comm3;

                const tx3: DBTransaction = {
                  id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
                  userId: tier3User.id,
                  userName: tier3User.name,
                  userPhone: tier3User.phone,
                  type: 'referral_bonus',
                  amount: comm3,
                  fee: 0,
                  netAmount: comm3,
                  status: 'completed',
                  referenceCode: `COMM-T3-${user.referralCode}`,
                  timestamp: getFormattedNow(),
                  notes: `Tier 3 (1%) network commission from ${user.name}'s deposit`,
                };
                memoryTransactions.unshift(tx3);
                persistUserUpdate(tier3User.id, {
                  unclaimedReferralEarnings: tier3User.unclaimedReferralEarnings,
                  referralEarnings: tier3User.referralEarnings,
                });
                persistTx(tx3);
              }
            }
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Deposit of Rs. ${tx.amount.toLocaleString()} approved! User wallet credited.`,
      transaction: tx,
    });
  });

  app.post('/api/admin/decline-deposit', (req, res) => {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === 'string' ? rawId.trim() : rawId ? String(rawId) : '';
    const { reason } = req.body;
    const tx = memoryTransactions.find(
      (t) =>
        (t.id === txId ||
          t.id.toLowerCase() === txId.toLowerCase() ||
          t.referenceCode === txId ||
          t.referenceCode?.toLowerCase() === txId.toLowerCase()) &&
        t.type === 'deposit'
    );
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    tx.status = 'declined';
    tx.notes = reason || 'Deposit declined: Invalid or unverified payment TID proof';

    persistTxUpdate(tx.id, 'declined', tx.notes);

    res.json({ success: true, message: 'Deposit declined.', transaction: tx });
  });

  app.post('/api/admin/approve-withdrawal', (req, res) => {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === 'string' ? rawId.trim() : rawId ? String(rawId) : '';
    const tx = memoryTransactions.find(
      (t) =>
        (t.id === txId ||
          t.id.toLowerCase() === txId.toLowerCase() ||
          t.referenceCode === txId ||
          t.referenceCode?.toLowerCase() === txId.toLowerCase()) &&
        t.type === 'withdrawal'
    );
    if (!tx) return res.status(404).json({ error: 'Withdrawal transaction not found' });

    if (tx.status === 'completed') {
      return res.status(400).json({ error: 'Withdrawal is already completed' });
    }

    const user = memoryUsers.find((u) => u.id === tx.userId);
    if (user) {
      user.totalWithdrawn += tx.amount;
      persistUserUpdate(user.id, { totalWithdrawn: user.totalWithdrawn });
    }

    tx.status = 'completed';
    tx.notes = `Dispatched successfully to ${tx.gateway} (${tx.accountNumber})`;

    persistTxUpdate(tx.id, 'completed', tx.notes);

    res.json({
      success: true,
      message: `Withdrawal of Rs. ${tx.amount.toLocaleString()} marked as approved and dispatched!`,
      transaction: tx,
    });
  });

  app.post('/api/admin/decline-withdrawal', (req, res) => {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === 'string' ? rawId.trim() : rawId ? String(rawId) : '';
    const { reason } = req.body;
    const tx = memoryTransactions.find(
      (t) =>
        (t.id === txId ||
          t.id.toLowerCase() === txId.toLowerCase() ||
          t.referenceCode === txId ||
          t.referenceCode?.toLowerCase() === txId.toLowerCase()) &&
        t.type === 'withdrawal'
    );
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const user = memoryUsers.find((u) => u.id === tx.userId);
    if (user && tx.status === 'pending') {
      user.balance += tx.amount;
      persistUserUpdate(user.id, { balance: user.balance });
    }

    tx.status = 'declined';
    tx.notes = reason || 'Withdrawal declined: Account details invalid. Funds refunded to wallet.';

    persistTxUpdate(tx.id, 'declined', tx.notes);

    res.json({ success: true, message: 'Withdrawal declined and funds refunded to user.', transaction: tx });
  });

  // CRM Analytics & Overview Stats
  app.get('/api/admin/stats', (req, res) => {
    const totalDeposited = memoryTransactions
      .filter((t) => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = memoryTransactions
      .filter((t) => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingDeposits = memoryTransactions.filter((t) => t.type === 'deposit' && t.status === 'pending');
    const pendingWithdrawals = memoryTransactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending');

    const totalLockedCapital = memoryInvestments
      .filter((i) => i.status === 'active')
      .reduce((sum, i) => sum + i.investedAmount, 0);

    const totalPaidProfits = memoryTransactions
      .filter((t) => (t.type === 'daily_profit' || t.type === 'referral_bonus') && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      stats: {
        totalDeposited,
        totalWithdrawn,
        pendingDepositsCount: pendingDeposits.length,
        pendingDepositsVolume: pendingDeposits.reduce((s, t) => s + t.amount, 0),
        pendingWithdrawalsCount: pendingWithdrawals.length,
        pendingWithdrawalsVolume: pendingWithdrawals.reduce((s, t) => s + t.amount, 0),
        totalUsersCount: memoryUsers.length,
        activeInvestmentsCount: memoryInvestments.filter((i) => i.status === 'active').length,
        totalLockedCapital,
        totalPaidProfits,
      },
    });
  });

  // CRM Plans Management
  app.get('/api/admin/plans', (req, res) => {
    res.json({ success: true, plans: memoryPlans });
  });

  app.post('/api/admin/plans', async (req, res) => {
    const planData = req.body.plan || req.body;
    if (!planData.id || !planData.name || !planData.minAmount || !planData.dailyProfitPercent) {
      return res.status(400).json({ error: 'Missing required plan attributes' });
    }

    const existingIndex = memoryPlans.findIndex((p) => p.id === planData.id);
    if (existingIndex >= 0) {
      memoryPlans[existingIndex] = { ...memoryPlans[existingIndex], ...planData };
    } else {
      memoryPlans.push(planData);
    }

    if (isPostgresConnected && prisma) {
      try {
        await prisma.investmentPlan.upsert({
          where: { id: planData.id },
          create: {
            id: planData.id,
            name: planData.name,
            category: planData.category,
            icon: planData.icon,
            badge: planData.badge,
            minAmount: planData.minAmount,
            maxAmount: planData.maxAmount,
            fixedAmount: planData.fixedAmount,
            dailyProfitPercent: planData.dailyProfitPercent,
            dailyProfitAmount: planData.dailyProfitAmount,
            durationDays: planData.durationDays,
            totalRoiPercent: planData.totalRoiPercent,
            totalReturnAmount: planData.totalReturnAmount,
            payoutFrequency: planData.payoutFrequency,
            capitalReturnPolicy: planData.capitalReturnPolicy,
            description: planData.description,
            highlights: planData.highlights,
            popular: Boolean(planData.popular),
            accentColor: planData.accentColor,
          },
          update: planData,
        });
      } catch (e) {
        console.error('[Prisma Plan Upsert Error]:', e);
      }
    }

    res.json({ success: true, message: 'Plan saved successfully', plan: planData });
  });

  app.delete('/api/admin/plans/:id', async (req, res) => {
    const { id } = req.params;
    memoryPlans = memoryPlans.filter((p) => p.id !== id);
    if (isPostgresConnected && prisma) {
      try {
        await prisma.investmentPlan.delete({ where: { id } });
      } catch (e) {
        console.error('[Prisma Plan Delete Error]:', e);
      }
    }
    res.json({ success: true, message: 'Plan removed' });
  });

  // CRM Deposit Channels Management
  app.get('/api/admin/deposit-channels', (req, res) => {
    res.json({ success: true, channels: memoryDepositChannels });
  });

  app.post('/api/admin/deposit-channels', async (req, res) => {
    const { channels } = req.body;
    if (Array.isArray(channels)) {
      memoryDepositChannels = channels;
      if (isPostgresConnected && prisma) {
        try {
          await prisma.depositChannel.deleteMany();
          for (const c of channels) {
            await prisma.depositChannel.create({
              data: {
                gateway: c.gateway,
                accountTitle: c.accountTitle,
                accountNumber: c.accountNumber,
                bankName: c.bankName,
                branchCode: c.branchCode,
                instructions: c.instructions,
                minDeposit: c.minDeposit,
                maxDeposit: c.maxDeposit,
                processingTime: c.processingTime,
                isActive: c.isActive,
              },
            });
          }
        } catch (e) {
          console.error('[Prisma Channels Save Error]:', e);
        }
      }
      return res.json({ success: true, message: 'Deposit channels updated successfully', channels: memoryDepositChannels });
    }
    const singleChannel = req.body.channel || req.body;
    const idx = memoryDepositChannels.findIndex((c) => c.gateway === singleChannel.gateway);
    if (idx >= 0) {
      memoryDepositChannels[idx] = { ...memoryDepositChannels[idx], ...singleChannel };
    } else {
      memoryDepositChannels.push(singleChannel);
    }
    if (isPostgresConnected && prisma) {
      try {
        await prisma.depositChannel.upsert({
          where: { gateway: singleChannel.gateway },
          create: singleChannel,
          update: singleChannel,
        });
      } catch (e) {
        console.error('[Prisma Single Channel Save Error]:', e);
      }
    }
    res.json({ success: true, message: 'Channel saved successfully', channels: memoryDepositChannels });
  });

  // CRM User Directory & Management
  app.get('/api/admin/users', (req, res) => {
    const usersWithStats = memoryUsers.map((u) => {
      const { password, ...safeUser } = u;
      const userActiveInvestments = memoryInvestments.filter((i) => i.userId === u.id && i.status === 'active');
      const downline = memoryUsers.filter((sub) => sub.referredBy === u.referralCode);
      return {
        ...safeUser,
        activePackagesCount: userActiveInvestments.length,
        directDownlineCount: downline.length,
      };
    });
    res.json({ success: true, users: usersWithStats });
  });

  app.post('/api/admin/users/adjust-balance', (req, res) => {
    const { userId, type, amount, reason } = req.body;
    const user = memoryUsers.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid adjustment amount' });
    }

    if (type === 'debit') {
      user.balance = Math.max(0, user.balance - numAmount);
    } else {
      user.balance += numAmount;
    }

    const tx: DBTransaction = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: type === 'debit' ? 'withdrawal' : 'deposit',
      amount: numAmount,
      fee: 0,
      netAmount: numAmount,
      status: 'completed',
      gateway: 'System_Balance',
      referenceCode: `ADJ-${Date.now().toString().slice(-6)}`,
      timestamp: getFormattedNow(),
      notes: `Admin Manual ${type === 'debit' ? 'Debit' : 'Credit'}: ${reason || 'Account Balance Correction'}`,
    };

    memoryTransactions.unshift(tx);
    persistUserUpdate(user.id, { balance: user.balance });
    persistTx(tx);

    const { password, ...safeUser } = user;
    res.json({
      success: true,
      message: `Balance adjusted by ${type === 'debit' ? '-' : '+'}Rs. ${numAmount.toLocaleString()}`,
      user: safeUser,
    });
  });

  app.post('/api/admin/users/reset-pin', (req, res) => {
    const { userId, newPin } = req.body;
    const user = memoryUsers.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.securityPin = newPin || '1234';
    persistUserUpdate(user.id, { securityPin: user.securityPin });
    res.json({ success: true, message: `Security PIN reset to ${user.securityPin}` });
  });

  // CRM Transactions Ledger
  app.get('/api/admin/transactions', (req, res) => {
    res.json({ success: true, transactions: memoryTransactions });
  });

  // 404 handler for unmatched /api routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route ${req.method} ${req.path} not found.` });
  });

  // Global API error middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Uncaught Error]:', err);
    if (req.path.startsWith('/api/')) {
      return res.status(err.status || 500).json({
        success: false,
        error: err?.message || 'Internal server error occurred. Please try again.',
      });
    }
    next(err);
  });

async function startServer() {
  const PORT = 3000;

  // ----------------------------------------------------
  // Vite Integration for Dev / Production
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PakInvest server running on http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone dev/prod server listener when not running on serverless platforms (e.g. Vercel)
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
  });
}

export default app;
