'use client';

import React, { useState } from 'react';
import { X, Check, CreditCard, Plus, ChevronRight, ImageIcon, LinkIcon } from 'lucide-react';

interface CardTemplate {
  id: string;
  name: string;
  issuer: string;
  gradient: string;
  benefit: string;
}

const TEMPLATES: CardTemplate[] = [
  { id: 't1', name: '삼성카드 iD SIMPLE', issuer: '삼성카드', gradient: 'linear-gradient(135deg, #007aff, #00c6ff)', benefit: '1% 무제한 할인' },
  { id: 't2', name: '현대카드 M Boost', issuer: '현대카드', gradient: 'linear-gradient(135deg, #111, #444)', benefit: '최대 3% M포인트 적립' },
  { id: 't3', name: '신한카드 Deep Dream', issuer: '신한카드', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', benefit: '0.7% 기본 적립' },
  { id: 't4', name: 'KB국민 노리2 체크', issuer: 'KB국민카드', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', benefit: '커피/편의점 10% 할인' },
];

import { Card } from '@/types/mobile';

export function CardRegistrationModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (card: Card) => void }) {
  const [step, setStep] = useState<'type' | 'template' | 'manual' | 'success'>('type');
  const [formData, setFormData] = useState({
    name: '',
    firstFour: '',
    lastFour: '',
    issuer: '',
    benefitType: 'discount' as 'discount' | 'mileage' | 'point',
    benefitValue: '',
    infoUrl: '',
    cardImageUrl: ''
  });

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    setTimeout(() => {
      onAdd({
        ...formData,
        id: Date.now().toString(),
        gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
        current: 0,
        target: 300000
      });
      onClose();
    }, 1500);
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    setFormData({
      ...formData,
      name: template.name,
      issuer: template.issuer,
      benefitValue: template.benefit
    });
    setStep('manual'); // Move to details for number entry
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[430px] bg-white rounded-t-[48px] p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[24px] font-black text-slate-800 tracking-tighter">새 카드 등록</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'type' && (
          <div className="space-y-4 pb-8">
            <button 
              onClick={() => setStep('template')}
              className="w-full p-7 rounded-[32px] bg-rose-50 border border-rose-100 flex items-center gap-5 group active:scale-[0.98] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <CreditCard size={28} />
              </div>
              <div className="text-left">
                <p className="text-[17px] font-black text-rose-600">카드사 템플릿에서 선택</p>
                <p className="text-[12px] font-bold text-rose-400 opacity-70">주요 카드사 인기 카드 정보를 불러옵니다</p>
              </div>
              <ChevronRight size={20} className="ml-auto text-rose-300" />
            </button>

            <button 
              onClick={() => setStep('manual')}
              className="w-full p-7 rounded-[32px] bg-white border border-gray-100 flex items-center gap-5 group active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                <Plus size={28} />
              </div>
              <div className="text-left">
                <p className="text-[17px] font-black text-slate-700">직접 정보 입력</p>
                <p className="text-[12px] font-bold text-gray-400">카드 애칭, 번호 등 상세 정보를 입력합니다</p>
              </div>
              <ChevronRight size={20} className="ml-auto text-gray-300" />
            </button>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-4 pb-8">
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-4">Popular Card Templates</p>
            <div className="grid grid-cols-1 gap-3">
              {TEMPLATES.map((t) => (
                <div 
                  key={t.id} 
                  onClick={() => handleTemplateSelect(t)}
                  className="p-5 rounded-[28px] border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 transition-all cursor-pointer group flex items-center gap-4"
                >
                  <div className="w-16 h-10 rounded-lg shadow-sm group-hover:scale-105 transition-transform" style={{ background: t.gradient }} />
                  <div className="flex-1">
                    <p className="text-[14px] font-black text-slate-800">{t.name}</p>
                    <p className="text-[11px] font-bold text-rose-400">{t.benefit}</p>
                  </div>
                  <Check size={16} className="text-gray-200 group-hover:text-rose-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-6 pb-12">
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">카드사 및 명칭</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 focus:bg-white focus:border-rose-400 outline-none transition-all font-bold text-slate-700"
                  placeholder="예: 삼성카드 iD SIMPLE"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">카드 번호 (앞 4자리)</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={formData.firstFour}
                    onChange={e => setFormData({...formData, firstFour: e.target.value})}
                    className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 focus:bg-white focus:border-rose-400 outline-none transition-all font-display font-black text-[18px] tracking-[4px]"
                    placeholder="1234"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">카드 번호 (뒤 4자리)</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={formData.lastFour}
                    onChange={e => setFormData({...formData, lastFour: e.target.value})}
                    className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 focus:bg-white focus:border-rose-400 outline-none transition-all font-display font-black text-[18px] tracking-[4px]"
                    placeholder="5678"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block">주요 혜택 한줄 요약</label>
                <input 
                  type="text" 
                  value={formData.benefitValue}
                  onChange={e => setFormData({...formData, benefitValue: e.target.value})}
                  className="w-full p-5 rounded-[24px] bg-gray-50 border border-gray-100 focus:bg-white focus:border-rose-400 outline-none transition-all font-bold text-rose-500"
                  placeholder="예: 모든 가맹점 1% 할인"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-[24px] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all">
                    <ImageIcon size={20} className="text-gray-300" />
                    <span className="text-[10px] font-black text-gray-400">실물 카드 이미지</span>
                 </div>
                 <div className="p-4 rounded-[24px] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all">
                    <LinkIcon size={20} className="text-gray-300" />
                    <span className="text-[10px] font-black text-gray-400">카드 정보 URL</span>
                 </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full p-6 rounded-[28px] bg-rose-500 text-white font-black text-[17px] shadow-lg shadow-rose-500/30 active:scale-95 transition-all mt-4"
            >
              카드 등록 완료
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="py-20 flex flex-col items-center justify-center animate-spring">
             <div className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center text-white mb-8 shadow-2xl shadow-rose-500/40">
                <Check size={48} strokeWidth={3} />
             </div>
             <h3 className="text-[24px] font-black text-slate-800 tracking-tighter mb-2">등록 성공!</h3>
             <p className="text-[14px] font-bold text-gray-400">카드가 포트폴리오에 안전하게 추가되었습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
