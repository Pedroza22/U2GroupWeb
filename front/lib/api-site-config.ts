import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://u2-group-backend.onrender.com/api';

export interface SiteConfig {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  business_hours: string;
  company_name: string;
  company_slogan: string;
}

// Obtener todas las configuraciones del sitio
export const getSiteConfig = async (): Promise<SiteConfig> => {
  try {
    console.log('🌐 getSiteConfig - Haciendo petición a:', `${API_URL}/admin/site-config/`);
    const response = await axios.get(`${API_URL}/admin/site-config/`);
    console.log('🌐 getSiteConfig - Respuesta recibida:', response.data);
    
    if (response.data.success) {
      console.log('✅ getSiteConfig - Configuración obtenida exitosamente:', response.data.data);
      return response.data.data;
    } else {
      console.error('❌ getSiteConfig - Error en respuesta:', response.data.message);
      throw new Error(response.data.message || 'Error obteniendo configuración');
    }
  } catch (error) {
    console.error('❌ getSiteConfig - Error obteniendo configuración del sitio:', error);
    // Retornar configuración por defecto en caso de error
    const defaultConfig = {
      site_name: 'U2 Group',
      site_description: 'Diseños arquitectónicos profesionales',
      contact_email: 'info@u2group.com',
      contact_phone: '+57 300 123 4567',
      contact_address: 'Calle 123, Ciudad, Colombia',
      social_facebook: 'https://facebook.com/u2group',
      social_instagram: 'https://instagram.com/u2group',
      social_twitter: 'https://twitter.com/u2group',
      business_hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
      company_name: 'U2 Group Arquitectura',
      company_slogan: 'Diseñando tu futuro'
    };
    console.log('🔄 getSiteConfig - Usando configuración por defecto:', defaultConfig);
    return defaultConfig;
  }
};

// Actualizar configuración del sitio
export const updateSiteConfig = async (config: Partial<SiteConfig>): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/admin/site-config/bulk-update/`, config);
    
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Configuración actualizada exitosamente'
      };
    } else {
      throw new Error(response.data.message || 'Error actualizando configuración');
    }
  } catch (error) {
    console.error('Error actualizando configuración del sitio:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    };
  }
};

// Obtener una configuración específica
export const getSiteConfigValue = async (key: string): Promise<string | null> => {
  try {
    const config = await getSiteConfig();
    return config[key as keyof SiteConfig] || null;
  } catch (error) {
    console.error(`Error obteniendo configuración ${key}:`, error);
    return null;
  }
};
