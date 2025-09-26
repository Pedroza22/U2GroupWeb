"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { X, Lock, User, UserPlus } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  message?: string
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Acceso Requerido",
  message = "Para continuar necesitas tener una cuenta"
}: LoginModalProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogin = () => {
    onClose()
    // Redirigir al login principal con la URL de redirección
    const currentPath = window.location.pathname
    // Si estamos en la página de detalle del producto, redirigir a la página de planos
    const redirectPath = currentPath.includes('/marketplace/products/') && !currentPath.includes('/plans')
      ? `${currentPath}/plans`
      : currentPath
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
  }

  const handleRegister = () => {
    onClose()
    const currentPath = window.location.pathname
    const redirectPath = currentPath.includes('/marketplace/products/') && !currentPath.includes('/plans')
      ? `${currentPath}/plans`
      : currentPath
    router.push(`/register?redirect=${encodeURIComponent(redirectPath)}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal mejorado */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
        {/* Botón de cerrar mejorado */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition-colors group"
        >
          <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
        </button>
        
        {/* Icono de seguridad */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Contenido */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title || t("Acceso Requerido")}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message || t("Inicia sesión para acceder a todos los detalles y opciones")}
          </p>
          
          <div className="space-y-3">
            {/* Botón de Login principal */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <User className="w-5 h-5 mr-2" />
              Iniciar Sesión
            </Button>
            
            {/* Botón de Registro secundario */}
            <Button 
              onClick={handleRegister}
              variant="outline"
              className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-semibold py-3 rounded-xl transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Cuenta
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("login_benefits") || "Al crear una cuenta podrás guardar favoritos, acceder a planos completos y realizar compras."} 
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}