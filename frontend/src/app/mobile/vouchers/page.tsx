'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Gift, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Voucher Management Page — 바우처 관리
// ─────────────────────────────────────────────────────────────

interface Voucher {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  icon: string;
  card: string;
  cardGradient: string;
  value: string;
  expiresIn: number; // days
  usedCount: number;
  totalCount: number;
  status: 'available' | 'expiring' | 'used';
  tags: string[];
}

const VOUCHERS: Voucher[] = [
  { id: '1', title: '스타벅스 아메리카노', subtitle: '사이즈 업 무료 교환권', type: 'coupon', icon: '☕', card: '삼성카드', cardGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', value: '6,800원 상당', expiresIn: 7, usedCount: 0, totalCount: 2, status: 'expiring', tags: ['카페', '음료'] },
  { id: '2', title: '영화관 할인권', subtitle: 'CGV / 롯데시네마 3,000원 할인', type: 'discount', icon: '🎬', card: '신한카드', cardGradient: 'linear-gradient(135deg, #a855f7, #6d28d9)', value: '3,000원 할인', expiresIn: 30, usedCount: 1, totalCount: 3, status: 'available', tags: ['문화', '영화'] },
  { id: '3', title: '공항 라운지 이용권', subtitle: '인천/김포공항 무제한 이용', type: 'access', icon: '✈️', card: '현대카드', cardGradient: 'linear-gradient(135deg, #1e40af, #3b82f6)', value: '프리미엄 혜택', expiresIn: 60, usedCount: 0, totalCount: 1, status: 'available', tags: ['여행', '라운지'] },
  { id: '4', title: '올리브영 할인권', subtitle: '5만원 이상 20% 할인', type: 'discount', icon: '💄', card: '삼성카드', cardGradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', value: '최대 10,000원', expiresIn: 0, usedCount: 2, totalCount: 2, status: 'used', tags: ['쇼핑', '뷰티'] },
  { id: '5', title: 'GS25 모바일쿠폰', subtitle: '즉석식품 1+1 교환권', type: 'coupon', icon: '🛒', card: '국민카드', cardGradient: 'linear-gradient(135deg, #f59e0b, #b45309)', value: '3,500원 상당', expiresIn: 14, usedCount: 0, totalCount: 1, status: 'available', tags: ['편의점', '식품'] },
];

function VoucherCard({ v, onTap }: { v: Voucher; onTap: () => void }) {
  const statusConfig = {
    available: { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: '사용 가능', badgeColor: 'text-emerald-600 bg-emerald-100', icon: <CheckCircle size={12} /> },
    expiring: { bg: 'bg-amber-50', border: 'border-amber-100', badge: `D-${v.expiresIn} 만료예정`, badgeColor: 'text-amber-600 bg-amber-100', icon: <AlertTriangle size={12} /> },
    used: { bg: 'bg-gray-50', border: 'border-gray-100', badge: '사용 완료', badgeColor: 'text-gray-400 bg-gray-100', icon: <CheckCircle size={12} /> },
  }[v.status];

  return (
    <button onClick={onTap}
      className={`w-full text-left rounded-[28px] overflow-hidden border shadow-md active:scale-[0.97] transition-all ${statusConfig.bg} ${statusConfig.border} ${v.status === 'used' ? 'opacity-50' : ''}`}>
      {/* Card Header */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-2xl shadow-sm" style={{ background: v.cardGradient }}>
          <span>{v.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[14px] font-black text-gray-800 truncate">{v.title}</p>
          </div>
          <p className="text-[11px] text-gray-500 font-bold truncate">{v.subtitle}</p>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{v.card}</span>
          <span className="text-[10px] font-bold text-gray-400">{v.usedCount}/{v.totalCount} 사용</span>
        </div>
        <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${(v.usedCount / v.totalCount) * 100}%`, background: v.cardGradient }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/40">
        <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl ${statusConfig.badgeColor}`}>
          {statusConfig.icon}
          {statusConfig.badge}
        </div>
        <p className="text-[12px] font-black text-gray-600">{v.value}</p>
      </div>
    </button>
  );
}

export default function VoucherPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'available' | 'expiring' | 'used'>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const filtered = filter === 'all' ? VOUCHERS : VOUCHERS.filter(v => v.status === filter);
  const expiringSoon = VOUCHERS.filter(v => v.status === 'expiring').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status */}
      <div className="flex justify-between items-center px-7 pt-4 pb-2 text-[12px] font-black text-gray-800 bg-white sticky top-0 z-50">
        <span>9:41</span><span className="opacity-40">75%</span>
      </div>

      {/* Hero Banner */}
      <div className="px-5 pt-4 pb-3" style={{ background: 'linear-gradient(160deg, #fff1f5 0%, #f8f8ff 100%)' }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-rose-500 font-black text-[13px] mb-4">
          <ChevronLeft size={18} />뒤로
        </button>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-1">My Vouchers</p>
            <h1 className="text-[28px] font-black text-gray-800 tracking-tighter">바우처 관리</h1>
          </div>
          <div className="text-right">
            <p className="text-[30px] font-black text-rose-500 tracking-tight">{VOUCHERS.filter(v => v.status !== 'used').length}</p>
            <p className="text-[11px] font-black text-gray-400">사용 가능</p>
          </div>
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-[20px] bg-amber-50 border border-amber-100 mt-3">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <p className="text-[12px] font-black text-amber-700">만료 임박 바우처 {expiringSoon}개 — 빨리 사용하세요!</p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-[36px] z-40 bg-white px-5 py-3 border-b border-gray-50">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[{ id: 'all', label: '전체' }, { id: 'available', label: '사용 가능' }, { id: 'expiring', label: '만료 임박' }, { id: 'used', label: '사용 완료' }].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-full text-[12px] font-black whitespace-nowrap transition-all ${
                filter === tab.id ? 'bg-rose-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voucher List */}
      <div className="p-5 space-y-4 pb-28">
        {filtered.map(v => (
          <VoucherCard key={v.id} v={v} onTap={() => setSelectedVoucher(v)} />
        ))}
      </div>

      {/* Voucher Detail Slide-Up Panel (side-slide not bottom sheet) */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setSelectedVoucher(null)} />
          <div className="relative w-full max-w-[380px] bg-white rounded-[40px] overflow-hidden shadow-2xl animate-spring">
            {/* Card Visual */}
            <div className="h-44 flex items-center justify-center text-6xl relative" style={{ background: selectedVoucher.cardGradient }}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)' }} />
              {selectedVoucher.icon}
            </div>
            <div className="p-6">
              <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">{selectedVoucher.card}</p>
              <h3 className="text-[20px] font-black text-gray-800 mb-1">{selectedVoucher.title}</h3>
              <p className="text-[14px] text-gray-500 font-bold mb-5">{selectedVoucher.subtitle}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 bg-gray-50 rounded-[20px] text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">혜택 가치</p>
                  <p className="text-[15px] font-black text-gray-800">{selectedVoucher.value}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-[20px] text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">남은 잔여</p>
                  <p className="text-[15px] font-black text-gray-800">{selectedVoucher.totalCount - selectedVoucher.usedCount}회</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedVoucher(null)}
                  className="flex-1 h-14 rounded-[20px] border-2 border-gray-200 text-gray-500 font-black active:scale-95 transition-all">
                  닫기
                </button>
                {selectedVoucher.status !== 'used' && (
                  <button className="flex-1 h-14 rounded-[20px] text-white font-black active:scale-95 transition-all shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}>
                    바우처 사용
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
