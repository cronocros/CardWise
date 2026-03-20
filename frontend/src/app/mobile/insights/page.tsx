'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Brain, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Insights Page — AI 소비 인사이트
// ─────────────────────────────────────────────────────────────

const SPENDING_BY_CATEGORY = [
  { name: '식사', amount: 89000, pct: 32, color: '#f97316', change: 8 },
  { name: '쇼핑', amount: 74000, pct: 27, color: '#a855f7', change: -15 },
  { name: '교통', amount: 42000, pct: 15, color: '#3b82f6', change: 0 },
  { name: '카페', amount: 38000, pct: 14, color: '#f43f5e', change: 12 },
  { name: '기타', amount: 34000, pct: 12, color: '#94a3b8', change: 0 },
];

const WEEKLY = [45000, 62000, 38000, 71000, 55000, 88000, 43000];
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const maxWeekly = Math.max(...WEEKLY);

const AI_INSIGHTS = [
  {
    id: 1,
    type: 'alert',
    icon: '⚠️',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    title: '카페 지출이 급증했어요',
    desc: '이번 달 카페 지출이 지난달보다 12% 증가했어요. 구독 서비스나 텀블러 지참으로 절약할 수 있어요.',
  },
  {
    id: 2,
    type: 'tip',
    icon: '💡',
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    title: '신한카드로 바꾸면 5,200원 아껴요',
    desc: '이번 달 쇼핑 패턴 기준, 신한카드 Deep Dream으로 결제하면 추가 절약 가능합니다.',
  },
  {
    id: 3,
    type: 'positive',
    icon: '🎉',
    color: '#f43f5e',
    bg: '#fff1f2',
    border: '#fecdd3',
    title: '교통비 절약에 성공했어요!',
    desc: '지난달 대비 교통비 지출을 15% 줄였습니다. 이 추세를 유지하면 연간 약 50,000원 절약!',
  },
];

export default function InsightsPage() {
  const router = useRouter();
  const [highlightedBar, setHighlightedBar] = useState(5);
  const [animBars, setAnimBars] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimBars(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-gray-800 bg-white sticky top-0 z-50">
        <span>9:41</span><span className="opacity-40">75%</span>
      </div>

      {/* Header */}
      <div className="bg-white px-5 pt-2 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">AI Analysis</p>
            <h1 className="text-[24px] font-black text-gray-800 tracking-tighter -mt-0.5">소비 인사이트</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Brain size={18} className="text-rose-500" />
          </div>
        </div>

        {/* Month Summary */}
        <div className="p-5 rounded-[28px] border border-gray-50 shadow-md" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">이번달 총 지출</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-[38px] font-black text-white tracking-tighter">277,000</span>
            <span className="text-[16px] font-bold text-white/60">원</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[12px] font-black text-white/80">
              <TrendingDown size={14} className="text-emerald-300" />
              전월 대비 -8.4%
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-black text-white/80">
              <TrendingUp size={14} className="text-rose-300" />
              예산 84% 사용
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-28 space-y-5">
        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-[28px] p-6 border border-gray-50 shadow-md">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[15px] font-black text-gray-800">이번주 일별 지출</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">7일 trend</p>
          </div>
          <div className="flex items-end gap-2 h-28 mb-3">
            {WEEKLY.map((v, i) => {
              const h = (v / maxWeekly) * 100;
              const isActive = i === highlightedBar;
              return (
                <button key={i} onClick={() => setHighlightedBar(i)}
                  className="flex-1 flex flex-col items-center gap-1 group">
                  {isActive && (
                    <span className="text-[10px] font-black text-rose-500 mb-1">{(v / 1000).toFixed(0)}K</span>
                  )}
                  <div className="w-full rounded-t-xl transition-all duration-700 relative"
                    style={{
                      height: animBars ? `${h}%` : '0%',
                      background: isActive ? 'linear-gradient(180deg, #fb7185, #f43f5e)' : '#f1f5f9',
                      boxShadow: isActive ? '0 4px 12px rgba(244,63,94,0.3)' : 'none',
                      minHeight: '4px',
                    }} />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            {DAY_LABELS.map((d, i) => (
              <p key={i} className={`flex-1 text-center text-[11px] font-black ${i === highlightedBar ? 'text-rose-500' : 'text-gray-300'}`}>{d}</p>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-[28px] p-6 border border-gray-50 shadow-md">
          <p className="text-[15px] font-black text-gray-800 mb-5">카테고리별 지출</p>
          <div className="space-y-4">
            {SPENDING_BY_CATEGORY.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[13px] font-black text-gray-700">{cat.name}</span>
                    {cat.change !== 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${cat.change > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {cat.change > 0 ? '+' : ''}{cat.change}%
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-black text-gray-800">{cat.amount.toLocaleString()}원</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ width: animBars ? `${cat.pct}%` : '0%', background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <Lightbulb size={14} className="text-rose-500" />
            <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">AI 추천 인사이트</p>
          </div>
          <div className="space-y-3">
            {AI_INSIGHTS.map(insight => (
              <div key={insight.id}
                className="rounded-[24px] p-5 border flex items-start gap-4 cursor-pointer active:scale-[0.98] transition-all"
                style={{ background: insight.bg, borderColor: insight.border }}>
                <div className="w-11 h-11 rounded-[16px] flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${insight.color}20` }}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-black mb-1" style={{ color: insight.color }}>{insight.title}</p>
                  <p className="text-[12px] text-gray-500 font-bold leading-relaxed">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Savings */}
        <div className="p-6 rounded-[28px] text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-xl" style={{ background: 'white' }} />
          <p className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-2">연간 예상 절약</p>
          <p className="text-[40px] font-black tracking-tighter mb-1">186,000<span className="text-[20px] font-bold text-white/70 ml-1">원</span></p>
          <p className="text-[13px] font-bold text-white/60">현재 패턴 유지 시 연간 총 절약 예측</p>
        </div>
      </div>
    </div>
  );
}
