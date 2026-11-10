import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Send,
  ArrowUpRight,
  PlusCircle,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Transaction, WalletProvider, TransactionCategory } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onInitiateTransfer: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onInitiateTransfer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState<'all' | WalletProvider>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TransactionCategory>('all');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.walletName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.counterpartyNumber.includes(searchTerm) ||
      (t.reference && t.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvider = providerFilter === 'all' || t.provider === providerFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesProvider && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">লেনদেন বিবরণী (Transaction History)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {filtered.length} RECORDS
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            সকল যুক্তকৃত bKash এবং Nagad ওয়ালেটের অর্থ গ্রহণ ও প্রদান (Send Money, Cash Out, Payment) বিবরণী
          </p>
        </div>

        <button
          onClick={onInitiateTransfer}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 transition-all shrink-0 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>নতুন লেনদেন আদেশ (Execute Command)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="TrxID, ওয়ালেট বা মোবাইল নম্বর দিয়ে সার্চ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Provider Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProviderFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              providerFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            সব ওয়ালেট
          </button>
          <button
            onClick={() => setProviderFilter('bKash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              providerFilter === 'bKash'
                ? 'bg-pink-600 text-white'
                : 'text-pink-400 hover:bg-pink-500/10'
            }`}
          >
            bKash
          </button>
          <button
            onClick={() => setProviderFilter('Nagad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              providerFilter === 'Nagad'
                ? 'bg-orange-600 text-white'
                : 'text-orange-400 hover:bg-orange-500/10'
            }`}
          >
            Nagad
          </button>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
        >
          <option value="all">সব লেনদেন ধরণ</option>
          <option value="send_money">Send Money (সেন্ড মানি)</option>
          <option value="cash_out">Cash Out (ক্যাশ আউট)</option>
          <option value="cash_in">Cash In / Deposit (জমা)</option>
          <option value="payment">Payment (পেমেন্ট)</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">TrxID / সময়</th>
                <th className="pb-3 font-semibold">উৎস ওয়ালেট</th>
                <th className="pb-3 font-semibold">ধরণ</th>
                <th className="pb-3 font-semibold">প্রাপক / বিবরণ</th>
                <th className="pb-3 font-semibold">ক্যাটাগরি</th>
                <th className="pb-3 font-semibold text-right">পরিমাণ (BDT)</th>
                <th className="pb-3 font-semibold text-right">ফি / চার্জ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    কোন মেলানো লেনদেন পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isCredit = t.type === 'cash_in' || t.type === 'add_money';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-pink-400 block">{t.trxId}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(t.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </td>

                      <td className="py-3 font-sans">
                        <span className="font-semibold text-white block">{t.walletName}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                            t.provider === 'bKash' ? 'bg-pink-500/10 text-pink-400' : 'bg-orange-500/10 text-orange-400'
                          }`}
                        >
                          {t.provider}
                        </span>
                      </td>

                      <td className="py-3 font-sans capitalize">
                        <span className="flex items-center gap-1 font-semibold text-slate-200">
                          {t.type === 'send_money' ? (
                            <Send className="w-3.5 h-3.5 text-pink-400" />
                          ) : t.type === 'cash_out' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 font-sans">
                        <span className="text-slate-200 font-mono block">{t.counterpartyNumber}</span>
                        <span className="text-[10px] text-slate-400">{t.reference || t.counterpartyName}</span>
                      </td>

                      <td className="py-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <span
                          className={`font-bold font-mono-num text-sm block ${
                            isCredit ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}৳ {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-3 text-right text-slate-400 font-mono">
                        ৳ {t.fee.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
