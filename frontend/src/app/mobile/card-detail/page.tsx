'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, ExternalLink, TrendingUp, Gift, Star } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Card Detail Page — Full Page Navigation (screens.html 기반)
// ─────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: '🛒', title: '대형마트', desc: '이마트·홈플러스·코스트코', badge: '5% 할인', badgeColor: '#f43f5e' },
  { icon: '☕', title: '카페', desc: '스타벅스·투썸플레이스·이디야', badge: '3% 적립', badgeColor: '#f97316' },
  { icon: '🚇', title: '교통', desc: '버스·지하철·택시', badge: '10% 할인', badgeColor: '#3b82f6' },
  { icon: '🍽️', title: '식사', desc: '음식점·배달앱', badge: '2% 적립', badgeColor: '#10b981' },
  { icon: '⛽', title: '주유소', desc: 'SK·GS·현대오일뱅크', badge: '리터당 60원', badgeColor: '#6366f1' },
];

const MONTHLY_DATA = [270000, 310000, 186000, 420000, 380000, 186000];
const MONTHS = ['10월', '11월', '12월', '1월', '2월', '3월'];
const maxVal = Math.max(...MONTHLY_DATA);

function StatBox({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div className="flex-1 bg-white rounded-[22px] p-4 shadow-sm border border-gray-50 text-center">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`text-[18px] font-black tracking-tight ${color || 'text-gray-800'}`}>{value}</p>
      <p className="text-[10px] font-bold text-gray-300">{unit}</p>
    </div>
  );
}

