export type WalletProvider = 'bKash' | 'Nagad';

export type WalletStatus = 'active' | 'pending_otp' | 'disconnected';

export interface Wallet {
  id: string;
  name: string;
  ownerName: string;
  provider: WalletProvider;
  mobileNumber: string;
  maskedPin: string;
  balance: number;
  status: WalletStatus;
  lastSynced: string;
  monthlyLimit: number;
  dailyLimit: number;
  color: string;
  pendingOtpCode?: string;
  pendingOtpExpires?: number;
}

export type TransactionType = 'send_money' | 'cash_out' | 'cash_in' | 'payment' | 'mobile_recharge' | 'add_money';

export type TransactionCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Salary'
  | 'Education'
  | 'Medical'
  | 'Family Transfer'
  | 'Shopping'
  | 'Business'
  | 'Other';

export interface Transaction {
  id: string;
  walletId: string;
  walletName: string;
  provider: WalletProvider;
  type: TransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  counterpartyNumber: string;
  counterpartyName?: string;
  category: TransactionCategory;
  trxId: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  reference?: string;
  executedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userRole: 'admin' | 'family_member' | 'viewer';
  walletId?: string;
  walletName?: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

export interface SmsLog {
  id: string;
  timestamp: string;
  sender: string;
  message: string;
  extractedOtp?: string;
  extractedAmount?: number;
  extractedTrxId?: string;
  status: 'processed' | 'otp_matched' | 'trx_synced' | 'ignored' | 'error';
}

export type UserRole = 'admin' | 'family_member' | 'viewer';

export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface PfmOverviewReport {
  totalBalance: number;
  bKashBalance: number;
  nagadBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  activeWalletCount: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
}
