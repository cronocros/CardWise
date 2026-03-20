'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ExternalLink, Sparkles } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Card Finder Page — 내게 맞는 카드 찾기
// ─────────────────────────────────────────────────────────────

const SPENDING_HABITS = [
  { id: 'dining', emoji: '🍽️', label: '식사·외식', desc: '카페 자주, 식당 더 자주' },
  { id: 'shopping', emoji: '🛍️', label: '온라인쇼핑', desc: '쿠팡, 네이버쇼핑 중독' },
  { id: 'transport', emoji: '🚇', label: '대중교통', desc: '버스/지하철 매일 이용' },
  { id: 'travel', emoji: '✈️', label: '여행·숙박', desc: '월 1회 이상 여행 선호' },
  { id: 'entertainment', emoji: '🎭', label: '문화·여가', desc: '영화, OTT, 스포츠' },
  { id: 'health', emoji: '💊', label: '의료·헬스', desc: '병원, 약국, 헬스장' },
  { id: 'fuel', emoji: '⛽', label: '자동차', desc: '주유비, 하이패스' },
  { id: 'subscription', emoji: '📱', label: '구독서비스', desc: '넷플릭스, 유튜브 프리미엄' },
];

const ANNUAL_SPENDS = [
  { id: 'under3m', label: '300만원 미만', desc: '월 25만원 이하' },
  { id: '3m-6m', label: '300~600만원', desc: '월 25~50만원' },
  { id: '6m-12m', label: '600만~1200만원', desc: '월 50~100만원' },
  { id: 'over12m', label: '1200만원 이상', desc: '월 100만원 이상' },
];

const RECOMMENDED_CARDS = [
  {
    rank: 1,
    name: '삼성카드 iD 5',
    issuer: 'SAMSUNG',
    gradient: 'linear-gradient(135deg, #1c0a12 0%, #7c2d46 100%)',
    match: 97,
    annualFee: '연회비 없음',
    highlight: '대형마트·온라인 5% 적립',
    benefits: ['대형마트 5% 할인', '카페 3% 적립', '해외 결제 1.5%', '무이자 할부'],
    tags: ['식사', '쇼핑', '카페'],
  },
  {
    rank: 2,
    name: '신한카드 Deep Dream',
    issuer: 'SHINHAN',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
    match: 89,
    annualFee: '연회비 1만원',
    highlight: '쇼핑·스트리밍 특화',
    benefits: ['쿠팡 최대 7% 할인', 'OTT 50% 할인', '영화관 2매 혜택', '편의점 3%'],
    tags: ['쇼핑', '문화', '구독'],
  },
  {
    rank: 3,
    name: '현대카드 ZERO 에디션',
    issuer: 'HYUNDAI',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    match: 82,
    annualFee: '연회비 없음',
    highlight: '교통·이동 특화 카드',
    benefits: ['교통 10% 할인', '주유 리터당 60원', '하이패스 무료', '블랙박스 지원'],
    tags: ['교통', '자동차'],
  },
];

