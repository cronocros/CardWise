'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  level: number;
  exp: number;
  tierName: string;
  photoUrl?: string;
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (isInitialFlag: boolean = false) => {
    if (!isInitialFlag) setLoading(true);
    
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      const { data: profile } = await supabase
        .from('account_profile')
        .select('display_name, level, exp, tier_name, avatar_url')
        .eq('account_id', authUser.id)
        .single();
        
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        displayName: profile?.display_name || authUser.email?.split('@')[0] || '사용자',
        level: profile?.level || 1,
        exp: profile?.exp || 0,
        tierName: profile?.tier_name || 'BRONZE',
        photoUrl: profile?.avatar_url
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    
    const initFetch = async () => {
      await fetchUser(true);
      if (!isMounted) return;
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: () => fetchUser() }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
