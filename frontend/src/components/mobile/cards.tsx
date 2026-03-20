'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { RadialGauge } from './charts';
import { Transaction, Card, Tier } from '@/types/mobile';


// ─────────────────────────────────────────────────────────────
// Utility: Format Currency to Man-won / Chun-won (Native App Style)
// ─────────────────────────────────────────────────────────────
const formatKRWFull = (amount: number) => {
  if (amount === 0) return '0원';
  
  const man = Math.floor(amount / 10000);
  const rest = Math.round((amount % 10000) / 1000);
  
  if (man > 0 && rest > 0) return `${man}만 ${rest}천원`;
  if (man > 0) return `${man}만원`;
  if (rest > 0) return `${rest}천원`;
  return `${amount.toLocaleString()}원`;
};

const BrandLogo = ({ brand }: { brand: string }) => {
  switch (brand.toLowerCase()) {
    case 'visa':
      return <span className="text-[15px] font-black italic text-white tracking-tighter drop-shadow-sm">VISA</span>;
    case 'mastercard':
      return (
        <div className="flex items-center -space-x-2.5 translate-x-1">
          <div className="w-5 h-5 rounded-full bg-[#EB001B]" />
          <div className="w-5 h-5 rounded-full bg-[#F79E1B]/90" />
        </div>
      );
    case 'amex':
      return (
        <div className="w-7 h-5 bg-[#016FD0] rounded-[2px] flex items-center justify-center border border-white/20">
          <span className="text-[7px] font-black text-white italic">AMEX</span>
        </div>
      );
    case 'unionpay':
      return (
        <div className="flex flex-col gap-[1px]">
           <div className="w-6 h-1 bg-[#004A99] rounded-t-[1px]" />
           <div className="w-6 h-1 bg-[#EE1C25]" />
           <div className="w-6 h-1 bg-[#009245] rounded-b-[1px]" />
        </div>
      );
    case 'jcb':
      return (
        <div className="flex gap-[1.5px]">
           <div className="w-2.5 h-4.5 bg-[#004289] rounded-sm" />
           <div className="w-2.5 h-4.5 bg-[#E50012] rounded-sm" />
           <div className="w-2.5 h-4.5 bg-[#009036] rounded-sm" />
        </div>
      );
    case 'local':
      return <span className="text-[12px] font-black text-rose-500 drop-shadow-sm">BC</span>;
    default:
      return <span className="text-[10px] font-black text-white italic tracking-tighter uppercase">{brand}</span>;
  }
};

// ─────────────────────────────────────────────────────────────
// Balance Card
// ─────────────────────────────────────────────────────────────
interface BalanceCardProps {
  amount: number;
  savings: number;
}

