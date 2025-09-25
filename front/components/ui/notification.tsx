"use client";

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && type !== 'loading') {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, type]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
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
    switch (type) {
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

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {title}
            </h3>
            {message && (
              <div className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                {message}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar notificaciones
export function useNotification() {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message?: string;
    isVisible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });

  const showNotification = (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => {
    setNotification({ type, title, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification('success', title, message);
  };

  const showError = (title: string, message?: string) => {
    showNotification('error', title, message);
  };

  const showLoading = (title: string, message?: string) => {
    showNotification('loading', title, message);
  };

  const showInfo = (title: string, message?: string) => {
    showNotification('info', title, message);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showLoading,
    showInfo
  };
}








