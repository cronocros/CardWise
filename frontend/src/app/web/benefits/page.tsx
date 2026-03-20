'use client';

import React from 'react';
import { 
  Gift, 
  Search, 
  Filter, 
  Zap, 
  ChevronRight, 
  Sparkles,
  Ticket,
  Percent,
  Star
} from 'lucide-react';

export default function WebBenefitsPage() {
  const vouchers = [
    { title: '스타벅스 50% 할인권', provider: '삼성카드 iD', expiry: '2026.03.25', icon: '☕', gradient: 'linear-gradient(135deg, #059669, #10b981)', code: 'SBX-50-SALE' },
    { title: 'CGV 영화 관람권', provider: '신한카드 Deep', expiry: '2026.04.10', icon: '🎬', gradient: 'linear-gradient(135deg, #e11d48, #fb4f4f)', code: 'CGV-FREE-PASS' },
    { title: '대한항공 마일리지 2배', provider: '현대카드 M', expiry: '2026.05.01', icon: '✈️', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', code: 'KAL-DBL-MILE' },
  ];

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Benefits Hub</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Maximize your rewards and exclusive perks</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-amber-500 text-white font-black text-[14px] shadow-xl shadow-amber-200">
             <Zap size={18} fill="white" /> Priority Status
           </div>
        </div>
      </header>

      {/* Hero Recommendation */}
      <section className="relative rounded-[56px] p-12 overflow-hidden shadow-2xl bg-slate-900 text-white group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] -mr-64 -mt-64 transition-transform group-hover:scale-125 duration-1000" />
         <div className="relative z-10 grid grid-cols-2 gap-12 items-center">
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="text-rose-500" size={24} />
                  <span className="text-[14px] font-black uppercase tracking-[0.3em] text-rose-500">AI Deep Analysis</span>
               </div>
               <h2 className="text-[40px] font-black leading-tight tracking-tighter mb-6">You're missing out on<br/><span className="text-rose-500">₩45,000</span> worth of benefits.</h2>
               <p className="text-slate-400 font-bold text-lg mb-8 leading-relaxed">Based on your recent spending at <span className="text-white">Emart</span> and <span className="text-white">Starbucks</span>, we recommend switching to the <span className="text-white">CardWise Premium</span> tier for 12% additional rewards.</p>
               <button className="px-8 py-5 rounded-[24px] bg-white text-slate-900 font-black text-[16px] active:scale-95 transition-all shadow-xl">Optimize My Portfolio</button>
            </div>
            <div className="grid grid-cols-2 gap-6">
               {[
                 { icon: <Percent size={28} />, label: 'Cashback', value: '+₩12,400' },
                 { icon: <Star size={28} />, label: 'Points', value: '450 pts' },
                 { icon: <Ticket size={28} />, label: 'Coupons', value: '3 Active' },
                 { icon: <Zap size={28} />, label: 'Boosters', value: 'x2 Multiplier' },
               ].map((box, i) => (
                 <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-md hover:bg-white/10 transition-colors">
                    <div className="text-rose-500 mb-4">{box.icon}</div>
                    <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-1">{box.label}</p>
                    <p className="text-[20px] font-black text-white">{box.value}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Vouchers Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[26px] font-black text-slate-900 tracking-tight">Active Vouchers</h2>
           <div className="flex gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search vouchers..." className="h-12 pl-12 pr-6 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:border-rose-500 transition-all font-bold text-[14px]" />
              </div>
              <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400"><Filter size={18} /></button>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {vouchers.map((v, i) => (
            <div key={i} className="group relative rounded-[48px] overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all border border-slate-50 hover:-translate-y-2">
               <div className="h-[200px] p-10 text-white flex flex-col justify-between relative" style={{ background: v.gradient }}>
                  <div className="flex justify-between items-start relative z-10">
                     <span className="text-4xl">{v.icon}</span>
                     <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20"><ChevronRight size={20} /></div>
                  </div>
                  <h3 className="text-[22px] font-black tracking-tight relative z-10">{v.title}</h3>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
               </div>
               <div className="p-10">
                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest mb-1">Provider</p>
                        <p className="text-[16px] font-black text-slate-700">{v.provider}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest mb-1">Expiry</p>
                        <p className="text-[14px] font-black text-slate-500">{v.expiry}</p>
                     </div>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center group-hover:border-rose-200 transition-colors">
                     <p className="text-[18px] font-black text-slate-900 tracking-[0.4em] select-all cursor-pointer">{v.code}</p>
                     <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Click to copy code</p>
               </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
