'use client';

import React from 'react';
import { Search, Sparkles, ChevronRight, Gift, Tag, Percent } from 'lucide-react';
import { Mascot } from './mascot';

export function BenefitsView() {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const recommendations = [
    { title: '오늘의 AI 추천', desc: '커피 50% 할인 카드 혜택이 곧 만료됩니다!', icon: '☕', color: '#ffedd5' },
    { title: '깜짝 리워드', desc: '이번 주말 마트 결제 시 5천원 페이백', icon: '🎁', color: '#fff1f2' },
  ];

  const popularBenefits = [
    { name: '스타벅스', type: '카페/디저트', rate: '50% 할인', code: 'C-01' },
    { name: '배달의민족', type: '음식/배달', rate: '5천원 쿠폰', code: 'F-12' },
    { name: '대중교통', type: '교통', rate: '10% 적립', code: 'T-05' },
    { name: '넷플릭스', type: '디지털/구독', rate: '2천원 캐시백', code: 'D-08' },
  ];

  const filteredBenefits = popularBenefits.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center text-gray-400 group-focus-within:text-rose-500 transition-colors">
          <Search size={22} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="가맹점, 혜택명 검색..." 
          className="w-full h-20 pl-16 pr-8 rounded-[32px] bg-white border border-gray-100 shadow-xl focus:border-rose-200 outline-none font-bold text-[16px] transition-all placeholder:text-gray-300 placeholder:font-medium"
        />
      </div>

      {/* AI Recommendation Banner */}
      <div className="relative p-8 rounded-[48px] bg-white border border-rose-100/50 overflow-hidden shadow-2xl shadow-rose-100/50 group active:scale-[0.98] transition-all">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-100/30 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-100/20 blur-[80px]" />
        
        {/* Floating Mascot Character */}
        <div className="absolute top-4 right-4 w-32 h-32 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
           <Mascot pose="thinking" size={120} className="rotate-12 translate-x-12 -translate-y-4" />
        </div>

        <div className="relative z-10">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-rose-500 shadow-lg shadow-rose-200 flex items-center justify-center">
                   <Sparkles size={14} className="text-white animate-pulse" />
                </div>
                <span className="text-[12px] font-black text-rose-500 uppercase tracking-[0.2em]">AI 스마트 분석</span>
              </div>
              {/* 3D Floating Tag */}
              <div className="px-3 py-1 bg-white border-2 border-slate-900 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3 hover:rotate-0 transition-transform cursor-default scale-90">
                 <span className="text-[10px] font-black text-slate-900">오늘의 추천 🔥</span>
              </div>
           </div>
           
           <h3 className="text-[26px] font-black text-slate-800 tracking-tighter leading-[1.1] mb-10 max-w-[200px]">
              크로노 님께<br/>딱 맞는 
              <span className="relative inline-block ml-1">
                 <span className="relative z-10">원픽 혜택</span>
                 <div className="absolute -bottom-1 left-0 w-full h-3 bg-rose-200/60 -rotate-1" />
              </span>은?
           </h3>
           
           <div className="flex flex-col gap-3">
              {recommendations.map((r, i) => (
                <div key={i} className="group/item flex items-center gap-4 p-5 rounded-[32px] bg-slate-50 hover:bg-white border border-transparent hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-100/50 transition-all cursor-pointer">
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover/item:scale-110" style={{ backgroundColor: r.color }}>
                      {r.icon}
                   </div>
                   <div className="flex-1">
                      <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-0.5">{r.title}</p>
                      <p className="text-[14px] font-bold text-slate-700 leading-tight tracking-tight">{r.desc}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover/item:text-rose-500 transition-colors">
                      <ChevronRight size={18} strokeWidth={3} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="space-y-6 px-2">
        <div className="flex items-center justify-between">
           <h4 className="text-[18px] font-black text-var(--text-strong)">인기 혜택</h4>
           <button className="text-[12px] font-black text-var(--text-muted) uppercase tracking-widest opacity-60">전체보기</button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {filteredBenefits.map((b, i) => (
             <div key={i} className="p-6 rounded-[36px] bg-white border border-gray-50 shadow-lg group active:scale-[0.95] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-rose-500 mb-4 shadow-inner group-hover:scale-110 transition-transform">
                   {b.type.includes('카페') ? <Gift size={22} /> : <Tag size={22} />}
                </div>
                <p className="text-[15px] font-black text-var(--text-strong) mb-1">{b.name}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-bold text-var(--text-soft) opacity-60">{b.type}</span>
                   <span className="text-[12px] font-black text-rose-500">{b.rate}</span>
                </div>
             </div>
           ))}
           {filteredBenefits.length === 0 && (
             <div className="col-span-2 py-10 text-center text-gray-400 font-bold">
               검색 결과가 없습니다 🔍
             </div>
           )}
        </div>
      </div>

      {/* Fixed Card Recommendation Section */}
      <div className="p-8 rounded-[48px] bg-rose-50 border border-rose-100 flex items-center gap-6">
         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-lg">
            <Percent size={28} strokeWidth={3} />
         </div>
         <div className="flex-1">
            <p className="text-[15px] font-black text-var(--text-strong)">나의 소비패턴 분석</p>
            <p className="text-[12px] font-medium text-rose-500">평균 2.4만원 더 아낄 수 있어요</p>
         </div>
         <ChevronRight size={20} className="text-rose-200" />
      </div>
    </div>
  );
}
