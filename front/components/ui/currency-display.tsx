'use client';

import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/use-location';
import { getCurrencyInfo } from '@/lib/currency-converter';

interface CurrencyDisplayProps {
  className?: string;
  showSelector?: boolean;
}

export function CurrencyDisplay({ className = '', showSelector = false }: CurrencyDisplayProps) {
  const { locationData, updateLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(locationData?.currency || 'usd');

  // Sincronizar el estado local con locationData
  useEffect(() => {
    if (locationData?.currency) {
      setCurrentCurrency(locationData.currency);
    }
  }, [locationData?.currency]);

  if (!locationData) {
    return null;
  }

  const currencyInfo = getCurrencyInfo(currentCurrency);

  const countries = [
    // América
    { code: 'US', name: 'Estados Unidos', currency: 'usd' },
    { code: 'CA', name: 'Canadá', currency: 'cad' },
    { code: 'MX', name: 'México', currency: 'mxn' },
    { code: 'AR', name: 'Argentina', currency: 'ars' },
    { code: 'BR', name: 'Brasil', currency: 'brl' },
    { code: 'CL', name: 'Chile', currency: 'clp' },
    { code: 'CO', name: 'Colombia', currency: 'cop' },
    { code: 'PE', name: 'Perú', currency: 'pen' },
    { code: 'VE', name: 'Venezuela', currency: 'ves' },
    { code: 'EC', name: 'Ecuador', currency: 'usd' },
    { code: 'UY', name: 'Uruguay', currency: 'uyu' },
    { code: 'PY', name: 'Paraguay', currency: 'pyg' },
    { code: 'BO', name: 'Bolivia', currency: 'bob' },
    
    // Europa
    { code: 'ES', name: 'España', currency: 'eur' },
    { code: 'FR', name: 'Francia', currency: 'eur' },
    { code: 'DE', name: 'Alemania', currency: 'eur' },
    { code: 'IT', name: 'Italia', currency: 'eur' },
    { code: 'PT', name: 'Portugal', currency: 'eur' },
    { code: 'NL', name: 'Países Bajos', currency: 'eur' },
    { code: 'BE', name: 'Bélgica', currency: 'eur' },
    { code: 'AT', name: 'Austria', currency: 'eur' },
    { code: 'CH', name: 'Suiza', currency: 'chf' },
    { code: 'GB', name: 'Reino Unido', currency: 'gbp' },
    { code: 'SE', name: 'Suecia', currency: 'sek' },
    { code: 'NO', name: 'Noruega', currency: 'nok' },
    { code: 'DK', name: 'Dinamarca', currency: 'dkk' },
    { code: 'PL', name: 'Polonia', currency: 'pln' },
    { code: 'CZ', name: 'República Checa', currency: 'czk' },
    { code: 'HU', name: 'Hungría', currency: 'huf' },
    { code: 'RO', name: 'Rumania', currency: 'ron' },
    { code: 'BG', name: 'Bulgaria', currency: 'bgn' },
    { code: 'HR', name: 'Croacia', currency: 'eur' },
    { code: 'SI', name: 'Eslovenia', currency: 'eur' },
    { code: 'SK', name: 'Eslovaquia', currency: 'eur' },
    { code: 'LT', name: 'Lituania', currency: 'eur' },
    { code: 'LV', name: 'Letonia', currency: 'eur' },
    { code: 'EE', name: 'Estonia', currency: 'eur' },
    { code: 'FI', name: 'Finlandia', currency: 'eur' },
    { code: 'IE', name: 'Irlanda', currency: 'eur' },
    { code: 'LU', name: 'Luxemburgo', currency: 'eur' },
    { code: 'MT', name: 'Malta', currency: 'eur' },
    { code: 'CY', name: 'Chipre', currency: 'eur' },
    { code: 'GR', name: 'Grecia', currency: 'eur' },
    
    // Asia
    { code: 'CN', name: 'China', currency: 'cny' },
    { code: 'JP', name: 'Japón', currency: 'jpy' },
    { code: 'KR', name: 'Corea del Sur', currency: 'krw' },
    { code: 'IN', name: 'India', currency: 'inr' },
    { code: 'TH', name: 'Tailandia', currency: 'thb' },
    { code: 'SG', name: 'Singapur', currency: 'sgd' },
    { code: 'MY', name: 'Malasia', currency: 'myr' },
    { code: 'ID', name: 'Indonesia', currency: 'idr' },
    { code: 'PH', name: 'Filipinas', currency: 'php' },
    { code: 'VN', name: 'Vietnam', currency: 'vnd' },
    { code: 'TW', name: 'Taiwán', currency: 'twd' },
    { code: 'HK', name: 'Hong Kong', currency: 'hkd' },
    { code: 'AE', name: 'Emiratos Árabes', currency: 'aed' },
    { code: 'SA', name: 'Arabia Saudita', currency: 'sar' },
    { code: 'IL', name: 'Israel', currency: 'ils' },
    { code: 'TR', name: 'Turquía', currency: 'try' },
    { code: 'RU', name: 'Rusia', currency: 'rub' },
    
    // Oceanía
    { code: 'AU', name: 'Australia', currency: 'aud' },
    { code: 'NZ', name: 'Nueva Zelanda', currency: 'nzd' },
  ];

  const handleCurrencyChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setCurrentCurrency(country.currency);
      updateLocation(countryCode);
      
      // Forzar actualización inmediata
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);
    }
    setIsOpen(false);
  };

  if (!showSelector) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium ${className}`}>
        {currencyInfo.symbol} {currentCurrency.toUpperCase()}
      </span>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
      >
        <span>{currencyInfo.symbol}</span>
        <span>{currentCurrency.toUpperCase()}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Seleccionar moneda</div>
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCurrencyChange(country.code)}
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors ${
                  currentCurrency === country.currency ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{country.name}</span>
                  <span className="font-medium">{country.currency.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
