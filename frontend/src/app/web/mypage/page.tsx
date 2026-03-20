'use client';

import React from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Clock,
  Smartphone,
  Globe,
  Star
} from 'lucide-react';
import { SAMPLE_USER } from '@/lib/sampleData';

export default function WebMyPage() {
  const settingGroups = [
    {
      title: 'Member Security',
      items: [
        { icon: <Shield size={20} />, label: 'Privacy Protection', value: 'High' },
        { icon: <Settings size={20} />, label: 'Account Preferences', value: null },
        { icon: <Smartphone size={20} />, label: 'Device Management', value: '2 Active' },
      ]
    },
    {
      title: 'Application',
      items: [
        { icon: <Bell size={20} />, label: 'Notifications', value: 'On' },
        { icon: <CreditCard size={20} />, label: 'Billing & Tiers', value: 'Premium' },
        { icon: <Globe size={20} />, label: 'Language', value: 'Korean' },
      ]
    }
  ];

  return (
    <div className="p-10 space-y-10 animate-fade-in max-w-[1200px] mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">My Profile</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Manage your personal identity and security</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-[14px] hover:bg-rose-50 hover:text-rose-500 transition-all">
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* Premium Profile Card */}
      <section className="relative h-[320px] rounded-[56px] overflow-hidden shadow-2xl bg-slate-900 group">
         <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent" />
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] -mr-80 -mt-80" />
         
         <div className="relative z-10 h-full flex items-center p-16 gap-16">
            <div className="relative">
               <div className="w-44 h-44 rounded-full border-4 border-white/10 p-2 group-hover:border-rose-500/50 transition-all duration-700">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-6xl shadow-inner">👤</div>
               </div>
               <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-xl shadow-rose-900 animate-pulse">
                  <Star size={24} fill="white" className="text-white" />
               </div>
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-[48px] font-black text-white tracking-tighter leading-none">{SAMPLE_USER.name}</h2>
                  <span className="px-5 py-2 rounded-full bg-rose-500 text-white text-[13px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-900">Premium Member</span>
               </div>
               <p className="text-slate-400 font-bold text-[18px] mb-8">{SAMPLE_USER.email}</p>
               
               <div className="flex gap-12">
                  <div>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
                     <p className="text-[22px] font-black text-white tracking-tight">₩{SAMPLE_USER.totalAssets.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 self-center" />
                  <div>
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Cards</p>
                     <p className="text-[22px] font-black text-white tracking-tight">{SAMPLE_USER.savingsCount} Cards</p>
                  </div>
               </div>
            </div>

            <div className="text-right">
               <div className="inline-flex items-center gap-3 px-6 py-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                 <Clock size={20} className="text-rose-500" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Time</p>
                    <p className="text-[16px] font-black text-white">04:52 Left</p>
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 gap-10">
         {settingGroups.map((group, i) => (
           <div key={i} className="space-y-6">
              <h3 className="text-[16px] font-black text-slate-400 uppercase tracking-widest ml-4">{group.title}</h3>
              <div className="space-y-4">
                 {group.items.map((item, j) => (
                   <button key={j} className="w-full group bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 hover:bg-rose-50/10 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
                            {item.icon}
                         </div>
                         <span className="text-[18px] font-black text-slate-700 tracking-tight">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         {item.value && <span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">{item.value}</span>}
                         <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 group-hover:text-rose-500 transition-all" />
                      </div>
                   </button>
                 ))}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
