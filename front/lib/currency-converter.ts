// Tasas de cambio actualizadas para coincidir con Stripe (2023)
const exchangeRates: Record<string, number> = {
  // América
  'usd': 1,
  'cad': 1.35,
  'mxn': 17.5,
  'ars': 350,
  'brl': 4.95,
  'clp': 950,
  'cop': 4184.6082, // Actualizado para coincidir exactamente con Stripe
  'pen': 3.7,
  'ves': 35.5,
  'uyu': 39.5,
  'pyg': 7300,
  'bob': 6.9,
  'gyd': 209,
  'srd': 37.5,
  
  // Europa
  'eur': 0.92,
  'gbp': 0.79,
  'chf': 0.88,
  'sek': 10.5,
  'nok': 10.8,
  'dkk': 6.85,
  'pln': 3.95,
  'czk': 22.5,
  'huf': 350,
  'ron': 4.55,
  'bgn': 1.8,
  
  // Asia
  'cny': 7.25,
  'jpy': 150,
  'krw': 1350,
  'inr': 83,
  'thb': 35.5,
  'sgd': 1.35,
  'myr': 4.75,
  'idr': 15500,
  'php': 56,
  'vnd': 24500,
  'twd': 32,
  'hkd': 7.8,
  'aed': 3.67,
  'sar': 3.75,
  'ils': 3.65,
  'try': 31,
  'rub': 95,
  
  // Oceanía
  'aud': 1.52,
  'nzd': 1.65,
};

export function convertPrice(priceUSD: number, targetCurrency: string): number {
  // Validar que priceUSD sea un número válido
  if (isNaN(priceUSD) || !isFinite(priceUSD)) {
    console.warn('Precio USD inválido:', priceUSD);
    return 0;
  }
  
  const rate = exchangeRates[targetCurrency.toLowerCase()] || 1;
  const converted = priceUSD * rate;
  
  // Validar que el resultado sea un número válido
  if (isNaN(converted) || !isFinite(converted)) {
    console.warn('Error en conversión de moneda:', { priceUSD, targetCurrency, rate, converted });
    return priceUSD; // Fallback al precio original
  }
  
  return Math.round(converted * 100) / 100; // Redondear a 2 decimales
}

export function formatPriceByCurrency(price: number, currency: string, currencySymbol: string): string {
  // Validar que price sea un número válido
  if (isNaN(price) || !isFinite(price)) {
    console.warn('Precio inválido para formateo:', price);
    return `${currencySymbol}0.00`;
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  try {
    return formatter.format(price);
  } catch (error) {
    console.warn('Error formateando precio:', error);
    // Fallback si la moneda no es soportada por Intl
    return `${currencySymbol}${price.toFixed(2)}`;
  }
}

export function getCurrencyInfo(currency: string): { symbol: string; name: string } {
  const currencyInfo: Record<string, { symbol: string; name: string }> = {
    // América
    'usd': { symbol: '$', name: 'Dólar Estadounidense' },
    'cad': { symbol: 'C$', name: 'Dólar Canadiense' },
    'mxn': { symbol: '$', name: 'Peso Mexicano' },
    'ars': { symbol: '$', name: 'Peso Argentino' },
    'brl': { symbol: 'R$', name: 'Real Brasileño' },
    'clp': { symbol: '$', name: 'Peso Chileno' },
    'cop': { symbol: '$', name: 'Peso Colombiano' },
    'pen': { symbol: 'S/', name: 'Sol Peruano' },
    'ves': { symbol: 'Bs', name: 'Bolívar Venezolano' },
    'uyu': { symbol: '$', name: 'Peso Uruguayo' },
    'pyg': { symbol: '₲', name: 'Guaraní Paraguayo' },
    'bob': { symbol: 'Bs', name: 'Boliviano' },
    'gyd': { symbol: '$', name: 'Dólar Guyanés' },
    'srd': { symbol: '$', name: 'Dólar Surinamés' },
    
    // Europa
    'eur': { symbol: '€', name: 'Euro' },
    'gbp': { symbol: '£', name: 'Libra Esterlina' },
    'chf': { symbol: 'CHF', name: 'Franco Suizo' },
    'sek': { symbol: 'kr', name: 'Corona Sueca' },
    'nok': { symbol: 'kr', name: 'Corona Noruega' },
    'dkk': { symbol: 'kr', name: 'Corona Danesa' },
    'pln': { symbol: 'zł', name: 'Złoty Polaco' },
    'czk': { symbol: 'Kč', name: 'Corona Checa' },
    'huf': { symbol: 'Ft', name: 'Forinto Húngaro' },
    'ron': { symbol: 'lei', name: 'Leu Rumano' },
    'bgn': { symbol: 'лв', name: 'Lev Búlgaro' },
    
    // Asia
    'cny': { symbol: '¥', name: 'Yuan Chino' },
    'jpy': { symbol: '¥', name: 'Yen Japonés' },
    'krw': { symbol: '₩', name: 'Won Surcoreano' },
    'inr': { symbol: '₹', name: 'Rupia India' },
    'thb': { symbol: '฿', name: 'Baht Tailandés' },
    'sgd': { symbol: 'S$', name: 'Dólar de Singapur' },
    'myr': { symbol: 'RM', name: 'Ringgit Malayo' },
    'idr': { symbol: 'Rp', name: 'Rupia Indonesia' },
    'php': { symbol: '₱', name: 'Peso Filipino' },
    'vnd': { symbol: '₫', name: 'Dong Vietnamita' },
    'twd': { symbol: 'NT$', name: 'Dólar de Taiwán' },
    'hkd': { symbol: 'HK$', name: 'Dólar de Hong Kong' },
    'aed': { symbol: 'د.إ', name: 'Dírham de los EAU' },
    'sar': { symbol: 'ر.س', name: 'Riyal Saudí' },
    'ils': { symbol: '₪', name: 'Nuevo Shekel Israelí' },
    'try': { symbol: '₺', name: 'Lira Turca' },
    'rub': { symbol: '₽', name: 'Rublo Ruso' },
    
    // Oceanía
    'aud': { symbol: 'A$', name: 'Dólar Australiano' },
    'nzd': { symbol: 'NZ$', name: 'Dólar Neozelandés' },
  };

  return currencyInfo[currency.toLowerCase()] || { symbol: '$', name: 'Dólar Estadounidense' };
}
// Función para verificar la conversión de moneda y mostrar diferencias
export function verifyCurrencyConversion(priceUSD: number, targetCurrency: string): {
  originalUSD: number;
  convertedLocal: number;
  convertedBackToUSD: number;
  difference: number;
  percentage: number;
} {
  const converted = convertPrice(priceUSD, targetCurrency);
  const convertedBackToUSD = converted / exchangeRates[targetCurrency.toLowerCase()];
  const difference = Math.abs(priceUSD - convertedBackToUSD);
  const percentage = (difference / priceUSD) * 100;
  
  return {
    originalUSD: priceUSD,
    convertedLocal: converted,
    convertedBackToUSD: convertedBackToUSD,
    difference: difference,
    percentage: percentage
  };
}

// Función para obtener la tasa de cambio actual
export function getExchangeRate(currency: string): number {
  return exchangeRates[currency.toLowerCase()] || 1;
}

