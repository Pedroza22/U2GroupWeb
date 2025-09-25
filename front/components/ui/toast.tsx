"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  message?: string;
  duration?: number;
  key?: string; // Para identificar toasts que deben reemplazarse
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  replaceToast: (key: string, newToast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    // Si es un toast con key, reemplazar el anterior
    if (toast.key) {
      setToasts(prev => {
        const filtered = prev.filter(t => t.key !== toast.key);
        return [...filtered, newToast];
      });
    } else {
      setToasts(prev => [...prev, newToast]);
    }

    // Auto remove after duration (except loading)
    if (toast.type !== 'loading' && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const replaceToast = (key: string, newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId = { ...newToast, id, key };
    
    setToasts(prev => {
      const filtered = prev.filter(t => t.key !== key);
      return [...filtered, toastWithId];
    });

    // Auto remove after duration (except loading)
    if (newToast.type !== 'loading' && newToast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration || 5000);
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, replaceToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-md w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {toast.title}
          </h3>
          {toast.message && (
            <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
              {toast.message}
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, replaceToast } = context;

  return {
    success: (title: string, message?: string, key?: string) => 
      addToast({ type: 'success', title, message, key }),
    error: (title: string, message?: string, key?: string) => 
      addToast({ type: 'error', title, message, key }),
    info: (title: string, message?: string, key?: string) => 
      addToast({ type: 'info', title, message, key }),
    loading: (title: string, message?: string, key?: string) => 
      addToast({ type: 'loading', title, message, key, duration: 0 }),
    replace: (key: string, type: 'success' | 'error' | 'info', title: string, message?: string) =>
      replaceToast(key, { type, title, message }),
    dismiss: (id: string) => context.removeToast(id),
    clear: () => context.clearToasts()
  };
}