export function BalanceCard({ amount, savings }: BalanceCardProps) {
  const [show, setShow] = useState(true);

  return (
    <div 
      className="p-7 rounded-[32px] mb-4 bg-white border border-var(--primary-200) tappable shadow-lg animate-spring" 
      style={{ 
        background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(255,245,245,0.95))',
        boxShadow: 'var(--shadow-card)' 
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.15em] flex-1">이번 달 총 지출</span>
        <button 
          onClick={() => setShow(!show)} 
          className="w-10 h-10 flex items-center justify-center bg-var(--primary-50) rounded-2xl text-var(--primary-400) active:scale-90 transition-transform"
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      <div className="flex items-baseline gap-2 mb-6">
        <span 
          className={`text-[42px] font-display font-black text-var(--text-strong) tracking-tighter transition-all duration-700 ${!show ? 'blur-2xl opacity-10' : ''}`}
        >
          {show ? amount.toLocaleString() : '888,888'}
        </span>
        <span className={`text-xl font-black text-var(--text-main) ${!show ? 'opacity-20' : ''}`}>원</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-md border border-var(--primary-100) rounded-[24px] p-4 shadow-sm group active:bg-var(--primary-50) transition-colors">
          <p className="text-[10px] font-black text-var(--text-muted) uppercase tracking-widest mb-1.5 opacity-60">절약 혜택</p>
          <p className="text-[15px] font-black text-var(--primary-500)">+{formatKRWFull(savings)}</p>
        </div>
        <div className="bg-emerald-50/80 backdrop-blur-md border border-emerald-100 rounded-[24px] p-4 shadow-sm">
          <p className="text-[10px] font-black text-var(--text-muted) uppercase tracking-widest mb-1.5 opacity-60">전월 대비</p>
          <p className="text-[15px] font-black text-emerald-600">-12.4%</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Performance Track — Node-Based Tier Track (Alignment Perfect)
// ─────────────────────────────────────────────────────────────
interface PerformanceTrackProps {
  current: number;
  tiers: Tier[];
  cardName?: string;
}

export function PerformanceTrack({ current, tiers, cardName = '삼성카드 iD SIMPLE' }: PerformanceTrackProps) {
  const maxAmount = tiers[tiers.length - 1].amount;
  const progressPercent = Math.min((current / maxAmount) * 100, 100);
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(progressPercent), 300);
    return () => clearTimeout(t);
  }, [progressPercent]);

  // All nodes: start at 0, then each tier
  const nodes = [
    { amount: 0, label: '시작', benefit: '' },
    ...tiers,
  ];

  const currentTier = tiers.filter(t => current >= t.amount).slice(-1)[0];
  const nextTier = tiers.find(t => current < t.amount);

  return (
    <div className="p-7 rounded-[32px] bg-white border border-var(--primary-100) shadow-lg animate-spring" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-black text-var(--text-strong) tracking-tight">이번달 실적 달성 현황</h3>
          <p className="text-[11px] text-var(--text-soft) font-bold mt-0.5 opacity-60">{cardName}</p>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-black text-var(--primary-500) font-display tracking-tighter">{formatKRWFull(current)}</p>
          <p className="text-[10px] font-bold text-var(--text-muted) opacity-40 uppercase tracking-widest">이번달 사용</p>
        </div>
      </div>

      {/* Node Track */}
      <div className="relative py-8">
        {/* Progress Bar Background (absolutely positioned under nodes) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 px-6">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: `${animPct}%`,
                background: 'linear-gradient(90deg, #fda4af, #f43f5e)',
                boxShadow: '0 0 12px rgba(244,63,94,0.5)',
              }}
            />
          </div>
        </div>

        {/* Nodes (flex row, evenly distributed) */}
        <div className="relative z-10 flex justify-between items-center">
          {nodes.map((node, i) => {
            const isStart = i === 0;
            const isReached = current >= node.amount;
            return (
              <div key={i} className="flex flex-col items-center gap-0" style={{ minWidth: 0 }}>
                {/* Node circle */}
                <div
                  className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-700 shadow-md relative z-20 ${
                    isStart
                      ? 'bg-gray-100 border-gray-200'
                      : isReached
                      ? 'bg-rose-500 border-white scale-110'
                      : 'bg-white border-gray-200'
                  }`}
                  style={isReached && !isStart ? { boxShadow: '0 0 16px rgba(244,63,94,0.5), inset 0 1px 2px rgba(255,255,255,0.4)' } : {}}
                >
                  {isStart ? (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  ) : isReached ? (
                    <svg viewBox="0 0 12 12" fill="white" className="w-3 h-3">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </div>

                {/* Label below node */}
                <div className="mt-3 text-center" style={{ width: '52px' }}>
                  <p className={`text-[11px] font-black leading-tight ${isReached && !isStart ? 'text-rose-500' : 'text-gray-400'}`}>
                    {isStart ? '0원' : formatKRWFull(node.amount)}
                  </p>
                  {!isStart && (
                    <p className={`text-[9px] font-bold mt-0.5 leading-tight ${isReached ? 'text-rose-400' : 'text-gray-300'}`}>
                      {isReached ? '달성 ✓' : node.benefit}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between pt-4 border-t border-gray-50">
        <div>
          {currentTier ? (
            <p className="text-[12px] font-bold text-var(--text-main)">
              현재 구간: <span className="text-rose-500 font-black">{currentTier.label} 달성</span>
            </p>
          ) : (
            <p className="text-[12px] font-bold text-gray-400">아직 달성한 구간이 없어요</p>
          )}
          {nextTier && (
            <p className="text-[11px] text-var(--text-muted) opacity-50 mt-0.5">
              다음까지 <span className="font-black">{formatKRWFull(nextTier.amount - current)}</span> 남음
            </p>
          )}
        </div>
        <div className="px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100">
          <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">D-12</span>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Transaction Item
// ─────────────────────────────────────────────────────────────
export function TransactionItem({ tx, onClick, delay = 0 }: { tx: Transaction; onClick?: () => void; delay?: number }) {

  const bgMap: Record<string, string> = {
    '카페': 'bg-rose-50 border-rose-100',
    '쇼핑': 'bg-purple-50 border-purple-100',
    '교통': 'bg-blue-50 border-blue-100',
    '식비': 'bg-orange-50 border-orange-100',
    '수입': 'bg-emerald-50 border-emerald-100',
  };

  const isIncome = tx.type === 'income';

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 py-5 border-b border-gray-50 last:border-0 group cursor-pointer active:bg-gray-50/50 transition-all rounded-[24px] px-2 -mx-1 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div 
        className={`w-12 h-12 rounded-[20px] flex items-center justify-center text-xl flex-shrink-0 transition-all group-hover:scale-110 shadow-sm border ${bgMap[tx.category] || 'bg-gray-100 border-gray-200'}`} 
      >
        {tx.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-black text-var(--text-strong) tracking-tighter truncate leading-none">
            {tx.name || '가맹점 정보 없음'}
          </span>
          <span className="text-[10px] font-bold text-gray-300 opacity-60">
            {tx.category}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5 focus-within:opacity-100 transition-opacity">
           {tx.tags?.map((tag, i) => (
             <span key={i} className="text-[9px] font-black text-rose-400 capitalize bg-rose-50/50 px-1.5 py-0.5 rounded-lg border border-rose-100/50">
               #{tag}
             </span>
           ))}
        </div>
        <div className="flex items-center gap-1.5 opacity-40">
          <span className="text-[9px] text-var(--text-soft) font-black tracking-tight font-mono">
            {(() => {
              const date = new Date(tx.date);
              if (isNaN(date.getTime())) return tx.date;
              return date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
            })()}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
          <span className="text-[9px] text-var(--text-soft) font-bold truncate">
            {tx.card}
          </span>
        </div>
      </div>
      <div className="text-right pl-2">
        <div className={`text-[17px] font-display font-black tracking-tight ${isIncome ? 'text-emerald-500' : 'text-var(--text-strong)'}`}>
          {isIncome ? '+' : '-'}{tx.currency === 'USD' ? '$' : ''}{tx.amount.toLocaleString()}<span className="text-[12px] ml-0.5 font-bold">{tx.currency === 'KRW' ? '원' : ''}</span>
        </div>
        {tx.benefitInfo && (
          <div className="text-[9px] text-rose-500 font-black mt-1 bg-rose-50 px-2 py-0.5 rounded-full inline-block border border-rose-100 animate-pulse">
            {tx.benefitInfo}
            {tx.discount && (
              <span className="text-[8px] ml-1 opacity-70">(-{tx.discount.toLocaleString()}원)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Credit Card Component (Flip Animation + Brand/Tier)
// ─────────────────────────────────────────────────────────────
export function CreditCardComponent({ card, onPerformanceClick }: { card: Card; onPerformanceClick?: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [backView, setBackView] = useState<'benefits' | 'vouchers'>('benefits');

  const SAMPLE_VOUCHERS = [
    { title: '더 라운지 멤버십', info: '전 세계 라운지 연 2회권', date: '2024.12.31' },
    { title: '부티크 호텔 숙박권', info: '국내 지정 호텔 1박권', date: '2024.11.15' },
    { title: '프리미엄 기프트 15만', info: '신세계/롯데 상품권 교환', date: '2024.10.20' },
    { title: '공항 발렛파킹 무료', info: '인천/김포공항 월 3회', date: '2024.09.30' }
  ];

  const tierColors: Record<string, string> = {
    classic: 'text-gray-400',
    gold: 'text-amber-400',
    platinum: 'text-rose-300',
    signature: 'text-emerald-300',
    infinite: 'text-rose-500',
    world: 'text-blue-400',
    world_elite: 'text-purple-400'
  };

  return (
    <div className="mb-6 px-1">
      {/* 3D Dynamic Expanding Card Wrapper */}
      <div 
        className={`relative w-full transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] cursor-pointer group z-10`}
        style={{ 
          perspective: '1200px',
          height: isFlipped ? '280px' : '176px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsFlipped(!isFlipped);
        }}
      >
        <div 
          className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]`}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front Side */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[32px] p-6 shadow-xl backface-hidden flex flex-col justify-between overflow-hidden"
            style={{ 
              background: card.cardImageUrl ? `url(${card.cardImageUrl}) center/cover no-repeat` : card.gradient,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-40 mix-blend-overlay" />
            
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm flex items-center justify-center">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${tierColors[card.tier] || 'text-white/60'} drop-shadow-md`}>
                        {card.tier.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <BrandLogo brand={card.brand} />
                  </div>
                  <h4 className="text-[13px] font-black text-white tracking-tight drop-shadow-md">{card.name}</h4>
               </div>
            </div>

            <div className="flex items-center gap-2.5 z-10">
               <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <div className="w-4 h-3 bg-amber-400/80 rounded-[2px]" />
               </div>
               <div className="text-[9px] text-white/40 font-black tracking-widest uppercase flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
                  컨택리스 결제
               </div>
            </div>
          </div>

          {/* Back Side (Expanded Content) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[32px] p-5 shadow-2xl transition-all duration-300 border border-white/10"
            style={{ 
              background: 'linear-gradient(135deg, #121212 0%, #000000 100%)', 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Back Header with Modern Toggle */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex flex-col">
                  <h5 className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">
                    {backView === 'benefits' ? '카드 주요 혜택' : '주요 바우처 정보'}
                  </h5>
                  <div className={`h-0.5 w-6 mt-1.5 rounded-full shadow-lg transition-all ${backView === 'benefits' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                </div>
                                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setBackView(backView === 'benefits' ? 'vouchers' : 'benefits'); 
                  }}
                  className={`border px-3 py-1.5 rounded-xl active:scale-90 transition-all flex items-center gap-2 group shadow-xl ${
                    backView === 'benefits' ? 'bg-white/10 border-white/10' : 'bg-emerald-500/20 border-emerald-500/20'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse transition-colors ${backView === 'benefits' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span className="text-[9px] font-black text-white uppercase tracking-tighter">
                    {backView === 'benefits' ? '바우처 보기' : '혜택 보기'}
                  </span>
                </button>
              </div>

              {/* Toggleable List Content */}
              <div className="flex-1 overflow-y-auto scrollbar-hide select-none touch-pan-y" onMouseDown={(e) => e.stopPropagation()}>
                {backView === 'benefits' ? (
                  <div className="grid grid-cols-2 gap-2.5 animate-in fade-in slide-in-from-right-4 duration-300 pb-2">
                    {[
                      { cat: '카페', val: '50% 결제 할인', ico: '☕' },
                      { cat: '쇼핑', val: '10% 무제한 적립', ico: '🛍️' },
                      { cat: '교통', val: '2,000원 캐시백', ico: '🚌' },
                      { cat: '푸드', val: '5,000원 즉시할인', ico: '🍔' },
                      { cat: '공항', val: '라운지 연 2회', ico: '✈️' },
                      { cat: '영화', val: '1만원 현장할인', ico: '🎬' },
                      { cat: '숙박', val: '상시 7% 할인', ico: '🏨' },
                      { cat: '주유', val: '리터당 120원', ico: '⛽' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group/item shadow-inner relative overflow-hidden">
                        <div className="shrink-0 w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[18px] grayscale group-hover/item:grayscale-0 transition-all shadow-lg border border-white/5">
                           {item.ico}
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-white/30 font-black text-[7px] uppercase tracking-widest leading-none mb-1 group-hover/item:text-rose-400/50 transition-colors">{item.cat}</span>
                           <span className="text-white font-black text-[10px] tracking-tighter leading-tight uppercase truncate">{item.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 animate-in fade-in slide-in-from-left-4 duration-300">
                    {SAMPLE_VOUCHERS.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-500/5 border border-dashed border-emerald-500/20 hover:bg-emerald-500/10 transition-all shadow-inner">
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[14px]">
                           🎟
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="text-white font-black text-[9px] tracking-tighter leading-tight truncate">{v.title}</span>
                           <span className="text-[7px] text-emerald-400/40 font-black uppercase tracking-tight truncate">{v.info}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5 opacity-50">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">CardWise Protocol</p>
                <div className="flex gap-1 items-center">
                   <div className={`h-1 rounded-full transition-all ${backView === 'benefits' ? 'w-4 bg-rose-500' : 'w-1 bg-white/10'}`} />
                   <div className={`h-1 rounded-full transition-all ${backView === 'vouchers' ? 'w-4 bg-emerald-500' : 'w-1 bg-white/10'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary Section */}
      <div 
        onClick={onPerformanceClick}
        className="mx-5 p-5 -mt-3 bg-white border border-gray-100 shadow-xl rounded-b-[40px] relative z-0 cursor-pointer active:bg-gray-50 transition-all hover:translate-y-0.5"
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 flex items-center justify-center">
             <RadialGauge percent={Math.round((card.current / card.target) * 100)} id={card.id} size={64} />
          </div>
          
          <div className="flex-1 grid grid-cols-2">
            {/* Monthly Column */}
            <div className="flex flex-col items-center border-r border-gray-100 px-2 space-y-1">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-80">월간 실적</span>
              <div className="flex items-baseline gap-0.5 text-rose-600">
                 <span className="text-[22px] font-display font-black leading-none">{Math.round((card.current / card.target) * 100)}</span>
                 <span className="text-[10px] font-black opacity-60">%</span>
              </div>
              <p className="text-[12px] font-black text-gray-800 leading-none">{card.current.toLocaleString()}원</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">목표: {formatKRWFull(card.target)}</p>
            </div>

            {/* Annual Column */}
            <div className="flex flex-col items-center px-2 space-y-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-80">연간 누적</span>
              <div className="flex items-baseline gap-0.5 text-gray-500">
                 <span className="text-[22px] font-display font-black leading-none">{Math.round((card.current * 1.5 / card.target) * 100)}</span>
                 <span className="text-[10px] font-black opacity-60">%</span>
              </div>
              <p className="text-[12px] font-black text-gray-700 leading-none">{(card.current * 12.5).toLocaleString()}원</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">최근 1년 합계</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
