"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (token: string) => void
  logout: () => void
  checkAuth: () => boolean
  token?: string | null
  isLoading?: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  checkAuth: () => false,
  token: null,
  isLoading: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
    
    if (!storedToken) {
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
      return false
    }

    // Verificar si el token ha expirado
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]))
      const expiry = new Date(payload.exp * 1000)
      const now = new Date()

      if (now > expiry) {
        console.log('Token expirado')
        logout()
        return false
      }

      setIsAuthenticated(true)
      setUser(payload)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Error al verificar token:', error)
      logout()
      setIsLoading(false)
      return false
    }
  }

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setIsLoading(false)
    checkAuth()
    
    // Disparar evento personalizado para notificar cambios en el mismo tab
    window.dispatchEvent(new Event('local-storage-change'))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        checkAuth,
        token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)