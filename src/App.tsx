import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Transaction,
  AuditLog,
  SmsLog,
  PfmOverviewReport,
  UserRole
} from './types';
import { Header } from './components/Header';
import { WalletCard } from './components/WalletCard';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { TransferModal } from './components/TransferModal';
import { WalletDetailModal } from './components/WalletDetailModal';
import { AndroidCompanionModal } from './components/AndroidCompanionModal';
import { ActivityReportModal } from './components/ActivityReportModal';
import { AuditLogModal } from './components/AuditLogModal';
import { TransactionList } from './components/TransactionList';
import { AiInsightsCard } from './components/AiInsightsCard';
import {
  PlusCircle,
  Send,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  FileBarChart,
  History,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions' | 'reports' | 'companion' | 'audit'>('wallets');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Server state
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [report, setReport] = useState<PfmOverviewReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferInitialWalletId, setTransferInitialWalletId] = useState<string | undefined>(undefined);
  const [transferInitialAction, setTransferInitialAction] = useState<'send_money' | 'cash_out' | 'add_money'>('send_money');

  const [selectedWalletForDetails, setSelectedWalletForDetails] = useState<Wallet | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [aiRefreshTrigger, setAiRefreshTrigger] = useState(0);

  // Fetch all data from Express API
  const loadAllData = async () => {
    try {
      const [wRes, tRes, aRes, sRes, rRes] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/transactions'),
        fetch('/api/audit-logs'),
        fetch('/api/sms-logs'),
        fetch('/api/reports')
      ]);

      const wData = await wRes.json();
      const tData = await tRes.json();
      const aData = await aRes.json();
      const sData = await sRes.json();
      const rData = await rRes.json();

      if (wData.success) setWallets(wData.wallets);
      if (tData.success) setTransactions(tData.transactions);
      if (aData.success) setAuditLogs(aData.auditLogs);
      if (sData.success) setSmsLogs(sData.smsLogs);
      if (rData.success) setReport(rData.report);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching platform data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleOpenTransfer = (wallet?: Wallet, actionType: 'send_money' | 'cash_out' = 'send_money') => {
    if (wallet) {
      setTransferInitialWalletId(wallet.id);
    } else {
      setTransferInitialWalletId(wallets[0]?.id);
    }
    setTransferInitialAction(actionType);
    setIsTransferModalOpen(true);
  };

  const handleOpenDetails = (wallet: Wallet) => {
    setSelectedWalletForDetails(wallet);
    setIsDetailModalOpen(true);
  };

  const handleDisconnectWallet = async (walletId: string) => {
    try {
      const res = await fetch(`/api/wallets/${walletId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadAllData();
      }
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  const totalBalance = report?.totalBalance || wallets.reduce((acc, w) => (w.status === 'active' ? acc + w.balance : acc), 0);
  const activeWallets = wallets.filter((w) => w.status === 'active');
  const bkashWallets = activeWallets.filter((w) => w.provider === 'bKash');
  const nagadWallets = activeWallets.filter((w) => w.provider === 'Nagad');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBalance={totalBalance}
        activeWalletCount={activeWallets.length}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenTransferModal={() => handleOpenTransfer()}
        smsLogs={smsLogs}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* WALLETS TAB */}
        {activeTab === 'wallets' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Dashboard Bar */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    মাল্টি-ওয়ালেট ফ্যামিলি ড্যাশবোর্ড
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    bKash & Nagad Sync
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  পরিবারের সদস্যদের ৫–৮টি বিকাশ ও নগদ ওয়ালেটের ব্যালেন্স ও স্টেটমেন্ট কেন্দ্রীয়ভাবে পর্যবেক্ষণ ও আদেশ প্রেরণের সুযোগ।
                </p>
              </div>

              {/* Combined Balance Stat Card */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">মোট ফ্যামিলি ফান্ড (Total Balance)</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono-num mt-0.5 block">
                    ৳ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {userRole === 'admin' && (
                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="px-4 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 transition-all active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>ওয়ালেট যুক্ত করুন</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Spending Insights Banner */}
            <AiInsightsCard onRefreshTrigger={aiRefreshTrigger} />

            {/* Provider Section Tabs / Counter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-400" />
                  সংযুক্ত ওয়ালেটসমূহ ({wallets.length} টি)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {bkashWallets.length} টি বিকাশ (bKash) · {nagadWallets.length} টি নগদ (Nagad)
                </p>
              </div>

              {/* Quick Actions */}
              {userRole === 'admin' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenTransfer(undefined, 'send_money')}
                    className="px-3 py-1.5 bg-pink-600/90 hover:bg-pink-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>সেন্ড মানি আদেশ</span>
                  </button>

                  <button
                    onClick={() => handleOpenTransfer(undefined, 'cash_out')}
                    className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>ক্যাশ আউট আদেশ</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Grid */}
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                ওয়ালেট ডেটা লোড করা হচ্ছে...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    userRole={userRole}
                    onOpenDetails={handleOpenDetails}
                    onInitiateTransfer={(w, type) => handleOpenTransfer(w, type)}
                    onVerifyOtp={() => setIsConnectModalOpen(true)}
                  />
                ))}

                {/* Add New Wallet Empty Card */}
                {userRole === 'admin' && (
                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="group border-2 border-dashed border-slate-800 hover:border-pink-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-900/50 min-h-[220px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                      + নতুন bKash / Nagad যুক্ত করুন
                    </span>
                    <span className="text-xs text-slate-400 mt-1 max-w-xs">
                      পরিবারের অন্য যেকোনো বিকাশ বা নগদ ওয়ালেট ওটিপি দিয়ে কানেক্ট করুন
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            onInitiateTransfer={() => handleOpenTransfer()}
          />
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <ActivityReportModal
            report={report}
            wallets={wallets}
            transactions={transactions}
          />
        )}

        {/* ANDROID COMPANION TAB */}
        {activeTab === 'companion' && (
          <AndroidCompanionModal
            smsLogs={smsLogs}
            onSmsSent={() => {
              loadAllData();
              setAiRefreshTrigger(prev => prev + 1);
            }}
          />
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <AuditLogModal
            auditLogs={auditLogs}
            userRole={userRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FinWall © 2026</span>
            <span>·</span>
            <span>মাল্টি-ওয়ালেট পার্সোনাল ফাইন্যান্স প্ল্যাটফর্ম</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <span>bKash & Nagad API Protocol</span>
            <span>·</span>
            <span>SSL 256-bit Encrypted</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onWalletConnected={() => {
          loadAllData();
          setAiRefreshTrigger(prev => prev + 1);
        }}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        initialWalletId={transferInitialWalletId}
        initialAction={transferInitialAction}
        onTransferCompleted={() => {
          loadAllData();
          setAiRefreshTrigger(prev => prev + 1);
        }}
      />

      <WalletDetailModal
        wallet={selectedWalletForDetails}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transactions={transactions}
        userRole={userRole}
        onDisconnectWallet={handleDisconnectWallet}
        onInitiateTransfer={(w, type) => handleOpenTransfer(w, type)}
      />
    </div>
  );
}
export default App;
