'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  TrendingUp,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { SAMPLE_CARDS } from '@/lib/sampleData';

export default function WebCardsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Card Portfolio</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Manage your active plastic and virtual cards</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-4 rounded-[22px] bg-rose-500 text-white font-black text-[15px] shadow-xl shadow-rose-200 active:scale-95 transition-all">
          <Plus size={20} /> Add New Card
        </button>
      </header>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-rose-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, provider or last 4 digits..."
            className="w-full h-16 pl-14 pr-6 rounded-3xl bg-white border border-slate-100 shadow-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="w-16 h-16 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
          <Filter size={20} />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-8">
        {SAMPLE_CARDS.map(card => (
          <div key={card.id} 
            className="group relative h-[320px] rounded-[56px] p-10 text-white shadow-2xl overflow-hidden transition-all hover:-translate-y-2 hover:rotate-1"
            style={{ background: card.color }}>
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[14px] font-black uppercase tracking-[0.3em] opacity-40 mb-1">{card.provider}</p>
                  <h3 className="text-[28px] font-black tracking-tight">{card.name}</h3>
                </div>
                <div className="w-20 h-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                  <CreditCard size={32} className="opacity-80" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[12px] font-bold opacity-30 uppercase tracking-widest mb-1">Current Balance</p>
                    <p className="text-[36px] font-black tracking-tighter">₩{card.balance.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-black tracking-[0.4em] opacity-40">•••• {card.lastFour}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-[13px] font-black uppercase tracking-widest opacity-40">
                    <span>Usage</span>
                    <span>{Math.round((card.balance / card.limit) * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_20px_white]" 
                      style={{ width: `${(card.balance / card.limit) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
          </div>
        ))}
      </div>

      {/* Quick Stats / Management Section */}
      <section className="grid grid-cols-3 gap-8">
        {[
          { icon: <Zap className="text-amber-500" />, label: 'Active Benefits', value: '12 Active', sub: 'Updated 1h ago' },
          { icon: <Shield className="text-emerald-500" />, label: 'Security Status', value: 'High', sub: 'All cards protected' },
          { icon: <Clock className="text-rose-500" />, label: 'Expiring Soon', value: '0 Cards', sub: 'Next expiry in 2029' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-[22px] bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
              {item.icon}
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-[20px] font-black text-slate-900 tracking-tight">{item.value}</p>
              <p className="text-[12px] font-bold text-slate-300 mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
