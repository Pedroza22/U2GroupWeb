'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar el token cada minuto
    const checkToken = () => {
      const token = localStorage.getItem('u2-token');
      if (!token) return;
      
      try {
        // Verificar si el token está próximo a expirar (menos de 5 minutos)
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000; // Convertir a milisegundos
        const currentTime = Date.now();
        
        // Si el token expira en menos de 5 minutos, mostrar el modal
        if (expirationTime - currentTime < 5 * 60 * 1000) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error al verificar el token:', error);
      }
    };

    // Verificar inmediatamente y luego cada minuto
    checkToken();
    const interval = setInterval(checkToken, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setIsOpen(false);
    router.push('/marketplace/login' as any);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Image 
                src="/icons/lock.svg" 
                alt="Acceso requerido" 
                width={32} 
                height={32}
                onError={(e) => {
                  // Fallback si la imagen no existe
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMDgyRUMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIxMSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjExIiByeD0iMiIgcnk9IjIiPjwvcmVjdD48cGF0aCBkPSJNNyAxMVY3YTUgNSAwIDAgMSAxMCAwdjQiPjwvcGF0aD48L3N2Zz4=';
                }}
              />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sesión expirada</h2>
          <p className="text-gray-600 mb-6">Tu sesión ha expirado o está a punto de expirar. Por favor, inicia sesión nuevamente para continuar.</p>
          
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
            >
              Cerrar
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleLogin}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}