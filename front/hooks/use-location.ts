import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  country: string;
  currency: string;
  currencySymbol: string;
}

// Mapeo de países a monedas
const countryToCurrency: Record<string, { currency: string; symbol: string }> = {
  'US': { currency: 'usd', symbol: '$' },
  'CA': { currency: 'cad', symbol: 'C$' },
  'MX': { currency: 'mxn', symbol: '$' },
  'ES': { currency: 'eur', symbol: '€' },
  'AR': { currency: 'ars', symbol: '$' },
  'BR': { currency: 'brl', symbol: 'R$' },
  'CL': { currency: 'clp', symbol: '$' },
  'CO': { currency: 'cop', symbol: '$' },
  'PE': { currency: 'pen', symbol: 'S/' },
  'VE': { currency: 'ves', symbol: 'Bs' },
  'EC': { currency: 'usd', symbol: '$' }, // Ecuador usa USD
  'UY': { currency: 'uyu', symbol: '$' },
  'PY': { currency: 'pyg', symbol: '₲' },
  'BO': { currency: 'bob', symbol: 'Bs' },
  'GY': { currency: 'gyd', symbol: '$' },
  'SR': { currency: 'srd', symbol: '$' },
  'GF': { currency: 'eur', symbol: '€' }, // Guayana Francesa usa EUR
};

export function useLocation() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocationFromStorage = useCallback(() => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        setLocationData(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading location from storage:', err);
    }
    return null;
  }, []);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setLoading(true);
        
        // Intentar obtener la ubicación desde localStorage primero
        const savedLocation = loadLocationFromStorage();
        if (savedLocation) {
          setLoading(false);
          return;
        }

        // Si no hay ubicación guardada, detectar automáticamente
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const country = data.country_code || 'US';
        const currencyInfo = countryToCurrency[country] || { currency: 'usd', symbol: '$' };
        
        const locationInfo: LocationData = {
          country,
          currency: currencyInfo.currency,
          currencySymbol: currencyInfo.symbol,
        };

        // Guardar en localStorage para futuras visitas
        localStorage.setItem('userLocation', JSON.stringify(locationInfo));
        
        setLocationData(locationInfo);
        setError(null);
      } catch (err) {
        console.error('Error detectando ubicación:', err);
        setError('No se pudo detectar la ubicación');
        
        // Fallback a USD
        const fallbackLocation: LocationData = {
          country: 'US',
          currency: 'usd',
          currencySymbol: '$',
        };
        setLocationData(fallbackLocation);
      } finally {
        setLoading(false);
      }
    };

    detectLocation();
  }, [loadLocationFromStorage]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLocation = loadLocationFromStorage();
      if (savedLocation) {
        setLocationData(savedLocation);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadLocationFromStorage]);

  const updateLocation = useCallback((country: string) => {
    const currencyInfo = countryToCurrency[country] || { currency: 'usd', symbol: '$' };
    const newLocation: LocationData = {
      country,
      currency: currencyInfo.currency,
      currencySymbol: currencyInfo.symbol,
    };
    
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    setLocationData(newLocation);
    
    // Disparar un evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: newLocation }));
  }, []);

  return {
    locationData,
    loading,
    error,
    updateLocation,
    loadLocationFromStorage,
  };
}
