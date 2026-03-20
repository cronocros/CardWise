'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Home, CreditCard, Gift, LineChart, Users, Settings, User, Sparkles } from 'lucide-react';
import { Mascot } from './mascot';
import { Transaction, Card, CommunityPost, CommunityComment } from '@/types/mobile';


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
  onUpdate?: (cards: Card[]) => void;
}

export function CardSettingsModal({ isOpen, onClose, cards, onUpdate }: CardSettingsModalProps) {
  const [visible, setVisible] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Card | null>(null);
  
  // Swipe state
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen) {
       setLocalCards(cards);
       setConfirmingDelete(null);
    }
  }, [isOpen, cards]);

  const handleDelete = () => {
    if (!confirmingDelete) return;
    const updated = localCards.filter(c => c.id !== confirmingDelete.id);
    setLocalCards(updated);
    setConfirmingDelete(null);
    setSwipeId(null);
    setSwipeOffset(0);
  };

  const handleDragStart = (idx: number) => {
    setDragIndex(idx);
    setSwipeId(null);
    setSwipeOffset(0);
  };

  const handleDragEnter = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    const updated = [...localCards];
    const dragItem = updated[dragIndex];
    updated.splice(dragIndex, 1);
    updated.splice(idx, 0, dragItem);
    setDragIndex(idx);
    setLocalCards(updated);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // Unified Swipe Handlers
  const startSwipe = (id: string, x: number) => {
    setStartX(x);
    setIsSwiping(true);
    if (swipeId && swipeId !== id) {
       setSwipeId(null);
       setSwipeOffset(0);
    }
  };

  const moveSwipe = (id: string, x: number) => {
    if (!isSwiping) return;
    const diff = x - startX;
    if (diff < -10) { 
       setSwipeOffset(Math.max(diff, -100));
       setSwipeId(id);
    } else if (diff > 10 && swipeId === id) { 
       setSwipeOffset(Math.min(0, -100 + diff));
    }
  };

  const endSwipe = (id: string) => {
    setIsSwiping(false);
    if (swipeOffset < -50) {
       setSwipeOffset(-100);
       setSwipeId(id);
    } else {
       setSwipeOffset(0);
       setSwipeId(null);
    }
  };

  const handleItemClick = (id: string) => {
    if (swipeId === id) {
       setSwipeOffset(0);
       setSwipeId(null);
    }
  };

  const handleSave = () => {
    onUpdate?.(localCards);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0a0005]/70 backdrop-blur-xl" onClick={onClose} />
       <div className={`relative w-full max-w-[430px] bg-gray-50 rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">카드 목록 관리</h2>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">설정된 모든 카드를 관리합니다.</p>
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={handleSave}
                 className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-[13px] active:scale-95 transition-all shadow-lg"
               >
                 저장
               </button>
               <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 active:scale-75 shadow-sm"><X size={18} /></button>
             </div>
          </div>

          <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto no-scrollbar py-2">
             {localCards.map((card, idx) => (
               <div key={card.id} className="relative group overflow-hidden rounded-[28px]">
                  {/* Swipe Delete Action Layer */}
                  <div className="absolute inset-0 bg-rose-500 flex items-center justify-end px-6">
                     <button 
                       onMouseDown={(e) => e.stopPropagation()} 
                       onClick={(e) => { e.stopPropagation(); setConfirmingDelete(card); }} 
                       className="text-white font-black text-[13px] uppercase tracking-widest flex items-center gap-2 active:scale-110 transition-transform"
                     >
                        <X size={18} strokeWidth={3} />
                        삭제
                     </button>
                  </div>
                  
                  {/* Main Card Item Layer */}
                  <div 
                    draggable={!swipeId}
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    
                    onTouchStart={(e) => startSwipe(card.id, e.touches[0].clientX)}
                    onTouchMove={(e) => moveSwipe(card.id, e.touches[0].clientX)}
                    onTouchEnd={() => endSwipe(card.id)}
                    
                    onMouseDown={(e) => startSwipe(card.id, e.clientX)}
                    onMouseMove={(e) => moveSwipe(card.id, e.clientX)}
                    onMouseUp={() => endSwipe(card.id)}
                    onMouseLeave={() => isSwiping && endSwipe(card.id)}
                    
                    onClick={() => handleItemClick(card.id)}
                    
                    style={{ 
                       transform: `translateX(${swipeId === card.id ? swipeOffset : 0}px)`,
                       transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    className={`p-4 rounded-[28px] bg-white border border-gray-100 flex items-center gap-4 shadow-sm relative z-10 cursor-grab active:cursor-grabbing hover:scale-[1.01] ${dragIndex === idx ? 'opacity-30 scale-95 border-rose-200 bg-rose-50/10' : 'opacity-100'}`}
                  >
                     <div className="flex flex-col gap-1 pr-2 opacity-20 pointer-events-none">
                        <span className="text-[14px]">⣿</span>
                     </div>
                     <div className="w-12 h-8 rounded-lg shadow-sm flex-shrink-0 pointer-events-none" style={{ background: card.gradient || card.color }} />
                     <div className="flex-1 min-w-0 pointer-events-none">
                        <p className="text-[14px] font-black text-slate-800 truncate">{card.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.brand} · {card.tier}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-4 bg-gray-100/50 rounded-3xl border border-dashed border-gray-200 mb-4 cursor-pointer active:scale-95 transition-all">
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">+ 새 카드 직접 등록</p>
          </div>
          
          {/* Internal Confirmation Layer */}
          {confirmingDelete && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 active:scale-100">
               <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-t-[50px]" onClick={() => setConfirmingDelete(null)} />
               <div className="relative w-full bg-white rounded-[40px] p-8 shadow-2xl border border-gray-100 animate-spring">
                  <div className="w-16 h-16 rounded-[24px] bg-rose-50 flex items-center justify-center text-3xl mb-6 mx-auto">⚠️</div>
                  <h3 className="text-[18px] font-black text-slate-800 text-center mb-2 tracking-tight">정말 이 카드를 삭제할까요?</h3>
                  <p className="text-[12px] text-slate-400 text-center font-bold mb-8 leading-relaxed">삭제된 카드는 목록에서 사라지며,<br/>필요시 다시 등록해야 합니다.</p>
                  <div className="grid grid-cols-2 gap-3">
                     <button onClick={() => setConfirmingDelete(null)} className="h-16 rounded-3xl bg-gray-50 text-slate-400 font-black text-[14px] active:scale-95 transition-all">취소</button>
                     <button onClick={handleDelete} className="h-16 rounded-3xl bg-rose-500 text-white font-black text-[14px] shadow-lg shadow-rose-200 active:scale-95 transition-all">카드 삭제</button>
                  </div>
               </div>
            </div>
          )}
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
import { getPostComments, createPostComment, unwrapArray } from '@/lib/cardwise-api';

interface CommunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
}

export function CommunityDetailModal({ isOpen, onClose, post }: CommunityDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    if (!post) return;
    const res = await getPostComments(post.postId);
    setComments(unwrapArray(res));
  }, [post]);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen && post) {
      loadComments();
    }
  }, [isOpen, post, loadComments]);

  const handleCreateComment = async () => {
    if (!post || !newComment.trim()) return;
    setLoading(true);
    const res = await createPostComment(post.postId, newComment);
    if (res?.data) {
      setNewComment('');
      loadComments();
    }
    setLoading(false);
  };

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
          <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 mb-8 max-h-[250px] overflow-y-auto no-scrollbar">
             <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-4">Comments ({comments.length})</p>
             <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-[11px] text-gray-400 font-bold text-center py-4">첫 댓글을 남겨보세요! 💬</p>
                ) : (
                  comments.map(c => (
                    <div key={c.commentId} className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-xs">👤</div>
                       <div className="flex-1">
                          <p className="text-[11px] font-black text-slate-700">{c.accountId.slice(0, 8)}</p>
                          <p className="text-[12px] text-slate-500">{c.content}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="flex gap-2 mb-8">
             <input 
               type="text" 
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               placeholder="댓글을 입력하세요"
               className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-[13px] outline-none focus:bg-white focus:border-rose-200 transition-all font-medium"
               onKeyPress={(e) => e.key === 'Enter' && handleCreateComment()}
             />
             <button 
               onClick={handleCreateComment}
               disabled={loading || !newComment.trim()}
               className="px-4 rounded-2xl bg-slate-900 text-white font-black text-[12px] active:scale-95 disabled:opacity-30 transition-all"
             >
               등록
             </button>
          </div>
          <button onClick={onClose} className="w-full h-18 rounded-[24px] bg-slate-900 shadow-xl shadow-gray-200 text-white font-black text-[15px] active:scale-95 transition-all">닫기</button>
       </div>
    </div>
  );
}

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function SitemapModal({ isOpen, onClose, onNavigate }: SitemapModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  if (!isOpen) return null;

  const sections = [
    {
      title: 'Wallet & Benefits',
      items: [
        { id: 'home', label: '자산 홈', icon: Home, color: 'bg-blue-500', desc: '내 자격 및 자산 현황' },
        { id: 'cards', label: '카드 지갑', icon: CreditCard, color: 'bg-slate-800', desc: '보유 카드 관리 및 순서 변경' },
        { id: 'benefits', label: '혜택 센터', icon: Gift, color: 'bg-rose-500', desc: '맞춤 혜택 및 바우처 확인' },
      ]
    },
    {
      title: 'Analysis & Report',
      items: [
        { id: 'ledger', label: '가계부', icon: LineChart, color: 'bg-emerald-500', desc: '상세 소비 내역 및 통계' },
        { id: 'insights', label: 'AI 인사이트', icon: Sparkles, color: 'bg-violet-500', desc: '지능형 소비 분석 리포트' },
      ]
    },
    {
      title: 'Social & Account',
      items: [
        { id: 'community', label: '커뮤니티', icon: Users, color: 'bg-amber-500', desc: '사용자간 정보 공유 및 팁' },
        { id: 'mypage', label: '내 정보', icon: User, color: 'bg-slate-400', desc: '프로필 설정 및 업적 관리' },
        { id: 'settings', label: '환경 설정', icon: Settings, color: 'bg-slate-200', desc: '앱 설정 및 알림 관리' },
      ]
    }
  ];

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl" onClick={onClose} />
       
       <div className={`relative w-full h-full max-w-[430px] bg-transparent p-8 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
          <div className="flex justify-between items-center mb-12">
             <div className="flex flex-col gap-1">
                <h2 className="text-[28px] font-black text-slate-800 tracking-tighter">Sitemap</h2>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em]">Navigation Hub</p>
             </div>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-slate-800 shadow-xl active:scale-75 transition-all">
                <X size={24} />
             </button>
          </div>

          <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar pb-12">
             {sections.map((section, sidx) => (
               <div key={sidx} className="space-y-4">
                  <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest pl-2">{section.title}</h3>
                  <div className="grid grid-cols-1 gap-3">
                     {section.items.map((item, iidx) => (
                       <button 
                         key={item.id}
                         onClick={() => onNavigate(item.id)}
                         className="group p-5 rounded-[32px] bg-white/50 border border-white hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex items-center gap-5 text-left active:scale-[0.98]"
                         style={{ transitionDelay: `${(sidx * 3 + iidx) * 50}ms` }}
                       >
                          <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                             <item.icon size={24} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                             <p className="text-[16px] font-black text-slate-800 tracking-tight leading-tight mb-1">{item.label}</p>
                             <p className="text-[12px] text-slate-400 font-medium">{item.desc}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            →
                          </div>
                       </button>
                     ))}
                  </div>
               </div>
             ))}
          </div>

          <div className="pt-8 border-t border-slate-100 mt-auto">
             <div className="flex items-center gap-3 p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">ℹ️</div>
                <div>
                   <p className="text-[13px] font-black tracking-tight whitespace-nowrap">빠른 메뉴를 이용해 보세요</p>
                   <p className="text-[11px] text-slate-400 font-bold opacity-80 uppercase tracking-widest">v2.4.0 Updated</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

