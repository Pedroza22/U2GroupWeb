"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Save,
  Globe,
  Mail
} from 'lucide-react';
import BackToDashboard from '@/components/admin/back-to-dashboard';
import { getSiteConfig, updateSiteConfig, SiteConfig } from '@/lib/api-site-config';

export default function AdminSiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig>({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    business_hours: '',
    company_name: '',
    company_slogan: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando configuración del sitio...');
      const siteConfig = await getSiteConfig();
      setConfig(siteConfig);
      console.log('✅ Configuración cargada:', siteConfig);
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Guardando configuración:', config);
      
      const result = await updateSiteConfig(config);
      
      if (result.success) {
        console.log('✅ Configuración guardada exitosamente');
        alert('Configuración guardada correctamente');
      } else {
        console.error('❌ Error guardando configuración:', result.message);
        alert(`Error al guardar la configuración: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando configuración...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Sitio</h1>
            <p className="text-gray-600 mt-2">Administra la configuración general del sitio web</p>
          </div>
          <BackToDashboard />
        </div>
      </div>

      <div className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_name">Nombre del Sitio</Label>
              <Input
                id="site_name"
                value={config.site_name}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Nombre del sitio web"
              />
            </div>
            <div>
              <Label htmlFor="site_description">Descripción del Sitio</Label>
              <Textarea
                id="site_description"
                value={config.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Descripción del sitio web"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_email">Email de Contacto</Label>
              <Input
                id="contact_email"
                type="email"
                value={config.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="info@u2group.com"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
              <Input
                id="contact_phone"
                value={config.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div>
              <Label htmlFor="contact_address">Dirección</Label>
              <Textarea
                id="contact_address"
                value={config.contact_address}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                placeholder="Dirección de la empresa"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="business_hours">Horarios de Atención</Label>
              <Input
                id="business_hours"
                value={config.business_hours}
                onChange={(e) => handleInputChange('business_hours', e.target.value)}
                placeholder="Lunes a Viernes: 8:00 AM - 6:00 PM"
              />
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={config.social_facebook}
                onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                placeholder="https://facebook.com/u2group"
              />
            </div>
            <div>
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={config.social_instagram}
                onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                placeholder="https://instagram.com/u2group"
              />
            </div>
            <div>
              <Label htmlFor="social_twitter">Twitter</Label>
              <Input
                id="social_twitter"
                value={config.social_twitter}
                onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                placeholder="https://twitter.com/u2group"
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Información de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Nombre Completo de la Empresa</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="U2 Group Arquitectura"
              />
            </div>
            <div>
              <Label htmlFor="company_slogan">Slogan de la Empresa</Label>
              <Input
                id="company_slogan"
                value={config.company_slogan}
                onChange={(e) => handleInputChange('company_slogan', e.target.value)}
                placeholder="Diseñando tu futuro"
              />
            </div>
          </CardContent>
        </Card>



        {/* Botón Guardar */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  );
}



