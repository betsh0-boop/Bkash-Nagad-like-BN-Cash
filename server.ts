import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  Wallet,
  Transaction,
  AuditLog,
  SmsLog,
  UserRole,
  PfmOverviewReport,
  WalletProvider,
  TransactionCategory
} from './src/types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Initial 6 Connected Family Wallets (bKash & Nagad)
let walletsStore: Wallet[] = [
  {
    id: 'w-bkash-1',
    name: 'আব্বুর বিকাশ মেইন (Father Primary)',
    ownerName: 'Md. Harun-or-Rashid',
    provider: 'bKash',
    mobileNumber: '01711987654',
    maskedPin: '••••4',
    balance: 24500.00,
    status: 'active',
    lastSynced: '2026-11-10T12:45:00Z',
    monthlyLimit: 100000.00,
    dailyLimit: 25000.00,
    color: '#e2136e',
  },
  {
    id: 'w-nagad-2',
    name: 'আম্মুর নগদ পার্সোনাল (Mother Nagad)',
    ownerName: 'Sultana Begum',
    provider: 'Nagad',
    mobileNumber: '01819234567',
    maskedPin: '••••8',
    balance: 18250.50,
    status: 'active',
    lastSynced: '2026-11-10T11:30:00Z',
    monthlyLimit: 80000.00,
    dailyLimit: 20000.00,
    color: '#f37023',
  },
  {
    id: 'w-bkash-3',
    name: 'ভাইয়ার স্যালারি বিকাশ (Brother Salary)',
    ownerName: 'Tanvir Ahmed',
    provider: 'bKash',
    mobileNumber: '01912345678',
    maskedPin: '••••2',
    balance: 42100.00,
    status: 'active',
    lastSynced: '2026-11-10T12:00:00Z',
    monthlyLimit: 150000.00,
    dailyLimit: 50000.00,
    color: '#e2136e',
  },
  {
    id: 'w-nagad-4',
    name: 'বোনের পড়াশোনা নগদ (Sister Education)',
    ownerName: 'Nusrat Jahan',
    provider: 'Nagad',
    mobileNumber: '01511223344',
    maskedPin: '••••6',
    balance: 6400.00,
    status: 'active',
    lastSynced: '2026-11-09T18:15:00Z',
    monthlyLimit: 30000.00,
    dailyLimit: 10000.00,
    color: '#f37023',
  },
  {
    id: 'w-bkash-5',
    name: 'আমার জরুরী বিকাশ (My Emergency)',
    ownerName: 'Rahman Porosh',
    provider: 'bKash',
    mobileNumber: '01799887766',
    maskedPin: '••••1',
    balance: 15800.00,
    status: 'active',
    lastSynced: '2026-11-10T12:50:00Z',
    monthlyLimit: 100000.00,
    dailyLimit: 25000.00,
    color: '#e2136e',
  },
  {
    id: 'w-nagad-6',
    name: 'বাড়ির খরচ নগদ (Home Expenses)',
    ownerName: 'Harun-or-Rashid / Family',
    provider: 'Nagad',
    mobileNumber: '01611335577',
    maskedPin: '••••9',
    balance: 9150.00,
    status: 'active',
    lastSynced: '2026-11-10T09:20:00Z',
    monthlyLimit: 50000.00,
    dailyLimit: 15000.00,
    color: '#f37023',
  }
];

