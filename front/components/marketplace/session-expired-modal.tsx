"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { X, AlertTriangle } from "lucide-react"

export default function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar la sesión cada minuto
    const checkSession = () => {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiry = new Date(payload.exp * 1000)
        const now = new Date()
        
        // Si el token está a punto de expirar (menos de 5 minutos)
        if ((expiry.getTime() - now.getTime()) < 5 * 60 * 1000) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Error al verificar token:', error)
      }
    }
    
    // Verificar inmediatamente y luego cada minuto
    checkSession()
    const interval = setInterval(checkSession, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    setIsOpen(false)
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
        {/* Botón de cerrar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition-colors group"
        >
          <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
        </button>
        
        {/* Icono de alerta */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        
        {/* Contenido */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Sesión a punto de expirar
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Tu sesión está a punto de expirar. Por favor, inicia sesión nuevamente para continuar.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg"
            >
              Iniciar sesión nuevamente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}