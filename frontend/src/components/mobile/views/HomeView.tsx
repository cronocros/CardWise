'use client';

import React from 'react';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { PerformanceTrack, TransactionItem } from '@/components/mobile/cards';
import { SimplePieChart, BucketChart, WordCloud, RadialGauge } from '@/components/mobile/charts';
import { SAMPLE_USER } from '@/lib/sampleData';
import { CategoryData, Bucket, Transaction } from '@/types/mobile';

interface HomeViewProps {
  visibleSections: string[];
  categories: CategoryData[];
  buckets: Bucket[];
  transactions: Transaction[];
  setSelectedTx: (tx: Transaction) => void;
  router: { push: (path: string) => void };
  monthlySpend?: number;
}

export function HomeView({
  visibleSections,
  categories,
  buckets,
  transactions,
  setSelectedTx,
  router,
  monthlySpend = SAMPLE_USER.monthlySpend,
}: HomeViewProps) {
  const recentTransactions = transactions.slice(0, 3);
  const currentMonth = new Date().getMonth() + 1;
  

  return (
    <div className="space-y-6">
      {visibleSections.map((sectionId) => {
        if (sectionId === 'balance') {
          return (
            <section key="balance" className="animate-fade-in group px-1">
              <div className="relative rounded-[40px] px-6 py-6 overflow-hidden shadow-[0_30px_60px_-15px_rgba(30,27,75,0.4)] border border-white/10 active:scale-[0.98] transition-transform duration-500 bg-slate-900"
                style={{ 
                  background: 'radial-gradient(120% 120% at 0% 0%, #1e1b4b 0%, #312e81 40%, #701a75 100%)',
                }}>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] group-hover:bg-rose-500/30 transition-colors duration-700" />
                <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-indigo-500/30 rounded-full blur-[60px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-[mobile-shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />
                
                <div className="flex justify-between items-center relative z-10 transition-all gap-4">
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                      <p className="text-[13px] font-bold text-white/70 uppercase tracking-widest leading-none mt-0.5">
                        종합 지출 내역 <span className="text-[10px] font-medium text-white/50 lowercase ml-1">({currentMonth}월 기준)</span>
                      </p>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-5 whitespace-nowrap">
                      <h2 className="text-[36px] font-black text-white tracking-tighter drop-shadow-lg leading-none truncate">
                        {monthlySpend.toLocaleString()}
                      </h2>
                      <span className="text-[20px] font-bold text-white/90 drop-shadow-md">원</span>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md w-max shadow-inner whitespace-nowrap">
                      <span className="text-[10px] font-black text-white/70 tracking-widest uppercase flex-shrink-0">이번 달 목표 현황</span>
                      <div className="w-px h-3 bg-white/20" />
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">3개중 2개</span>
                        <span className="text-[11px] font-bold text-emerald-400/80 mr-1">달성</span>
                        <span className="text-[10px] font-bold text-white/50">(1개 남음)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center relative z-10 w-[90px] flex-shrink-0 min-w-max -mt-2 -mr-3">
                    <div className="relative group-hover:scale-105 transition-transform duration-500 flex justify-center w-full">
                      <RadialGauge percent={66} id="main-asset" size={80} />
                    </div>
                  </div>
                </div>
                
                <div className="absolute right-[-20px] bottom-[-20px] p-8 scale-[2.5] opacity-[0.03] pointer-events-none rotate-[15deg] group-hover:rotate-[20deg] group-hover:scale-[2.8] transition-all duration-700">
                  <CreditCard size={120} />
                </div>
              </div>
            </section>
          );
        }

        if (sectionId === 'performance') {
          return (
            <div key="performance" className="px-1 animate-fade-in translate-y-0 opacity-100">
              <PerformanceTrack 
                current={monthlySpend} 
                tiers={[
                  { label: '30만원', benefit: '5% 할인', amount: 300000 }, 
                  { label: '50만원', benefit: '추가적립', amount: 500000 }, 
                  { label: '100만원', benefit: 'VIP 혜택', amount: 1000000 }
                ]} 
                cardName="현대카드 (메인 소비 실적)" 
              />
            </div>
          );
        }

        if (sectionId === 'analytics') {
          return (
            <div key="analytics" className="grid grid-cols-2 gap-4 px-1 pb-2">
              <div className="px-5 py-6 rounded-[48px] bg-white border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in hover:shadow-2xl duration-500">
                <h3 className="text-[16px] font-black text-gray-800 tracking-tighter mb-2">카테고리</h3>
                <div className="scale-[0.8] origin-center relative">
                  <div className="absolute inset-0 bg-rose-500/5 blur-2xl rounded-full scale-150" />
                  <SimplePieChart data={categories} />
                </div>
                <div className="mt-3">
                  <p className="text-[14px] font-black text-gray-800">식사 30%</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-rose-400" />
                    <p className="text-[10px] font-bold text-gray-400 leading-none">가장 높음</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-6 rounded-[48px] bg-white border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in hover:shadow-2xl duration-500">
                <h3 className="text-[16px] font-black text-gray-800 tracking-tighter mb-2">이달의 목표</h3>
                <div className="scale-[0.9] origin-center relative">
                  <div className="absolute inset-0 bg-rose-500/5 blur-2xl rounded-full scale-150" />
                  <BucketChart buckets={buckets} compact />
                </div>
                <div className="mt-3">
                  <p className="text-[14px] font-black text-rose-500">62% 달성</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-rose-400" />
                    <p className="text-[10px] font-bold text-gray-400 leading-none">목표 진행중</p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (sectionId === 'weekly') {
          return (
            <div key="weekly" className="px-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {/* Note: WeeklyBarChart would be rendered here if we choose to make it reorderable too, 
                  but user mentioned "homescreen edit" which usually refers to these cards. */}
            </div>
          );
        }

        if (sectionId === 'insights') {
          return (
            <section key="insights" className="mt-2 mb-2 px-1 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white rounded-[40px] px-6 py-6 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] group active:scale-[0.98] transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">소비 키워드</h3>
                  <div className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest">AI 분석</div>
                </div>
                <WordCloud />
              </div>
            </section>
          );
        }

        if (sectionId === 'recent') {
          return (
            <section key="recent" className="space-y-5 animate-fade-in px-1 pt-2" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white rounded-[32px] px-5 py-6 border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">최근 지출 내역</h3>
                  <button 
                    onClick={() => router.push('/mobile/ledger')}
                    className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 active:scale-90 transition-transform outline-none"
                  >
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50/50">
                  {recentTransactions.map((tx, idx) => (
                    <TransactionItem 
                      key={tx.id} 
                      tx={tx} 
                      onClick={() => setSelectedTx(tx)}
                      delay={0.1 * idx}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