// Transaction History Database Store
let transactionsStore: Transaction[] = [
  {
    id: 'trx-101',
    walletId: 'w-bkash-1',
    walletName: 'আব্বুর বিকাশ মেইন (Father Primary)',
    provider: 'bKash',
    type: 'cash_in',
    amount: 15000.00,
    fee: 0.00,
    netAmount: 15000.00,
    counterpartyNumber: '01711000111',
    counterpartyName: 'Monthly Pension Deposit',
    category: 'Salary',
    trxId: 'BK9A82X10',
    timestamp: '2026-11-10T10:30:00Z',
    status: 'completed',
    reference: 'Pension Nov 2026',
    executedBy: 'Md. Harun-or-Rashid',
  },
  {
    id: 'trx-102',
    walletId: 'w-bkash-1',
    walletName: 'আব্বুর বিকাশ মেইন (Father Primary)',
    provider: 'bKash',
    type: 'send_money',
    amount: 3500.00,
    fee: 5.00,
    netAmount: 3505.00,
    counterpartyNumber: '01819234567',
    counterpartyName: 'Sultana Begum (Amma)',
    category: 'Family Transfer',
    trxId: 'BK9A85M22',
    timestamp: '2026-11-10T11:15:00Z',
    status: 'completed',
    reference: 'Household groceries',
    executedBy: 'Admin (Remote Command)',
  },
  {
    id: 'trx-103',
    walletId: 'w-nagad-2',
    walletName: 'আম্মুর নগদ পার্সোনাল (Mother Nagad)',
    provider: 'Nagad',
    type: 'payment',
    amount: 2150.00,
    fee: 0.00,
    netAmount: 2150.00,
    counterpartyNumber: '01999887700',
    counterpartyName: 'Swapno Supershop Dhanmondi',
    category: 'Groceries',
    trxId: 'NG771920B',
    timestamp: '2026-11-10T11:40:00Z',
    status: 'completed',
    reference: 'Kitchen items',
    executedBy: 'Sultana Begum',
  },
  {
    id: 'trx-104',
    walletId: 'w-bkash-3',
    walletName: 'ভাইয়ার স্যালারি বিকাশ (Brother Salary)',
    provider: 'bKash',
    type: 'cash_in',
    amount: 35000.00,
    fee: 0.00,
    netAmount: 35000.00,
    counterpartyNumber: '01700112233',
    counterpartyName: 'Brain Station 23 Ltd',
    category: 'Salary',
    trxId: 'BK881729A',
    timestamp: '2026-11-09T16:00:00Z',
    status: 'completed',
    reference: 'Salary Nov',
    executedBy: 'Tanvir Ahmed',
  },
  {
    id: 'trx-105',
    walletId: 'w-nagad-4',
    walletName: 'বোনের পড়াশোনা নগদ (Sister Education)',
    provider: 'Nagad',
    type: 'payment',
    amount: 1800.00,
    fee: 0.00,
    netAmount: 1800.00,
    counterpartyNumber: '01555667788',
    counterpartyName: 'Dhaka University Admission Fee',
    category: 'Education',
    trxId: 'NG991823C',
    timestamp: '2026-11-09T14:20:00Z',
    status: 'completed',
    reference: 'Exam Fee',
    executedBy: 'Nusrat Jahan',
  },
  {
    id: 'trx-106',
    walletId: 'w-bkash-5',
    walletName: 'আমার জরুরী বিকাশ (My Emergency)',
    provider: 'bKash',
    type: 'cash_out',
    amount: 2000.00,
    fee: 37.00,
    netAmount: 2037.00,
    counterpartyNumber: '01712999000',
    counterpartyName: 'Master bKash Agent Dhanmondi',
    category: 'Medical',
    trxId: 'BK994812K',
    timestamp: '2026-11-10T08:10:00Z',
    status: 'completed',
    reference: 'Labaid Pharmacy',
    executedBy: 'Admin (Remote Command)',
  }
];

// Audit Log Store
let auditLogsStore: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-11-10T12:50:00Z',
    action: 'SYSTEM_BOOTUP',
    userRole: 'admin',
    details: 'FinWall Multi-Wallet Platform initialized with 6 active family wallets.',
    ipAddress: '127.0.0.1',
    status: 'success',
  },
  {
    id: 'audit-2',
    timestamp: '2026-11-10T12:30:00Z',
    action: 'SMS_AUTO_FORWARDER_SYNC',
    userRole: 'admin',
    details: 'Android Companion Companion-V2 parsed bKash TrxID BK9A85M22 automatically.',
    ipAddress: '192.168.1.45',
    status: 'success',
  },
  {
    id: 'audit-3',
    timestamp: '2026-11-10T11:15:00Z',
    action: 'REMOTE_SEND_MONEY_EXECUTED',
    userRole: 'admin',
    walletId: 'w-bkash-1',
    walletName: 'আব্বুর বিকাশ মেইন (Father Primary)',
    details: 'Admin authorized Send Money ৳3,500 to 01819234567 with PIN verification.',
    ipAddress: '103.220.21.14',
    status: 'success',
  }
];

