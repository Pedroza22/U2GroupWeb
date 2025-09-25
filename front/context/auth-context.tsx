"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, register as apiRegister, logout as apiLogout, LoginCredentials, RegisterData } from '@/lib/api-auth';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Para desarrollo, siempre estar autenticado
    setUser({ id: 1, username: 'juan', email: 'julianpedrozaospina@gmail.com' });
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { access } = await apiLogin(credentials);
    const decoded: { user_id: number; username: string; email: string } = jwtDecode(access);
    setUser({ id: decoded.user_id, username: decoded.username, email: decoded.email });
    router.push('/marketplace');
  };

  const register = async (data: RegisterData) => {
    await apiRegister(data);
    // Redirect to login page after successful registration to let them log in
    router.push('/login'); 
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    // Limpiar también el token de admin si existe
    localStorage.removeItem('u2-admin-token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 