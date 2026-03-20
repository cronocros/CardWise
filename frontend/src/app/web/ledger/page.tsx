'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Download,
  Plus
} from 'lucide-react';
import { SAMPLE_TRANSACTIONS, SPENDING_CATEGORIES, SAMPLE_USER } from '@/lib/sampleData';

export default function WebLedgerPage() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Personal Ledger</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Precise tracking of your financial flow</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-100 text-slate-600 font-bold text-[14px] shadow-sm hover:bg-slate-50 transition-all">
            <Download size={18} /> Export Data
          </button>
          <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-rose-500 text-white font-black text-[14px] shadow-xl shadow-rose-200 active:scale-95 transition-all">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Ledger Area */}
        <div className="col-span-8 space-y-8">
          {/* Controls */}
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..."
                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700"
              />
            </div>
            <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
              <Calendar size={18} />
            </button>
            <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
              <Filter size={18} />
            </button>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Transactions</h3>
                <div className="flex gap-2">
                   {['all', 'expense', 'income'].map(m => (
                     <button key={m} onClick={() => setFilter(m)}
                       className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${
                         filter === m ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                       }`}>
                       {m}
                     </button>
                   ))}
                </div>
             </div>
             <div className="divide-y divide-slate-50">
               {SAMPLE_TRANSACTIONS.map(tx => (
                 <div key={tx.id} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner group-hover:bg-white transition-all">
                        {tx.icon || '💰'}
                      </div>
                      <div>
                        <p className="font-black text-[17px] text-slate-900 group-hover:text-rose-500 transition-colors">{tx.merchant}</p>
                        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className={`text-[18px] font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                            {tx.type === 'income' ? '+' : '-'}₩{tx.amount.toLocaleString()}
                          </p>
                          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Confirmed</p>
                       </div>
                       <button className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="col-span-4 space-y-8">
          <section className="bg-slate-900 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[12px] font-bold opacity-40 uppercase tracking-[0.2em] mb-4">Savings Rate</p>
                <div className="flex items-end gap-3 mb-8">
                   <h2 className="text-[44px] font-black leading-none">{SAMPLE_USER.savingRate}%</h2>
                   <div className="flex items-center gap-1 text-emerald-400 text-sm font-black mb-1">
                      <ArrowUpRight size={16} /> 4.2%
                   </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                   <div className="h-full bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.6)]" style={{ width: `${SAMPLE_USER.savingRate}%` }} />
                </div>
                <p className="text-[14px] font-bold opacity-60 leading-relaxed">You've saved ₩{(SAMPLE_USER.monthlySpend * 0.25).toLocaleString()} more than last month!</p>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] -mr-16 -mt-16" />
          </section>

          <section className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
             <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Spending by Category</h3>
             <div className="space-y-6">
                {SPENDING_CATEGORIES.map(cat => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-[14px] font-black text-slate-700">{cat.name}</span>
                       </div>
                       <span className="text-[14px] font-bold text-slate-400">₩{cat.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full rounded-full transition-all duration-1000" 
                         style={{ 
                           backgroundColor: cat.color, 
                           width: `${(cat.amount / SAMPLE_USER.monthlySpend) * 100}%`,
                           boxShadow: `0 0 10px ${cat.color}40`
                         }} />
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