// SMS Listener Log Store
let smsLogsStore: SmsLog[] = [
  {
    id: 'sms-1',
    timestamp: '2026-11-10T12:30:00Z',
    sender: 'bKash',
    message: 'You have received Tk 3,500.00 from 01711987654. Balance Tk 18,250.50. TrxID BK9A85M22.',
    extractedAmount: 3500.00,
    extractedTrxId: 'BK9A85M22',
    status: 'trx_synced',
  },
  {
    id: 'sms-2',
    timestamp: '2026-11-10T10:15:00Z',
    sender: 'Nagad',
    message: 'Your Nagad OTP is 849201. Valid for 5 minutes. Do not share your OTP or PIN with anyone.',
    extractedOtp: '849201',
    status: 'otp_matched',
  }
];

// API ROUTES

// 1. GET /api/wallets - List all connected wallets
app.get('/api/wallets', (req: Request, res: Response) => {
  res.json({ success: true, wallets: walletsStore });
});

// 2. POST /api/wallets/connect-step1 - Initiate wallet connection with Mobile Number + PIN
app.post('/api/wallets/connect-step1', (req: Request, res: Response) => {
  const { name, ownerName, provider, mobileNumber, pin } = req.body;

  if (!name || !ownerName || !provider || !mobileNumber || !pin) {
    return res.status(400).json({ success: false, error: 'সবগুলো ঘর সঠিকভাবে পূরণ করুন (Name, Owner, Provider, Mobile Number & PIN required)' });
  }

  if (pin.length < 4 || pin.length > 5) {
    return res.status(400).json({ success: false, error: `${provider} পিন সাধারণত ৪ বা ৫ ডিজিটের হতে হবে (Valid 4 or 5-digit PIN required)` });
  }

  // Generate 6-digit OTP code simulation
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  const maskedPin = `••••${pin.slice(-1)}`;
  const color = provider === 'bKash' ? '#e2136e' : '#f37023';

  const newWallet: Wallet = {
    id: `w-${provider.toLowerCase()}-${Date.now()}`,
    name,
    ownerName,
    provider: provider as WalletProvider,
    mobileNumber,
    maskedPin,
    balance: Math.floor(5000 + Math.random() * 25000), // initial balance discovery
    status: 'pending_otp',
    lastSynced: new Date().toISOString(),
    monthlyLimit: provider === 'bKash' ? 100000 : 80000,
    dailyLimit: 25000,
    color,
    pendingOtpCode: otpCode,
    pendingOtpExpires: expiresAt,
  };

  walletsStore.unshift(newWallet);

  // Add Audit Log
  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'WALLET_OTP_DISPATCHED',
    userRole: 'admin',
    walletId: newWallet.id,
    walletName: newWallet.name,
    details: `${provider} OTP code ${otpCode} dispatched to ${mobileNumber} for ${ownerName}`,
    ipAddress: '127.0.0.1',
    status: 'success',
  });

  // Add SMS log simulation
  smsLogsStore.unshift({
    id: `sms-${Date.now()}`,
    timestamp: new Date().toISOString(),
    sender: provider,
    message: provider === 'bKash'
      ? `Your bKash verification code is ${otpCode}. Never share your PIN or OTP with anyone.`
      : `Your Nagad OTP is ${otpCode}. Valid for 5 mins. Do not share.`,
    extractedOtp: otpCode,
    status: 'processed',
  });

  res.json({
    success: true,
    wallet: newWallet,
    otpSentTo: mobileNumber,
    simulatedOtpMessage: provider === 'bKash'
      ? `Your bKash verification code is ${otpCode}. Never share your PIN or OTP with anyone.`
      : `Your Nagad OTP is ${otpCode}. Valid for 5 mins. Do not share.`,
    message: `${provider} থেকে ${mobileNumber} নাম্বারে ওটিপি পাঠানো হয়েছে। অনুগ্রহ করে মেসেজ বা ওটিপি প্রদান করুন।`
  });
});

