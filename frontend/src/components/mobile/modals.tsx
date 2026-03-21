'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Home, CreditCard, Gift, LineChart, Users, Settings, User, Sparkles, Pencil, Trash2, MapPin, Tag, Smartphone, ShoppingBag, HelpCircle } from 'lucide-react';
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
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<number>(Number(cards[0]?.id) || 0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 25);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSave = async () => {
    if (!amount || !merchantName) {
       alert('금액과 사용처를 입력해주세요.');
       return;
    }

    const { createPayment } = await import('@/lib/cardwise-api');
    const result = await createPayment({
       userCardId: selectedCardId,
       merchantName,
       krwAmount: parseInt(amount.replace(/,/g, '')),
       paidAt: new Date().toISOString(),
       transactionType
    });

    if (result) {
       alert(`${transactionType === 'INCOME' ? '수입' : '지출'} 내역이 저장되었습니다.`);
       onClose();
       // Refresh page or update state in parent
       window.location.reload(); 
    } else {
       alert('저장에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-14 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-[26px] font-black text-var(--text-strong) tracking-tighter">
                {transactionType === 'EXPENSE' ? '소비 내역 추가' : '수입 내역 추가'}
             </h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform"><X size={22} /></button>
          </div>

          <div className="flex p-1.5 bg-gray-50 rounded-[22px] mb-8 border border-gray-100">
             <button 
               onClick={() => setTransactionType('EXPENSE')}
               className={`flex-1 py-3 rounded-[18px] text-[13px] font-black transition-all ${transactionType === 'EXPENSE' ? 'bg-white shadow-md text-rose-500' : 'text-gray-400'}`}
             >
                지출
             </button>
             <button 
               onClick={() => setTransactionType('INCOME')}
               className={`flex-1 py-3 rounded-[18px] text-[13px] font-black transition-all ${transactionType === 'INCOME' ? 'bg-white shadow-md text-emerald-500' : 'text-gray-400'}`}
             >
                수입
             </button>
          </div>

          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[12px] font-black text-var(--text-soft) uppercase tracking-[0.2em] opacity-60">결제 수단 선택</label>
                  <span className="text-[10px] font-black text-var(--primary-400)">+ 카드 추가</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-5 -mx-2 px-2 scrollbar-hide">
                   {cards.map((card) => (
                      <div 
                         key={card.id} 
                         onClick={() => setSelectedCardId(Number(card.id))}
                         className={`flex-shrink-0 p-5 rounded-[28px] border-2 transition-all cursor-pointer min-w-[130px] active:scale-95 ${selectedCardId === Number(card.id) ? 'border-var(--primary-400) bg-var(--primary-50) shadow-lg shadow-rose-100' : 'border-gray-50 bg-white'}`}
                      >
                         <div className="w-10 h-6 rounded-lg mb-3 shadow-sm" style={{ background: card.gradient || card.color }} />
                         <p className="text-[12px] font-black text-var(--text-strong) whitespace-nowrap tracking-tight">{card.name}</p>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6">
                <div className="p-7 rounded-[32px] bg-gray-50/70 border border-gray-100/50 shadow-inner group focus-within:bg-white focus-within:border-var(--primary-100) transition-all">
                   <p className="text-[11px] font-black text-var(--text-soft) uppercase tracking-widest mb-2 opacity-60 group-focus-within:text-var(--primary-400) group-focus-within:opacity-100">금액</p>
                   <div className="flex items-baseline gap-2">
                      <input 
                         type="text" 
                         value={amount}
                         onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                         placeholder="0" 
                         className="bg-transparent text-[42px] font-display font-black text-var(--text-strong) w-full outline-none placeholder:opacity-20 translate-y-1" 
                         autoFocus 
                      />
                      <span className="text-xl font-black text-var(--text-soft)">원</span>
                   </div>
                </div>

                <div className="p-7 rounded-[32px] bg-gray-50/70 border border-gray-100/50 shadow-inner group focus-within:bg-white focus-within:border-var(--primary-100) transition-all">
                   <p className="text-[11px] font-black text-var(--text-soft) uppercase tracking-widest mb-2 opacity-60 group-focus-within:text-var(--primary-400) group-focus-within:opacity-100">
                      {transactionType === 'EXPENSE' ? '사용처' : '출처'}
                   </p>
                   <input 
                      type="text" 
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder={transactionType === 'EXPENSE' ? "예: 스타벅스 강남역점" : "예: 월급"} 
                      className="bg-transparent text-[18px] font-black text-var(--text-strong) w-full outline-none placeholder:opacity-20" 
                   />
                </div>
             </div>

             <button 
                onClick={handleSave}
                className="w-full py-6 rounded-[28px] bg-var(--text-strong) text-white font-black text-[17px] shadow-2xl shadow-gray-400/30 active:scale-95 transition-all mt-6 uppercase tracking-[0.2em] h-20"
             >
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
  onRefresh?: () => void;
}


export function TransactionDetailModal({ isOpen, onClose, tx, onRefresh }: TransactionDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !tx) return null;

  const formattedDate = new Date(tx.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDelete = async () => {
     if (!window.confirm('정말로 이 내역을 삭제하시겠습니까?')) return;
     
     setIsDeleting(true);
     const { deletePayment } = await import('@/lib/cardwise-api');
     const res = await deletePayment(parseInt(tx.id.replace('tx-', '')));
     
     if (res) {
        alert('내역이 삭제되었습니다.');
        onRefresh?.();
        onClose();
        window.location.reload(); // Temporary till we have a better state refresh
     } else {
        alert('삭제에 실패했습니다. (샘플 데이터인 경우 삭제 불가)');
        setIsDeleting(false);
     }
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-6 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#070110]/80 backdrop-blur-3xl" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-white rounded-[64px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${visible ? 'translate-y-0 scale-100' : 'translate-y-24 scale-90'}`}>
          {/* Dynamic Header with Vibrant Gradient */}
          <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 -z-10 overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/3" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/30 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          {/* Actions - Stylish & Discreet */}
          <div className="absolute top-10 right-10 flex items-center gap-3 z-30">
             <button className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white/90 active:scale-75 transition-all border border-white/20 shadow-lg hover:bg-white/30">
                <Pencil size={16} />
             </button>
             <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-9 h-9 rounded-xl bg-rose-500/30 backdrop-blur-xl flex items-center justify-center text-rose-100 active:scale-75 transition-all border border-rose-500/40 shadow-lg hover:bg-rose-500/50 disabled:opacity-50"
             >
                <Trash2 size={16} />
             </button>
          </div>

          <div className="px-10 flex flex-col items-center pt-24 pb-12">
             <div className="w-28 h-28 rounded-[44px] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] flex items-center justify-center text-[54px] mb-8 relative z-10 animate-spring border border-white">
                <span className="relative z-10">{tx.icon}</span>
                <div className="absolute inset-x-2 -bottom-2 h-4 bg-black/5 blur-xl rounded-full" />
             </div>
             
             <div className="text-center relative z-10 mb-12">
                <h2 className="text-[32px] font-black text-white tracking-tighter leading-none mb-3 drop-shadow-sm">{tx.name}</h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{tx.category}</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-white/30" />
                   <span className="text-[13px] font-bold text-white/60 tracking-tight">{tx.description || '카드 결제 완료'}</span>
                </div>
             </div>

             <div className="w-full space-y-1 bg-slate-50/70 rounded-[56px] p-3 border border-gray-100 shadow-inner">
                {/* Main Stats Block */}
                <div className="bg-white rounded-[44px] p-9 shadow-sm border border-gray-50 mb-1">
                   <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <CreditCard size={14} className="opacity-40" />
                      Payment Amount
                   </p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-[44px] font-display font-black text-slate-900 tracking-tighter leading-none">{tx.amount.toLocaleString()}</span>
                      <span className="text-[20px] font-black text-slate-400">{tx.currency === 'USD' ? '$' : '원'}</span>
                   </div>
                   {tx.exchangeRate && (
                     <p className="text-[11px] font-bold text-emerald-500 mt-2 bg-emerald-50 w-fit px-3 py-1 rounded-lg">Applied FX: 1 USD = {tx.exchangeRate} KRW</p>
                   )}
                </div>

                {/* Details Section */}
                <div className="p-8 pt-6 space-y-8">
                   <div className="grid grid-cols-2 gap-y-8 gap-x-10">
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 opacity-50">
                            <Tag size={13} className="text-slate-900" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">분류</p>
                         </div>
                         <p className="text-[15px] font-black text-slate-800 tracking-tight ml-1">{tx.category}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 opacity-50">
                            <Smartphone size={13} className="text-slate-900" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">결제 수단</p>
                         </div>
                         <p className="text-[15px] font-black text-slate-800 tracking-tight ml-1">{tx.paymentMethod || tx.card}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 opacity-50">
                            <ShoppingBag size={13} className="text-slate-900" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">거래 품목</p>
                         </div>
                         <p className="text-[15px] font-black text-slate-800 tracking-tight ml-1 truncate">{tx.items || tx.name}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 opacity-50">
                            <MapPin size={13} className="text-slate-900" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">결제 시각</p>
                         </div>
                         <p className="text-[14px] font-black text-slate-800 tracking-tight ml-1 leading-tight">{formattedDate}</p>
                      </div>
                   </div>

                   {/* Tags Pillbox */}
                   {tx.tags && tx.tags.length > 0 && (
                     <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-2.5">
                        {tx.tags.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-white border border-slate-100 rounded-[18px] text-[12px] font-black text-slate-500 shadow-sm transition-all hover:bg-slate-50 cursor-default">#{tag}</span>
                        ))}
                     </div>
                   )}

                   {/* Premium Benefit Badge */}
                   {(tx.benefitInfo || tx.benefitAmount) && (
                     <div className="p-6 rounded-[36px] bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-200/20 blur-2xl rounded-full" />
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2.5">
                              <Sparkles size={16} className="text-rose-500" />
                              <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Premium Benefit</span>
                           </div>
                           <span className="text-[18px] font-display font-black text-rose-600 tracking-tight">-{tx.benefitAmount?.toLocaleString()}원</span>
                        </div>
                        <p className="text-[14px] font-black text-slate-800 tracking-tight opacity-80 leading-snug">{tx.benefitInfo}</p>
                     </div>
                   )}
                </div>
             </div>

             <button onClick={onClose} className="w-full py-6 mt-8 rounded-[30px] bg-slate-900 text-white font-black text-[17px] active:scale-95 transition-all shadow-xl shadow-slate-200">
                닫기
             </button>
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

import { deleteCard } from '@/lib/cardwise-api';

export function CardSettingsModal({ isOpen, onClose, cards, onUpdate }: CardSettingsModalProps) {
  const [visible, setVisible] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Card | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Swipe state
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(isOpen);
      if (isOpen) {
         setLocalCards(cards);
         setConfirmingDelete(null);
      }
    }, 30);
    return () => clearTimeout(timer);
  }, [isOpen, cards]);

  const handleDelete = async () => {
    if (!confirmingDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCard(parseInt(confirmingDelete.id));
      if (res) {
        const updated = localCards.filter(c => c.id !== confirmingDelete.id);
        setLocalCards(updated);
        setConfirmingDelete(null);
        setSwipeId(null);
        setSwipeOffset(0);
        // Better to reload to sync with backend if needed, or rely on local state
        onUpdate?.(updated); 
      } else {
        alert('카드 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete card error:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
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
                     {confirmingDelete && confirmingDelete.id === card.id ? (
                       <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            disabled={isDeleting}
                            className="bg-rose-500 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-rose-200 disabled:opacity-50"
                          >
                            {isDeleting ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }}
                            className="bg-gray-200 text-gray-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter"
                          >
                            Cancel
                          </button>
                       </div>
                     ) : (
                       <button 
                         onClick={(e) => { e.stopPropagation(); setConfirmingDelete(card); }}
                         className="bg-slate-100 text-slate-400 p-2 rounded-xl active:scale-75 transition-transform"
                       >
                          <X size={14} />
                       </button>
                     )}
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
    const timer = setTimeout(() => {
      setVisible(isOpen);
      if (isOpen && post) {
        loadComments();
      }
    }, 30);
    return () => clearTimeout(timer);
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
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
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
      title: 'Social & Support',
      items: [
        { id: 'community', label: '커뮤니티', icon: Users, color: 'bg-amber-500', desc: '사용자간 정보 공유 및 팁' },
        { id: '/mobile/support', label: '고객지원', icon: HelpCircle, color: 'bg-indigo-500', desc: '공지사항 및 1:1 문의' },
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

export function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState('CARD_HACKS');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isOpen), 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    
    try {
      const { createCommunityPost } = await import('@/lib/cardwise-api');
      const res = await createCommunityPost({ category, title, content, tags: [] });
      if (res?.data) {
        alert('게시글이 등록되었습니다! 🎉');
        onClose();
      } else {
        alert('등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('Create post error:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[1000] flex items-end justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
       <div className="absolute inset-0 bg-[#0a0515]/80 backdrop-blur-xl" onClick={onClose} />
       
       <div className={`relative w-full max-w-[430px] bg-white rounded-t-[50px] p-9 pb-12 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-14 h-1.5 bg-gray-200/60 rounded-full mx-auto mb-10" />
          
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-[26px] font-black text-slate-800 tracking-tighter">새 글 작성</h2>
             <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 active:scale-75 transition-transform">
               <X size={22} />
             </button>
          </div>

          <div className="space-y-6">
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['CARD_HACKS', 'SAVING_TIPS', 'QNA', 'FREE'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-[12px] font-black transition-all ${
                      category === cat ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {cat === 'CARD_HACKS' ? '💡 꿀팁' : cat === 'SAVING_TIPS' ? '💰 절약' : cat === 'QNA' ? '❓ 질문' : '💬 자유'}
                  </button>
                ))}
             </div>

             <div className="space-y-4">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-[16px]"
                />
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  className="w-full h-48 p-6 rounded-[32px] bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-slate-200 transition-all font-medium text-[15px] resize-none"
                />
             </div>

             <button 
                onClick={handleSave}
                disabled={loading || !title.trim() || !content.trim()}
                className="w-full py-6 rounded-[32px] bg-slate-900 text-white font-black text-[17px] shadow-2xl active:scale-95 disabled:opacity-30 transition-all mt-4 tracking-[0.2em] h-20"
              >
                {loading ? '등록 중...' : '등록하기'}
             </button>
          </div>
       </div>
    </div>
  );
}
