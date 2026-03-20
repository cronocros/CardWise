'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus } from 'lucide-react';
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
      className="flex items-center gap-5 py-5 border-b border-gray-50 last:border-0 group cursor-pointer active:bg-gray-50/50 transition-all rounded-[24px] px-3 -mx-3 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div 
        className={`w-13 h-13 rounded-[22px] flex items-center justify-center text-2xl flex-shrink-0 transition-all group-hover:scale-110 shadow-sm border ${bgMap[tx.category] || 'bg-gray-100 border-gray-200'}`} 
      >
        {tx.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] font-black text-var(--text-strong) tracking-tighter mb-1 truncate">{tx.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-var(--text-soft) font-black tracking-tight font-mono opacity-60">
            {(() => {
              const date = new Date(tx.date);
              if (isNaN(date.getTime())) return tx.date;
              return date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            })()}
          </span>
          <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
          <span className="text-[10px] text-rose-500 font-black truncate max-w-[120px]">
            {tx.benefitInfo || (isIncome ? '입금 완료' : '결제 완료')}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-[17px] font-display font-black tracking-tight ${isIncome ? 'text-emerald-500' : 'text-var(--text-strong)'}`}>
          {isIncome ? '+' : '-'}{tx.currency === 'USD' ? '$' : ''}{tx.amount.toLocaleString()}<span className="text-[13px] ml-0.5 font-bold">{tx.currency === 'KRW' ? '원' : ''}</span>
        </div>
        <div className="flex flex-wrap justify-end gap-1 mt-2">
           {tx.tags?.map((tag, i) => (
             <span key={i} className="text-[9px] font-black px-1.5 py-0.5 rounded-md border bg-gray-50 text-gray-400 border-gray-100">
               #{tag}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Credit Card Component (Flip Animation + Brand/Tier)
// ─────────────────────────────────────────────────────────────
export function CreditCardComponent({ card, onPerformanceClick }: { card: Card; onPerformanceClick?: () => void }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const brandIcons: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'MasterCard',
    amex: 'AMEX',
    unionpay: '银联',
    jcb: 'JCB',
    local: 'BC'
  };

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
      {/* 3D Card Wrapper */}
      <div 
        className="relative w-full h-44 cursor-pointer group"
        style={{ perspective: '1200px' }}
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
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start z-10 relative">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/60 tracking-[0.2em] uppercase drop-shadow-sm">{card.issuer}</span>
                  <span className={`text-[10px] font-black mt-0.5 uppercase tracking-tighter shadow-sm ${tierColors[card.tier] || 'text-white'}`}>{card.tier}</span>
               </div>
               <div className="px-3 h-7 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-[9px] font-black text-white italic tracking-tighter">{brandIcons[card.brand]}</span>
               </div>
            </div>
            
            <div className="relative z-10">
               <h4 className="text-[13px] font-black text-white tracking-tight opacity-90 drop-shadow-sm">{card.name}</h4>
               <div className="text-[16px] mt-1 tracking-[4px] font-display font-black text-white/60 drop-shadow-md flex gap-4">
                 <span>{card.firstFour}</span>
                 <span>••••</span>
                 <span>••••</span>
                 <span>{card.lastFour}</span>
               </div>
            </div>

            <div className="flex items-center gap-2.5 z-10">
               <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <div className="w-4 h-3 bg-amber-400/80 rounded-[2px]" />
               </div>
               <p className="text-[9px] text-white/30 font-black tracking-widest uppercase">Premium Identity</p>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[32px] p-7 shadow-2xl flex flex-col justify-between border border-white/5"
            style={{ 
              background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)', 
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-[12px] font-black text-rose-500 uppercase tracking-widest">Main Benefits</h5>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="text-[10px] text-white font-bold">★</span>
                </div>
              </div>
              <div className="space-y-2.5">
                {card.tags?.slice(0, 3).map((tag, i) => (
                  <div key={i} className="flex items-center gap-3 group/item">
                    <div className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover/item:scale-150 transition-transform" />
                    <span className="text-white/90 text-[12px] font-black tracking-tight">{tag} 맞춤형 리워드</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-[22px] border border-white/10 relative z-10">
              <div>
                <span className="text-[10px] font-black text-white/30 uppercase block mb-0.5 tracking-tighter">Voucher Status</span>
                <span className="text-[11px] font-black text-emerald-400">3 Coupons Available</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Plus size={16} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section (Clickable for Detail) */}
      <div 
        onClick={onPerformanceClick}
        className="mx-4 p-5 -mt-6 bg-white border border-gray-100 shadow-xl rounded-b-[32px] relative z-0 cursor-pointer active:bg-gray-50 transition-all hover:translate-y-0.5"
      >
        <div className="flex items-center gap-6">
          <RadialGauge percent={Math.round((card.current / card.target) * 100)} id={card.id} size={68} />
          <div className="flex-1">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest opacity-60">Monthly Performance</h4>
            <div className="flex items-baseline gap-1 mt-1 text-rose-500">
               <span className="text-[24px] font-display font-black leading-none">{Math.round((card.current / card.target) * 100)}</span>
               <span className="text-[11px] font-black opacity-80">%</span>
            </div>
            <p className="text-[11px] text-gray-800 font-black mt-1.5 flex justify-between items-center">
               <span>{card.currency === 'USD' ? '$' : ''}{card.current.toLocaleString()}{card.currency === 'KRW' ? '원' : ''}</span>
               <span className="text-[9px] text-gray-300 font-bold uppercase">/ {card.target.toLocaleString()} target</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