// 3. POST /api/wallets/connect-step2 - Verify OTP manually or via full SMS text paste
app.post('/api/wallets/connect-step2', (req: Request, res: Response) => {
  const { walletId, otpCode, rawSmsText } = req.body;

  const wallet = walletsStore.find(w => w.id === walletId);
  if (!wallet) {
    return res.status(404).json({ success: false, error: 'ওয়ালেট পাওয়া যায়নি (Wallet not found)' });
  }

  let codeToVerify = otpCode ? otpCode.trim() : '';

  // If raw SMS text is pasted, extract 6-digit OTP regex!
  if (rawSmsText && !codeToVerify) {
    const match = rawSmsText.match(/\b\d{6}\b/);
    if (match) {
      codeToVerify = match[0];
    }
  }

  if (!codeToVerify) {
    return res.status(400).json({ success: false, error: 'অনুগ্রহ করে ৬ ডিজিটের ওটিপি অথবা সম্পূর্ণ মেসেজ পেস্ট করুন।' });
  }

  if (wallet.pendingOtpCode && wallet.pendingOtpCode !== codeToVerify) {
    return res.status(400).json({ success: false, error: 'ভুল ওটিপি (Invalid OTP code. Please check SMS).' });
  }

  wallet.status = 'active';
  delete wallet.pendingOtpCode;
  delete wallet.pendingOtpExpires;
  wallet.lastSynced = new Date().toISOString();

  // Audit Log
  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'WALLET_CONNECTED_SUCCESS',
    userRole: 'admin',
    walletId: wallet.id,
    walletName: wallet.name,
    details: `${wallet.provider} Wallet (${wallet.mobileNumber}) successfully connected & verified via OTP ${codeToVerify}.`,
    ipAddress: '127.0.0.1',
    status: 'success',
  });

  res.json({
    success: true,
    wallet,
    message: `অভিনন্দন! ${wallet.name} সফলতা এবং নিরাপত্তার সাথে যুক্ত করা হয়েছে।`
  });
});

// 4. DELETE /api/wallets/:id - Disconnect wallet
app.delete('/api/wallets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = walletsStore.findIndex(w => w.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Wallet not found' });
  }

  const removed = walletsStore.splice(index, 1)[0];

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'WALLET_DISCONNECTED',
    userRole: 'admin',
    walletId: removed.id,
    walletName: removed.name,
    details: `Wallet ${removed.name} (${removed.mobileNumber}) disconnected by admin.`,
    ipAddress: '127.0.0.1',
    status: 'warning',
  });

  res.json({ success: true, message: `${removed.name} সংযোগ বিচ্ছিন্ন করা হয়েছে।` });
});

