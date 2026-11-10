import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Key,
  Users,
  Terminal,
  Activity
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';

interface AuditLogModalProps {
  auditLogs: AuditLog[];
  userRole: UserRole;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  auditLogs,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.walletName && log.walletName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ipAddress.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">সিকিউরিটি ও অডিট লগ (Audit Logs & RBAC)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                AES-256 ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              পাসওয়ার্ড ও পিন এনক্রিপশন, ওটিপি ভেরিফিকেশন, সেন্ড মানি/ক্যাশ আউট আদেশ এবং এডমিন কার্যক্রমের অডিট ট্রেইল।
            </p>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">আপনার ভূমিকা:</span>
          <span className="font-bold text-white capitalize">{userRole.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Role-Based Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            অ্যাডমিন অ্যাক্সেস (Super Admin)
          </div>
          <p className="text-xs text-slate-300">
            নতুন ওয়ালেট যুক্ত, সেন্ড মানি/ক্যাশ আউট আদেশ কার্যকর, পিন ভেরিফিকেশন ও অডিট দেখার পূর্ণ সুবিধা।
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            সদস্য অ্যাক্সেস (Family Member)
          </div>
          <p className="text-xs text-slate-300">
            নিজের বিকাশ/নগদ ওয়ালেটের ব্যালেন্স ও লেনদেনের ইতিহাস পর্যবেক্ষণের সুবিধা।
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            এনক্রিপ্টেড কমিউনিকেশন
          </div>
          <p className="text-xs text-slate-300">
            অ্যান্ড্রয়েড অ্যাপ থেকে সার্ভার পর্যন্ত প্রতিটি ওটিপি ও লেনদেন মেসেজ SSL/TLS 256-bit সিকিউর।
          </p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            সিস্টেম অডিট ট্রেইল ({filteredLogs.length} টি ইভেন্ট)
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="অ্যাকশন, ওয়ালেট বা IP দিয়ে সার্চ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">সময় (Timestamp)</th>
                <th className="pb-3 font-semibold">ইভেন্ট / অ্যাকশন</th>
                <th className="pb-3 font-semibold">রোল (Role)</th>
                <th className="pb-3 font-semibold">বিস্তারিত তথ্য (Audit Details)</th>
                <th className="pb-3 font-semibold">IP এড্রেস</th>
                <th className="pb-3 font-semibold text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    কোন অডিট লগ রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 font-bold text-white font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-sans capitalize text-slate-300">
                      {log.userRole}
                    </td>
                    <td className="py-3 font-sans text-slate-300 max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-3 text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : log.status === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        )}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
