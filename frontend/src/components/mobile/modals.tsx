'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Mascot } from './mascot';
import { Transaction, Card, CommunityPost } from '@/types/mobile';


// ─────────────────────────────────────────────────────────────
// Utility: Format Currency to Man-won / Chun-won
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
function Confetti() {
  const [pieces, setPieces] = useState<Array<{ cx: string; cr: string; dur: string; del: string; left: string; w: string; h: string; col: string }>>([]);

  
  useEffect(() => {
    const COLORS = ['#f43f5e', '#fb923c', '#10b981', '#3b82f6', '#a855f7', '#fb7185', '#f59e0b', '#ec4899', '#06b6d4'];
    const newPieces = [...Array(32)].map(() => ({
      cx: `${Math.random() * 180 - 90}px`,
      cr: `${Math.random() * 400 - 100}deg`,
      dur: `${(1.3 + Math.random() * 0.9).toFixed(2)}s`,
      del: `${(Math.random() * 0.6).toFixed(2)}s`,
      left: `${(5 + Math.random() * 90).toFixed(1)}%`,
      w: `${(6 + Math.random() * 7).toFixed(0)}px`,
      h: `${(12 + Math.random() * 14).toFixed(0)}px`,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const timer = setTimeout(() => setPieces(newPieces), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 animate-confetti"
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            backgroundColor: p.col,
            animationDuration: p.dur,
            animationDelay: p.del,
            transform: `translateX(${p.cx}) rotate(${p.cr})`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Achievement Modal (Units & Alignment Fixed)
// ─────────────────────────────────────────────────────────────
interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierName: string;
  benefit: string;
  current: number;
  target: number;
}

export function AchievementModal({ isOpen, onClose, tierName, benefit, current, target }: AchievementModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 20);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-sm bg-[#111112]/92 backdrop-blur-3xl rounded-[48px] border border-white/10 p-9 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0 scale-100' : 'translate-y-24 scale-90'}`}
      >
        <Confetti />

        {/* Premium Background Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-rose-600/15 blur-[100px] rounded-full" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-8 group active:scale-95 transition-transform">
             <div className="absolute inset-0 bg-rose-500/30 blur-3xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-1000 animate-pulse" />
             <div className="w-28 h-28 rounded-[36px] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative z-10 overflow-hidden">
                <Mascot pose="celebrating" size={82} animate />
             </div>
          </div>
          
          <h2 className="text-[28px] font-black text-white mb-2 tracking-tighter drop-shadow-md">
             {tierName} 돌파! 🎉
          </h2>
          <p className="text-[14px] text-white/50 font-bold mb-10 leading-relaxed px-4">
            {benefit}
          </p>
          
          <div className="w-full bg-white/5 rounded-3xl p-6 mb-10 border border-white/5 shadow-inner">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[12px] font-black text-white/30 uppercase tracking-[0.2em]">CURRENT PROGRESS</span>
              <span className="text-[18px] font-display font-black text-rose-500 tracking-tight">
                {formatKRWFull(current)} <span className="text-[11px] text-white/20 font-medium ml-1">/ {formatKRWFull(target)}</span>
              </span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-[1.5px] border border-white/5">
               <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_12px_rgba(244,63,94,0.4)]" style={{ width: `${(current/target)*100}%` }} />
            </div>
            <p className="text-[11px] font-black text-emerald-400 mt-4 tracking-widest uppercase opacity-80">SUCCESSFULLY UNLOCKED ✓</p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-5 rounded-[24px] bg-rose-500 hover:bg-rose-600 text-white font-black text-[16px] shadow-2xl shadow-rose-900/40 active:scale-95 transition-all tracking-widest"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Transaction Modal
// ─────────────────────────────────────────────────────────────

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
}


export function AddTransactionModal({ isOpen, onClose, cards }: AddTransactionModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 25);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-14 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-[26px] font-black text-var(--text-strong) tracking-tighter">소비 내역 추가</h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"><X size={22} /></button>
          </div>

          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[12px] font-black text-var(--text-soft) uppercase tracking-[0.2em] opacity-60">결제 수단 선택</label>
                  <span className="text-[10px] font-black text-var(--primary-400)">+ 카드 추가</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-5 -mx-2 px-2 scrollbar-hide">
                   {cards.map((card, i) => (
                      <div key={i} className={`flex-shrink-0 p-5 rounded-[28px] border-2 transition-all cursor-pointer min-w-[130px] active:scale-95 ${i === 0 ? 'border-var(--primary-400) bg-var(--primary-50) shadow-lg shadow-rose-100' : 'border-gray-50 bg-white'}`}>
                         <div className="w-10 h-6 rounded-lg mb-3 shadow-sm" style={{ background: card.gradient }} />
                         <p className="text-[12px] font-black text-var(--text-strong) whitespace-nowrap tracking-tight">{card.name}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <div className="p-7 rounded-[32px] bg-gray-50/70 border border-gray-100/50 shadow-inner group focus-within:bg-white focus-within:border-var(--primary-100) transition-all">
                   <p className="text-[11px] font-black text-var(--text-soft) uppercase tracking-widest mb-2 opacity-60 group-focus-within:text-var(--primary-400) group-focus-within:opacity-100">사용 금액</p>
                   <div className="flex items-baseline gap-2">
                      <input type="text" placeholder="0" className="bg-transparent text-[42px] font-display font-black text-var(--text-strong) w-full outline-none placeholder:opacity-20 translate-y-1" autoFocus />
                      <span className="text-xl font-black text-var(--text-soft)">원</span>
                   </div>
                </div>

                <div className="p-7 rounded-[32px] bg-gray-50/70 border border-gray-100/50 shadow-inner group focus-within:bg-white focus-within:border-var(--primary-100) transition-all">
                   <p className="text-[11px] font-black text-var(--text-soft) uppercase tracking-widest mb-2 opacity-60 group-focus-within:text-var(--primary-400) group-focus-within:opacity-100">사용처</p>
                   <input type="text" placeholder="예: 스타벅스 강남역점" className="bg-transparent text-[18px] font-black text-var(--text-strong) w-full outline-none placeholder:opacity-20" />
                </div>
             </div>

             <button className="w-full py-6 rounded-[28px] bg-var(--text-strong) text-white font-black text-[17px] shadow-2xl shadow-gray-400/30 active:scale-95 transition-all mt-6 uppercase tracking-[0.2em] h-20">
                입력 완료
             </button>
          </div>
       </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Transaction Detail Modal (2nd Depth)
// ─────────────────────────────────────────────────────────────
interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: Transaction | null;
}


export function TransactionDetailModal({ isOpen, onClose, tx }: TransactionDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !tx) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0a0005]/80 backdrop-blur-2xl" onClick={onClose} />
       
       <div className={`relative w-full max-w-sm bg-white rounded-[48px] p-9 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0 scale-100' : 'translate-y-24 scale-90'}`}>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-50 to-transparent rounded-t-[48px] -z-10" />
          
          <div className="flex flex-col items-center">
             <div className="w-24 h-24 rounded-[32px] bg-white border border-gray-100 flex items-center justify-center text-[44px] shadow-xl mb-6 animate-spring">
                {tx.icon}
             </div>
             
             <h2 className="text-[26px] font-black text-var(--text-strong) tracking-tighter mb-2">{tx.name}</h2>
             <div className="flex items-center gap-2 mb-8">
                <span className="text-[11px] font-black text-var(--text-soft) bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">{tx.category}</span>
                <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">{tx.card}</span>
             </div>

             <div className="w-full space-y-5 mb-10">
                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                   <span className="text-[13px] font-black text-var(--text-soft) uppercase tracking-widest opacity-60">결제 금액</span>
                   <span className="text-[22px] font-display font-black text-var(--text-strong) tracking-tight">{tx.amount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-gray-50 text-rose-500">
                   <span className="text-[13px] font-black uppercase tracking-widest opacity-60">적용 혜택</span>
                   <span className="text-[15px] font-black">
                      {tx.discount ? `${tx.discount}% 청구할인` : tx.reward ? `${tx.reward}% 포인트적립` : '혜택 없음'}
                   </span>
                </div>
                <div className="flex justify-between items-center py-4">
                   <span className="text-[13px] font-black text-var(--text-soft) uppercase tracking-widest opacity-60">결제 일시</span>
                   <span className="text-[15px] font-bold text-var(--text-strong)">2026년 3월 18일 14:32</span>
                </div>
             </div>

             <div className="w-full grid grid-cols-2 gap-4">
                <button className="h-18 rounded-[24px] bg-gray-50 text-var(--text-strong) font-black text-[15px] active:scale-95 transition-all">거래 수정</button>
                <button className="h-18 rounded-[24px] bg-rose-50 text-rose-500 font-black text-[15px] active:scale-95 transition-all">거래 취소</button>
             </div>
             
             <button onClick={onClose} className="mt-8 text-[13px] font-black text-var(--text-soft) uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">닫기</button>
          </div>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit Home Modal (Personalization)
// ─────────────────────────────────────────────────────────────
interface EditHomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleSections: string[];
  onToggleSection: (sectionId: string) => void;
}

const ALL_SECTIONS = [
  { id: 'balance', name: '내 잔액 현황', icon: '💰' },
  { id: 'performance', name: '실적 달성 현황', icon: '🚀' },
  { id: 'weekly', name: '주간 소비 패턴', icon: '📊' },
  { id: 'category', name: '카테고리 비율', icon: '🍕' },
  { id: 'goal', name: '이달의 목표', icon: '🎯' },
  { id: 'recent', name: '최근 소비 내역', icon: '📑' },
];

export function EditHomeModal({ isOpen, onClose, visibleSections, onToggleSection }: EditHomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-gray-50 rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-[24px] font-black text-var(--text-strong) tracking-tighter">홈 화면 편집</h2>
                <p className="text-[12px] text-var(--text-soft) font-bold mt-1">원하는 항목만 골라서 볼 수 있어요.</p>
             </div>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 transition-transform shadow-sm"><X size={20} /></button>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide py-2">
             {ALL_SECTIONS.map((section) => {
                const isActive = visibleSections.includes(section.id);
                return (
                  <div key={section.id} className="p-5 rounded-[28px] bg-white border border-gray-100 flex items-center gap-4 shadow-sm transition-all active:scale-[0.98]">
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">{section.icon}</div>
                     <span className="flex-1 text-[15px] font-black text-var(--text-strong)">{section.name}</span>
                     <button 
                       onClick={() => onToggleSection(section.id)}
                       className={`w-14 h-8 rounded-full transition-all duration-300 relative ${isActive ? 'bg-rose-500' : 'bg-gray-200'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${isActive ? 'left-7' : 'left-1'}`} />
                     </button>
                  </div>
                );
             })}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-6 rounded-[28px] bg-var(--text-strong) text-white font-black text-[16px] shadow-2xl shadow-gray-400/30 active:scale-95 transition-all mt-10 tracking-widest uppercase"
          >
             설정 완료
          </button>
       </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Add Card Modal (New Registration)
// ─────────────────────────────────────────────────────────────
interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (card: Card) => void;
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', // Midnight
  'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', // Rose
  'linear-gradient(135deg, #0f172a 0%, #334155 100%)', // Slate
  'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', // Purple
  'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', // Gold
  'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
];

export function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
  const [visible, setVisible] = useState(false);
  const [selectedGradient, setSelectedGradient] = useState(CARD_GRADIENTS[0]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0a0005]/70 backdrop-blur-xl" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-[26px] font-black text-var(--text-strong) tracking-tighter">새 카드 등록</h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"><X size={22} /></button>
          </div>

          <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
             {/* Card Preview */}
             <div className="p-6 rounded-[28px] h-44 w-full relative overflow-hidden shadow-2xl animate-spring" style={{ background: selectedGradient }}>
                <div className="absolute top-6 left-6 w-12 h-8 bg-yellow-400/80 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
                   <div className="w-full h-[1px] bg-black/10 my-1" />
                </div>
                <div className="absolute bottom-16 left-6 text-white/50 text-[10px] font-black tracking-[0.2em] uppercase">Card Number</div>
                <div className="absolute bottom-8 left-6 text-white text-[18px] font-display font-black tracking-[0.15em]">**** **** **** 1234</div>
                <div className="absolute top-6 right-6 text-white/20 text-[24px] font-black italic">VISA</div>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.2em] ml-2 mb-3 block opacity-60">카드 별칭 (Nickname)</label>
                  <input type="text" placeholder="예: 생활비 카드" className="w-full p-6 rounded-[28px] bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-rose-200 transition-all font-bold text-[16px] shadow-inner" />
                </div>

                <div>
                   <label className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.2em] ml-2 mb-3 block opacity-60">카드 번호</label>
                   <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <input key={i} type="password" maxLength={4} placeholder="****" className="w-full p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center font-display font-black outline-none focus:bg-white focus:border-rose-200 shadow-inner" />
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.2em] ml-2 mb-3 block opacity-60">유효기간</label>
                      <input type="text" placeholder="MM/YY" className="w-full p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-center font-bold outline-none focus:bg-white focus:border-rose-200 shadow-inner" />
                   </div>
                   <div>
                      <label className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.2em] ml-2 mb-3 block opacity-60">CVC</label>
                      <input type="password" maxLength={3} placeholder="***" className="w-full p-6 rounded-[28px] bg-gray-50 border border-gray-100 text-center font-bold outline-none focus:bg-white focus:border-rose-200 shadow-inner" />
                   </div>
                </div>

                <div>
                   <label className="text-[11px] font-black text-var(--text-soft) uppercase tracking-[0.2em] ml-2 mb-3 block opacity-60">디자인 선택</label>
                   <div className="flex gap-4 p-2 overflow-x-auto scrollbar-hide">
                      {CARD_GRADIENTS.map((g, i) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedGradient(g)}
                          className={`w-12 h-12 rounded-full border-4 transition-all flex-shrink-0 ${selectedGradient === g ? 'border-rose-200 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                          style={{ background: g }}
                        />
                      ))}
                   </div>
                </div>
             </div>

             <button className="w-full h-20 rounded-[32px] bg-var(--text-strong) text-white font-black text-[18px] shadow-2xl shadow-gray-400/30 active:scale-95 transition-all mt-6 tracking-widest uppercase">
                등록 하기
             </button>
          </div>
       </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Notification Modal
// ─────────────────────────────────────────────────────────────
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [visible, setVisible] = useState(false);
  const notifications = [
    { id: 1, title: '결제 알림', body: '스타벅스 강남역점 12,500원 결제 완료', time: '10분 전', icon: '☕' },
    { id: 2, title: '혜택 알림', body: '이번 달 목표 실적 90% 달성! 조금만 더 힘내세요.', time: '1시간 전', icon: '🚀' },
    { id: 3, title: '시스템 알림', body: '카드와이즈 v4.0 업데이트가 완료되었습니다.', time: '3시간 전', icon: '✨' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-start justify-center pt-24 px-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
       <div className={`relative w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/50 transition-all duration-500 ${visible ? 'translate-y-0 scale-100' : '-translate-y-12 scale-95'}`}>
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[17px] font-black text-slate-800">알림 센터</h3>
             <button onClick={onClose} className="text-gray-400 font-bold text-xs uppercase tracking-widest">Close</button>
          </div>
          <div className="space-y-3">
             {notifications.map(n => (
               <div key={n.id} className="p-4 rounded-2xl bg-white/50 border border-white flex gap-4 active:scale-95 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-inner">{n.icon}</div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                        <span className="text-[14px] font-black text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{n.time}</span>
                     </div>
                     <p className="text-[12px] text-slate-500 font-medium leading-tight mt-1">{n.body}</p>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Asset Action Modal (Fill / Send)
// ─────────────────────────────────────────────────────────────
interface AssetActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'fill' | 'send' | null;
}

export function AssetActionModal({ isOpen, onClose, type }: AssetActionModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !type) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          <h2 className="text-[26px] font-black text-slate-800 tracking-tighter mb-8">{type === 'fill' ? '자산 충전' : '자산 송금'}</h2>
          
          <div className="p-8 rounded-[32px] bg-rose-50 border border-rose-100 text-center mb-8">
             <div className="w-20 h-20 rounded-[28px] bg-white border border-rose-100 flex items-center justify-center text-[40px] shadow-xl mx-auto mb-6 animate-spring">
                {type === 'fill' ? '💰' : '💸'}
             </div>
             <p className="text-[15px] font-black text-rose-600 mb-2">{type === 'fill' ? '부족한 잔액을 바로 채워보세요' : '누구에게 송금할까요?'}</p>
             <p className="text-[12px] text-rose-400 font-bold opacity-60">CardWise 안전 송금 시스템 가동 중</p>
          </div>

          <div className="space-y-4">
             <input type="text" placeholder="금액 입력" className="w-full p-6 rounded-[28px] bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-rose-200 font-bold text-center text-2xl" />
             <button className="w-full h-20 rounded-[32px] bg-slate-900 text-white font-black text-[18px] shadow-2xl active:scale-95 transition-all mt-4">
                {type === 'fill' ? '충전하기' : '송금하기'}
             </button>
          </div>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card Settings Modal
// ─────────────────────────────────────────────────────────────
interface CardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
}

export function CardSettingsModal({ isOpen, onClose, cards }: CardSettingsModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0a0005]/70 backdrop-blur-xl" onClick={onClose} />
       <div className={`relative w-full max-w-[430px] bg-gray-50 rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">카드 목록 관리</h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 shadow-sm"><X size={20} /></button>
          </div>

          <div className="space-y-3 mb-10">
             {cards.map((card) => (
               <div key={card.id} className="p-4 rounded-[28px] bg-white border border-gray-100 flex items-center gap-4 shadow-sm group">
                  <div className="w-12 h-8 rounded-lg shadow-sm flex-shrink-0" style={{ background: card.gradient || card.color }} />
                  <div className="flex-1">
                     <p className="text-[14px] font-black text-slate-800 truncate">{card.name}</p>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.brand} · {card.tier}</p>
                  </div>
                  <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 active:text-rose-500 transition-colors">
                        <X size={16} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
          <button className="w-full py-6 rounded-[28px] bg-slate-900 text-white font-black text-[16px] shadow-2xl active:scale-95 transition-all text-center tracking-widest uppercase">
             순서 변경 저장
          </button>
       </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Settings Detail Modal (Generic for Profile Items)
// ─────────────────────────────────────────────────────────────
interface SettingsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function SettingsDetailModal({ isOpen, onClose, title }: SettingsDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">{title}</h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 shadow-sm"><X size={20} /></button>
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-20 h-20 rounded-[32px] bg-rose-50 flex items-center justify-center text-[40px] shadow-inner mb-2">
                ⚙️
             </div>
             <div>
                <p className="text-[17px] font-black text-slate-800 mb-2">상세 설정 준비 중</p>
                <p className="text-[13px] text-slate-400 font-bold leading-relaxed px-10">현재 에이전트가 {title} 기능을 고도화하고 있습니다. 잠시만 기다려주세요.</p>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-18 rounded-[28px] bg-rose-500 text-white font-black text-[15px] shadow-lg shadow-rose-200 active:scale-95 transition-all mt-8"
          >
             확인
          </button>
       </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Community Post Detail Modal
// ─────────────────────────────────────────────────────────────
interface CommunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
}

export function CommunityDetailModal({ isOpen, onClose, post }: CommunityDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0f0520]/80 backdrop-blur-2xl" onClick={onClose} />
       <div className={`relative w-full max-w-sm bg-white rounded-[48px] p-9 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0 scale-100' : 'translate-y-24 scale-90'}`}>
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl border border-gray-100">
                {post?.author?.avatar}
             </div>
             <div>
                <p className="text-[15px] font-black text-slate-800">{post?.author?.name}</p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{post?.category} · {post?.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</p>
             </div>
          </div>
          <h2 className="text-[22px] font-black text-slate-800 tracking-tight leading-tight mb-4">{post?.title}</h2>
          <p className="text-[14px] text-slate-500 leading-relaxed font-medium mb-10">{post?.content}</p>
          <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 mb-8">
             <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Comments</p>
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-xs">🤖</div>
                   <div className="flex-1">
                      <p className="text-[12px] font-black text-slate-700">CardWise AI</p>
                      <p className="text-[12px] text-slate-500 line-clamp-2">데이터를 분석한 결과, taptap O 카드 혜택이 가장 적합해요!</p>
                   </div>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="w-full h-18 rounded-[24px] bg-slate-900 shadow-xl shadow-gray-200 text-white font-black text-[15px] active:scale-95 transition-all">닫기</button>
       </div>
    </div>
  );
}

