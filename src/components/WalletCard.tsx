import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  Send,
  ArrowUpRight,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Wallet, UserRole } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  userRole: UserRole;
  onOpenDetails: (wallet: Wallet) => void;
  onInitiateTransfer: (wallet: Wallet, actionType: 'send_money' | 'cash_out') => void;
  onVerifyOtp: (wallet: Wallet) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  userRole,
  onOpenDetails,
  onInitiateTransfer,
  onVerifyOtp
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const isBkash = wallet.provider === 'bKash';

  return (
    <div
      className={`relative group bg-slate-900/90 rounded-2xl border transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 ${
        isBkash
          ? 'border-pink-500/30 hover:border-pink-500/60'
          : 'border-orange-500/30 hover:border-orange-500/60'
      }`}
    >
      {/* Provider Header Accent */}
      <div
        className={`h-2 rounded-t-2xl w-full ${
          isBkash ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'
        }`}
      />

      <div className="p-5">
        {/* Top Row: Provider & Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md ${
                isBkash
                  ? 'bg-gradient-to-br from-pink-600 to-rose-700 shadow-pink-600/30'
                  : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30'
              }`}
            >
              {isBkash ? 'bK' : 'NG'}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight leading-snug group-hover:text-pink-300 transition-colors">
                {wallet.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <User className="w-3 h-3 text-slate-400" />
                <span>{wallet.ownerName}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-slate-300">{wallet.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {wallet.status === 'active' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              কানেক্টেড
            </span>
          ) : wallet.status === 'pending_otp' ? (
            <button
              onClick={() => onVerifyOtp(wallet)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors cursor-pointer animate-pulse"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              ওটিপি প্রদান করুন
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              বিচ্ছিন্ন
            </span>
          )}
        </div>

        {/* Balance Display Area */}
        <div className="my-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">বর্তমান ব্যালেন্স (Balance)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-semibold text-slate-400">৳</span>
              {showBalance ? (
                <span className="text-2xl font-bold text-white font-mono-num tracking-tight">
                  {wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-xl font-bold text-slate-500 font-mono tracking-widest">
                  •••••••••
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={showBalance ? "Hide Balance" : "Show Balance"}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Security & Synced Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1">
          <span className="font-mono">পিন: <strong className="text-slate-300">{wallet.maskedPin}</strong></span>
          <span className="flex items-center gap-1 text-slate-400">
            <Smartphone className="w-3 h-3 text-emerald-400" />
            সর্বশেষ সিঙ্ক: {new Date(wallet.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
          {userRole === 'admin' && wallet.status === 'active' ? (
            <>
              <button
                onClick={() => onInitiateTransfer(wallet, 'send_money')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-white ${
                  isBkash
                    ? 'bg-pink-600/90 hover:bg-pink-600 active:scale-95'
                    : 'bg-orange-600/90 hover:bg-orange-600 active:scale-95'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>সেন্ড মানি</span>
              </button>

              <button
                onClick={() => onInitiateTransfer(wallet, 'cash_out')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700 active:scale-95"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                <span>ক্যাশ আউট</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onOpenDetails(wallet)}
              className="col-span-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <span>ওয়ালেট তথ্য ও লেনদেন</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* View Details Link */}
        {userRole === 'admin' && wallet.status === 'active' && (
          <button
            onClick={() => onOpenDetails(wallet)}
            className="w-full text-center mt-2.5 text-[11px] text-slate-400 hover:text-pink-300 font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <span>সম্পূর্ণ স্টেটমেন্ট ও লিমিট দেখুন</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
