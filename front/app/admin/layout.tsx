"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ToastProvider } from '@/components/ui/toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación del admin
    const adminToken = localStorage.getItem("u2-admin-token");
    
    if (adminToken === "authenticated") {
      setIsAuthenticated(true);
    } else {
      // Si no está autenticado y no está en la página de login, redirigir
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
    
    setIsLoading(false);
  }, [pathname, router]);

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
        </div>
      </div>
    );
  }

  // Si no está autenticado y no está en login, no mostrar nada
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  // Si está en login, mostrar solo el contenido del login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Si está autenticado, mostrar el layout del admin
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header del Admin */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">U2 Group Admin</h1>
                {pathname !== '/admin/dashboard' && (
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    localStorage.removeItem("u2-admin-token");
                    router.push('/admin/login');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