export default function CardDetailPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'benefits' | 'history' | 'stats'>('benefits');
  const [activeFilter, setActiveFilter] = useState('전체');
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(56), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-gray-800 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <span>9:41</span>
        <span className="opacity-50">75%</span>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-rose-50 via-rose-50/50 to-gray-50 pb-6">
        {/* Nav Bar */}
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 flex items-center justify-center text-gray-700 active:scale-90 transition-all shadow-sm">
            <ChevronLeft size={20} />
          </button>
          <span className="text-[15px] font-black text-gray-800">카드 상세</span>
          <button className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 flex items-center justify-center text-gray-500 active:scale-90 transition-all shadow-sm">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* 3D Credit Card */}
        <div className="px-5 mt-2">
          <div className="w-full h-[196px] rounded-[28px] overflow-hidden relative shadow-2xl shadow-rose-300/40 cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
              transform: 'perspective(800px)',
              transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)',
            }}>
            {/* Shine */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 50%, transparent 60%)' }} />
            {/* Chip */}
            <div className="absolute top-5 right-6 w-8 h-5 rounded-md" style={{ background: 'linear-gradient(135deg, #e8c96b, #c49a28)' }} />
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-black text-white/70 tracking-[0.15em] uppercase">Samsung Card</p>
                <p className="text-[17px] font-black text-white mt-1">iD SIMPLE</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[14px] font-bold text-white/80 tracking-[0.2em]">1234 •••• •••• 4821</p>
                  <p className="text-[9px] text-white/50 mt-1 uppercase tracking-widest">VALID THRU &nbsp;&nbsp;12/27</p>
                </div>
                <p className="text-[22px] font-black text-white/90 italic tracking-[-0.5px]">VISA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="flex gap-3 px-5 mt-5">
          <StatBox label="이번달 지출" value="186,000" unit="원" />
          <StatBox label="혜택 받음" value="4,200" unit="원" color="text-emerald-600" />
          <StatBox label="남은 실적" value="114,000" unit="원" color="text-amber-500" />
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 pt-4 pb-3">
        <div className="bg-white rounded-[28px] p-6 border border-gray-50 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-black text-gray-800">실적 현황</p>
            <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">⚡ 달성 임박</span>
          </div>
          <div className="flex items-center justify-between text-[12px] font-bold mb-3">
            <span className="text-gray-500">186,000원 / 300,000원</span>
            <span className="text-rose-500 font-black">56%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative"
              style={{ width: `${animPct}%`, background: 'linear-gradient(90deg, #fb7185, #f43f5e)', boxShadow: '0 0 12px rgba(244,63,94,0.4)' }}>
              <div className="absolute right-0 top-0 bottom-0 w-5 blur-sm bg-rose-400 opacity-60" />
            </div>
          </div>
          <p className="text-[12px] text-gray-400 font-bold mt-2.5">
            114,000원 더 사용하면 <span className="text-rose-500 font-black">최대 5% 할인 혜택</span>
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-5 pb-3">
        <div className="flex p-1.5 bg-white rounded-[22px] border border-gray-100 shadow-sm">
          {[
            { id: 'benefits', label: '혜택', icon: <Gift size={13} /> },
            { id: 'history', label: '이용내역', icon: <TrendingUp size={13} /> },
            { id: 'stats', label: '통계', icon: <Star size={13} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-[18px] font-black text-[12px] transition-all ${
                activeTab === tab.id ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'text-gray-400'
              }`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="px-5 pb-28">
        {activeTab === 'benefits' && (
          <div>
            {/* Filter Chips */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {['전체', '쇼핑', '교통', '식사', '기타'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all ${
                    activeFilter === f
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                      : 'bg-white text-gray-500 border border-gray-100'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            {/* Benefit Link */}
            <button className="w-full mb-4 p-4 rounded-[22px] bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 flex items-center gap-3 active:scale-98 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ExternalLink size={16} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-black text-rose-600">삼성카드 공식 혜택 페이지</p>
                <p className="text-[11px] text-rose-400 font-bold">card.samsung.com/benefits</p>
              </div>
              <ExternalLink size={14} className="text-rose-300" />
            </button>

            {/* Benefit List */}
            <div className="space-y-2">
              {BENEFITS.map((b, i) => (
                <div key={i} className="bg-white rounded-[22px] p-4 border border-gray-50 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer">
                  <div className="w-11 h-11 rounded-[16px] flex items-center justify-center text-xl bg-gray-50 shadow-inner flex-shrink-0">{b.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-gray-800">{b.title}</p>
                    <p className="text-[11px] text-gray-400 font-bold truncate">{b.desc}</p>
                  </div>
                  <span className="text-[11px] font-black px-3 py-1.5 rounded-xl"
                    style={{ background: `${b.badgeColor}15`, color: b.badgeColor }}>
                    {b.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {['이마트 영등포점', '스타벅스 여의도IFC', '서울 1호선', '쿠팡', '배달의민족'].map((name, i) => (
              <div key={i} className="bg-white rounded-[22px] p-4 border border-gray-50 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-gray-50 flex items-center justify-center text-lg">
                  {['🛒', '☕', '🚇', '🛍️', '🍕'][i]}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-black text-gray-800">{name}</p>
                  <p className="text-[11px] text-gray-400 font-bold">{['오늘', '오늘', '어제', '어제', '2일 전'][i]}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-black text-gray-800">{['32,500', '6,800', '1,400', '48,200', '22,000'][i]}원</p>
                  <p className="text-[10px] font-bold text-emerald-500">-{['1,625', '204', '140', '964', '440'][i]}원</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">월별 지출 추이</p>
            <div className="bg-white rounded-[28px] p-5 border border-gray-50 shadow-md">
              <div className="flex items-end gap-2 h-24 mb-3">
                {MONTHLY_DATA.map((v, i) => {
                  const h = (v / maxVal) * 100;
                  const isLast = i === MONTHLY_DATA.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-lg transition-all duration-700"
                        style={{ height: `${h}%`, background: isLast ? 'linear-gradient(180deg, #f43f5e, #e11d48)' : 'linear-gradient(180deg, #f1f5f9, #e2e8f0)' }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2">
                {MONTHS.map((m, i) => (
                  <p key={i} className={`flex-1 text-center text-[10px] font-bold ${i === 5 ? 'text-rose-500' : 'text-gray-300'}`}>{m}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto flex gap-3 p-5 bg-white/95 backdrop-blur-xl border-t border-gray-100">
        <button className="flex-1 h-14 rounded-[20px] border-2 border-rose-200 text-rose-500 font-black text-[14px] active:scale-95 transition-all">
          카드 수정
        </button>
        <button className="flex-1 h-14 rounded-[20px] font-black text-[14px] text-white active:scale-95 transition-all shadow-lg shadow-rose-200"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
          혜택 사용
        </button>
      </div>
    </div>
  );
}
