"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, Settings, Globe, Mail, Phone, MapPin, Share2 } from "lucide-react"
import axios from "axios"

interface SiteConfig {
  site_name: string
  site_description: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_facebook: string
  social_instagram: string
  social_twitter: string
  social_linkedin: string
}

export default function SiteConfiguration() {
  const [config, setConfig] = useState<SiteConfig>({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get("/api/design/site-configuration/")
      const configData = response.data
      
      setConfig(prev => ({
        ...prev,
        ...configData
      }))
    } catch (err: any) {
      console.error('Error cargando configuración:', err)
      setError('Error al cargar la configuración del sitio')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await axios.put("/api/design/site-configuration/", config)
      
      if (response.data.status === 'success') {
        setSuccessMessage('Configuración guardada exitosamente')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(response.data.message || 'Error al guardar la configuración')
      }
    } catch (err: any) {
      console.error('Error guardando configuración:', err)
      setError(err.response?.data?.message || 'Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sitio</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Información General</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sitio
              </label>
              <Input
                name="site_name"
                value={config.site_name}
                onChange={handleInputChange}
                placeholder="U2 Group"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <Input
                name="site_description"
                value={config.site_description}
                onChange={handleInputChange}
                placeholder="Arquitectura del Futuro"
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Información de Contacto */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <Input
                name="contact_email"
                type="email"
                value={config.contact_email}
                onChange={handleInputChange}
                placeholder="hello@u2group.com"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <Input
                name="contact_phone"
                value={config.contact_phone}
                onChange={handleInputChange}
                placeholder="+34 123 456 789"
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <Textarea
                name="contact_address"
                value={config.contact_address}
                onChange={handleInputChange}
                placeholder="Dirección de la oficina"
                rows={3}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Redes Sociales */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Redes Sociales</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <Input
                name="social_facebook"
                value={config.social_facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/u2group"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <Input
                name="social_instagram"
                value={config.social_instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/u2group"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <Input
                name="social_twitter"
                value={config.social_twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/u2group"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <Input
                name="social_linkedin"
                value={config.social_linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/company/u2group"
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
