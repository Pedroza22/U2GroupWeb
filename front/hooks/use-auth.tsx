"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (token: string) => void
  logout: () => void
  checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  checkAuth: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    // Escuchar cambios en localStorage para detectar login/logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          // Token agregado - usuario se autenticó
          checkAuth()
        } else {
          // Token removido - usuario cerró sesión
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }

    // Escuchar eventos de storage (para cambios desde otras pestañas)
    window.addEventListener('storage', handleStorageChange)
    
    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleCustomStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('auth-state-changed', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-state-changed', handleCustomStorageChange)
    }
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      return false
    }

    // Verificar si el token ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiry = new Date(payload.exp * 1000)
      const now = new Date()

      if (now > expiry) {
        console.log('Token expirado')
        logout()
        return false
      }

      setIsAuthenticated(true)
      setUser(payload)
      return true
    } catch (error) {
      console.error('Error al verificar token:', error)
      logout()
      return false
    }
  }

  const login = async (token: string) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
    
    // Decodificar el token para obtener la información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
    } catch (error) {
      console.error('Error al decodificar token:', error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 