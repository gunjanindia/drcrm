'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '@/types';
import { defaultSiteSettings } from '@/lib/store';

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSiteSettings,
  isLoading: false,
  updateSettings: async () => ({ success: false }),
  refreshSettings: async () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/site');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/settings/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update site settings.' };
      }

      setSettings(data.settings);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating settings.' };
    }
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading, updateSettings, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