// 5. GET /api/transactions - Get transaction history with filters
app.get('/api/transactions', (req: Request, res: Response) => {
  const { walletId, type, category, search } = req.query;
  let filtered = [...transactionsStore];

  if (walletId && walletId !== 'all') {
    filtered = filtered.filter(t => t.walletId === walletId);
  }

  if (type && type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(t =>
      t.trxId.toLowerCase().includes(q) ||
      t.counterpartyNumber.includes(q) ||
      (t.counterpartyName && t.counterpartyName.toLowerCase().includes(q)) ||
      (t.reference && t.reference.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, transactions: filtered });
});

// 6. POST /api/transactions/send-money - Execute Send Money Remote Command
app.post('/api/transactions/send-money', (req: Request, res: Response) => {
  const { walletId, receiverNumber, amount, pin, reference, category } = req.body;

  if (!walletId || !receiverNumber || !amount || !pin) {
    return res.status(400).json({ success: false, error: 'সব প্রয়োজনীয় ফিল্ড (Wallet, Receiver Number, Amount & PIN) পূরণ করুন।' });
  }

  const wallet = walletsStore.find(w => w.id === walletId);
  if (!wallet) {
    return res.status(404).json({ success: false, error: 'উৎস ওয়ালেট পাওয়া যায়নি (Source wallet not found).' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 10) {
    return res.status(400).json({ success: false, error: 'সর্বনিম্ন সেন্ড মানি পরিমাণ ৳১০ টাকা।' });
  }

  const fee = wallet.provider === 'bKash' ? 5.00 : 5.00; // 5 BDT standard fee
  const totalCost = numAmount + fee;

  if (wallet.balance < totalCost) {
    return res.status(400).json({
      success: false,
      error: `পর্যাপ্ত ব্যালেন্স নেই! আপনার ওয়ালেটে আছে ৳${wallet.balance.toLocaleString()} কিন্তু প্রয়োজন ৳${totalCost.toLocaleString()}`
    });
  }

  // Deduct balance
  wallet.balance -= totalCost;
  wallet.lastSynced = new Date().toISOString();

  const trxId = `${wallet.provider === 'bKash' ? 'BK' : 'NG'}${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newTrx: Transaction = {
    id: `trx-${Date.now()}`,
    walletId: wallet.id,
    walletName: wallet.name,
    provider: wallet.provider,
    type: 'send_money',
    amount: numAmount,
    fee,
    netAmount: totalCost,
    counterpartyNumber: receiverNumber,
    counterpartyName: 'Received via Send Money',
    category: (category as TransactionCategory) || 'Family Transfer',
    trxId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    reference: reference || 'Send Money Command',
    executedBy: 'Admin (Remote Execution)',
  };

  transactionsStore.unshift(newTrx);

  // Audit Log
  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'REMOTE_SEND_MONEY_EXECUTED',
    userRole: 'admin',
    walletId: wallet.id,
    walletName: wallet.name,
    details: `Send Money ৳${numAmount.toLocaleString()} to ${receiverNumber} executed from ${wallet.name}. TrxID: ${trxId}`,
    ipAddress: '127.0.0.1',
    status: 'success',
  });

  res.json({
    success: true,
    transaction: newTrx,
    updatedBalance: wallet.balance,
    message: `সফলভাবে ৳${numAmount.toLocaleString()} টাকা ${receiverNumber} নাম্বারে সেন্ড মানি করা হয়েছে। TrxID: ${trxId}`
  });
});

// 7. POST /api/transactions/cash-out - Execute Cash Out Remote Command
app.post('/api/transactions/cash-out', (req: Request, res: Response) => {
  const { walletId, agentNumber, amount, pin, reference } = req.body;

  if (!walletId || !agentNumber || !amount || !pin) {
    return res.status(400).json({ success: false, error: 'সব ফিল্ড (Wallet, Agent Number, Amount, PIN) প্রদান করুন।' });
  }

  const wallet = walletsStore.find(w => w.id === walletId);
  if (!wallet) {
    return res.status(404).json({ success: false, error: 'ওয়ালেট পাওয়া যায়নি।' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 50) {
    return res.status(400).json({ success: false, error: 'সর্বনিম্ন ক্যাশ আউট ৳৫০ টাকা।' });
  }

  // Cash out fee: bKash App = 1.85% (18.50 BDT / 1000 BDT), Nagad = 1.49% (14.90 BDT / 1000 BDT)
  const feeRate = wallet.provider === 'bKash' ? 0.0185 : 0.0149;
  const fee = Math.round(numAmount * feeRate * 100) / 100;
  const totalDeducted = numAmount + fee;

  if (wallet.balance < totalDeducted) {
    return res.status(400).json({
      success: false,
      error: `পর্যাপ্ত ব্যালেন্স নেই! ক্যাশ আউট ফি (৳${fee}) সহ প্রয়োজন ৳${totalDeducted.toLocaleString()}`
    });
  }

  wallet.balance -= totalDeducted;
  wallet.lastSynced = new Date().toISOString();

  const trxId = `${wallet.provider === 'bKash' ? 'BK' : 'NG'}${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newTrx: Transaction = {
    id: `trx-${Date.now()}`,
    walletId: wallet.id,
    walletName: wallet.name,
    provider: wallet.provider,
    type: 'cash_out',
    amount: numAmount,
    fee,
    netAmount: totalDeducted,
    counterpartyNumber: agentNumber,
    counterpartyName: 'Agent Cash Out Spot',
    category: 'Other',
    trxId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    reference: reference || 'Agent Cash Out',
    executedBy: 'Admin (Remote Execution)',
  };

  transactionsStore.unshift(newTrx);

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'REMOTE_CASH_OUT_EXECUTED',
    userRole: 'admin',
    walletId: wallet.id,
    walletName: wallet.name,
    details: `Cash Out ৳${numAmount.toLocaleString()} to Agent ${agentNumber} executed. Fee: ৳${fee}. TrxID: ${trxId}`,
    ipAddress: '127.0.0.1',
    status: 'success',
  });

  res.json({
    success: true,
    transaction: newTrx,
    updatedBalance: wallet.balance,
    message: `সফলভাবে Agent (${agentNumber}) নাম্বারে ৳${numAmount.toLocaleString()} ক্যাশ আউট সম্পন্ন হয়েছে। TrxID: ${trxId}`
  });
});

// 8. POST /api/transactions/add-money - Top Up / Cash In simulation for testing
app.post('/api/transactions/add-money', (req: Request, res: Response) => {
  const { walletId, amount, category, reference } = req.body;
  const wallet = walletsStore.find(w => w.id === walletId);
  if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });

  wallet.balance += numAmount;
  wallet.lastSynced = new Date().toISOString();

  const trxId = `${wallet.provider === 'bKash' ? 'BK' : 'NG'}${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newTrx: Transaction = {
    id: `trx-${Date.now()}`,
    walletId: wallet.id,
    walletName: wallet.name,
    provider: wallet.provider,
    type: 'cash_in',
    amount: numAmount,
    fee: 0,
    netAmount: numAmount,
    counterpartyNumber: '01700000000',
    counterpartyName: 'Bank / Add Money',
    category: (category as TransactionCategory) || 'Salary',
    trxId,
    timestamp: new Date().toISOString(),
    status: 'completed',
    reference: reference || 'Deposit / Add Money',
    executedBy: wallet.ownerName,
  };

  transactionsStore.unshift(newTrx);

  res.json({ success: true, wallet, transaction: newTrx });
});

// 9. POST /api/sms-forwarder - Android Companion Listener Endpoint
app.post('/api/sms-forwarder', (req: Request, res: Response) => {
  const { sender, message, apiKey } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message content required' });
  }

  const senderNormalized = sender && String(sender).toLowerCase().includes('nagad') ? 'Nagad' : 'bKash';
  const timestamp = new Date().toISOString();

  // Check 1: Is this an OTP message?
  const otpMatch = message.match(/\b\d{6}\b/);
  let otpVerified = false;
  let matchedWalletName = '';

  if (otpMatch) {
    const extractedOtp = otpMatch[0];
    // Find pending OTP wallet
    const pendingWallet = walletsStore.find(w => w.status === 'pending_otp' && w.provider === senderNormalized);
    if (pendingWallet) {
      pendingWallet.status = 'active';
      delete pendingWallet.pendingOtpCode;
      delete pendingWallet.pendingOtpExpires;
      pendingWallet.lastSynced = timestamp;
      otpVerified = true;
      matchedWalletName = pendingWallet.name;

      auditLogsStore.unshift({
        id: `audit-${Date.now()}`,
        timestamp,
        action: 'ANDROID_COMPANION_AUTO_OTP',
        userRole: 'admin',
        walletId: pendingWallet.id,
        walletName: pendingWallet.name,
        details: `Android companion auto-forwarded OTP ${extractedOtp} and verified wallet ${pendingWallet.name}!`,
        ipAddress: '192.168.1.100 (Android)',
        status: 'success',
      });
    }
  }

  // Check 2: Is this a Transaction SMS?
  // Parse amount e.g. "Tk 2,500.00" or "Tk 2500"
  const amountMatch = message.match(/(?:Tk|BDT|Tk\.)\s*([\d,]+(?:\.\d{2})?)/i);
  const trxMatch = message.match(/TrxID\s*[:\s]?\s*([A-Z0-9]+)/i);

  let extractedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;
  let extractedTrxId = trxMatch ? trxMatch[1] : undefined;

  let trxRecorded = false;
  if (extractedAmount && extractedTrxId) {
    // Determine target wallet by looking at connected wallets of this provider
    const targetWallet = walletsStore.find(w => w.provider === senderNormalized && w.status === 'active') || walletsStore[0];
    if (targetWallet) {
      const isCredit = /received|cash in|credit/i.test(message);
      const isDebit = /send money|cash out|payment|debited/i.test(message);

      if (isCredit) {
        targetWallet.balance += extractedAmount;
      } else if (isDebit && targetWallet.balance >= extractedAmount) {
        targetWallet.balance -= extractedAmount;
      }
      targetWallet.lastSynced = timestamp;

      const newTrx: Transaction = {
        id: `trx-sms-${Date.now()}`,
        walletId: targetWallet.id,
        walletName: targetWallet.name,
        provider: targetWallet.provider,
        type: isCredit ? 'cash_in' : 'payment',
        amount: extractedAmount,
        fee: 0,
        netAmount: extractedAmount,
        counterpartyNumber: 'SMS Intercept',
        counterpartyName: 'Auto Synced via Android Listener',
        category: isCredit ? 'Salary' : 'Other',
        trxId: extractedTrxId,
        timestamp,
        status: 'completed',
        reference: 'Android SMS Forwarder',
        executedBy: 'Android Companion App',
      };

      transactionsStore.unshift(newTrx);
      trxRecorded = true;

      auditLogsStore.unshift({
        id: `audit-${Date.now()}`,
        timestamp,
        action: 'ANDROID_COMPANION_SMS_TRX_PARSED',
        userRole: 'admin',
        walletId: targetWallet.id,
        walletName: targetWallet.name,
        details: `Auto-parsed transaction TrxID ${extractedTrxId} for ৳${extractedAmount} on ${targetWallet.name}`,
        ipAddress: '192.168.1.100 (Android)',
        status: 'success',
      });
    }
  }

  const smsLogItem: SmsLog = {
    id: `sms-${Date.now()}`,
    timestamp,
    sender: senderNormalized,
    message,
    extractedOtp: otpMatch ? otpMatch[0] : undefined,
    extractedAmount,
    extractedTrxId,
    status: otpVerified ? 'otp_matched' : trxRecorded ? 'trx_synced' : 'processed',
  };

  smsLogsStore.unshift(smsLogItem);

  res.json({
    success: true,
    received: true,
    otpVerified,
    trxRecorded,
    matchedWalletName,
    parsedData: {
      otp: otpMatch ? otpMatch[0] : null,
      amount: extractedAmount || null,
      trxId: extractedTrxId || null,
    },
    message: otpVerified
      ? `OTP auto-matched! Wallet ${matchedWalletName} is now connected!`
      : trxRecorded
      ? `Transaction TrxID ${extractedTrxId} auto-synced!`
      : 'SMS received and logged into Android Forwarder queue.'
  });
});

// 10. GET /api/reports - Financial overview and report stats
app.get('/api/reports', (req: Request, res: Response) => {
  const activeWallets = walletsStore.filter(w => w.status === 'active');
  const totalBalance = activeWallets.reduce((acc, w) => acc + w.balance, 0);
  const bKashBalance = activeWallets.filter(w => w.provider === 'bKash').reduce((acc, w) => acc + w.balance, 0);
  const nagadBalance = activeWallets.filter(w => w.provider === 'Nagad').reduce((acc, w) => acc + w.balance, 0);

  // Income vs Expense this month
  const totalIncomeThisMonth = transactionsStore
    .filter(t => t.type === 'cash_in' || t.type === 'add_money')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenseThisMonth = transactionsStore
    .filter(t => t.type !== 'cash_in' && t.type !== 'add_money')
    .reduce((acc, t) => acc + t.netAmount, 0);

  // Category breakdown
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  transactionsStore.forEach(t => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = { amount: 0, count: 0 };
    }
    categoryTotals[t.category].amount += t.amount;
    categoryTotals[t.category].count += 1;
  });

  const categoryColors: Record<string, string> = {
    Groceries: '#10b981',
    Utilities: '#3b82f6',
    Salary: '#8b5cf6',
    Education: '#ec4899',
    Medical: '#ef4444',
    'Family Transfer': '#f59e0b',
    Shopping: '#06b6d4',
    Business: '#6366f1',
    Other: '#64748b',
  };

  const totalAllCat = Object.values(categoryTotals).reduce((a, b) => a + b.amount, 0) || 1;

  const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({
    category: cat as TransactionCategory,
    amount: categoryTotals[cat].amount,
    count: categoryTotals[cat].count,
    percentage: Math.round((categoryTotals[cat].amount / totalAllCat) * 100),
    color: categoryColors[cat] || '#64748b',
  }));

  const monthlyTrends = [
    { month: 'Jun', income: 45000, expense: 32000 },
    { month: 'Jul', income: 52000, expense: 38500 },
    { month: 'Aug', income: 48000, expense: 34000 },
    { month: 'Sep', income: 61000, expense: 41200 },
    { month: 'Oct', income: 58000, expense: 39000 },
    { month: 'Nov', income: totalIncomeThisMonth, expense: totalExpenseThisMonth },
  ];

  const report: PfmOverviewReport = {
    totalBalance,
    bKashBalance,
    nagadBalance,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    activeWalletCount: activeWallets.length,
    categoryBreakdown,
    monthlyTrends,
  };

  res.json({ success: true, report });
});

// 11. GET /api/audit-logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ success: true, auditLogs: auditLogsStore });
});

// 12. GET /api/sms-logs
app.get('/api/sms-logs', (req: Request, res: Response) => {
  res.json({ success: true, smsLogs: smsLogsStore });
});

// 13. Gemini Smart Financial Advisory & Insights Endpoint
app.post('/api/ai/spending-insights', async (req: Request, res: Response) => {
  try {
    const activeWallets = walletsStore.filter(w => w.status === 'active');
    const walletSummary = activeWallets.map(w => `${w.name} (${w.provider} - ${w.ownerName}): ৳${w.balance.toLocaleString()}`).join('\n');
    const recentTrxs = transactionsStore.slice(0, 10).map(t => `${t.timestamp.slice(0, 10)} | ${t.walletName} | ${t.type} | ৳${t.amount} | Cat: ${t.category}`).join('\n');

    const prompt = `You are an expert Bangladeshi Family Personal Finance & Multi-Wallet Advisor for FinWall.
    Analyze this family's multi-wallet bKash and Nagad balances and recent transactions.

    Wallets:
    ${walletSummary}

    Recent Activity:
    ${recentTrxs}

    Provide smart, actionable, practical financial advice for a Bangladeshi household in concise bullet points (both in Bengali and English).
    Format as JSON:
    {
      "summaryBn": "সংক্ষিপ্ত বাংলা আর্থিক পর্যালোচনা (২ বাক্য)",
      "summaryEn": "Short English financial summary (2 sentences)",
      "recommendations": [
        "বাংলা ও ইংরেজি পরামর্শ ১",
        "বাংলা ও ইংরেজি পরামর্শ ২",
        "বাংলা ও ইংরেজি পরামর্শ ৩"
      ],
      "healthScore": 85
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryBn: { type: Type.STRING },
            summaryEn: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            healthScore: { type: Type.INTEGER }
          },
          required: ['summaryBn', 'summaryEn', 'recommendations', 'healthScore']
        }
      }
    });

    const insights = JSON.parse(response.text || '{}');
    res.json({ success: true, insights });
  } catch (error: any) {
    console.error('Gemini Spending Insights Error:', error);
    res.json({
      success: true,
      insights: {
        summaryBn: 'আপনার পরিবারের মোট ব্যালেন্স ও ক্যাশফ্লো বর্তমানে অত্যন্ত স্থিতিশীল অবস্থায় রয়েছে।',
        summaryEn: 'Your family overall multi-wallet liquidity remains healthy across bKash and Nagad.',
        recommendations: [
          'বিকাশ ক্যাশ আউটের ক্ষেত্রে অ্যাপ বা ১৯.৯০ টাকার অফারযুক্ত পয়েন্ট ব্যবহার করুন ফি সাশ্রয়ের জন্য।',
          'আম্মুর নগদ একাউন্টে ইউটিলিটি বিল পেমেন্টে ক্যাশব্যাক অফার চেক করুন।',
          'আব্বুর ও ভাইয়ার বিকাশ একাউন্টের মধ্যে সেন্ড মানির জন্য ফ্রি প্রিয় নাম্বার যুক্ত করুন।'
        ],
        healthScore: 88
      }
    });
  }
});

// Start Express server & Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`FinWall Multi-Wallet Server running on http://localhost:${PORT}`);
  });
}

startServer();
