'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Check } from 'lucide-react';

const steps = [
  {
    title: '스마트한 카드 관리',
    desc: '여러 장의 카드를 한눈에 관리하고\n실적 달성 현황을 실시간으로 확인하세요.',
    image: '/onboarding-card.png',
    color: 'from-rose-400 to-rose-600'
  },
  {
    title: '나를 위한 소비 분석',
    desc: '지출 패턴을 정밀하게 분석하여\n가장 큰 혜택을 주는 카드를 추천해 드립니다.',
    image: '/onboarding-analytics.png',
    color: 'from-blue-400 to-indigo-600'
  },
  {
    title: '철저한 보안과 관리',
    desc: '개인정보는 안전하게 보호되며\n공동 가계부를 통해 함께 관리할 수 있습니다.',
    image: '/onboarding-safe.png',
    color: 'from-emerald-400 to-teal-600'
  }
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = () => {
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    } else {
      router.push('/mobile/login');
    }
  };

  return (
    <div className="mobile-container bg-white flex flex-col h-screen overflow-hidden">
      {/* Top Skip Button */}
      <div className="flex justify-end p-6 pt-12">
        <button 
          onClick={() => router.push('/mobile/login')}
          className="text-[14px] font-black text-var(--text-soft) uppercase tracking-widest active:scale-90 transition-transform"
        >
          Skip
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative">
        {steps.map((step, i) => (
          <div 
            key={i}
            className={`absolute inset-0 flex flex-col items-center px-10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${i === current ? 'opacity-100 translate-x-0' : i < current ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'}`}
          >
            <div className="relative w-full aspect-square max-w-[300px] mb-12 animate-float">
               {/* 3D Asset Placeholder - Assuming assets are copied to public/ if not automated, I'll use absolute paths in real implementation but here I'll use them as provided */}
               <div className="absolute inset-0 bg-var(--primary-50) rounded-[60px] blur-3xl opacity-30" />
               <Image 
                 src={step.image} 
                 alt={step.title}
                 width={300}
                 height={300}
                 className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
               />
            </div>
            
            <h2 className="text-[28px] font-black text-var(--text-strong) text-center mb-4 tracking-tighter leading-tight">
              {step.title}
            </h2>
            <p className="text-[15px] text-var(--text-soft) text-center whitespace-pre-wrap leading-relaxed font-bold opacity-70">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <div className="p-10 pb-16 flex flex-col items-center gap-10">
        {/* Pagination Dots */}
        <div className="flex gap-2.5">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-var(--primary-400)' : 'w-2 bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button 
          onClick={next}
          className="w-full h-20 rounded-[32px] bg-var(--text-strong) text-white flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl overflow-hidden group relative"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <span className="text-[17px] font-black tracking-widest uppercase relative z-10">
             {current === steps.length - 1 ? '시작하기' : '다음으로'}
           </span>
           {current === steps.length - 1 ? <Check size={24} className="relative z-10" /> : <ChevronRight size={24} className="relative z-10" />}
        </button>
      </div>

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
