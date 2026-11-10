import React, { useState } from 'react';
import {
  Wallet,
  Smartphone,
  ShieldCheck,
  FileBarChart,
  History,
  Send,
  PlusCircle,
  Bell,
  Sun,
  Moon,
  Users,
  CheckCircle2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { UserRole, SmsLog } from '../types';

interface HeaderProps {
  activeTab: 'wallets' | 'transactions' | 'reports' | 'companion' | 'audit';
  setActiveTab: (tab: 'wallets' | 'transactions' | 'reports' | 'companion' | 'audit') => void;
  totalBalance: number;
  activeWalletCount: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenConnectModal: () => void;
  onOpenTransferModal: () => void;
  smsLogs: SmsLog[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalBalance,
  activeWalletCount,
  userRole,
  setUserRole,
  onOpenConnectModal,
  onOpenTransferModal,
  smsLogs
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const unreadSmsCount = smsLogs.filter(s => s.status === 'otp_matched' || s.status === 'trx_synced').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Banner Bar for Role & Companion Quick Indicator */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            অ্যান্ড্রয়েড এসএমএস সিস্ক সক্রিয় (Android Sync Active)
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-medium">
            সংযুক্ত ওয়ালেট: <strong className="text-white">{activeWalletCount} টি</strong> (bKash & Nagad)
          </span>
        </div>

        {/* Role Switcher & Security Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/60 rounded-md px-2 py-0.5">
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="text-slate-300">অ্যাক্সেস রোল:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-900 text-white">অ্যাডমিন (Admin - Full Access)</option>
              <option value="family_member" className="bg-slate-900 text-white">সদস্য (Family Member)</option>
              <option value="viewer" className="bg-slate-900 text-white">দর্শক (Read Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white whitespace-nowrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 font-extrabold text-lg">
              FW
            </div>
            <span>FinWall</span>
            <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded px-1.5 py-0.5 font-mono">
              v2.4 PFM
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'wallets'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Wallet className="w-4 h-4 text-pink-400" />
            <span>ওয়ালেটসমূহ (Wallets)</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>লেনদেন ইতিহাস (History)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileBarChart className="w-4 h-4 text-purple-400" />
            <span>রিপোর্ট (Reports)</span>
          </button>

          <button
            onClick={() => setActiveTab('companion')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'companion'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>অ্যান্ড্রয়েড মনিটর (Companion)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>অডিট লগ (Audit Logs)</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Combined Balance */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Combined Balance Chip */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">মোট ব্যালেন্স (Total)</span>
            <span className="text-sm font-bold text-emerald-400 font-mono-num">
              ৳ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Send / Cash Out Execution Trigger */}
          {userRole === 'admin' && (
            <button
              onClick={onOpenTransferModal}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-pink-600/20 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>লেনদেন আদেশ (Send/Cashout)</span>
            </button>
          )}

          {/* Add Wallet Trigger */}
          <button
            onClick={onOpenConnectModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">ওয়ালেট যুক্ত করুন</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors"
              title="SMS Sync Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadSmsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadSmsCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h4 className="font-semibold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    এসএমএস মনিটরিং নোটিফিকেশন
                  </h4>
                  <span className="text-slate-400 text-[11px]">{smsLogs.length} টি প্রাপ্ত</span>
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {smsLogs.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">কোন সাম্প্রতিক এসএমএস নোটিফিকেশন নেই</p>
                  ) : (
                    smsLogs.slice(0, 5).map((sms) => (
                      <div
                        key={sms.id}
                        className={`p-2.5 rounded-lg border ${
                          sms.status === 'otp_matched'
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                            : sms.status === 'trx_synced'
                            ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span className="flex items-center gap-1">
                            {sms.status === 'otp_matched' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            {sms.sender}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(sms.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[11px] font-mono leading-relaxed opacity-90">{sms.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setActiveTab('companion');
                  }}
                  className="w-full mt-3 py-1.5 text-center text-xs text-pink-400 hover:text-pink-300 font-medium border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  সব এসএমএস ও কম্প্যানিয়ন দেখুন →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
