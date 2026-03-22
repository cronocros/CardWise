import React from 'react';
import { GlobalHeader } from '@/components/mobile/global-header';
import { ScrollToTopButton } from '@/components/mobile/scroll-to-top';

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[12px] font-black text-slate-800 bg-transparent sticky top-0 z-[100] backdrop-blur-sm">
      <span>9:41</span>
      <div className="flex items-center gap-2">
        <span className="opacity-50">75%</span>
        <div className="w-[20px] h-[10px] border-[1px] border-slate-400 rounded-[3px] p-[1.5px] relative">
          <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-slate-400 rounded-r-[1px]" />
          <div className="h-full w-[75%] bg-slate-800 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mobile-container overflow-x-hidden shadow-2xl bg-var(--primary-50)">
      {/* Background Orbs (Visual consistency with design system) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[300px] h-[300px] bg-var(--primary-100) blur-[80px] opacity-40 rounded-full" />
        <div className="absolute top-[40%] -left-[20%] w-[400px] h-[400px] bg-var(--primary-50) blur-[100px] opacity-30 rounded-full" />
        <div className="absolute -bottom-[5%] right-[5%] w-[250px] h-[250px] bg-var(--primary-200) blur-[70px] opacity-20 rounded-full" />
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <div className="sticky top-0 z-[100] bg-white/60 backdrop-blur-xl border-b border-slate-100/50">
          <StatusBar />
          <GlobalHeader />
        </div>
        <div id="mobile-scroll-container" className="flex-1 w-full overflow-y-auto relative scroll-smooth">
          {children}
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
