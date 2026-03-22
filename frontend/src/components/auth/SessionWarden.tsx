'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionContextType {
  lastActivity: number;
  isExpired: boolean;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function SessionWarden({ children }: { children: React.ReactNode }) {
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now());
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const resetSession = useCallback(() => {
    if (!isExpired) {
      setLastActivity(Date.now());
    }
  }, [isExpired]);

  const handleLogout = useCallback(() => {
    setIsExpired(true);
    router.push('/login?reason=timeout');
  }, [router]);

  useEffect(() => {
    if (pathname.includes('/login')) return; // Don't monitor on login pages

    const checkSession = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        handleLogout();
      }
    };

    const interval = setInterval(checkSession, 10000); // Check every 10 seconds

    const handleInteraction = () => resetSession();
    
    // Listen for common user interactions
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [lastActivity, handleLogout, resetSession, pathname]);

  return (
    <SessionContext.Provider value={{ lastActivity, isExpired, resetSession }}>
      {children}
      {/* Session Timeout Warning Overlay (Optional but good for UX) */}
      {isExpired && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl animate-spring">
             <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-3xl">⏰</span>
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-3">세션이 만료되었습니다</h2>
             <p className="text-slate-500 font-medium mb-8 leading-relaxed">
               보안을 위해 5분간 활동이 없어<br/>자동으로 로그아웃되었습니다.
             </p>
             <button 
               onClick={() => {
                 setIsExpired(false);
                 router.push('/login');
               }}
               className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
             >
               다시 로그인하기
             </button>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionWarden');
  return context;
};
