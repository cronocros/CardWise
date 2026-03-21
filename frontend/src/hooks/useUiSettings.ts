'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/providers/UserProvider';

export function useUiSettings<T>(category: string, defaultSettings: T) {
  const { user } = useUser();
  const [settings, setSettings] = useState<T>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Use relative path for Next.js proxy or direct API calls 
  // (Assuming backend is reachable via /api prefix if proxied, or we use full URL)
  // For now we'll assume a direct call or dev proxy is set.
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/user-settings/${user.id}/${category}`);
      if (res.ok) {
        const data = await res.json();
        // Check if data is an array or object and not empty
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          setSettings(data as T);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, category, API_BASE]);

  const saveSettings = useCallback(async (newSettings: T) => {
    if (!user?.id) return;
    setSettings(newSettings);
    try {
      await fetch(`${API_BASE}/api/v1/user-settings/${user.id}/${category}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.warn('Failed to save settings', err);
    }
  }, [user?.id, category, API_BASE]);

  const resetSettings = useCallback(() => {
    saveSettings(defaultSettings);
  }, [saveSettings, defaultSettings]);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id, fetchSettings]);

  return { settings, setSettings, saveSettings, resetSettings, loading };
}
