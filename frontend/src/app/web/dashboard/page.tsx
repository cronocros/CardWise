'use client';

import React from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingBag, 
  Coffee, 
  Truck,
  Plus,
  Search,
  MoreHorizontal,
  Wallet
} from 'lucide-react';
import { SAMPLE_USER, SAMPLE_CARDS, SAMPLE_TRANSACTIONS, SPENDING_CATEGORIES } from '@/lib/sampleData';

export default function WebDashboard() {
  const stats = [
    { label: 'Total Assets', value: `₩${SAMPLE_USER.totalAssets.toLocaleString()}`, trend: '+2.4%', color: 'rose' },
    { label: 'Monthly Spend', value: `₩${SAMPLE_USER.monthlySpend.toLocaleString()}`, trend: `${SAMPLE_USER.savingRate}% saved`, color: 'emerald' },
    { label: 'Active Cards', value: `${SAMPLE_CARDS.length} Cards`, trend: 'Standard', color: 'blue' },
  ];

  return (
    <div className="p-10 space-y-10">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">종합 대시보드</h1>
        <p className="text-slate-500 font-medium">데스크톱 버전에서 상세 내역을 한눈에 확인하세요.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="group relative bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 rounded-full mr-[-40px] mt-[-40px] ${
                stat.color === 'rose' ? 'bg-rose-500' : 
                stat.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
            <div className="flex items-center justify-between">
              <span className="text-[32px] font-black text-slate-900 tracking-tighter">{stat.value}</span>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[12px] font-black ${
                stat.color === 'rose' ? 'bg-rose-50 text-rose-500' : 
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
              }`}>
                <TrendingUp size={14} />
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Recent Activity */}
        <section className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <Wallet size={24} />
              </div>
              <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Recent Activity</h2>
            </div>
            <button className="px-5 py-2.5 rounded-2xl bg-slate-50 text-[13px] font-black text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest">View History</button>
          </div>
          <div className="space-y-6">
            {SAMPLE_TRANSACTIONS.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between group cursor-pointer p-4 rounded-3xl hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[22px] bg-slate-100 flex items-center justify-center text-2xl shadow-inner group-hover:bg-white group-hover:shadow-md transition-all">
                    {tx.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-black text-[17px] text-slate-900 group-hover:text-rose-500 transition-colors">{tx.merchant}</p>
                    <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[18px] font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : '-'}₩{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Verified</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Card Portfolio */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Active Portfolio</h2>
            <button className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:text-rose-500 transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {SAMPLE_CARDS.map(card => (
              <div key={card.id} 
                className="group p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden transition-all hover:-rotate-1 active:scale-[0.98]"
                style={{ background: card.color }}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-12">
                     <div>
                        <p className="text-[12px] font-bold opacity-50 uppercase tracking-[0.2em] mb-1">{card.provider}</p>
                        <p className="text-[22px] font-black tracking-tight">{card.name}</p>
                     </div>
                     <div className="w-16 h-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                        <CreditCard size={24} className="opacity-80" />
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[32px] font-black tracking-tighter mb-1">₩{card.balance.toLocaleString()}</p>
                      <p className="text-[14px] font-bold opacity-60">Status: High Utility</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black tracking-[0.3em] opacity-40">•••• {card.lastFour}</p>
                    </div>
                  </div>
                  <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                      style={{ width: `${(card.balance / card.limit) * 100}%` }} />
                  </div>
                </div>
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-120" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
