'use client';

import React from 'react';
import { Search, Sparkles, ChevronRight, Gift, Tag, Percent } from 'lucide-react';

export function BenefitsView() {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const recommendations = [
    { title: '오늘의 AI 추천', desc: '커피 50% 할인 카드 혜택이 곧 만료됩니다!', icon: '☕', color: 'from-amber-400 to-orange-500' },
    { title: '깜짝 리워드', desc: '이번 주말 마트 결제 시 5천원 페이백', icon: '🎁', color: 'from-rose-400 to-pink-500' },
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
      <div className="relative p-8 rounded-[48px] bg-var(--text-strong) overflow-hidden shadow-2xl group active:scale-[0.98] transition-all">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 blur-[80px]" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[60px]" />
        
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-rose-400 animate-pulse" />
              <span className="text-[12px] font-black text-rose-400 uppercase tracking-[0.2em]">AI Intelligence</span>
           </div>
           <h3 className="text-[22px] font-black text-white tracking-tighter leading-tight mb-6">
             김카드 님께 딱 맞는<br/>
             <span className="text-rose-500">이달의 원픽 혜택</span>은?
           </h3>
           <div className="flex gap-4">
              {recommendations.map((r, i) => (
                <div key={i} className="flex-1 p-5 rounded-[28px] bg-white/5 border border-white/10 backdrop-blur-md">
                   <div className="text-2xl mb-3">{r.icon}</div>
                   <p className="text-white text-[13px] font-black tracking-tight leading-snug">{r.desc}</p>
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
