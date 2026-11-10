import React, { useState } from 'react';
import {
  X,
  Send,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Receipt,
  Loader2,
  Building
} from 'lucide-react';
import { Wallet, TransactionCategory, Transaction } from '../types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  initialWalletId?: string;
  initialAction?: 'send_money' | 'cash_out' | 'add_money';
  onTransferCompleted: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  initialWalletId,
  initialAction = 'send_money',
  onTransferCompleted
}) => {
  const [activeTab, setActiveTab] = useState<'send_money' | 'cash_out' | 'add_money'>(initialAction);
  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    initialWalletId || (wallets[0]?.id || '')
  );

  // Form states
  const [targetNumber, setTargetNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Family Transfer');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [executedTrx, setExecutedTrx] = useState<Transaction | null>(null);

  if (!isOpen) return null;

  const activeWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];
  const isBkash = activeWallet?.provider === 'bKash';

  // Fee calculation preview
  const numAmount = Number(amount) || 0;
  let estimatedFee = 0;
  if (activeTab === 'send_money') {
    estimatedFee = numAmount > 0 ? 5.00 : 0;
  } else if (activeTab === 'cash_out') {
    const feeRate = isBkash ? 0.0185 : 0.0149;
    estimatedFee = numAmount > 0 ? Math.round(numAmount * feeRate * 100) / 100 : 0;
  }
  const totalCost = numAmount + estimatedFee;

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedWalletId || !targetNumber || !amount || !pin) {
      setErrorMessage('সবগুলো ঘর পূরণ করুন (Fill out all required fields)');
      return;
    }

    if (pin.length < 4) {
      setErrorMessage('সঠিক ওয়ালেট পিন নম্বর প্রদান করুন');
      return;
    }

    setLoading(true);

    const endpoint =
      activeTab === 'send_money'
        ? '/api/transactions/send-money'
        : activeTab === 'cash_out'
        ? '/api/transactions/cash-out'
        : '/api/transactions/add-money';

    const bodyData =
      activeTab === 'send_money'
        ? { walletId: selectedWalletId, receiverNumber: targetNumber, amount: numAmount, pin, reference, category }
        : activeTab === 'cash_out'
        ? { walletId: selectedWalletId, agentNumber: targetNumber, amount: numAmount, pin, reference }
        : { walletId: selectedWalletId, amount: numAmount, category, reference };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setExecutedTrx(data.transaction);
        onTransferCompleted();
      } else {
        setErrorMessage(data.error || 'লেনদেন সম্পন্ন করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('সার্ভার যোগাযোগে ত্রুটি ঘটেছে।');
    }
  };

  const handleReset = () => {
    setExecutedTrx(null);
    setAmount('');
    setTargetNumber('');
    setPin('');
    setReference('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                isBkash ? 'bg-pink-600' : 'bg-orange-600'
              }`}
            >
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">লেনদেন আদেশ ড্যাশবোর্ড (Remote Command)</h3>
              <p className="text-xs text-slate-400">bKash / Nagad সেন্ড মানি ও ক্যাশ আউট বাস্তবায়ন</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!executedTrx && (
          <div className="flex border-b border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => { setActiveTab('send_money'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'send_money'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>সেন্ড মানি (Send)</span>
            </button>

            <button
              onClick={() => { setActiveTab('cash_out'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'cash_out'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>ক্যাশ আউট (Cash Out)</span>
            </button>

            <button
              onClick={() => { setActiveTab('add_money'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'add_money'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>জমা / ক্যাশ ইন (Add)</span>
            </button>
          </div>
        )}

        {/* Error alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form area */}
        {!executedTrx ? (
          <form onSubmit={handleExecute} className="p-6 space-y-4">
            {/* Wallet Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                উৎস ওয়ালেট সিলেক্ট করুন (Select Source Wallet)
              </label>
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-slate-900 text-white">
                    {w.name} ({w.provider}) — ৳{w.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Number */}
            {activeTab !== 'add_money' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {activeTab === 'send_money' ? 'প্রাপকের মোবাইল নাম্বার (Receiver Number)' : 'এজেন্ট নাম্বার (Agent Number)'}
                </label>
                <input
                  type="tel"
                  placeholder="01712XXXXXX"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-pink-500"
                  required
                />
              </div>
            )}

            {/* Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  টাকার পরিমাণ (Amount in BDT ৳)
                </label>
                <input
                  type="number"
                  min="10"
                  step="1"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ক্যাটাগরি (Category Tag)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="Family Transfer">Family Transfer (পারিবারিক)</option>
                  <option value="Groceries">Groceries (বাজার খরচ)</option>
                  <option value="Utilities">Utilities (বিদ্যুৎ/গ্যাস/বিল)</option>
                  <option value="Salary">Salary (বেতন/পেনশন)</option>
                  <option value="Education">Education (শিক্ষা/ফি)</option>
                  <option value="Medical">Medical (চিকিৎসা)</option>
                  <option value="Shopping">Shopping (কেনাকাটা)</option>
                  <option value="Business">Business (ব্যবসা)</option>
                  <option value="Other">Other (অন্যান্য)</option>
                </select>
              </div>
            </div>

            {/* Reference & PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  রেফারেন্স নোট (Reference Note)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nov Electricity Bill"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  ওয়ালেট সিকিউরিটি পিন (PIN Authorization)
                </label>
                <input
                  type="password"
                  maxLength={5}
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Fee Breakdown Summary */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>মূল পরিমাণ (Base Amount):</span>
                <span className="font-mono text-white">৳ {numAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>সার্ভিস চার্জ / ফি ({activeWallet?.provider}):</span>
                <span className="font-mono text-amber-400">৳ {estimatedFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
                <span className="text-slate-200">মোট কর্তনযোগ্য (Total Deducted):</span>
                <span className="font-mono text-pink-400">৳ {totalCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                activeTab === 'send_money'
                  ? 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20'
                  : activeTab === 'cash_out'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আদেশ প্রসেস করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>আদেশ কার্যকর করুন (Execute Command)</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success Receipt */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">লেনদেন সফলভাবে সম্পন্ন হয়েছে!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {executedTrx.walletName} থেকে নতুন স্টেটমেন্ট রেকর্ড তৈরি হয়েছে।
              </p>
            </div>

            {/* Trx Receipt Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">TrxID:</span>
                <span className="text-pink-400 font-bold">{executedTrx.trxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ধরণ:</span>
                <span className="text-white capitalize">{executedTrx.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">পরিমাণ:</span>
                <span className="text-emerald-400 font-bold">৳ {executedTrx.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">চার্জ / ফি:</span>
                <span className="text-amber-400">৳ {executedTrx.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">প্রাপক / এজেন্সী:</span>
                <span className="text-slate-200">{executedTrx.counterpartyNumber}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px]">
                <span className="text-slate-400">সময়:</span>
                <span className="text-slate-300">{new Date(executedTrx.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
