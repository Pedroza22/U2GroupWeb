import { useState, useEffect } from 'react';
import { getSiteConfig, SiteConfig } from '@/lib/api-site-config';

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('🔄 useSiteConfig - Iniciando carga de configuración...');
        setLoading(true);
        setError(null);
        const siteConfig = await getSiteConfig();
        console.log('✅ useSiteConfig - Configuración cargada:', siteConfig);
        setConfig(siteConfig);
      } catch (err) {
        console.error('❌ useSiteConfig - Error cargando configuración:', err);
        setError(err instanceof Error ? err.message : 'Error cargando configuración');
      } finally {
        setLoading(false);
        console.log('🏁 useSiteConfig - Carga completada');
      }
    };

    loadConfig();
  }, []);

  const getValue = (key: keyof SiteConfig): string => {
    if (!config) return '';
    return config[key] || '';
  };

  return {
    config,
    loading,
    error,
    getValue
  };
};
