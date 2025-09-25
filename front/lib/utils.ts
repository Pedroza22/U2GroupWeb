import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para generar un ID único para el visitante
export function generateVisitorId() {
  return 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Función para obtener el ID del visitante actual
export function getVisitorId() {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

// Utilidades para manejo seguro de localStorage en Next.js

export const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const setLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const removeLocalStorage = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};
