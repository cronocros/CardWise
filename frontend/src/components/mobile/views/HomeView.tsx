'use client';

import React from 'react';
import { CreditCard, ChevronRight, Settings } from 'lucide-react';
import { PerformanceTrack, TransactionItem } from '@/components/mobile/cards';
import { WeeklyBarChart, SimplePieChart, BucketChart, WordCloud, RadialGauge } from '@/components/mobile/charts';
import { SAMPLE_USER } from '@/lib/sampleData';
import { CategoryData, Bucket, Transaction } from '@/types/mobile';

interface HomeViewProps {
  visibleSections: string[];
  categories: CategoryData[];
  buckets: Bucket[];
  transactions: Transaction[];
  setShowEditHome: (val: boolean) => void;
  setShowAssetAction: (val: 'fill' | 'send' | null) => void;
  setSelectedTx: (tx: Transaction) => void;
  router: any; // NextRouter typing is complex with App Router, keeping any for now but documented
}

export function HomeView({
  visibleSections,
  categories,
  buckets,
  transactions,
  setShowEditHome,
  setShowAssetAction,
  setSelectedTx,
  router
}: HomeViewProps) {
  const recentTransactions = transactions.slice(0, 3);
  
  // Use router to handle navigation if needed
  const handleSettingsClick = () => {
    setShowEditHome(true);
  };

  return (
    <div className="space-y-6">
      {/* Asset Summary Section */}
      {visibleSections.includes('balance') && (
        <section className="animate-fade-in">
          <div className="relative rounded-[40px] p-8 overflow-hidden shadow-[0_35px_70px_-15px_rgba(244,63,94,0.35)] border-t border-white/30"
            style={{ 
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 30%, #f43f5e 100%)',
            }}>
            {/* Animated Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
            
            <div className="flex justify-between items-center mb-10 relative z-10 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <p className="text-[12px] font-black text-rose-100/60 uppercase tracking-[0.25em]">종합 지출 내역</p>
                </div>
                <h2 className="text-[38px] font-black text-white tracking-tighter drop-shadow-2xl leading-none mb-3">
                  ₩{SAMPLE_USER.monthlySpend.toLocaleString()}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-tighter">Budget Left</span>
                  <p className="text-[12px] font-black text-emerald-400 drop-shadow-sm">
                    ₩{(SAMPLE_USER.monthlyBudget - SAMPLE_USER.monthlySpend).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 relative z-10 transition-all">
                <button 
                  onClick={handleSettingsClick}
                  className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-75 transition-transform"
                >
                  <Settings className="text-white w-5 h-5" />
                </button>
                
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

            <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setShowAssetAction('fill')}
                className="flex-1 h-16 rounded-[24px] bg-white text-rose-600 font-black text-[16px] shadow-[0_10px_30px_rgba(255,255,255,0.2)] active:scale-95 hover:bg-rose-50 transition-all border-b-4 border-rose-100"
              >
                채우기
              </button>
              <button 
                onClick={() => setShowAssetAction('send')}
                className="flex-1 h-16 rounded-[24px] bg-white/10 backdrop-blur-xl text-white font-black text-[16px] border border-white/20 active:scale-95 hover:bg-white/20 transition-all"
              >
                보내기 
              </button>
            </div>
            
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
      <div className="grid grid-cols-2 gap-4">
        {visibleSections.includes('category') && (
          <div className="p-6 rounded-[40px] bg-white border border-gray-100 shadow-lg flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in" style={{ animationDelay: '0.4s' }}>
             <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest opacity-30 mb-4">Categories</h3>
             <div className="scale-[0.8] origin-center">
               <SimplePieChart data={categories} />
             </div>
             <div className="mt-4">
                <p className="text-[14px] font-black text-gray-800">식사 30%</p>
                <p className="text-[10px] font-bold text-gray-400">가장 높은 비중</p>
             </div>
          </div>
        )}

        {visibleSections.includes('goal') && (
          <div className="p-6 rounded-[40px] bg-gradient-to-br from-white to-rose-50/20 border border-gray-100 shadow-lg flex flex-col items-center justify-between text-center group active:scale-[0.98] transition-all animate-fade-in" style={{ animationDelay: '0.5s' }}>
             <h3 className="text-[12px] font-black text-gray-800 uppercase tracking-widest opacity-30 mb-4">Monthly Goal</h3>
             <div className="scale-[0.9] origin-center">
               <BucketChart buckets={buckets} compact />
             </div>
             <div className="mt-4">
                <p className="text-[14px] font-black text-rose-500">62% 달성</p>
                <p className="text-[10px] font-bold text-gray-400">18.6만 / 30만</p>
             </div>
          </div>
        )}
      </div>

      {/* AI Insights Word Cloud */}
      <section className="mt-2 mb-2 px-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[17px] font-black text-gray-800 tracking-tighter">소비 키워드 인사이트</h3>
          <div className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest">AI Analysis</div>
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
