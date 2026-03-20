'use client';

import React from 'react';
import { CreditCard, ChevronRight } from 'lucide-react';
import { PerformanceTrack, TransactionItem } from '@/components/mobile/cards';
import { WeeklyBarChart, SimplePieChart, BucketChart, WordCloud, RadialGauge } from '@/components/mobile/charts';
import { SAMPLE_USER } from '@/lib/sampleData';
import { CategoryData, Bucket, Transaction } from '@/types/mobile';

interface HomeViewProps {
  visibleSections: string[];
  categories: CategoryData[];
  buckets: Bucket[];
  transactions: Transaction[];
  setSelectedTx: (tx: Transaction) => void;
  router: any;
}

export function HomeView({
  visibleSections,
  categories,
  buckets,
  transactions,
  setSelectedTx,
  router
}: HomeViewProps) {
  const recentTransactions = transactions.slice(0, 3);
  

  return (
    <div className="space-y-6">
      {/* Asset Summary Section */}
      {visibleSections.includes('balance') && (
        <section className="animate-fade-in group">
          <div className="relative rounded-[48px] p-7 overflow-hidden shadow-[0_45px_100px_-20px_rgba(244,63,94,0.4)] border border-white/20"
            style={{ 
              background: 'linear-gradient(145deg, #1e1b4b 0%, #4338ca 40%, #f43f5e 100%)',
            }}>
            {/* Animated Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
            
            <div className="flex justify-between items-end mb-2 relative z-10 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <p className="text-[14px] font-black text-white uppercase tracking-[0.1em] drop-shadow-sm">종합 지출 내역</p>
                </div>
                <h2 className="text-[42px] font-black text-white tracking-tighter drop-shadow-2xl leading-none mb-4">
                  ₩{SAMPLE_USER.monthlySpend.toLocaleString()}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-white/50 bg-white/10 border border-white/20 px-3 py-1.5 rounded-[12px] uppercase">남은 예산</span>
                  <p className="text-[15px] font-black text-emerald-400 drop-shadow-sm">
                    ₩{(SAMPLE_USER.monthlyBudget - SAMPLE_USER.monthlySpend).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 relative z-10 transition-all">
                
                {/* Radial Progress */}
                <div className="flex flex-col items-center gap-2 mr-1">
                  <RadialGauge 
                    percent={Math.round((SAMPLE_USER.monthlySpend / SAMPLE_USER.monthlyBudget) * 100)} 
                    id="main-asset" 
                    size={84} 
                  />
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-rose-400 w-2/3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fill/Send buttons removed per request */}
            
            <div className="absolute right-[-20px] bottom-[-20px] p-8 scale-[2.5] opacity-5 pointer-events-none rotate-[25deg]">
              <CreditCard size={120} />
            </div>
          </div>
        </section>
      )}
      
      {/* Performance Track Section */}
      {visibleSections.includes('performance') && (
        <PerformanceTrack 
          current={SAMPLE_USER.monthlySpend} 
          tiers={[
            { label: '30만원', benefit: '5% 할인', amount: 300000 }, 
            { label: '50만원', benefit: '추가적립', amount: 500000 }, 
            { label: '100만원', benefit: 'VIP 혜택', amount: 1000000 }
          ]} 
          cardName="현대카드 (메인 소비 실적)" 
        />
      )}

      {/* Weekly Pattern Chart */}
      {visibleSections.includes('weekly') && (
        <section className="p-7 rounded-[40px] bg-white border border-gray-100 shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">주간 소비 패턴</h3>
            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 uppercase tracking-widest">이번주</span>
          </div>
          <WeeklyBarChart />
        </section>
      )}

      {/* 2-Column Split: Category & Goal */}
      <div className="grid grid-cols-2 gap-5 px-1">
        {visibleSections.includes('category') && (
          <div className="p-7 rounded-[48px] bg-white border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in hover:shadow-2xl hover:-translate-y-1 duration-500" style={{ animationDelay: '0.4s' }}>
             <h3 className="text-[16px] font-black text-gray-800 tracking-tighter mb-4">카테고리</h3>
             <div className="scale-[0.9] origin-center relative">
               <div className="absolute inset-0 bg-rose-500/5 blur-2xl rounded-full scale-150" />
               <SimplePieChart data={categories} />
             </div>
             <div className="mt-5">
                <p className="text-[15px] font-black text-gray-800">식사 30%</p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-rose-400" />
                   <p className="text-[11px] font-bold text-gray-400">가장 높은 비중</p>
                </div>
             </div>
          </div>
        )}

        {visibleSections.includes('goal') && (
          <div className="p-7 rounded-[48px] bg-white border border-gray-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in hover:shadow-2xl hover:-translate-y-1 duration-500" style={{ animationDelay: '0.5s' }}>
             <h3 className="text-[16px] font-black text-gray-800 tracking-tighter mb-4">이달의 목표</h3>
             <div className="scale-[1.0] origin-center relative">
               <div className="absolute inset-0 bg-rose-500/5 blur-2xl rounded-full scale-150" />
               <BucketChart buckets={buckets} compact />
             </div>
             <div className="mt-5">
                <p className="text-[15px] font-black text-rose-500">62% 달성</p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-rose-400" />
                   <p className="text-[11px] font-bold text-gray-400">18.6만 / 30만</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* AI Insights Word Cloud */}
      <section className="mt-2 mb-2 px-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">소비 키워드 인사이트</h3>
          <div className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest">AI 분석</div>
        </div>
        <WordCloud />
      </section>

      {/* Recent Transactions List */}
      {visibleSections.includes('recent') && (
        <section className="space-y-5 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">최근 지출 내역</h3>
            <button 
              onClick={() => router.push('/mobile/ledger')}
              className="text-[12px] font-black text-rose-500 flex items-center gap-1 active:scale-90 transition-transform"
            >
              전체보기 <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden divide-y divide-gray-50">
            {recentTransactions.map((tx, idx) => (
              <TransactionItem 
                key={tx.id} 
                tx={tx} 
                onClick={() => setSelectedTx(tx)}
                delay={0.1 * idx}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
