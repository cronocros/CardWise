'use client';

import React from 'react';
import Link from 'next/link';
import { Home, CreditCard, BookOpen, Gift, User, LogOut } from 'lucide-react';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { id: 'home', label: '홈', icon: <Home size={20} />, href: '/web/dashboard' },
    { id: 'cards', label: '카드 관리', icon: <CreditCard size={20} />, href: '/web/cards' },
    { id: 'ledger', label: '가계부', icon: <BookOpen size={20} />, href: '/web/ledger' },
    { id: 'benefits', label: '혜택/바우처', icon: <Gift size={20} />, href: '/web/benefits' },
    { id: 'mypage', label: '마이페이지', icon: <User size={20} />, href: '/web/mypage' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-6 h-6">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tighter">CardWise</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all group"
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition-all">
            <LogOut size={20} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
