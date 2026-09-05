var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_path2 = __toESM(require("path"), 1);
var import_express2 = __toESM(require("express"), 1);
var import_vite = require("vite");

// api/index.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_client = require("@prisma/client");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_genai = require("@google/genai");
var JWT_SECRET = process.env.JWT_SECRET || "pakinvest_jwt_secret_key_2025_prod";
var prisma = new import_client.PrismaClient();
var INITIAL_PLANS = [
  {
    id: "starter-1000",
    name: "Pak Starter Spark",
    category: "Starter",
    icon: "Zap",
    badge: "Popular for Beginners",
    minAmount: 1e3,
    maxAmount: 1e3,
    fixedAmount: 1e3,
    dailyProfitPercent: 5,
    dailyProfitAmount: 50,
    durationDays: 30,
    totalRoiPercent: 150,
    totalReturnAmount: 2500,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "Perfect entry package for Pakistani retail investors. Low threshold with daily instant PKR yield payouts to JazzCash / EasyPaisa.",
    highlights: ["Guaranteed Rs. 50/day profit", "Low Rs. 1,000 entry point", "100% Capital refund after 30 days", "Instant daily auto-credit"],
    popular: true,
    accentColor: "#10b981"
  },
  {
    id: "solar-5000",
    name: "Punjab Solar Farm Initiative",
    category: "Solar Energy",
    icon: "Sun",
    badge: "High Demand Clean Energy",
    minAmount: 5e3,
    maxAmount: 5e3,
    fixedAmount: 5e3,
    dailyProfitPercent: 6,
    dailyProfitAmount: 300,
    durationDays: 30,
    totalRoiPercent: 180,
    totalReturnAmount: 14e3,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "Invest in distributed commercial solar grid setups across Punjab and Sindh industrial zones generating clean commercial tariff revenue.",
    highlights: ["Earn Rs. 300 daily (Rs. 9,000/mo)", "Clean green energy asset backing", "Government NEPRA grid revenue linked", "Bi-weekly bonus compounding"],
    popular: true,
    accentColor: "#f59e0b"
  },
  {
    id: "agro-10000",
    name: "Sindh Agri Yield & Cotton Export",
    category: "Agro Yield",
    icon: "Sprout",
    badge: "High Yield Agritech",
    minAmount: 1e4,
    maxAmount: 1e4,
    fixedAmount: 1e4,
    dailyProfitPercent: 7,
    dailyProfitAmount: 700,
    durationDays: 45,
    totalRoiPercent: 315,
    totalReturnAmount: 41500,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "Support verified modern drip-irrigation cotton and wheat crop cultivation with guaranteed harvest commodity off-take contracts.",
    highlights: ["Earn Rs. 700/day guaranteed", "Export commodity backed yield", "45 days cycle with 315% total return", "VIP Priority Withdrawal Status"],
    popular: false,
    accentColor: "#22c55e"
  },
  {
    id: "cpec-25000",
    name: "CPEC Logistics & Fleet Expansion",
    category: "CPEC Logistics",
    icon: "Truck",
    badge: "High Volume Freight",
    minAmount: 25e3,
    maxAmount: 25e3,
    fixedAmount: 25e3,
    dailyProfitPercent: 8,
    dailyProfitAmount: 2e3,
    durationDays: 60,
    totalRoiPercent: 480,
    totalReturnAmount: 145e3,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "Fleet leasing and container freight routing between Gwadar Port, Karachi Port Trust, and northern corridor trade hubs.",
    highlights: ["Rs. 2,000 credited every 24 hours", "CPEC commercial transit contracts", "Highest daily dividend rate (8.0%)", "Dedicated 24/7 Account Officer"],
    popular: false,
    accentColor: "#3b82f6"
  },
  {
    id: "estate-50000",
    name: "Islamabad Capital Commercial Real Estate",
    category: "Real Estate",
    icon: "Building2",
    badge: "Bluechip Real Asset",
    minAmount: 5e4,
    maxAmount: 5e4,
    fixedAmount: 5e4,
    dailyProfitPercent: 9,
    dailyProfitAmount: 4500,
    durationDays: 60,
    totalRoiPercent: 540,
    totalReturnAmount: 32e4,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "Fractional ownership in commercial retail plazas and IT park towers in Islamabad Blue Area and DHA Phase 2 commercial hub.",
    highlights: ["Rs. 4,500 daily passive rental income", "Capital appreciation bonus on maturity", "Monthly corporate audit reports", "Dedicated Portfolio Manager"],
    popular: false,
    accentColor: "#8b5cf6"
  },
  {
    id: "tech-100000",
    name: "PakTech Unicorn Venture Fund",
    category: "Tech Venture",
    icon: "Rocket",
    badge: "Institutional Grade",
    minAmount: 1e5,
    maxAmount: 1e5,
    fixedAmount: 1e5,
    dailyProfitPercent: 10,
    dailyProfitAmount: 1e4,
    durationDays: 90,
    totalRoiPercent: 900,
    totalReturnAmount: 1e6,
    payoutFrequency: "daily",
    capitalReturnPolicy: "Capital returned on maturity",
    description: "High-growth fintech and software export ventures backed by top Pakistani tech incubators and venture capital syndicates.",
    highlights: ["Rs. 10,000 daily payout", "900% ROI milestone", "Guaranteed exit liquidation", "VIP Executive Club & Direct CEO Desk"],
    popular: false,
    accentColor: "#ec4899"
  }
];
var INITIAL_CHANNELS = [
  {
    gateway: "JazzCash",
    accountTitle: "PakInvest Official Treasury",
    accountNumber: "03045645642",
    bankName: "JazzCash (Mobilink Microfinance Bank)",
    branchCode: "001",
    instructions: "Send money to this official JazzCash mobile account. Once sent, copy the 12-digit TID from the SMS or app and enter below.",
    minDeposit: 1e3,
    maxDeposit: 1e6,
    processingTime: "Instant 24/7 verification",
    isActive: true
  },
  {
    gateway: "EasyPaisa",
    accountTitle: "PakInvest Official Treasury",
    accountNumber: "03451234567",
    bankName: "EasyPaisa (Telenor Microfinance Bank)",
    branchCode: "002",
    instructions: "Transfer to this EasyPaisa mobile wallet account. Enter your Transaction ID (TID) received via 3737 SMS as payment proof.",
    minDeposit: 1e3,
    maxDeposit: 1e6,
    processingTime: "Instant 24/7 verification",
    isActive: true
  },
  {
    gateway: "Bank_Transfer",
    accountTitle: "PakInvest Global Technologies Ltd",
    accountNumber: "01020304050607",
    bankName: "Meezan Bank Ltd (Islamic Banking)",
    branchCode: "0204 (Main Blue Area, Islamabad)",
    instructions: "Transfer via Inter-Bank Fund Transfer (IBFT) from any Pakistani commercial bank (HBL, Meezan, UBL, Alfalah).",
    minDeposit: 5e3,
    maxDeposit: 25e5,
    processingTime: "10-30 mins manual verification",
    isActive: true
  },
  {
    gateway: "USDT_TRC20",
    accountTitle: "TRC-20 Treasury Wallet",
    accountNumber: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    bankName: "Binance / Tron Network (TRC20)",
    branchCode: "",
    instructions: "Send USDT (TRC-20). 1 USDT = Rs. 280 PKR fixed conversion rate.",
    minDeposit: 2800,
    maxDeposit: 5e6,
    processingTime: "1-3 blockchain confirmations",
    isActive: true
  }
];
var getFormattedNow = (date = /* @__PURE__ */ new Date()) => {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const validDate = isNaN(d.getTime()) ? /* @__PURE__ */ new Date() : d;
  const dateStr = validDate.toLocaleDateString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = validDate.toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${dateStr}, ${timeStr} PKT`;
};
function getStartOfToday() {
  const now = /* @__PURE__ */ new Date();
  const pktOffsetMs = 5 * 60 * 60 * 1e3;
  const pktDate = new Date(now.getTime() + pktOffsetMs);
  const startOfPktDay = new Date(Date.UTC(pktDate.getUTCFullYear(), pktDate.getUTCMonth(), pktDate.getUTCDate()));
  return new Date(startOfPktDay.getTime() - pktOffsetMs);
}
function getTodayPktDateString(date = /* @__PURE__ */ new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
var maskPhone = (phone) => {
  if (!phone || phone.length < 8) return phone;
  return phone.slice(0, 4) + "\u2022\u2022\u2022" + phone.slice(-3);
};
var dbInitDone = false;
async function ensureInitialDatabaseData() {
  if (dbInitDone) return;
  try {
    const plansCount = await prisma.investmentPlan.count();
    if (plansCount === 0) {
      for (const p of INITIAL_PLANS) {
        await prisma.investmentPlan.create({ data: p });
      }
    }
    const channelsCount = await prisma.depositChannel.count();
    if (channelsCount === 0) {
      for (const c of INITIAL_CHANNELS) {
        await prisma.depositChannel.create({ data: c });
      }
    }
    const tiersCount = await prisma.dailyRewardTier.count();
    if (tiersCount === 0) {
      const defaultTiers = [
        { day: 1, reward: 250, title: "Starter Spark", badge: "Day 1 Bonus", description: "Kickstart your daily earning journey in PKR" },
        { day: 2, reward: 300, title: "Bronze Momentum", badge: "+Rs. 50 Jump", description: "Consistent loyalty pays compounding dividends" },
        { day: 3, reward: 350, title: "Silver Streak", badge: "+Rs. 50 Jump", description: "Mid-week investor loyalty payout" },
        { day: 4, reward: 400, title: "Gold Tier", badge: "+Rs. 50 Jump", description: "Four consecutive active days reward" },
        { day: 5, reward: 450, title: "Platinum Velocity", badge: "+Rs. 50 Jump", description: "Five-day check-in loyalty achievement" },
        { day: 6, reward: 500, title: "Diamond Milestone", badge: "+Rs. 50 Jump", description: "Almost at weekly grand jackpot!" },
        { day: 7, reward: 1e3, title: "Crown Mega Bonus", badge: "\u{1F381} Grand Jackpot", description: "Complete 7-day streak grand reward!" }
      ];
      for (const t of defaultTiers) {
        await prisma.dailyRewardTier.create({ data: t });
      }
    }
    await syncWithdrawalFeeConfigFromDb();
    dbInitDone = true;
  } catch (err) {
    console.error("[Prisma Seed/Init Error]:", err);
  }
}
async function createUserNotification(userId, title, message, type = "system", amount) {
  try {
    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        amount: amount || null,
        timestamp: getFormattedNow()
      }
    });
    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    });
    await prisma.user.update({
      where: { id: userId },
      data: { notificationsCount: unreadCount }
    });
    return notif;
  } catch (e) {
    console.error("[Notification Create Error]:", e);
    return null;
  }
}
var app = (0, import_express.default)();
app.use(import_express.default.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.get(["/investify.apk", "/api/download-apk"], (req, res) => {
  const apkPath = import_path.default.join(process.cwd(), "public", "investify.apk");
  if (import_fs.default.existsSync(apkPath)) {
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", 'attachment; filename="Investify.apk"');
    return res.sendFile(apkPath);
  }
  return res.status(404).json({ error: "APK package is being prepared. Please try again shortly." });
});
app.use(async (req, res, next) => {
  if (!dbInitDone) {
    await ensureInitialDatabaseData();
  }
  next();
});
var authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Please sign in to your account." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) {
      return res.status(401).json({ error: "User account not found or session expired. Please log in again." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
};
var router = import_express.default.Router();
router.get("/database/status", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const txCount = await prisma.transaction.count();
    const invCount = await prisma.activeInvestment.count();
    res.json({
      success: true,
      status: "online",
      provider: "PostgreSQL (Prisma ORM)",
      databaseConnected: true,
      stats: {
        users: userCount,
        transactions: txCount,
        activeInvestments: invCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: "error",
      error: err?.message || "Database query error"
    });
  }
});
router.post("/auth/register", async (req, res) => {
  try {
    const { name, phone, email, password, securityPin, referralCode } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Full name, mobile number, and password are required." });
    }
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("92") && cleanPhone.length === 12) {
      cleanPhone = "0" + cleanPhone.slice(2);
    } else if (cleanPhone.startsWith("0092") && cleanPhone.length === 14) {
      cleanPhone = "0" + cleanPhone.slice(4);
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
      cleanPhone = "0" + cleanPhone;
    }
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("03")) {
      return res.status(400).json({
        error: "Please enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567)."
      });
    }
    const existingPhoneUser = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    });
    if (existingPhoneUser) {
      return res.status(409).json({
        error: `The mobile number (${cleanPhone}) is already registered. Please sign in with your password.`
      });
    }
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: "insensitive" } }
      });
      if (existingEmail) {
        return res.status(409).json({
          error: `An account is already registered with email (${cleanEmail}).`
        });
      }
    }
    let validReferredBy = null;
    let parentUser = null;
    if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
      const cleanRef = referralCode.trim().toUpperCase();
      parentUser = await prisma.user.findFirst({
        where: { referralCode: { equals: cleanRef, mode: "insensitive" } }
      });
      validReferredBy = parentUser ? parentUser.referralCode : cleanRef;
    }
    const newRefCode = "PAK" + Math.floor(1e3 + Math.random() * 9e3);
    const hashedPassword = import_bcryptjs.default.hashSync(password, 10);
    const joinedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim() : null,
        password: hashedPassword,
        securityPin: securityPin ? String(securityPin) : "1234",
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
        notificationsCount: 1,
        joinedDate,
        isVerified: true,
        isAdmin: false
      }
    });
    await createUserNotification(
      newUser.id,
      "Welcome to Investify PKR! \u{1F1F5}\u{1F1F0}",
      `Assalam-o-Alaikum ${newUser.name}! Your account is active. Deposit via JazzCash / EasyPaisa to activate high-yield plans.`,
      "system"
    );
    if (parentUser) {
      await createUserNotification(
        parentUser.id,
        "New Referral Registered! \u{1F465}",
        `${newUser.name} just registered using your referral code (${parentUser.referralCode}). You will earn instant commissions when they deposit!`,
        "referral"
      ).catch(() => {
      });
    }
    const token = import_jsonwebtoken.default.sign({ userId: newUser.id, phone: newUser.phone }, JWT_SECRET, { expiresIn: "30d" });
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      token,
      user: safeUser
    });
  } catch (err) {
    console.error("[Register Error]:", err);
    res.status(500).json({ error: err?.message || "Registration failed. Please try again." });
  }
});
router.post("/auth/login", async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.phone || req.body.email || req.body.username;
    const password = req.body.password;
    if (!rawIdentifier || !password) {
      return res.status(400).json({ error: "Mobile number or username and password are required." });
    }
    const trimmed = String(rawIdentifier).trim();
    let cleanPhone = trimmed.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("92") && cleanPhone.length === 12) {
      cleanPhone = "0" + cleanPhone.slice(2);
    } else if (cleanPhone.startsWith("0092") && cleanPhone.length === 14) {
      cleanPhone = "0" + cleanPhone.slice(4);
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
      cleanPhone = "0" + cleanPhone;
    }
    let user = null;
    if (cleanPhone && cleanPhone.length >= 10) {
      user = await prisma.user.findUnique({
        where: { phone: cleanPhone }
      });
    }
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: trimmed },
            ...cleanPhone ? [{ phone: cleanPhone }] : [],
            { email: { equals: trimmed, mode: "insensitive" } },
            { name: { equals: trimmed, mode: "insensitive" } }
          ]
        }
      });
    }
    if (!user) {
      return res.status(401).json({ error: "No registered account found. Please check your mobile number or sign up." });
    }
    const isMatch = import_bcryptjs.default.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please verify your credentials and try again." });
    }
    const unreadNotifs = await prisma.notification.count({
      where: { userId: user.id, read: false }
    });
    const token = import_jsonwebtoken.default.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: "Signed in successfully!",
      token,
      user: {
        ...safeUser,
        notificationsCount: unreadNotifs
      }
    });
  } catch (err) {
    console.error("[Login Error]:", err);
    res.status(500).json({ error: err?.message || "Login failed. Please try again." });
  }
});
router.get("/auth/me", authenticate, async (req, res) => {
  const user = req.user;
  const unreadNotifs = await prisma.notification.count({
    where: { userId: user.id, read: false }
  });
  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    user: {
      ...safeUser,
      notificationsCount: unreadNotifs
    }
  });
});
router.post("/auth/change-password", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }
    const isMatch = import_bcryptjs.default.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password does not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    const hashedPassword = import_bcryptjs.default.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    await createUserNotification(user.id, "Password Changed \u{1F512}", "Your account login password has been updated securely.");
    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to update password" });
  }
});
router.post("/auth/toggle-2fa", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { enabled } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { is2faEnabled: Boolean(enabled) }
    });
    res.json({
      success: true,
      is2faEnabled: updatedUser.is2faEnabled,
      message: `Two-factor authentication ${updatedUser.is2faEnabled ? "enabled" : "disabled"}`
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to toggle 2FA" });
  }
});
router.get("/user/sync", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const [freshUser, activeInvestments, transactions, notifications] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.activeInvestment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.transaction.findMany({
        where: {
          OR: [{ userId: user.id }, { userPhone: user.phone }]
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 100
      })
    ]);
    if (!freshUser) {
      return res.status(404).json({ error: "User record not found" });
    }
    const unreadCount = notifications.filter((n) => !n.read).length;
    const { password: _, ...safeUser } = freshUser;
    const mappedInvestments = activeInvestments.map((i) => ({
      ...i,
      lastClaimTimestamp: Number(i.lastClaimTimestamp),
      status: i.status
    }));
    res.json({
      success: true,
      user: {
        ...safeUser,
        notificationsCount: unreadCount
      },
      activeInvestments: mappedInvestments,
      transactions,
      notifications,
      unreadNotificationsCount: unreadCount
    });
  } catch (err) {
    console.error("[User Sync Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to sync user state" });
  }
});
router.get("/plans", async (req, res) => {
  try {
    const plans = await prisma.investmentPlan.findMany({
      orderBy: { minAmount: "asc" }
    });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch investment plans" });
  }
});
router.get("/deposit-channels", async (req, res) => {
  try {
    const channels = await prisma.depositChannel.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });
    res.json({ success: true, channels });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch deposit channels" });
  }
});
router.get("/payment-accounts", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const accounts = await prisma.paymentAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch payment accounts" });
  }
});
router.post("/payment-accounts", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { gateway, accountTitle, accountNumber, bankName, isDefault } = req.body;
    if (!gateway || !accountTitle || !accountNumber) {
      return res.status(400).json({ error: "Gateway, account title, and account number are required." });
    }
    if (isDefault) {
      await prisma.paymentAccount.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
    }
    const addedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const newAccount = await prisma.paymentAccount.create({
      data: {
        userId: user.id,
        gateway,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName ? bankName.trim() : null,
        isDefault: Boolean(isDefault),
        addedDate
      }
    });
    res.json({ success: true, account: newAccount });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to save payment account" });
  }
});
router.delete("/payment-accounts/:id", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    await prisma.paymentAccount.deleteMany({
      where: { id, userId: user.id }
    });
    res.json({ success: true, message: "Account removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to delete payment account" });
  }
});
router.get("/investments", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const investments = await prisma.activeInvestment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });
    const now = Date.now();
    const mapped = investments.map((inv) => {
      const lastClaim = Number(inv.lastClaimTimestamp);
      const nextClaimTimestamp = lastClaim > 0 ? lastClaim + 864e5 : now;
      const isReady = now >= nextClaimTimestamp && inv.status === "active";
      return {
        ...inv,
        lastClaimTimestamp: lastClaim,
        nextClaimTimestamp,
        unclaimedProfit: isReady ? inv.dailyProfitAmount : 0,
        status: inv.status
      };
    });
    res.json({ success: true, activeInvestments: mapped, investments: mapped });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch investments" });
  }
});
router.post("/investments/activate", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { planId, amount } = req.body;
    if (!planId) {
      return res.status(400).json({ error: "Please select an investment plan to activate." });
    }
    const plan = await prisma.investmentPlan.findUnique({
      where: { id: planId }
    });
    if (!plan) {
      return res.status(404).json({ error: "Selected investment package is no longer available." });
    }
    const investAmount = Number(amount) || plan.fixedAmount || plan.minAmount;
    if (investAmount < plan.minAmount || investAmount > plan.maxAmount) {
      return res.status(400).json({
        error: `Investment amount must be between Rs. ${plan.minAmount.toLocaleString()} and Rs. ${plan.maxAmount.toLocaleString()}`
      });
    }
    const liveUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!liveUser || liveUser.balance < investAmount) {
      return res.status(400).json({
        error: `Insufficient wallet balance (Current: Rs. ${Number(liveUser?.balance || 0).toLocaleString()}). Please deposit at least Rs. ${investAmount.toLocaleString()} to activate this package.`
      });
    }
    let dailyProfitAmount = Number(plan.dailyProfitAmount);
    if (!dailyProfitAmount || dailyProfitAmount <= 0 || plan.fixedAmount && investAmount !== plan.fixedAmount) {
      dailyProfitAmount = Math.round(investAmount * plan.dailyProfitPercent / 100);
    }
    const hourlyProfitAmount = dailyProfitAmount / 24;
    const totalExpectedReturn = dailyProfitAmount * plan.durationDays + investAmount;
    const now = Date.now();
    const startDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const endDate = new Date(Date.now() + plan.durationDays * 864e5).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [updatedUser, newInvestment, newTx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: investAmount },
          investedCapital: { increment: investAmount }
        }
      }),
      prisma.activeInvestment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          planName: plan.name,
          planCategory: plan.category,
          accentColor: plan.accentColor,
          investedAmount: investAmount,
          dailyProfitPercent: plan.dailyProfitPercent,
          dailyProfitAmount,
          hourlyProfitAmount,
          totalExpectedReturn,
          earnedSoFar: 0,
          durationDays: plan.durationDays,
          daysRemaining: plan.durationDays,
          hoursRemaining: 24,
          startDate,
          endDate,
          nextPayoutTime: "24-Hour Cycle Automated Yield",
          status: "active",
          lastClaimTimestamp: BigInt(now),
          unclaimedProfit: 0
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "investment_buy",
          amount: investAmount,
          fee: 0,
          netAmount: investAmount,
          status: "completed",
          gateway: "Wallet_Balance",
          referenceCode: `PKG-${plan.id.toUpperCase().slice(0, 6)}-${Date.now().toString().slice(-4)}`,
          timestamp: getFormattedNow(),
          notes: `Activated ${plan.name} package for Rs. ${investAmount.toLocaleString()}`,
          planName: plan.name
        }
      })
    ]);
    await createUserNotification(
      user.id,
      "Package Activated Successfully! \u{1F680}",
      `Your investment of Rs. ${investAmount.toLocaleString()} in ${plan.name} is now active generating Rs. ${dailyProfitAmount.toLocaleString()}/day!`,
      "system",
      investAmount
    );
    res.json({
      success: true,
      message: `Package ${plan.name} activated successfully!`,
      investment: {
        ...newInvestment,
        lastClaimTimestamp: Number(newInvestment.lastClaimTimestamp)
      },
      balance: updatedUser.balance,
      transaction: newTx
    });
  } catch (err) {
    console.error("[Activate Package Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to activate package" });
  }
});
router.post("/investments/claim", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { investmentId } = req.body;
    if (!investmentId) {
      return res.status(400).json({ error: "Investment ID is required" });
    }
    if (investmentId === "all") {
      const activeInvs = await prisma.activeInvestment.findMany({
        where: { userId: user.id, status: "active" }
      });
      if (activeInvs.length === 0) {
        return res.status(400).json({ error: "You have no active investment packages earning yield." });
      }
      const now2 = Date.now();
      let totalDailyProfits = 0;
      const operations = [];
      for (const inv2 of activeInvs) {
        const exactDaily = Math.round(inv2.dailyProfitAmount);
        totalDailyProfits += exactDaily;
        const newDaysRemaining2 = Math.max(0, inv2.daysRemaining - 1);
        const isCompleted2 = newDaysRemaining2 <= 0;
        operations.push(
          prisma.activeInvestment.update({
            where: { id: inv2.id },
            data: {
              earnedSoFar: { increment: exactDaily },
              unclaimedProfit: 0,
              daysRemaining: newDaysRemaining2,
              status: isCompleted2 ? "completed" : "active",
              lastClaimTimestamp: BigInt(now2)
            }
          })
        );
      }
      const txId2 = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
      operations.push(
        prisma.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: totalDailyProfits },
            totalEarnedProfit: { increment: totalDailyProfits }
          }
        })
      );
      operations.push(
        prisma.transaction.create({
          data: {
            id: txId2,
            userId: user.id,
            userName: user.name,
            userPhone: user.phone,
            type: "daily_profit",
            amount: totalDailyProfits,
            fee: 0,
            netAmount: totalDailyProfits,
            status: "completed",
            gateway: "Yield_Payout",
            referenceCode: `CLAIM-ALL-${Date.now().toString().slice(-6)}`,
            timestamp: getFormattedNow(),
            notes: `Batch claimed exact Rs. ${totalDailyProfits.toLocaleString()} daily yield across ${activeInvs.length} packages`
          }
        })
      );
      await prisma.$transaction(operations);
      const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
      await createUserNotification(
        user.id,
        "Batch Yield Claimed! \u{1F4B0}",
        `Rs. ${totalDailyProfits.toLocaleString()} daily profit yield has been credited to your wallet balance.`,
        "profit_claimed",
        totalDailyProfits
      );
      return res.json({
        success: true,
        message: `Successfully collected Rs. ${totalDailyProfits.toLocaleString()} in daily profits!`,
        claimedAmount: totalDailyProfits,
        totalClaimed: totalDailyProfits,
        balance: freshUser?.balance || 0,
        totalEarnedProfit: freshUser?.totalEarnedProfit || 0
      });
    }
    const inv = await prisma.activeInvestment.findFirst({
      where: { id: investmentId, userId: user.id, status: "active" }
    });
    if (!inv) {
      return res.status(404).json({ error: "Active investment package not found" });
    }
    const exactDailyProfit = Math.round(inv.dailyProfitAmount);
    if (exactDailyProfit <= 0) {
      return res.status(400).json({ error: "Invalid profit calculation for this package." });
    }
    const now = Date.now();
    const newDaysRemaining = Math.max(0, inv.daysRemaining - 1);
    const isCompleted = newDaysRemaining <= 0;
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const principalToRefund = isCompleted ? inv.investedAmount : 0;
    const [updatedUser, updatedInv, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: exactDailyProfit + principalToRefund },
          totalEarnedProfit: { increment: exactDailyProfit },
          ...isCompleted ? { investedCapital: { decrement: inv.investedAmount } } : {}
        }
      }),
      prisma.activeInvestment.update({
        where: { id: inv.id },
        data: {
          earnedSoFar: { increment: exactDailyProfit },
          unclaimedProfit: 0,
          daysRemaining: newDaysRemaining,
          status: isCompleted ? "completed" : "active",
          lastClaimTimestamp: BigInt(now)
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "daily_profit",
          amount: exactDailyProfit,
          fee: 0,
          netAmount: exactDailyProfit,
          status: "completed",
          gateway: "Yield_Payout",
          referenceCode: `CLAIM-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Claimed Rs. ${exactDailyProfit.toLocaleString()} daily yield from ${inv.planName}`,
          planName: inv.planName
        }
      })
    ]);
    await createUserNotification(
      user.id,
      "Profit Yield Claimed! \u{1F4B0}",
      `Rs. ${exactDailyProfit.toLocaleString()} daily yield from ${inv.planName} has been credited to your wallet balance.`,
      "profit_claimed",
      exactDailyProfit
    );
    if (isCompleted && principalToRefund > 0) {
      const refundTxId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
      await prisma.transaction.create({
        data: {
          id: refundTxId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "capital_refund",
          amount: principalToRefund,
          fee: 0,
          netAmount: principalToRefund,
          status: "completed",
          gateway: "Principal_Return",
          referenceCode: `REFUND-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Contract maturity: 100% principal capital of Rs. ${principalToRefund.toLocaleString()} returned for ${inv.planName}`,
          planName: inv.planName
        }
      });
      await createUserNotification(
        user.id,
        "Contract Matured & Capital Refunded! \u{1F31F}",
        `Your investment in ${inv.planName} has completed its full ${inv.durationDays}-day cycle. Rs. ${principalToRefund.toLocaleString()} principal capital refunded to your wallet!`,
        "system",
        principalToRefund
      );
    }
    res.json({
      success: true,
      message: `Rs. ${exactDailyProfit.toLocaleString()} credited to your balance!`,
      claimedAmount: exactDailyProfit,
      balance: updatedUser.balance,
      totalEarnedProfit: updatedUser.totalEarnedProfit,
      investment: {
        ...updatedInv,
        lastClaimTimestamp: Number(updatedInv.lastClaimTimestamp)
      },
      transaction: tx
    });
  } catch (err) {
    console.error("[Claim Profit Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to claim profit" });
  }
});
router.post("/investments/claim-all", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const activeInvs = await prisma.activeInvestment.findMany({
      where: { userId: user.id, status: "active" }
    });
    if (activeInvs.length === 0) {
      return res.status(400).json({ error: "You have no active investment packages earning yield." });
    }
    const now = Date.now();
    let totalDailyProfits = 0;
    const operations = [];
    for (const inv of activeInvs) {
      const exactDaily = Math.round(inv.dailyProfitAmount);
      totalDailyProfits += exactDaily;
      const newDaysRemaining = Math.max(0, inv.daysRemaining - 1);
      const isCompleted = newDaysRemaining <= 0;
      operations.push(
        prisma.activeInvestment.update({
          where: { id: inv.id },
          data: {
            earnedSoFar: { increment: exactDaily },
            unclaimedProfit: 0,
            daysRemaining: newDaysRemaining,
            status: isCompleted ? "completed" : "active",
            lastClaimTimestamp: BigInt(now)
          }
        })
      );
    }
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    operations.push(
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: totalDailyProfits },
          totalEarnedProfit: { increment: totalDailyProfits }
        }
      })
    );
    operations.push(
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "daily_profit",
          amount: totalDailyProfits,
          fee: 0,
          netAmount: totalDailyProfits,
          status: "completed",
          gateway: "Yield_Payout",
          referenceCode: `CLAIM-ALL-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Batch claimed exact Rs. ${totalDailyProfits.toLocaleString()} daily yield across ${activeInvs.length} packages`
        }
      })
    );
    await prisma.$transaction(operations);
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    await createUserNotification(
      user.id,
      "Batch Yield Claimed! \u{1F4B0}",
      `Rs. ${totalDailyProfits.toLocaleString()} daily profit yield has been credited to your wallet balance.`,
      "profit_claimed",
      totalDailyProfits
    );
    res.json({
      success: true,
      message: `Successfully collected Rs. ${totalDailyProfits.toLocaleString()} in daily profits!`,
      totalClaimed: totalDailyProfits,
      balance: freshUser?.balance || 0,
      totalEarnedProfit: freshUser?.totalEarnedProfit || 0
    });
  } catch (err) {
    console.error("[Claim All Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to claim all profits" });
  }
});
router.get("/transactions", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ userId: user.id }, { userPhone: user.phone }]
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch transactions" });
  }
});
router.post("/deposit", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { amount, gateway, referenceCode, senderPhone, senderTitle } = req.body;
    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount < 1e3) {
      return res.status(400).json({ error: "Minimum deposit amount is Rs. 1,000." });
    }
    if (!referenceCode || typeof referenceCode !== "string" || referenceCode.trim().length < 4) {
      return res.status(400).json({ error: "Please enter transaction ID / Reference TID proof from your payment app." });
    }
    const cleanRef = referenceCode.trim().toUpperCase();
    const existingTid = await prisma.transaction.findFirst({
      where: {
        referenceCode: { equals: cleanRef, mode: "insensitive" },
        type: "deposit"
      }
    });
    if (existingTid) {
      return res.status(409).json({
        error: `Transaction ID (${cleanRef}) has already been submitted. Please check your transaction history.`
      });
    }
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const tx = await prisma.transaction.create({
      data: {
        id: txId,
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: "deposit",
        amount: depositAmount,
        fee: 0,
        netAmount: depositAmount,
        status: "pending",
        gateway: gateway || "JazzCash",
        senderPhone: senderPhone || user.phone,
        senderTitle: senderTitle || user.name,
        referenceCode: cleanRef,
        timestamp: getFormattedNow(),
        notes: `Deposit submitted via ${gateway || "JazzCash"}. Awaiting manual verification.`
      }
    });
    await createUserNotification(
      user.id,
      "Deposit Proof Submitted \u23F3",
      `Rs. ${depositAmount.toLocaleString()} deposit via ${gateway || "JazzCash"} (TID: ${cleanRef}) is under manual verification.`,
      "system",
      depositAmount
    );
    res.json({
      success: true,
      message: "Deposit request submitted successfully! Funds will be credited once verified.",
      transaction: tx
    });
  } catch (err) {
    console.error("[Deposit Submit Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to submit deposit request" });
  }
});
var withdrawalFeeConfig = {
  enabled: true,
  standardPercent: 1,
  // 1% standard
  standardFlatFee: 0,
  minWithdrawal: 300,
  maxDailyRequests: 3,
  description: "Dynamic processing fee tiering for PKR withdrawals",
  tiers: [
    {
      id: "tier-under-500",
      condition: "lt",
      threshold: 500,
      feePercent: 0,
      flatFee: 0,
      label: "Under Rs. 500: Free"
    },
    {
      id: "tier-500-to-2500",
      condition: "lte",
      threshold: 2500,
      feePercent: 1,
      flatFee: 0,
      label: "Rs. 500 - Rs. 2,500"
    },
    {
      id: "tier-above-2500",
      condition: "gt",
      threshold: 2500,
      feePercent: 1.5,
      flatFee: 0,
      label: "Above Rs. 2,500"
    }
  ]
};
async function syncWithdrawalFeeConfigFromDb() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "withdrawal_fee_config" }
    });
    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      withdrawalFeeConfig = {
        ...withdrawalFeeConfig,
        ...parsed,
        tiers: Array.isArray(parsed.tiers) && parsed.tiers.length > 0 ? parsed.tiers : withdrawalFeeConfig.tiers
      };
    } else {
      await prisma.systemSetting.upsert({
        where: { key: "withdrawal_fee_config" },
        update: { value: JSON.stringify(withdrawalFeeConfig) },
        create: { key: "withdrawal_fee_config", value: JSON.stringify(withdrawalFeeConfig) }
      });
    }
  } catch (err) {
    console.error("[syncWithdrawalFeeConfigFromDb Error]:", err);
  }
  return withdrawalFeeConfig;
}
function calculateWithdrawalFee(amount) {
  if (!withdrawalFeeConfig.enabled) {
    return { fee: 0, netAmount: amount, feePercent: 0, ruleMatched: "Rs. 0" };
  }
  if (amount < 500) {
    return { fee: 0, netAmount: amount, feePercent: 0, ruleMatched: "Rs. 0" };
  }
  for (const tier of withdrawalFeeConfig.tiers) {
    let matches = false;
    if (tier.condition === "lt" && amount < tier.threshold) matches = true;
    else if (tier.condition === "lte" && amount <= tier.threshold) matches = true;
    else if (tier.condition === "gt" && amount > tier.threshold) matches = true;
    else if (tier.condition === "gte" && amount >= tier.threshold) matches = true;
    else if (tier.condition === "always") matches = true;
    if (matches) {
      const calculated2 = Math.round(amount * (tier.feePercent / 100) + (tier.flatFee || 0));
      const fee2 = Math.max(0, calculated2);
      return {
        fee: fee2,
        netAmount: Math.max(0, amount - fee2),
        feePercent: tier.feePercent,
        ruleMatched: `Rs. ${fee2}`
      };
    }
  }
  const calculated = Math.round(amount * (withdrawalFeeConfig.standardPercent / 100) + (withdrawalFeeConfig.standardFlatFee || 0));
  const fee = Math.max(0, calculated);
  return {
    fee,
    netAmount: Math.max(0, amount - fee),
    feePercent: withdrawalFeeConfig.standardPercent,
    ruleMatched: `Rs. ${fee}`
  };
}
router.get("/withdrawal-fee-config", async (req, res) => {
  await syncWithdrawalFeeConfigFromDb();
  let userDailyStats = {
    todayCount: 0,
    maxDaily: withdrawalFeeConfig.maxDailyRequests || 3,
    remaining: withdrawalFeeConfig.maxDailyRequests || 3,
    canWithdraw: true
  };
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
      if (decoded?.userId) {
        const startOfDay = getStartOfToday();
        const count = await prisma.transaction.count({
          where: {
            userId: decoded.userId,
            type: "withdrawal",
            createdAt: { gte: startOfDay }
          }
        });
        const maxDaily = withdrawalFeeConfig.maxDailyRequests || 3;
        userDailyStats = {
          todayCount: count,
          maxDaily,
          remaining: Math.max(0, maxDaily - count),
          canWithdraw: count < maxDaily
        };
      }
    } catch {
    }
  }
  res.json({
    success: true,
    config: withdrawalFeeConfig,
    userDailyStats
  });
});
router.get("/withdraw/daily-status", authenticate, async (req, res) => {
  try {
    await syncWithdrawalFeeConfigFromDb();
    const user = req.user;
    const startOfDay = getStartOfToday();
    const todayCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "withdrawal",
        createdAt: { gte: startOfDay }
      }
    });
    const maxDaily = withdrawalFeeConfig.maxDailyRequests || 3;
    const minWithdrawal = withdrawalFeeConfig.minWithdrawal || 300;
    const remaining = Math.max(0, maxDaily - todayCount);
    res.json({
      success: true,
      minWithdrawal,
      maxDailyRequests: maxDaily,
      todayRequestsCount: todayCount,
      remainingRequests: remaining,
      canWithdraw: remaining > 0
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch daily withdrawal status" });
  }
});
router.post("/admin/withdrawal-fee-config", async (req, res) => {
  try {
    const { enabled, standardPercent, standardFlatFee, minWithdrawal, maxDailyRequests, description, tiers } = req.body;
    if (typeof enabled === "boolean") withdrawalFeeConfig.enabled = enabled;
    if (typeof standardPercent === "number" && !isNaN(standardPercent)) withdrawalFeeConfig.standardPercent = Math.max(0, standardPercent);
    if (typeof standardFlatFee === "number" && !isNaN(standardFlatFee)) withdrawalFeeConfig.standardFlatFee = Math.max(0, standardFlatFee);
    if (typeof minWithdrawal === "number" && !isNaN(minWithdrawal)) withdrawalFeeConfig.minWithdrawal = Math.max(50, minWithdrawal);
    if (typeof maxDailyRequests === "number" && !isNaN(maxDailyRequests)) withdrawalFeeConfig.maxDailyRequests = Math.max(1, maxDailyRequests);
    if (typeof description === "string") withdrawalFeeConfig.description = description;
    if (Array.isArray(tiers) && tiers.length > 0) {
      withdrawalFeeConfig.tiers = tiers;
    }
    await prisma.systemSetting.upsert({
      where: { key: "withdrawal_fee_config" },
      update: { value: JSON.stringify(withdrawalFeeConfig) },
      create: { key: "withdrawal_fee_config", value: JSON.stringify(withdrawalFeeConfig) }
    });
    res.json({
      success: true,
      message: "Dynamic withdrawal fee configuration saved permanently in database.",
      config: withdrawalFeeConfig
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to update withdrawal fee config in database" });
  }
});
router.post("/withdraw", authenticate, async (req, res) => {
  try {
    await syncWithdrawalFeeConfigFromDb();
    const user = req.user;
    const { amount, gateway, accountTitle, accountNumber, bankName, pin } = req.body;
    const liveUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!liveUser) return res.status(404).json({ error: "User not found" });
    if (!pin || String(pin).trim() !== String(liveUser.securityPin).trim()) {
      return res.status(400).json({ error: "Incorrect 4-digit Security PIN. Please enter your valid PIN." });
    }
    const withdrawAmount = Number(amount);
    const minLimit = withdrawalFeeConfig.minWithdrawal || 300;
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ error: `Please enter a valid withdrawal amount.` });
    }
    if (withdrawAmount < minLimit) {
      return res.status(400).json({ error: `Minimum withdrawal amount is Rs. ${minLimit.toLocaleString()}.` });
    }
    const maxDaily = withdrawalFeeConfig.maxDailyRequests || 3;
    const startOfDay = getStartOfToday();
    const todayWithdrawalsCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "withdrawal",
        createdAt: {
          gte: startOfDay
        }
      }
    });
    if (todayWithdrawalsCount >= maxDaily) {
      return res.status(400).json({
        error: `Daily limit reached! You can submit up to ${maxDaily} withdrawal requests per day (${todayWithdrawalsCount}/${maxDaily} used today). Please try again tomorrow.`,
        dailyLimitReached: true,
        maxDailyRequests: maxDaily,
        todayRequestsCount: todayWithdrawalsCount
      });
    }
    if (liveUser.balance < withdrawAmount) {
      return res.status(400).json({
        error: `Insufficient balance. Available: Rs. ${liveUser.balance.toLocaleString()}, Requested: Rs. ${withdrawAmount.toLocaleString()}`
      });
    }
    if (!accountTitle || !accountNumber) {
      return res.status(400).json({ error: "Account title and account number are required for withdrawal." });
    }
    const { fee, netAmount, feePercent, ruleMatched } = calculateWithdrawalFee(withdrawAmount);
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: withdrawAmount }
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "withdrawal",
          amount: withdrawAmount,
          fee,
          netAmount,
          status: "pending",
          gateway: gateway || "JazzCash",
          accountTitle: accountTitle.trim(),
          accountNumber: accountNumber.trim(),
          bankName: bankName ? bankName.trim() : null,
          referenceCode: `WD-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Withdrawal to ${gateway} (${accountNumber}). Awaiting disbursement approval.`
        }
      })
    ]);
    await createUserNotification(
      user.id,
      "Withdrawal Request Queued \u23F3",
      `Rs. ${withdrawAmount.toLocaleString()} withdrawal to ${gateway} (${accountNumber}) is awaiting dispatch approval.`,
      "system",
      withdrawAmount
    );
    res.json({
      success: true,
      message: "Withdrawal request submitted! Status is Pending approval.",
      transaction: tx,
      balance: updatedUser.balance
    });
  } catch (err) {
    console.error("[Withdraw Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to submit withdrawal request" });
  }
});
router.get("/referrals", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const myCode = (user.referralCode || "").trim().toUpperCase();
    const tier1Users = await prisma.user.findMany({
      where: { referredBy: { equals: myCode, mode: "insensitive" } },
      select: { id: true, name: true, phone: true, joinedDate: true, referralCode: true }
    });
    const tier1Ids = tier1Users.map((u) => u.id);
    const tier1Codes = tier1Users.map((u) => u.referralCode.trim().toUpperCase());
    const tier2Users = tier1Codes.length > 0 ? await prisma.user.findMany({
      where: { referredBy: { in: tier1Codes, mode: "insensitive" } },
      select: { id: true, name: true, phone: true, joinedDate: true, referralCode: true }
    }) : [];
    const tier2Ids = tier2Users.map((u) => u.id);
    const tier2Codes = tier2Users.map((u) => u.referralCode.trim().toUpperCase());
    const tier3Users = tier2Codes.length > 0 ? await prisma.user.findMany({
      where: { referredBy: { in: tier2Codes, mode: "insensitive" } },
      select: { id: true, name: true, phone: true, joinedDate: true, referralCode: true }
    }) : [];
    const tier3Ids = tier3Users.map((u) => u.id);
    const allDownlineIds = [...tier1Ids, ...tier2Ids, ...tier3Ids];
    const downlineDeposits = allDownlineIds.length > 0 ? await prisma.transaction.findMany({
      where: {
        userId: { in: allDownlineIds },
        type: "deposit",
        status: "completed"
      },
      select: { userId: true, amount: true }
    }) : [];
    const depositMap = /* @__PURE__ */ new Map();
    for (const d of downlineDeposits) {
      if (d.userId) {
        depositMap.set(d.userId, (depositMap.get(d.userId) || 0) + d.amount);
      }
    }
    const tier1Members = tier1Users.map((u) => {
      const dep = depositMap.get(u.id) || 0;
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: dep > 0 ? "Active" : "Registered",
        totalDeposited: dep,
        commissionEarned: Math.round(dep * 0.1),
        tier: 1
      };
    });
    const tier2Members = tier2Users.map((u) => {
      const dep = depositMap.get(u.id) || 0;
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: dep > 0 ? "Active" : "Registered",
        totalDeposited: dep,
        commissionEarned: Math.round(dep * 0.04),
        tier: 2
      };
    });
    const tier3Members = tier3Users.map((u) => {
      const dep = depositMap.get(u.id) || 0;
      return {
        id: u.id,
        name: u.name,
        phoneMasked: maskPhone(u.phone),
        joinedDate: u.joinedDate,
        status: dep > 0 ? "Active" : "Registered",
        totalDeposited: dep,
        commissionEarned: Math.round(dep * 0.01),
        tier: 3
      };
    });
    const totalTeamMembers = tier1Members.length + tier2Members.length + tier3Members.length;
    const activeTeamMembers = [...tier1Members, ...tier2Members, ...tier3Members].filter((m) => m.status === "Active").length;
    const totalTeamVolume = [...tier1Members, ...tier2Members, ...tier3Members].reduce((s, m) => s + m.totalDeposited, 0);
    const commissionHistory = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "referral_bonus"
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json({
      success: true,
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      unclaimedReferralEarnings: user.unclaimedReferralEarnings,
      tier1Count: tier1Members.length,
      tier2Count: tier2Members.length,
      tier3Count: tier3Members.length,
      totalTeamMembers,
      activeTeamMembers,
      totalTeamVolume,
      tier1Members,
      tier2Members,
      tier3Members,
      commissionHistory
    });
  } catch (err) {
    console.error("[Referrals API Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to fetch referral network" });
  }
});
router.post("/referrals/claim", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const liveUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!liveUser) return res.status(404).json({ error: "User not found" });
    if (liveUser.unclaimedReferralEarnings <= 0) {
      return res.status(400).json({ error: "You have no unclaimed referral commissions at this time." });
    }
    const claimAmount = liveUser.unclaimedReferralEarnings;
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: claimAmount },
          unclaimedReferralEarnings: 0
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "referral_bonus",
          amount: claimAmount,
          fee: 0,
          netAmount: claimAmount,
          status: "completed",
          gateway: "Referral_Commission",
          referenceCode: `REF-CLAIM-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Claimed Rs. ${claimAmount.toLocaleString()} multi-tier team referral commissions into wallet balance`
        }
      })
    ]);
    await createUserNotification(
      user.id,
      "Referral Commission Credited! \u{1F465}",
      `Rs. ${claimAmount.toLocaleString()} team commission has been transferred to your wallet balance.`,
      "referral_bonus",
      claimAmount
    );
    res.json({
      success: true,
      message: `Rs. ${claimAmount.toLocaleString()} referral commission claimed into your balance!`,
      claimedAmount: claimAmount,
      balance: updatedUser.balance,
      transaction: tx
    });
  } catch (err) {
    console.error("[Referrals Claim Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to claim referral earnings" });
  }
});
router.get("/streak/tiers", async (req, res) => {
  try {
    await ensureInitialDatabaseData();
    const tiers = await prisma.dailyRewardTier.findMany({
      orderBy: { day: "asc" }
    });
    res.json({ success: true, tiers });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch reward tiers" });
  }
});
router.post("/streak/checkin", authenticate, async (req, res) => {
  try {
    await ensureInitialDatabaseData();
    const user = req.user;
    const liveUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!liveUser) return res.status(404).json({ error: "User not found" });
    const todayStr = getTodayPktDateString();
    if (liveUser.lastCheckInDate === todayStr) {
      return res.status(400).json({
        error: "You have already checked in today! Come back tomorrow for your next reward.",
        alreadyClaimed: true
      });
    }
    let nextStreak = 1;
    let streakBroken = false;
    if (liveUser.lastCheckInDate) {
      const lastDateParts = liveUser.lastCheckInDate.split("-").map(Number);
      const lastDate = new Date(Date.UTC(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]));
      const todayParts = todayStr.split("-").map(Number);
      const todayDate = new Date(Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]));
      const diffMs = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1e3 * 60 * 60 * 24));
      if (diffDays === 1) {
        nextStreak = liveUser.dailyStreak % 7 + 1;
      } else if (diffDays > 1) {
        nextStreak = 1;
        streakBroken = true;
      } else {
        return res.status(400).json({ error: "Already claimed today!" });
      }
    } else {
      nextStreak = 1;
    }
    const tierConfig = await prisma.dailyRewardTier.findUnique({
      where: { day: nextStreak }
    });
    const fallbackAmounts = {
      1: 250,
      2: 300,
      3: 350,
      4: 400,
      5: 450,
      6: 500,
      7: 1e3
    };
    const reward = tierConfig && tierConfig.isActive !== false ? tierConfig.reward : fallbackAmounts[nextStreak] || 250;
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          dailyStreak: nextStreak,
          lastCheckInDate: todayStr,
          balance: { increment: reward },
          totalEarnedProfit: { increment: reward }
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: "streak_reward",
          amount: reward,
          fee: 0,
          netAmount: reward,
          status: "completed",
          gateway: "Loyalty_Bonus",
          referenceCode: `STREAK-D${nextStreak}`,
          timestamp: getFormattedNow(),
          notes: `Day ${nextStreak} Loyalty Check-in Cash Bonus${streakBroken ? " (Streak Reset after Inactivity)" : ""}`
        }
      })
    ]);
    await createUserNotification(
      user.id,
      `Day ${nextStreak} Streak Bonus Credited! \u{1F525}`,
      `Rs. ${reward.toLocaleString()} cash bonus was credited for checking in today!${streakBroken ? " Your streak restarted at Day 1 after missed day." : ""}`,
      "system",
      reward
    );
    res.json({
      success: true,
      dailyStreak: updatedUser.dailyStreak,
      reward,
      balance: updatedUser.balance,
      transaction: tx,
      streakBroken,
      message: streakBroken ? `Streak restarted at Day 1! Earned Rs. ${reward}` : `Day ${nextStreak} Check-in claimed! Earned Rs. ${reward}`
    });
  } catch (err) {
    console.error("[Streak Error]:", err);
    res.status(500).json({ error: err?.message || "Check-in failed" });
  }
});
router.get("/notifications", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch notifications" });
  }
});
router.post("/notifications/mark-read", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { notificationId } = req.body;
    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { read: true }
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { read: true }
      });
    }
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false }
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationsCount: unreadCount }
    });
    res.json({ success: true, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to update notifications" });
  }
});
router.post("/notifications/clear", authenticate, async (req, res) => {
  try {
    const user = req.user;
    await prisma.notification.deleteMany({
      where: { userId: user.id }
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationsCount: 0 }
    });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to clear notifications" });
  }
});
router.post("/ai/chat", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please provide a message for the AI advisor." });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: `Assalam-o-Alaikum ${user.name}! I am your PakInvest Wealth Advisor. You currently have a wallet balance of Rs. ${user.balance.toLocaleString()} and active invested capital of Rs. ${user.investedCapital.toLocaleString()}. Consider our high-performing Starter (5% daily) or Solar Farm (6% daily) packages for guaranteed daily PKR returns to your JazzCash or EasyPaisa wallet.`
      });
    }
    const [userInvestments, userTx] = await Promise.all([
      prisma.activeInvestment.findMany({ where: { userId: user.id, status: "active" } }),
      prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 })
    ]);
    const activePackagesSummary = userInvestments.map((i) => `${i.planName} (Invested: Rs. ${i.investedAmount.toLocaleString()}, Daily Yield: ${i.dailyProfitPercent}%)`).join(", ");
    const promptContext = `
You are the official Senior Investment Portfolio Consultant for PakInvest, Pakistan's leading digital fixed-yield investment platform.
User Profile:
- Name: ${user.name}
- Wallet Balance: Rs. ${user.balance.toLocaleString()} PKR
- Invested Capital: Rs. ${user.investedCapital.toLocaleString()} PKR
- Total Earned Profit: Rs. ${user.totalEarnedProfit.toLocaleString()} PKR
- Active Packages: ${activePackagesSummary || "None currently active"}
- Referral Code: ${user.referralCode} (Earns 10% on Tier 1, 4% on Tier 2, 1% on Tier 3)

PakInvest Official Packages Available:
1. Pak Starter Spark: Rs. 1,000 (5% daily, 30 days, Rs. 50/day)
2. Punjab Solar Farm: Rs. 5,000 (6% daily, 30 days, Rs. 300/day)
3. Sindh Agri Yield: Rs. 10,000 (7% daily, 45 days, Rs. 700/day)
4. CPEC Logistics: Rs. 25,000 (8% daily, 60 days, Rs. 2,000/day)
5. Capital Real Estate: Rs. 50,000 (9% daily, 60 days, Rs. 4,500/day)
6. Tech Unicorn Fund: Rs. 100,000 (10% daily, 90 days, Rs. 10,000/day)

Supported Payment Gateways: JazzCash, EasyPaisa, Meezan Bank (IBFT), USDT (TRC-20).

User Question: "${message}"

Please provide a polite, professional, Urdu-friendly English response (or Urdu Roman phrasing where helpful like "Shukriya", "Assalam-o-Alaikum"). Calculate exact daily earnings if user asks for specific amounts. Keep it concise, helpful, and reassuring.
`;
    const ai = new import_genai.GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContext
    });
    const replyText = response.text || "Assalam-o-Alaikum! Please deposit into your wallet to activate our high-yield investment plans.";
    res.json({ success: true, reply: replyText });
  } catch (err) {
    console.error("[AI Advisor Error]:", err);
    res.json({
      success: true,
      reply: "Assalam-o-Alaikum! Our automated daily dividend packages are actively paying yields. Deposit via JazzCash or EasyPaisa to start earning daily returns directly to your wallet."
    });
  }
});
router.get("/admin/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { investments: true, transactions: true }
        }
      }
    });
    const enriched = users.map((u) => {
      const { password: _, ...safeUser } = u;
      return {
        ...safeUser,
        activePackagesCount: u._count.investments
      };
    });
    res.json({ success: true, users: enriched });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch CRM users" });
  }
});
router.get("/admin/pending", async (req, res) => {
  try {
    const [pendingTransactions, allUsers] = await Promise.all([
      prisma.transaction.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          balance: true,
          investedCapital: true,
          referralCode: true,
          isVerified: true,
          isAdmin: true
        }
      })
    ]);
    res.json({
      success: true,
      pending: pendingTransactions,
      allUsers
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch pending transactions" });
  }
});
router.get("/admin/transactions", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;
    const { type, status, userId, search, gateway } = req.query;
    const where = {};
    if (type && typeof type === "string" && type !== "all") {
      where.type = type;
    }
    if (status && typeof status === "string" && status !== "all") {
      where.status = status;
    }
    if (gateway && typeof gateway === "string" && gateway !== "all") {
      where.gateway = { equals: gateway, mode: "insensitive" };
    }
    if (userId && typeof userId === "string" && userId !== "all") {
      where.userId = userId;
    }
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { referenceCode: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { userPhone: { contains: q, mode: "insensitive" } },
        { accountNumber: { contains: q, mode: "insensitive" } },
        { senderPhone: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { gateway: { contains: q, mode: "insensitive" } }
      ];
    }
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);
    let typeStats = null;
    let availableGateways = [];
    if (type && typeof type === "string" && type !== "all") {
      const [grouped, sumAgg, distinctGateways] = await Promise.all([
        prisma.transaction.groupBy({
          by: ["status"],
          where: { type },
          _count: { id: true },
          _sum: { amount: true, netAmount: true }
        }),
        prisma.transaction.count({ where: { type } }),
        prisma.transaction.findMany({
          where: { type },
          select: { gateway: true },
          distinct: ["gateway"]
        })
      ]);
      let pendingCount = 0;
      let pendingVolume = 0;
      let completedCount = 0;
      let completedVolume = 0;
      let declinedCount = 0;
      let declinedVolume = 0;
      for (const g of grouped) {
        if (g.status === "pending") {
          pendingCount = g._count.id;
          pendingVolume = g._sum.amount || 0;
        } else if (g.status === "completed") {
          completedCount = g._count.id;
          completedVolume = (type === "withdrawal" ? g._sum.netAmount || g._sum.amount : g._sum.amount) || 0;
        } else if (g.status === "declined") {
          declinedCount = g._count.id;
          declinedVolume = g._sum.amount || 0;
        }
      }
      typeStats = {
        totalSubmissions: sumAgg,
        pendingCount,
        pendingVolume,
        completedCount,
        completedVolume,
        declinedCount,
        declinedVolume
      };
      availableGateways = distinctGateways.map((g) => g.gateway).filter((g) => Boolean(g));
    }
    const LEDGER_SECRET = process.env.LEDGER_SECRET || "PAK_LEDGER_MASTER_INTEGRITY_KEY_2026";
    const enriched = transactions.map((t) => {
      const payload = `${t.id}:${t.userId || ""}:${t.amount}:${t.status}:${t.referenceCode}`;
      const checksum = import_crypto.default.createHmac("sha256", LEDGER_SECRET).update(payload).digest("hex");
      const idempotencyKey = `IDEM-PK-${t.id.replace(/[^a-zA-Z0-9]/g, "")}-${t.amount}`;
      const isClean = t.amount > 0 && !isNaN(t.amount) && t.status !== "";
      const auditStatus = isClean ? "VERIFIED" : "ANOMALY_DETECTED";
      return {
        ...t,
        cryptoChecksum: checksum,
        idempotencyKey,
        reconciliationStatus: isClean ? "MATCHED" : "DISCREPANCY_FLAGGED",
        auditStatus
      };
    });
    res.json({
      success: true,
      transactions: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      typeStats,
      availableGateways
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch CRM transactions" });
  }
});
router.get("/admin/users/:userId/transactions", async (req, res) => {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const skip = (page - 1) * limit;
    const where = { userId };
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);
    const LEDGER_SECRET = process.env.LEDGER_SECRET || "PAK_LEDGER_MASTER_INTEGRITY_KEY_2026";
    const enriched = transactions.map((t) => {
      const payload = `${t.id}:${t.userId || ""}:${t.amount}:${t.status}:${t.referenceCode}`;
      const checksum = import_crypto.default.createHmac("sha256", LEDGER_SECRET).update(payload).digest("hex");
      const idempotencyKey = `IDEM-PK-${t.id.replace(/[^a-zA-Z0-9]/g, "")}-${t.amount}`;
      return {
        ...t,
        cryptoChecksum: checksum,
        idempotencyKey,
        reconciliationStatus: t.amount > 0 ? "MATCHED" : "DISCREPANCY_FLAGGED"
      };
    });
    res.json({
      success: true,
      transactions: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch user ledger transactions" });
  }
});
router.get("/admin/ledger/audit-integrity", async (req, res) => {
  try {
    const [
      totalCount,
      negativeAmounts,
      missingUserId,
      unknownTypes,
      anomaliesSample
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { amount: { lte: 0 } } }),
      prisma.transaction.count({ where: { userId: null } }),
      prisma.transaction.count({ where: { type: { notIn: ["deposit", "withdrawal", "daily_profit", "plan_investment", "referral_bonus", "admin_adjustment", "streak_reward", "profit", "investment_buy"] } } }),
      prisma.transaction.findMany({
        where: {
          OR: [
            { amount: { lte: 0 } },
            { type: "" },
            { status: "" }
          ]
        },
        take: 10
      })
    ]);
    res.json({
      success: true,
      integrity: {
        totalTransactions: totalCount,
        negativeOrZeroAmountCount: negativeAmounts,
        unlinkedTransactionsCount: missingUserId,
        unknownTypeCount: unknownTypes,
        isHealthy: negativeAmounts === 0 && unknownTypes === 0,
        anomaliesSample,
        secretConfigured: !!process.env.LEDGER_SECRET
      }
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to run ledger audit check" });
  }
});
router.post("/admin/ledger/bulk-ingest", async (req, res) => {
  try {
    const { items, secretKey, autoReconcileUsers } = req.body;
    const LEDGER_SECRET = process.env.LEDGER_SECRET || "PAK_LEDGER_MASTER_INTEGRITY_KEY_2026";
    if (!secretKey || secretKey !== LEDGER_SECRET) {
      return res.status(401).json({
        error: "Invalid or missing injection secret key. Ensure your Python script passes the authorized system ledger secret."
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Payload must contain a non-empty items array." });
    }
    const validTypes = /* @__PURE__ */ new Set([
      "deposit",
      "withdrawal",
      "daily_profit",
      "plan_investment",
      "referral_bonus",
      "admin_adjustment",
      "streak_reward"
    ]);
    const errors = [];
    const validRecords = [];
    const userBalanceIncrements = /* @__PURE__ */ new Map();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const amount = Number(item.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({ index: i, reason: "Amount must be a positive number greater than 0", item });
        continue;
      }
      if (!item.type || !validTypes.has(item.type)) {
        errors.push({ index: i, reason: `Invalid transaction type '${item.type}'. Allowed: ${Array.from(validTypes).join(", ")}`, item });
        continue;
      }
      const txId = item.id ? String(item.id).trim() : `TXN-${Math.floor(1e5 + Math.random() * 9e5)}`;
      const status = item.status || "completed";
      validRecords.push({
        id: txId,
        userId: item.userId || null,
        userName: item.userName || null,
        userPhone: item.userPhone || null,
        type: item.type,
        amount,
        fee: Number(item.fee) || 0,
        netAmount: Number(item.netAmount) || amount,
        status,
        gateway: item.gateway || "System_Ingest",
        referenceCode: item.referenceCode || `ING-${Date.now().toString().slice(-6)}-${i}`,
        timestamp: item.timestamp || getFormattedNow(),
        notes: item.notes ? `[Ingest] ${item.notes}` : "[Ingest] Batch validated insertion"
      });
      if (autoReconcileUsers && item.userId && status === "completed") {
        const delta = item.type === "deposit" || item.type === "daily_profit" || item.type === "referral_bonus" ? amount : item.type === "withdrawal" ? -amount : 0;
        if (delta !== 0) {
          const current = userBalanceIncrements.get(item.userId) || 0;
          userBalanceIncrements.set(item.userId, current + delta);
        }
      }
    }
    let insertedCount = 0;
    const chunkSize = 200;
    for (let i = 0; i < validRecords.length; i += chunkSize) {
      const chunk = validRecords.slice(i, i + chunkSize);
      await prisma.transaction.createMany({
        data: chunk,
        skipDuplicates: true
      });
      insertedCount += chunk.length;
    }
    let reconciledUsers = 0;
    if (autoReconcileUsers && userBalanceIncrements.size > 0) {
      for (const [userId, delta] of userBalanceIncrements.entries()) {
        try {
          await prisma.user.update({
            where: { id: userId },
            data: {
              balance: { [delta > 0 ? "increment" : "decrement"]: Math.abs(delta) }
            }
          });
          reconciledUsers++;
        } catch (e) {
        }
      }
    }
    res.json({
      success: true,
      summary: {
        totalReceived: items.length,
        insertedCount,
        failedCount: errors.length,
        reconciledUsers,
        errorsSample: errors.slice(0, 10)
      },
      message: `Successfully validated and ingested ${insertedCount} transactions into the financial ledger.`
    });
  } catch (err) {
    console.error("[Bulk Ingestion Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to ingest batch transactions." });
  }
});
router.get("/admin/active-investments", async (req, res) => {
  try {
    const investments = await prisma.activeInvestment.findMany({
      include: {
        user: {
          select: { name: true, phone: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const enriched = investments.map((inv) => ({
      ...inv,
      lastClaimTimestamp: Number(inv.lastClaimTimestamp),
      userName: inv.user?.name || "Investor",
      userPhone: inv.user?.phone || ""
    }));
    res.json({ success: true, activeInvestments: enriched });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch active investments" });
  }
});
router.get("/admin/stats", async (req, res) => {
  try {
    const [
      totalUsersCount,
      txGrouped,
      activeInvAgg,
      activeInvCount,
      streakTiers,
      depositChannels
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.groupBy({
        by: ["type", "status"],
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.activeInvestment.aggregate({
        where: { status: "active" },
        _sum: { investedAmount: true }
      }),
      prisma.activeInvestment.count({ where: { status: "active" } }),
      prisma.dailyRewardTier.findMany({ orderBy: { day: "asc" } }),
      prisma.depositChannel.findMany({ orderBy: { createdAt: "asc" } })
    ]);
    let totalDeposited = 0;
    let totalWithdrawn = 0;
    let pendingDepositsCount = 0;
    let pendingDepositsVolume = 0;
    let pendingWithdrawalsCount = 0;
    let pendingWithdrawalsVolume = 0;
    let streakRewardsTotal = 0;
    let streakRewardsCount = 0;
    let referralBonusesTotal = 0;
    let referralBonusesCount = 0;
    let dailyYieldDividendsTotal = 0;
    let adminBonusesTotal = 0;
    let totalPaidProfits = 0;
    for (const g of txGrouped) {
      const sum = g._sum.amount || 0;
      const count = g._count.id || 0;
      if (g.type === "deposit") {
        if (g.status === "completed") {
          totalDeposited += sum;
        } else if (g.status === "pending") {
          pendingDepositsCount += count;
          pendingDepositsVolume += sum;
        }
      } else if (g.type === "withdrawal") {
        if (g.status === "completed") {
          totalWithdrawn += sum;
        } else if (g.status === "pending") {
          pendingWithdrawalsCount += count;
          pendingWithdrawalsVolume += sum;
        }
      } else if (g.type === "streak_reward" && g.status === "completed") {
        streakRewardsTotal += sum;
        streakRewardsCount += count;
        totalPaidProfits += sum;
      } else if (g.type === "referral_bonus" && g.status === "completed") {
        referralBonusesTotal += sum;
        referralBonusesCount += count;
        totalPaidProfits += sum;
      } else if ((g.type === "daily_profit" || g.type === "profit") && g.status === "completed") {
        dailyYieldDividendsTotal += sum;
        totalPaidProfits += sum;
      } else if (g.type === "admin_adjustment" && g.status === "completed") {
        adminBonusesTotal += sum;
      }
    }
    const totalLockedCapital = activeInvAgg._sum.investedAmount || 0;
    const totalRewardsGiven = streakRewardsTotal + referralBonusesTotal + dailyYieldDividendsTotal + adminBonusesTotal;
    const depositsByGateway = await prisma.transaction.groupBy({
      by: ["gateway"],
      where: { type: "deposit", status: "completed" },
      _sum: { amount: true },
      _count: { id: true }
    });
    const depositsMap = /* @__PURE__ */ new Map();
    depositsByGateway.forEach((g) => {
      if (g.gateway) {
        depositsMap.set(g.gateway, {
          total: g._sum.amount || 0,
          count: g._count.id || 0
        });
      }
    });
    const channelBalances = depositChannels.map((c) => {
      const stats = depositsMap.get(c.gateway) || { total: 0, count: 0 };
      const currentBal = typeof c.currentBalance === "number" ? c.currentBalance : stats.total + (c.manualAdjustment || 0);
      return {
        id: c.id,
        gateway: c.gateway,
        accountTitle: c.accountTitle,
        accountNumber: c.accountNumber,
        bankName: c.bankName,
        balance: currentBal,
        manualAdjustment: c.manualAdjustment || 0,
        totalDeposited: stats.total,
        completedCount: stats.count,
        isActive: c.isActive
      };
    });
    const totalChannelsBalance = channelBalances.reduce((sum, c) => sum + c.balance, 0);
    res.json({
      success: true,
      stats: {
        totalDeposited,
        totalWithdrawn,
        pendingDepositsCount,
        pendingDepositsVolume,
        pendingWithdrawalsCount,
        pendingWithdrawalsVolume,
        totalUsersCount,
        activeInvestmentsCount: activeInvCount,
        totalLockedCapital,
        totalPaidProfits,
        totalChannelsBalance,
        channelBalances,
        totalRewardsGiven,
        streakRewardsTotal,
        referralBonusesTotal,
        dailyYieldDividendsTotal,
        adminBonusesTotal,
        rewardsSummary: {
          totalRewardsGiven,
          streakRewardsCount,
          streakRewardsTotal,
          referralBonusesCount,
          referralBonusesTotal,
          dailyYieldDividendsTotal,
          adminBonusesTotal,
          dailyTiers: streakTiers
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch admin statistics" });
  }
});
router.post("/admin/approve-deposit", async (req, res) => {
  try {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === "string" ? rawId.trim() : rawId ? String(rawId) : "";
    const { channelId, gateway: targetGateway } = req.body;
    if (!txId) {
      return res.status(400).json({ error: "Transaction ID is required for approval" });
    }
    const tx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: { equals: txId, mode: "insensitive" } },
          { referenceCode: { equals: txId, mode: "insensitive" } }
        ],
        type: "deposit"
      }
    });
    if (!tx) return res.status(404).json({ error: "Deposit transaction record not found" });
    if (tx.status === "completed") {
      return res.status(400).json({ error: "Transaction is already completed" });
    }
    const user = tx.userId ? await prisma.user.findUnique({ where: { id: tx.userId } }) : null;
    if (!user) return res.status(404).json({ error: "User associated with transaction not found" });
    const effectiveGateway = targetGateway || tx.gateway;
    const notes = `Deposit verified & credited to official float (${effectiveGateway || "Payment Channel"} TID: ${tx.referenceCode})`;
    const operations = [
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "completed",
          notes,
          ...effectiveGateway ? { gateway: effectiveGateway } : {}
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: tx.amount } }
      })
    ];
    let targetChannelQuery = null;
    if (channelId) {
      targetChannelQuery = {
        OR: [{ id: channelId }, { gateway: channelId }]
      };
    } else if (effectiveGateway) {
      targetChannelQuery = { gateway: { equals: effectiveGateway, mode: "insensitive" } };
    }
    if (targetChannelQuery) {
      operations.push(
        prisma.depositChannel.updateMany({
          where: targetChannelQuery,
          data: { currentBalance: { increment: tx.amount } }
        })
      );
    }
    const [updatedTx, updatedUser] = await prisma.$transaction(operations);
    await createUserNotification(
      user.id,
      "Deposit Approved & Credited! \u{1F4B0}",
      `Your deposit of Rs. ${tx.amount.toLocaleString()} via ${tx.gateway} (TID: ${tx.referenceCode}) has been verified. Funds are now in your wallet balance.`,
      "deposit_approved",
      tx.amount
    );
    if (user.referredBy) {
      const tier1Parent = await prisma.user.findFirst({
        where: { referralCode: { equals: user.referredBy, mode: "insensitive" } }
      });
      if (tier1Parent) {
        const comm1 = Math.round(tx.amount * 0.1);
        const tx1Id = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
        await prisma.$transaction([
          prisma.user.update({
            where: { id: tier1Parent.id },
            data: {
              unclaimedReferralEarnings: { increment: comm1 },
              referralEarnings: { increment: comm1 }
            }
          }),
          prisma.transaction.create({
            data: {
              id: tx1Id,
              userId: tier1Parent.id,
              userName: tier1Parent.name,
              userPhone: tier1Parent.phone,
              type: "referral_bonus",
              amount: comm1,
              fee: 0,
              netAmount: comm1,
              status: "completed",
              referenceCode: `COMM-T1-${tx.referenceCode}`,
              timestamp: getFormattedNow(),
              notes: `Tier 1 (10%) referral commission from ${user.name}'s Rs. ${tx.amount.toLocaleString()} deposit`
            }
          })
        ]);
        await createUserNotification(
          tier1Parent.id,
          "Direct Referral Commission Earned! \u{1F465}",
          `You received Rs. ${comm1.toLocaleString()} (10%) from ${user.name}'s verified deposit.`,
          "referral_bonus",
          comm1
        );
        if (tier1Parent.referredBy) {
          const tier2Parent = await prisma.user.findFirst({
            where: { referralCode: { equals: tier1Parent.referredBy, mode: "insensitive" } }
          });
          if (tier2Parent) {
            const comm2 = Math.round(tx.amount * 0.04);
            const tx2Id = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
            await prisma.$transaction([
              prisma.user.update({
                where: { id: tier2Parent.id },
                data: {
                  unclaimedReferralEarnings: { increment: comm2 },
                  referralEarnings: { increment: comm2 }
                }
              }),
              prisma.transaction.create({
                data: {
                  id: tx2Id,
                  userId: tier2Parent.id,
                  userName: tier2Parent.name,
                  userPhone: tier2Parent.phone,
                  type: "referral_bonus",
                  amount: comm2,
                  fee: 0,
                  netAmount: comm2,
                  status: "completed",
                  referenceCode: `COMM-T2-${tx.referenceCode}`,
                  timestamp: getFormattedNow(),
                  notes: `Tier 2 (4%) team commission from ${user.name}'s deposit`
                }
              })
            ]);
            if (tier2Parent.referredBy) {
              const tier3Parent = await prisma.user.findFirst({
                where: { referralCode: { equals: tier2Parent.referredBy, mode: "insensitive" } }
              });
              if (tier3Parent) {
                const comm3 = Math.round(tx.amount * 0.01);
                const tx3Id = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
                await prisma.$transaction([
                  prisma.user.update({
                    where: { id: tier3Parent.id },
                    data: {
                      unclaimedReferralEarnings: { increment: comm3 },
                      referralEarnings: { increment: comm3 }
                    }
                  }),
                  prisma.transaction.create({
                    data: {
                      id: tx3Id,
                      userId: tier3Parent.id,
                      userName: tier3Parent.name,
                      userPhone: tier3Parent.phone,
                      type: "referral_bonus",
                      amount: comm3,
                      fee: 0,
                      netAmount: comm3,
                      status: "completed",
                      referenceCode: `COMM-T3-${tx.referenceCode}`,
                      timestamp: getFormattedNow(),
                      notes: `Tier 3 (1%) network commission from ${user.name}'s deposit`
                    }
                  })
                ]);
              }
            }
          }
        }
      }
    }
    res.json({
      success: true,
      message: `Deposit of Rs. ${tx.amount.toLocaleString()} approved and credited to ${user.name}'s wallet!`,
      transaction: updatedTx,
      balance: updatedUser.balance
    });
  } catch (err) {
    console.error("[Admin Approve Deposit Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to approve deposit" });
  }
});
router.post("/admin/decline-deposit", async (req, res) => {
  try {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === "string" ? rawId.trim() : rawId ? String(rawId) : "";
    const { reason } = req.body;
    const tx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: { equals: txId, mode: "insensitive" } },
          { referenceCode: { equals: txId, mode: "insensitive" } }
        ],
        type: "deposit"
      }
    });
    if (!tx) return res.status(404).json({ error: "Deposit transaction record not found" });
    const notes = reason || "Deposit declined: Invalid Transaction ID proof or funds not received.";
    const updatedTx = await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "declined", notes }
    });
    if (tx.userId) {
      await createUserNotification(
        tx.userId,
        "Deposit Verification Declined \u26A0\uFE0F",
        `Your deposit of Rs. ${tx.amount.toLocaleString()} (${tx.gateway} TID: ${tx.referenceCode}) was declined. Reason: ${notes}`,
        "deposit_declined",
        tx.amount
      );
    }
    res.json({ success: true, message: "Deposit declined.", transaction: updatedTx });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to decline deposit" });
  }
});
router.post("/admin/approve-withdrawal", async (req, res) => {
  try {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === "string" ? rawId.trim() : rawId ? String(rawId) : "";
    const { channelId, gateway: targetGateway, dispatchReference, dispatchNotes } = req.body;
    const tx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: { equals: txId, mode: "insensitive" } },
          { referenceCode: { equals: txId, mode: "insensitive" } }
        ],
        type: "withdrawal"
      }
    });
    if (!tx) return res.status(404).json({ error: "Withdrawal transaction record not found" });
    if (tx.status === "completed") {
      return res.status(400).json({ error: "Withdrawal is already completed" });
    }
    let channel = null;
    if (channelId) {
      channel = await prisma.depositChannel.findFirst({
        where: {
          OR: [{ id: channelId }, { gateway: channelId }]
        }
      });
    }
    if (!channel && targetGateway) {
      channel = await prisma.depositChannel.findFirst({
        where: { gateway: { equals: targetGateway, mode: "insensitive" } }
      });
    }
    if (!channel && tx.gateway) {
      channel = await prisma.depositChannel.findFirst({
        where: { gateway: { equals: tx.gateway, mode: "insensitive" } }
      });
    }
    const dispatchAmount = typeof tx.netAmount === "number" && tx.netAmount > 0 ? tx.netAmount : tx.amount;
    const channelSummary = channel ? `Dispatched via ${channel.gateway} (${channel.accountTitle} / ${channel.accountNumber})` : `Dispatched to ${tx.gateway} (${tx.accountNumber})`;
    const refSummary = dispatchReference ? `[Ref: ${dispatchReference}]` : "";
    const customNotes = dispatchNotes ? `${dispatchNotes.trim()} | ` : "";
    const finalNotes = `${customNotes}${channelSummary} ${refSummary}`.trim();
    const operations = [
      prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "completed",
          notes: finalNotes,
          // If a channel was selected, stamp its gateway on the record for audit linking
          ...channel ? { gateway: channel.gateway } : {}
        }
      })
    ];
    if (tx.userId) {
      operations.push(
        prisma.user.update({
          where: { id: tx.userId },
          data: { totalWithdrawn: { increment: tx.amount } }
        })
      );
    }
    if (channel) {
      operations.push(
        prisma.depositChannel.update({
          where: { id: channel.id },
          data: {
            currentBalance: { decrement: dispatchAmount }
          }
        })
      );
    }
    const [updatedTx] = await prisma.$transaction(operations);
    let updatedChannelBalance = null;
    if (channel) {
      const freshChannel = await prisma.depositChannel.findUnique({ where: { id: channel.id } });
      updatedChannelBalance = freshChannel?.currentBalance ?? null;
    }
    if (tx.userId) {
      await createUserNotification(
        tx.userId,
        "Withdrawal Dispatched! \u{1F680}",
        `Your withdrawal of Rs. ${dispatchAmount.toLocaleString()} has been approved and dispatched from our official ${channel ? channel.gateway : tx.gateway} account to ${tx.accountTitle || "your account"} (${tx.accountNumber}).`,
        "withdrawal_approved",
        tx.amount
      );
    }
    res.json({
      success: true,
      message: `Withdrawal of Rs. ${dispatchAmount.toLocaleString()} dispatched! ${channel ? `Deducted from ${channel.gateway} float.` : ""}`,
      transaction: updatedTx,
      channelDeducted: channel ? {
        id: channel.id,
        gateway: channel.gateway,
        deductedAmount: dispatchAmount,
        newBalance: updatedChannelBalance
      } : null
    });
  } catch (err) {
    console.error("[Admin Approve Withdrawal Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to approve withdrawal" });
  }
});
router.post("/admin/decline-withdrawal", async (req, res) => {
  try {
    const rawId = req.body.txId || req.body.transactionId || req.body.id;
    const txId = typeof rawId === "string" ? rawId.trim() : rawId ? String(rawId) : "";
    const { reason } = req.body;
    const tx = await prisma.transaction.findFirst({
      where: {
        OR: [
          { id: { equals: txId, mode: "insensitive" } },
          { referenceCode: { equals: txId, mode: "insensitive" } }
        ],
        type: "withdrawal"
      }
    });
    if (!tx) return res.status(404).json({ error: "Withdrawal transaction record not found" });
    const notes = reason || "Withdrawal declined: Account details invalid. Funds refunded to wallet.";
    const operations = [
      prisma.transaction.update({
        where: { id: tx.id },
        data: { status: "declined", notes }
      })
    ];
    if (tx.userId && tx.status === "pending") {
      operations.push(
        prisma.user.update({
          where: { id: tx.userId },
          data: { balance: { increment: tx.amount } }
        })
      );
    }
    const [updatedTx] = await prisma.$transaction(operations);
    if (tx.userId) {
      await createUserNotification(
        tx.userId,
        "Withdrawal Declined & Refunded \u26A0\uFE0F",
        `Your withdrawal of Rs. ${tx.amount.toLocaleString()} was declined (${notes}). Rs. ${tx.amount.toLocaleString()} has been refunded back to your wallet balance.`,
        "withdrawal_declined",
        tx.amount
      );
    }
    res.json({ success: true, message: "Withdrawal declined and funds refunded to user.", transaction: updatedTx });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to decline withdrawal" });
  }
});
router.get("/admin/plans", async (req, res) => {
  try {
    const plans = await prisma.investmentPlan.findMany({ orderBy: { minAmount: "asc" } });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch plans" });
  }
});
router.post("/admin/plans", async (req, res) => {
  try {
    const planData = req.body.plan || req.body;
    if (!planData.id || !planData.name || !planData.minAmount || !planData.dailyProfitPercent) {
      return res.status(400).json({ error: "Missing required plan attributes" });
    }
    const savedPlan = await prisma.investmentPlan.upsert({
      where: { id: planData.id },
      create: {
        id: planData.id,
        name: planData.name,
        category: planData.category,
        icon: planData.icon,
        badge: planData.badge || null,
        minAmount: Number(planData.minAmount),
        maxAmount: Number(planData.maxAmount || planData.minAmount),
        fixedAmount: planData.fixedAmount ? Number(planData.fixedAmount) : null,
        dailyProfitPercent: Number(planData.dailyProfitPercent),
        dailyProfitAmount: Number(planData.dailyProfitAmount),
        durationDays: Number(planData.durationDays),
        totalRoiPercent: Number(planData.totalRoiPercent),
        totalReturnAmount: Number(planData.totalReturnAmount),
        payoutFrequency: planData.payoutFrequency || "daily",
        capitalReturnPolicy: planData.capitalReturnPolicy || "Capital returned on maturity",
        description: planData.description,
        highlights: Array.isArray(planData.highlights) ? planData.highlights : [],
        popular: Boolean(planData.popular),
        accentColor: planData.accentColor || "#10b981"
      },
      update: {
        name: planData.name,
        category: planData.category,
        icon: planData.icon,
        badge: planData.badge || null,
        minAmount: Number(planData.minAmount),
        maxAmount: Number(planData.maxAmount || planData.minAmount),
        fixedAmount: planData.fixedAmount ? Number(planData.fixedAmount) : null,
        dailyProfitPercent: Number(planData.dailyProfitPercent),
        dailyProfitAmount: Number(planData.dailyProfitAmount),
        durationDays: Number(planData.durationDays),
        totalRoiPercent: Number(planData.totalRoiPercent),
        totalReturnAmount: Number(planData.totalReturnAmount),
        payoutFrequency: planData.payoutFrequency || "daily",
        capitalReturnPolicy: planData.capitalReturnPolicy || "Capital returned on maturity",
        description: planData.description,
        highlights: Array.isArray(planData.highlights) ? planData.highlights : [],
        popular: Boolean(planData.popular),
        accentColor: planData.accentColor || "#10b981"
      }
    });
    res.json({ success: true, message: "Plan saved successfully", plan: savedPlan });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to save plan" });
  }
});
router.delete("/admin/plans/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.investmentPlan.delete({ where: { id } });
    res.json({ success: true, message: "Plan removed" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to delete plan" });
  }
});
router.get("/admin/deposit-channels", async (req, res) => {
  try {
    const [channels, depositsByGateway, withdrawalsByGateway] = await Promise.all([
      prisma.depositChannel.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.transaction.groupBy({
        by: ["gateway"],
        where: { type: "deposit", status: "completed" },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.transaction.groupBy({
        by: ["gateway"],
        where: { type: "withdrawal", status: "completed" },
        _sum: { netAmount: true, amount: true },
        _count: { id: true }
      })
    ]);
    const depositsMap = /* @__PURE__ */ new Map();
    depositsByGateway.forEach((g) => {
      if (g.gateway) {
        depositsMap.set(g.gateway.toLowerCase(), {
          total: g._sum.amount || 0,
          count: g._count.id || 0
        });
      }
    });
    const withdrawalsMap = /* @__PURE__ */ new Map();
    withdrawalsByGateway.forEach((w) => {
      if (w.gateway) {
        withdrawalsMap.set(w.gateway.toLowerCase(), {
          total: w._sum.netAmount || w._sum.amount || 0,
          count: w._count.id || 0
        });
      }
    });
    const enriched = channels.map((c) => {
      const gKey = (c.gateway || "").toLowerCase();
      const depStats = depositsMap.get(gKey) || { total: 0, count: 0 };
      const wdStats = withdrawalsMap.get(gKey) || { total: 0, count: 0 };
      const currentBal = typeof c.currentBalance === "number" ? c.currentBalance : Math.max(0, depStats.total - wdStats.total + (c.manualAdjustment || 0));
      return {
        ...c,
        currentBalance: currentBal,
        manualAdjustment: c.manualAdjustment || 0,
        totalDeposited: depStats.total,
        completedDepositsCount: depStats.count,
        totalDepositsVolume: depStats.total,
        totalWithdrawn: wdStats.total,
        completedWithdrawalsCount: wdStats.count,
        totalWithdrawalsVolume: wdStats.total
      };
    });
    res.json({ success: true, channels: enriched });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch deposit channels" });
  }
});
router.get("/admin/deposit-channels/:channelId/transactions", async (req, res) => {
  try {
    const { channelId } = req.params;
    const { type, search, status, page: rawPage, limit: rawLimit } = req.query;
    const page = Math.max(1, parseInt(rawPage, 10) || 1);
    const limit = Math.min(250, Math.max(1, parseInt(rawLimit, 10) || 25));
    const skip = (page - 1) * limit;
    let channel = null;
    let where = {};
    if (status && status !== "all") {
      where.status = status;
    } else if (!status) {
      where.status = "completed";
    }
    if (channelId !== "all") {
      channel = await prisma.depositChannel.findFirst({
        where: {
          OR: [{ id: channelId }, { gateway: channelId }]
        }
      });
      if (!channel) {
        return res.status(404).json({ error: "Payment channel not found" });
      }
      where.OR = [
        { gateway: { equals: channel.gateway, mode: "insensitive" } },
        { notes: { contains: channel.gateway, mode: "insensitive" } },
        ...channel.accountNumber ? [{ notes: { contains: channel.accountNumber } }] : []
      ];
    }
    if (type && typeof type === "string" && type !== "all") {
      where.type = type;
    }
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      const searchConditions = [
        { referenceCode: { contains: q, mode: "insensitive" } },
        { userName: { contains: q, mode: "insensitive" } },
        { userPhone: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        { accountNumber: { contains: q, mode: "insensitive" } },
        { gateway: { contains: q, mode: "insensitive" } }
      ];
      if (where.OR && Array.isArray(where.OR)) {
        where.AND = [{ OR: searchConditions }];
      } else {
        where.OR = searchConditions;
      }
    }
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);
    res.json({
      success: true,
      channel,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    console.error("[Channel Transactions Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to fetch channel transactions" });
  }
});
router.post("/admin/deposit-channels", async (req, res) => {
  try {
    const { channels } = req.body;
    if (Array.isArray(channels)) {
      await prisma.depositChannel.deleteMany();
      for (const c of channels) {
        await prisma.depositChannel.create({
          data: {
            gateway: c.gateway,
            accountTitle: c.accountTitle,
            accountNumber: c.accountNumber,
            bankName: c.bankName || null,
            branchCode: c.branchCode || null,
            instructions: c.instructions || "Send money to this official account.",
            minDeposit: Number(c.minDeposit) || 1e3,
            maxDeposit: Number(c.maxDeposit) || 1e6,
            processingTime: c.processingTime || "Instant 24/7 verification",
            currentBalance: Number(c.currentBalance) || 0,
            manualAdjustment: Number(c.manualAdjustment) || 0,
            isActive: c.isActive !== false
          }
        });
      }
      const updatedChannels = await prisma.depositChannel.findMany({ orderBy: { createdAt: "asc" } });
      return res.json({ success: true, message: "Deposit channels updated successfully", channels: updatedChannels });
    }
    const rawChannel = req.body.channel || req.body;
    if (!rawChannel.gateway || !rawChannel.accountTitle || !rawChannel.accountNumber) {
      return res.status(400).json({ error: "Gateway type, account title, and account number are required." });
    }
    const updateData = {
      accountTitle: rawChannel.accountTitle,
      accountNumber: rawChannel.accountNumber,
      bankName: rawChannel.bankName || null,
      branchCode: rawChannel.branchCode || null,
      instructions: rawChannel.instructions || "Send money to this official account.",
      minDeposit: Number(rawChannel.minDeposit) || 1e3,
      maxDeposit: Number(rawChannel.maxDeposit) || 1e6,
      processingTime: rawChannel.processingTime || "Instant 24/7 verification",
      isActive: rawChannel.isActive !== false
    };
    if (rawChannel.currentBalance !== void 0) {
      updateData.currentBalance = Number(rawChannel.currentBalance);
    }
    if (rawChannel.manualAdjustment !== void 0) {
      updateData.manualAdjustment = Number(rawChannel.manualAdjustment);
    }
    const createData = {
      gateway: rawChannel.gateway,
      ...updateData,
      currentBalance: Number(rawChannel.currentBalance) || 0,
      manualAdjustment: Number(rawChannel.manualAdjustment) || 0
    };
    const savedChannel = await prisma.depositChannel.upsert({
      where: { gateway: rawChannel.gateway },
      create: createData,
      update: updateData
    });
    const allChannels = await prisma.depositChannel.findMany({ orderBy: { createdAt: "asc" } });
    res.json({ success: true, message: "Channel saved successfully", channel: savedChannel, channels: allChannels });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to save channel" });
  }
});
router.post("/admin/deposit-channels/adjust", async (req, res) => {
  try {
    const { channelId, gateway, type, amount, reason } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Please enter a valid positive adjustment amount." });
    }
    const channel = await prisma.depositChannel.findFirst({
      where: {
        OR: [
          ...channelId ? [{ id: channelId }] : [],
          ...gateway ? [{ gateway: { equals: gateway, mode: "insensitive" } }] : []
        ]
      }
    });
    if (!channel) {
      return res.status(404).json({ error: "Payment channel not found" });
    }
    const delta = type === "decrease" ? -numAmount : numAmount;
    const newBalance = Math.max(0, (channel.currentBalance || 0) + delta);
    const newAdjustment = (channel.manualAdjustment || 0) + delta;
    const updated = await prisma.depositChannel.update({
      where: { id: channel.id },
      data: {
        currentBalance: newBalance,
        manualAdjustment: newAdjustment
      }
    });
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    await prisma.transaction.create({
      data: {
        id: txId,
        type: "admin_adjustment",
        amount: numAmount,
        fee: 0,
        netAmount: numAmount,
        status: "completed",
        gateway: channel.gateway,
        referenceCode: `ADJ-CH-${Date.now().toString().slice(-6)}`,
        timestamp: getFormattedNow(),
        notes: `Channel ${channel.gateway} balance ${type === "decrease" ? "deduction" : "addition"} of Rs. ${numAmount.toLocaleString()} (${reason || "Channel Error Correction"})`
      }
    });
    const allChannels = await prisma.depositChannel.findMany({ orderBy: { createdAt: "asc" } });
    res.json({
      success: true,
      message: `Channel ${channel.gateway} adjusted by ${delta > 0 ? "+" : ""}Rs. ${delta.toLocaleString()}. New Balance: Rs. ${newBalance.toLocaleString()}`,
      channel: updated,
      channels: allChannels
    });
  } catch (err) {
    console.error("[Channel Adjust Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to adjust channel balance" });
  }
});
router.delete("/admin/deposit-channels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.depositChannel.deleteMany({
      where: {
        OR: [{ id }, { gateway: id }]
      }
    });
    const channels = await prisma.depositChannel.findMany();
    res.json({ success: true, message: "Channel removed successfully", channels });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to delete channel" });
  }
});
router.post("/admin/users/adjust-balance", async (req, res) => {
  try {
    const { userId, type, amount, reason } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Invalid adjustment amount" });
    }
    const txId = `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: type === "debit" ? { decrement: numAmount } : { increment: numAmount }
        }
      }),
      prisma.transaction.create({
        data: {
          id: txId,
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          type: type === "debit" ? "withdrawal" : "deposit",
          amount: numAmount,
          fee: 0,
          netAmount: numAmount,
          status: "completed",
          gateway: "System_Balance",
          referenceCode: `ADJ-${Date.now().toString().slice(-6)}`,
          timestamp: getFormattedNow(),
          notes: `Admin Manual ${type === "debit" ? "Debit" : "Credit"}: ${reason || "Account Balance Correction"}`
        }
      })
    ]);
    await createUserNotification(
      user.id,
      `Wallet Balance ${type === "debit" ? "Debited" : "Credited"} \u2699\uFE0F`,
      `Account balance was adjusted by ${type === "debit" ? "-" : "+"}Rs. ${numAmount.toLocaleString()}. Reason: ${reason || "Account Balance Correction"}`,
      "system",
      numAmount
    );
    const { password: _, ...safeUser } = updatedUser;
    res.json({
      success: true,
      message: `Balance adjusted by ${type === "debit" ? "-" : "+"}Rs. ${numAmount.toLocaleString()}`,
      user: safeUser,
      transaction: tx
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to adjust balance" });
  }
});
router.post("/admin/users/reset-pin", async (req, res) => {
  try {
    const { userId, newPin } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const pinToSet = newPin || "1234";
    await prisma.user.update({
      where: { id: user.id },
      data: { securityPin: pinToSet }
    });
    res.json({ success: true, message: `Security PIN reset to ${pinToSet}` });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to reset PIN" });
  }
});
router.post("/admin/active-investments/cancel", async (req, res) => {
  try {
    const { investmentId, reason, refundPrincipal } = req.body;
    const inv = await prisma.activeInvestment.findUnique({ where: { id: investmentId } });
    if (!inv) return res.status(404).json({ error: "Investment record not found" });
    const operations = [
      prisma.activeInvestment.update({
        where: { id: inv.id },
        data: { status: "completed" }
      })
    ];
    if (refundPrincipal) {
      operations.push(
        prisma.user.update({
          where: { id: inv.userId },
          data: {
            investedCapital: { decrement: inv.investedAmount },
            balance: { increment: inv.investedAmount }
          }
        }),
        prisma.transaction.create({
          data: {
            id: `TXN-${Math.floor(1e4 + Math.random() * 9e4)}`,
            userId: inv.userId,
            type: "admin_adjustment",
            amount: inv.investedAmount,
            fee: 0,
            netAmount: inv.investedAmount,
            status: "completed",
            gateway: "System_Balance",
            referenceCode: `INV-REFUND-${Date.now().toString().slice(-6)}`,
            timestamp: getFormattedNow(),
            notes: `Admin Investment Refund: ${inv.planName} (${reason || "Terminated early by administrator"})`
          }
        })
      );
    } else {
      operations.push(
        prisma.user.update({
          where: { id: inv.userId },
          data: {
            investedCapital: { decrement: inv.investedAmount }
          }
        })
      );
    }
    await prisma.$transaction(operations);
    await createUserNotification(
      inv.userId,
      "Investment Package Concluded \u{1F4E6}",
      `Your investment in ${inv.planName} (Rs. ${inv.investedAmount.toLocaleString()}) was concluded. ${refundPrincipal ? "Principal was refunded to your wallet." : ""}`,
      "system",
      inv.investedAmount
    );
    res.json({ success: true, message: "Investment package cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to cancel investment" });
  }
});
router.get("/admin/rewards/tiers", async (req, res) => {
  try {
    await ensureInitialDatabaseData();
    const tiers = await prisma.dailyRewardTier.findMany({ orderBy: { day: "asc" } });
    res.json({ success: true, tiers });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch reward tiers" });
  }
});
router.post("/admin/rewards/tiers", async (req, res) => {
  try {
    await ensureInitialDatabaseData();
    const { tiers } = req.body;
    if (Array.isArray(tiers)) {
      for (const t of tiers) {
        const day = Number(t.day);
        const reward = Number(t.reward);
        if (day >= 1 && day <= 7 && !isNaN(reward) && reward >= 0) {
          await prisma.dailyRewardTier.upsert({
            where: { day },
            create: {
              day,
              reward,
              title: t.title || `Day ${day} Reward`,
              badge: t.badge || `Day ${day}`,
              description: t.description || `Daily check-in reward for day ${day}`,
              isActive: t.isActive !== false
            },
            update: {
              reward,
              title: t.title !== void 0 ? t.title : void 0,
              badge: t.badge !== void 0 ? t.badge : void 0,
              description: t.description !== void 0 ? t.description : void 0,
              isActive: t.isActive !== void 0 ? t.isActive : true
            }
          });
        }
      }
    } else if (req.body.day && req.body.reward !== void 0) {
      const day = Number(req.body.day);
      const reward = Number(req.body.reward);
      await prisma.dailyRewardTier.upsert({
        where: { day },
        create: {
          day,
          reward,
          title: req.body.title || `Day ${day} Reward`,
          badge: req.body.badge || `Day ${day}`,
          description: req.body.description || `Daily check-in reward for day ${day}`,
          isActive: req.body.isActive !== false
        },
        update: {
          reward,
          title: req.body.title,
          badge: req.body.badge,
          description: req.body.description,
          isActive: req.body.isActive
        }
      });
    }
    const updated = await prisma.dailyRewardTier.findMany({ orderBy: { day: "asc" } });
    res.json({ success: true, message: "Daily reward tiers updated successfully", tiers: updated });
  } catch (err) {
    console.error("[Update Tiers Error]:", err);
    res.status(500).json({ error: err?.message || "Failed to update reward tiers" });
  }
});
router.get("/admin/rewards/breakdown", async (req, res) => {
  try {
    const [
      streakTiers,
      streakTx,
      referralTx,
      dailyProfitsTx,
      adminBonusTx,
      recentTxs
    ] = await Promise.all([
      prisma.dailyRewardTier.findMany({ orderBy: { day: "asc" } }),
      prisma.transaction.findMany({ where: { type: "streak_reward", status: "completed" } }),
      prisma.transaction.findMany({ where: { type: "referral_bonus", status: "completed" } }),
      prisma.transaction.findMany({ where: { type: "daily_profit", status: "completed" } }),
      prisma.transaction.findMany({ where: { type: "admin_adjustment", status: "completed" } }),
      prisma.transaction.findMany({
        where: {
          type: { in: ["streak_reward", "referral_bonus", "daily_profit", "admin_adjustment"] },
          status: "completed"
        },
        orderBy: { createdAt: "desc" },
        take: 50
      })
    ]);
    const streakRewardsTotal = streakTx.reduce((s, t) => s + t.amount, 0);
    const referralBonusesTotal = referralTx.reduce((s, t) => s + t.amount, 0);
    const dailyYieldDividendsTotal = dailyProfitsTx.reduce((s, t) => s + t.amount, 0);
    const adminBonusesTotal = adminBonusTx.reduce((s, t) => s + t.amount, 0);
    const totalRewardsGiven = streakRewardsTotal + referralBonusesTotal + dailyYieldDividendsTotal + adminBonusesTotal;
    res.json({
      success: true,
      data: {
        totalRewardsGiven,
        streakRewardsCount: streakTx.length,
        streakRewardsTotal,
        referralBonusesCount: referralTx.length,
        referralBonusesTotal,
        dailyYieldDividendsTotal,
        adminBonusesTotal,
        dailyTiers: streakTiers,
        recentRewardsTransactions: recentTxs
      }
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || "Failed to fetch rewards breakdown" });
  }
});
app.use("/api", router);
app.use(router);
app.all("/api/*", (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.method} ${req.path} not found.` });
});
app.use((err, req, res, next) => {
  console.error("[Server Uncaught Error]:", err);
  if (req.path.startsWith("/api/")) {
    return res.status(err.status || 500).json({
      success: false,
      error: err?.message || "Internal server error occurred. Please try again."
    });
  }
  next(err);
});
var api_default = app;

// server.ts
async function startServer() {
  const PORT = 3e3;
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    api_default.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    api_default.use(import_express2.default.static(distPath));
    api_default.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  api_default.listen(PORT, "0.0.0.0", () => {
    console.log(`PakInvest server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Fatal server startup error:", err);
  });
}
var server_default = api_default;
//# sourceMappingURL=server.cjs.map
