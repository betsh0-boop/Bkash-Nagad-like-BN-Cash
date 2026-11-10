import React from 'react';
import {
  X,
  User,
  Smartphone,
  Shield,
  TrendingUp,
  History,
  AlertTriangle,
  ArrowUpRight,
  Send,
  PlusCircle,
  CreditCard,
  Trash2
} from 'lucide-react';
import { Wallet, Transaction, UserRole } from '../types';

interface WalletDetailModalProps {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  userRole: UserRole;
  onDisconnectWallet: (walletId: string) => void;
  onInitiateTransfer: (wallet: Wallet, actionType: 'send_money' | 'cash_out') => void;
}

export const WalletDetailModal: React.FC<WalletDetailModalProps> = ({
  wallet,
  isOpen,
  onClose,
  transactions,
  userRole,
  onDisconnectWallet,
  onInitiateTransfer
}) => {
  if (!isOpen || !wallet) return null;

  const isBkash = wallet.provider === 'bKash';
  const walletTrxs = transactions.filter(t => t.walletId === wallet.id);

  // Calculate monthly stats
  const totalOut = walletTrxs
    .filter(t => t.type !== 'cash_in' && t.type !== 'add_money')
    .reduce((acc, t) => acc + t.netAmount, 0);

  const totalIn = walletTrxs
    .filter(t => t.type === 'cash_in' || t.type === 'add_money')
    .reduce((acc, t) => acc + t.amount, 0);

  const limitUsagePercent = Math.min(100, Math.round((totalOut / wallet.monthlyLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div
          className={`p-6 border-b border-slate-800 ${
            isBkash
              ? 'bg-gradient-to-r from-pink-950/80 via-slate-900 to-slate-900'
              : 'bg-gradient-to-r from-orange-950/80 via-slate-900 to-slate-900'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shadow-lg ${
                  isBkash ? 'bg-pink-600 shadow-pink-600/30' : 'bg-orange-600 shadow-orange-600/30'
                }`}
              >
                {isBkash ? 'bK' : 'NG'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{wallet.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {wallet.provider}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {wallet.ownerName}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-300">{wallet.mobileNumber}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Balance & Limits Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">বর্তমান ব্যালেন্স</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono-num mt-1 block">
                ৳ {wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">চলতি মাসে খরচ</span>
              <span className="text-xl font-bold text-rose-400 font-mono-num mt-1 block">
                ৳ {totalOut.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-xs text-slate-400 block font-medium">চলতি মাসে জমা</span>
              <span className="text-xl font-bold text-blue-400 font-mono-num mt-1 block">
                ৳ {totalIn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Monthly Limit Progress Bar */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">মাসিক ব্যবহারের সীমা (Monthly Limit)</span>
              <span className="text-white font-mono font-semibold">
                ৳{totalOut.toLocaleString()} / ৳{wallet.monthlyLimit.toLocaleString()} ({limitUsagePercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  limitUsagePercent > 80 ? 'bg-rose-500' : 'bg-pink-500'
                }`}
                style={{ width: `${limitUsagePercent}%` }}
              />
            </div>
          </div>

          {/* Quick Admin Actions */}
          {userRole === 'admin' && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  onInitiateTransfer(wallet, 'send_money');
                }}
                className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-pink-600/20"
              >
                <Send className="w-4 h-4" />
                <span>সেন্ড মানি করুন</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onInitiateTransfer(wallet, 'cash_out');
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>ক্যাশ আউট করুন</span>
              </button>
            </div>
          )}

          {/* Transaction History for this wallet */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-pink-400" />
              এই ওয়ালেটের সাম্প্রতিক লেনদেন ({walletTrxs.length} টি)
            </h4>

            {walletTrxs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 bg-slate-950 rounded-xl border border-slate-800">
                এই ওয়ালেটে এখনও কোন লেনদেন পাওয়া যায়নি।
              </p>
            ) : (
              <div className="space-y-2">
                {walletTrxs.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white capitalize">{t.type.replace('_', ' ')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {t.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        TrxID: <strong className="text-slate-300 font-mono">{t.trxId}</strong> · {t.counterpartyNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold font-mono-num block ${
                          t.type === 'cash_in' || t.type === 'add_money'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'cash_in' || t.type === 'add_money' ? '+' : '-'}৳ {t.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(t.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Disconnect Action */}
        {userRole === 'admin' && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="text-xs text-slate-500">আইডি: {wallet.id}</span>
            <button
              onClick={() => {
                if (confirm(`আপনি কি নিশ্চিত ${wallet.name} ডিসকানেক্ট করতে চান?`)) {
                  onDisconnectWallet(wallet.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ওয়ালেট বিচ্ছিন্ন করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
