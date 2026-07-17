import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create settings api instance with correct base URL
const settingsApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'BlogCMS',
    siteLogo: '',
    favicon: '',
    contactEmail: 'admin@blogcms.com',
    footerText: '© 2026 BlogCMS. All rights reserved.',
    socialFacebook: '',
    socialTwitter: '',
    socialGithub: '',
    socialLinkedin: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await settingsApi.get('/settings');
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings from API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update favicon dynamically in document head
  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.head.appendChild(link);
      }
      link.href = `http://localhost:5000${settings.favicon}`;
    }
  }, [settings.favicon]);

  const updateSettingsState = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refetchSettings: fetchSettings, updateSettingsState }}>
      {children}
    </SettingsContext.Provider>
  );
};
