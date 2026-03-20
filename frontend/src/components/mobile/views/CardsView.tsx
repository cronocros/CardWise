'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CreditCardComponent } from '@/components/mobile/cards';
import { Card } from '@/types/mobile';

interface CardsViewProps {
  cards: Card[];
  setShowAddCard: (val: boolean) => void;
  router: any; // NextRouter typing
}

export function CardsView({ cards, setShowAddCard, router }: CardsViewProps) {
  return (
    <div className="animate-spring space-y-6 pt-4">
      <div className="space-y-4">
        {cards.map(card => (
          <div key={card.id} onClick={() => router.push('/mobile/card-detail')} className="cursor-pointer">
            <CreditCardComponent card={card} />
          </div>
        ))}
      </div>
      <button 
        onClick={() => setShowAddCard(true)}
        className="w-full py-10 rounded-[40px] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-rose-100 text-rose-400 bg-white group active:scale-[0.97] transition-all shadow-sm"
      >
        <div className="w-14 h-14 rounded-[22px] bg-rose-50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Plus size={30} className="text-rose-400" />
        </div>
        <div className="text-center">
           <p className="text-[15px] font-black text-gray-700">새로운 카드 등록</p>
           <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Register New Card</p>
        </div>
      </button>
    </div>
  );
}
