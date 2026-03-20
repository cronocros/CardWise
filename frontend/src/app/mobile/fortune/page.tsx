'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Fortune Page — 오늘의 운세 (재미 컨셉)
// ─────────────────────────────────────────────────────────────

const FORTUNES = [
  {
    emoji: '🌟',
    overall: '대길',
    overallScore: 92,
    overallColor: '#f59e0b',
    title: '오늘은 지출이 복이 돼요!',
    desc: '오늘 큰 혜택을 받을 기회가 숨어있어요. 평소 미뤄두었던 쇼핑이 있다면 오늘이 기회입니다. 카드 실적도 채워지고 할인도 받을 수 있는 행운의 날이에요.',
    money: '💰 재물운: 예상치 못한 캐시백 또는 포인트 적립',
    shopping: '🛒 소비운: 오늘 구매는 후회 없는 선택이 됩니다',
    lucky: { color: '로즈 핑크', number: 4, place: '백화점' },
    card: '삼성카드 iD SIMPLE',
    tip: '오늘은 마트보다 백화점이 더 유리해요. 삼성카드로 결제하면 추가 5% 할인!',
  },
  {
    emoji: '🌙',
    overall: '소길',
    overallScore: 65,
    overallColor: '#6366f1',
    title: '꼼꼼한 소비가 답이에요',
    desc: '충동 구매보다는 계획적인 지출이 필요한 날입니다. 오늘은 작은 금액이라도 꼭 필요한 것만 구매하면 나중에 큰 혜택으로 돌아올 거예요.',
    money: '💳 카드 혜택을 꼭 확인하고 결제하세요',
    shopping: '🎯 必수 지출에 집중, 충동구매 자제',
    lucky: { color: '딥 블루', number: 7, place: '카페' },
    card: '현대카드 ZERO',
    tip: '교통비 지출이 많은 날! 대중교통 이용 시 현대카드로 10% 할인.',
  },
];

const ZODIAC_SIGNS = ['♈양자리', '♉황소', '♊쌍둥이', '♋게자리', '♌사자', '♍처녀', '♎천칭', '♏전갈', '♐사수', '♑염소', '♒물병', '♓물고기'];

function CircleScore({ score, color }: { score: number; color: string }) {
  const [anim, setAnim] = useState(0);
  const r = 52;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setAnim(score), 600);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - anim / 100)}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 8px ${color}60)` }} />
      <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="900" fill={color}>{score}</text>
      <text x="70" y="84" textAnchor="middle" fontSize="11" fontWeight="700" fill="#94a3b8">점</text>
    </svg>
  );
}

export default function FortunePage() {
  const router = useRouter();
  const [selectedSign, setSelectedSign] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fortune = FORTUNES[selectedSign % 2];

  const handleReveal = () => setRevealed(true);
  const handleRefresh = () => {
    setRefreshing(true);
    setRevealed(false);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0f0520 0%, #1a0535 40%, #0a0010 100%)' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-white/60">
        <span>9:41</span><span>75%</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
          <ChevronLeft size={20} />
        </button>
        <span className="text-[15px] font-black text-white">오늘의 운세</span>
        <button onClick={handleRefresh}
          className={`w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="flex-1 px-5 pb-8 overflow-y-auto scrollbar-hide">
        {/* Zodiac Scroll */}
        <div className="mb-6">
          <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-3">별자리 선택</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {ZODIAC_SIGNS.map((sign, i) => (
              <button key={i} onClick={() => { setSelectedSign(i); setRevealed(false); }}
                className={`px-4 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all active:scale-90 ${
                  selectedSign === i
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/8 text-white/50 border border-white/10'
                }`}>
                {sign}
              </button>
            ))}
          </div>
        </div>

        {!revealed ? (
          /* Reveal Button */
          <div className="flex flex-col items-center justify-center py-16 gap-6">
            <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl relative"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }}>
              <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping" />
              ✨
            </div>
            <p className="text-[22px] font-black text-white tracking-tight">{ZODIAC_SIGNS[selectedSign]}</p>
            <p className="text-[14px] text-white/40 font-bold text-center">오늘의 운세와 카드 추천을<br />확인해보세요</p>
            <button onClick={handleReveal}
              className="mt-4 px-10 py-5 rounded-[28px] text-white font-black text-[16px] active:scale-95 transition-all shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 20px 40px rgba(124,58,237,0.4)' }}>
              운세 확인하기 🔮
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Overall Score */}
            <div className="rounded-[36px] p-6 flex items-center gap-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <CircleScore score={fortune.overallScore} color={fortune.overallColor} />
              <div>
                <p className="text-[13px] font-black text-white/40 uppercase tracking-widest">오늘의 운세</p>
                <p className="text-[36px] font-black mt-1" style={{ color: fortune.overallColor }}>{fortune.overall}</p>
                <p className="text-[14px] font-black text-white mt-1 leading-tight">{fortune.title}</p>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-[28px] p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] text-white/60 font-bold leading-relaxed">{fortune.desc}</p>
            </div>

            {/* Detail Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[22px] p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl">💰</span>
                <p className="text-[12px] font-black text-white/70 leading-relaxed">{fortune.money}</p>
              </div>
              <div className="rounded-[22px] p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl">🛒</span>
                <p className="text-[12px] font-black text-white/70 leading-relaxed">{fortune.shopping}</p>
              </div>
            </div>

            {/* Lucky Section */}
            <div className="rounded-[28px] p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-3">오늘의 럭키</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: '색상', value: fortune.lucky.color }, { label: '숫자', value: String(fortune.lucky.number) }, { label: '장소', value: fortune.lucky.place }].map((item, i) => (
                  <div key={i} className="rounded-[18px] p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[13px] font-black text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Tip */}
            <div className="rounded-[28px] p-5 flex items-start gap-3" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(244,63,94,0.2)' }}>
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(244,63,94,0.2)' }}>💳</div>
              <div>
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-1">오늘의 카드 추천</p>
                <p className="text-[13px] font-black text-white mb-1">{fortune.card}</p>
                <p className="text-[11px] text-white/50 font-bold leading-relaxed">{fortune.tip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
