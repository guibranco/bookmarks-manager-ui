import { useState, useEffect } from 'react';
import { AppConfig } from '../types';

const defaultConfig: AppConfig = {
  darkMode: false,
  showSidebar: window.innerWidth >= 768,
  viewMode: 'grid',
  flattenSubfolders: true,
  apiKey: '',
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(loadConfig());

  function loadConfig(): AppConfig {
    const savedConfig = localStorage.getItem('bookmarkManagerConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
        return defaultConfig;
      }
    }
    return defaultConfig;
  }

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile && config.showSidebar) {
        setConfig(prev => ({ ...prev, showSidebar: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.showSidebar]);

  useEffect(() => {
    localStorage.setItem('bookmarkManagerConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (config.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.darkMode]);

  return {
    config,
    setConfig,
    defaultConfig,
  };
}