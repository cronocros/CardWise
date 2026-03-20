import React from 'react';

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
        {children}
      </div>
    </div>
  );
}