export default function CardFinderPage() {
  const router = useRouter();
  const [step, setStep] = useState<'habits' | 'spend' | 'results'>('habits');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [selectedSpend, setSelectedSpend] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleHabit = (id: string) => {
    setSelectedHabits(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const stepProgress = step === 'habits' ? 1 : step === 'spend' ? 2 : 3;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-gray-800 bg-white">
        <span>9:41</span><span className="opacity-40">75%</span>
      </div>

      {/* Header */}
      <div className="bg-white sticky top-0 z-50 px-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-3 pt-2 mb-4">
          <button onClick={() => step !== 'habits' ? setStep(step === 'results' ? 'spend' : 'habits') : router.back()}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-600 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-rose-500" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">AI Card Match</p>
            </div>
            <h1 className="text-[20px] font-black text-gray-800 tracking-tighter -mt-0.5">내게 맞는 카드 찾기</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i <= stepProgress ? 'linear-gradient(90deg, #f43f5e, #e11d48)' : '#f1f5f9' }} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-28">
        {/* STEP 1: Habits */}
        {step === 'habits' && (
          <div>
            <h2 className="text-[20px] font-black text-gray-800 mb-1">어떤 지출이 많으신가요?</h2>
            <p className="text-[13px] text-gray-400 font-bold mb-5">최대 3개까지 선택할 수 있어요</p>
            <div className="grid grid-cols-2 gap-3">
              {SPENDING_HABITS.map(h => {
                const isOn = selectedHabits.includes(h.id);
                return (
                  <button key={h.id} onClick={() => toggleHabit(h.id)}
                    className={`p-4 rounded-[24px] text-left border-2 transition-all active:scale-95 ${
                      isOn ? 'border-rose-400 bg-rose-50 shadow-md shadow-rose-100' : 'border-gray-100 bg-white'
                    }`}>
                    <div className="text-2xl mb-2">{h.emoji}</div>
                    <p className={`text-[13px] font-black mb-0.5 ${isOn ? 'text-rose-600' : 'text-gray-700'}`}>{h.label}</p>
                    <p className={`text-[10px] font-bold leading-tight ${isOn ? 'text-rose-400' : 'text-gray-400'}`}>{h.desc}</p>
                    {isOn && <div className="mt-2 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center ml-auto">
                      <svg viewBox="0 0 12 12" fill="white" className="w-2.5 h-2.5"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" fill="none" /></svg>
                    </div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Annual Spend */}
        {step === 'spend' && (
          <div>
            <h2 className="text-[20px] font-black text-gray-800 mb-1">연간 지출 규모는?</h2>
            <p className="text-[13px] text-gray-400 font-bold mb-5">카드 연회비 대비 혜택을 비교해서 추천해드려요</p>
            <div className="space-y-3">
              {ANNUAL_SPENDS.map(s => (
                <button key={s.id} onClick={() => setSelectedSpend(s.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-[24px] border-2 text-left transition-all active:scale-[0.98] ${
                    selectedSpend === s.id ? 'border-rose-400 bg-rose-50' : 'border-gray-100 bg-white'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    selectedSpend === s.id ? 'border-rose-500 bg-rose-500' : 'border-gray-300'
                  }`}>
                    {selectedSpend === s.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className={`text-[15px] font-black ${selectedSpend === s.id ? 'text-rose-600' : 'text-gray-700'}`}>{s.label}</p>
                    <p className={`text-[12px] font-bold ${selectedSpend === s.id ? 'text-rose-400' : 'text-gray-400'}`}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === 'results' && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Sparkles size={18} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">AI 분석 결과</p>
                <h2 className="text-[18px] font-black text-gray-800 tracking-tight">추천 카드 3종</h2>
              </div>
            </div>

            <div className="space-y-4">
              {RECOMMENDED_CARDS.map((card, i) => (
                <div key={i}
                  className="bg-white rounded-[28px] border border-gray-50 shadow-md overflow-hidden cursor-pointer"
                  onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
                  {/* Card Header */}
                  <div className="flex items-center gap-4 p-5">
                    {/* Mini Card Visual */}
                    <div className="w-16 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center relative overflow-hidden"
                      style={{ background: card.gradient }}>
                      <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent)' }} />
                      <span className="text-[9px] font-black text-white/70 tracking-wide">{card.issuer}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {card.rank === 1 && <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-600">🏆 1위</span>}
                        <p className="text-[14px] font-black text-gray-800 truncate">{card.name}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 font-bold">{card.highlight}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[22px] font-black text-rose-500">{card.match}%</p>
                      <p className="text-[9px] font-black text-gray-400">매칭</p>
                    </div>
                  </div>

                  {/* Match Progress */}
                  <div className="px-5 pb-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${card.match}%`, background: card.gradient }} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {card.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-50 text-rose-400">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedCard === i && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {card.benefits.map((b, bi) => (
                          <div key={bi} className="flex items-center gap-2 p-3 bg-gray-50 rounded-[14px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                            <span className="text-[11px] font-bold text-gray-700 leading-tight">{b}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[12px] font-bold text-gray-500">{card.annualFee}</span>
                      </div>
                      <button className="w-full h-12 rounded-[18px] text-white font-black text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                        style={{ background: card.gradient }}>
                        <ExternalLink size={14} />
                        카드 자세히 보기
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step !== 'results' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-5 bg-white/95 backdrop-blur-xl border-t border-gray-100">
          <button
            onClick={() => { if (step === 'habits' && selectedHabits.length > 0) setStep('spend'); else if (step === 'spend' && selectedSpend) setStep('results'); }}
            className={`w-full h-14 rounded-[22px] text-white font-black text-[16px] transition-all ${(step === 'habits' && selectedHabits.length > 0) || (step === 'spend' && selectedSpend) ? 'active:scale-95 shadow-lg shadow-rose-200' : 'opacity-40'}`}
            style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
            {step === 'habits' ? `${selectedHabits.length}개 선택 · 다음` : '분석 시작하기 ✨'}
          </button>
        </div>
      )}
    </div>
  );
}
