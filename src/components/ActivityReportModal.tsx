import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Calendar,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet as WalletIcon,
  Printer,
  Sparkles
} from 'lucide-react';
import { PfmOverviewReport, Wallet, Transaction } from '../types';

interface ActivityReportModalProps {
  report: PfmOverviewReport | null;
  wallets: Wallet[];
  transactions: Transaction[];
}

export const ActivityReportModal: React.FC<ActivityReportModalProps> = ({
  report,
  wallets,
  transactions
}) => {
  const [dateRange, setDateRange] = useState<'this_month' | 'last_3_months' | 'all_time'>('this_month');

  if (!report) return null;

  // Export CSV generator
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Wallet Name', 'Provider', 'Type', 'Category', 'Amount (BDT)', 'Fee (BDT)', 'Date', 'Executed By'];
    const rows = transactions.map(t => [
      t.trxId,
      `"${t.walletName}"`,
      t.provider,
      t.type,
      t.category,
      t.amount,
      t.fee,
      new Date(t.timestamp).toLocaleDateString(),
      `"${t.executedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinWall_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const netCashFlow = report.totalIncomeThisMonth - report.totalExpenseThisMonth;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Date Filter */}
      <div className="p-6 bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">ওয়ালেট কার্যক্রম প্রতিবেদন (Activity Reports)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ANALYTICS & EXPORT
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            পারিবারিক বিকাশ ও নগদ ওয়ালেটসমূহের আয়-ব্যয়ের পরিসংখ্যান এবং বিস্তারিত অডিট রিপোর্ট
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>CSV ডাউনলোড</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">সর্বমোট ব্যালেন্স</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono-num mt-1 block">
            ৳ {report.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-pink-400">bKash: ৳{report.bKashBalance.toLocaleString()}</span>
            <span>·</span>
            <span className="text-orange-400">Nagad: ৳{report.nagadBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">চলতি মাসের মোট আয়/জমা</span>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-2xl font-bold text-white font-mono-num">
              ৳ {report.totalIncomeThisMonth.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block font-medium">পেনশন, বেতন ও ক্যাশ ইন</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">চলতি মাসের মোট ব্যয়</span>
          <div className="flex items-center gap-2 mt-1">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <span className="text-2xl font-bold text-white font-mono-num">
              ৳ {report.totalExpenseThisMonth.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-rose-400 mt-2 block font-medium">সেন্ড মানি, ক্যাশ আউট ও পেমেন্ট</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium block">নিট ক্যাশ ফ্লো (Net Flow)</span>
          <span
            className={`text-2xl font-bold font-mono-num mt-1 block ${
              netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}৳ {netCashFlow.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-400 mt-2 block font-medium">
            {report.activeWalletCount} টি সক্রিয় ওয়ালেট সিঙ্কড
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Bar Chart (SVG) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileBarChart className="w-4 h-4 text-purple-400" />
              মাসিক আয়-ব্যয় তুলনা (Monthly Comparison)
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> আয় (Income)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span> ব্যয় (Expense)
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800 px-4">
            {report.monthlyTrends.map((trend) => {
              const maxVal = 70000;
              const incHeight = Math.round((trend.income / maxVal) * 100);
              const expHeight = Math.round((trend.expense / maxVal) * 100);

              return (
                <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="flex items-end gap-1.5 h-48 w-full justify-center">
                    {/* Income Bar */}
                    <div
                      className="w-3.5 bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-400 relative group"
                      style={{ height: `${incHeight}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap font-mono z-10">
                        ৳{trend.income.toLocaleString()}
                      </div>
                    </div>
                    {/* Expense Bar */}
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-md transition-all duration-500 hover:bg-rose-400 relative group"
                      style={{ height: `${expHeight}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap font-mono z-10">
                        ৳{trend.expense.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{trend.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-pink-400" />
            খাতভিত্তিক ব্যয় বণ্টন (Category Distribution)
          </h3>

          <div className="space-y-3">
            {report.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.category}</span>
                  <span className="text-slate-400 font-mono">
                    ৳{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family Member Distribution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <WalletIcon className="w-4 h-4 text-emerald-400" />
          পারিবারিক ওয়ালেট ব্যালেন্স সমীকরণ (Family Wallet Ledger)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">ওয়ালেটের নাম</th>
                <th className="pb-3 font-semibold">মালিকের নাম</th>
                <th className="pb-3 font-semibold">প্রোভাইডার</th>
                <th className="pb-3 font-semibold">মোবাইল নম্বর</th>
                <th className="pb-3 font-semibold text-right">বর্তমান ব্যালেন্স</th>
                <th className="pb-3 font-semibold text-right">মাসিক লিমিট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {wallets.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-sans font-bold text-white">{w.name}</td>
                  <td className="py-3 font-sans text-slate-300">{w.ownerName}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.provider === 'bKash' ? 'bg-pink-500/10 text-pink-400' : 'bg-orange-500/10 text-orange-400'
                      }`}
                    >
                      {w.provider}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{w.mobileNumber}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ৳ {w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    ৳ {w.monthlyLimit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
