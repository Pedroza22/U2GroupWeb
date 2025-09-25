import { MarketplaceProduct } from './api-marketplace'

export interface PriceInfo {
  price: number
  currency: string
  unit: string
  planType: 'pdf' | 'editable'
}

/**
 * Obtiene el precio correcto basado en el tipo de plan y unidad
 */
export const getProductPrice = (
  product: MarketplaceProduct,
  planType: 'pdf' | 'editable' = 'pdf',
  unit: 'm2' | 'sqft' = 'm2'
): PriceInfo => {
  let price = 0
  let currency = 'USD'
  let unitLabel = unit === 'm2' ? 'm²' : 'sq.ft'

  if (planType === 'pdf') {
    if (unit === 'm2') {
      price = Number(product.price_pdf_m2) || Number(product.price) || 0
    } else {
      price = Number(product.price_pdf_sqft) || Number(product.price) || 0
    }
  } else {
    // Plan editable
    if (unit === 'm2') {
      price = Number(product.price_editable_m2) || Number(product.price) * 1.5 || 0
    } else {
      price = Number(product.price_editable_sqft) || Number(product.price) * 1.5 || 0
    }
  }

  return {
    price,
    currency,
    unit: unitLabel,
    planType
  }
}

/**
 * Formatea el precio para mostrar
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Convierte el área entre m² y sq.ft
 */
export const convertArea = (area: number, fromUnit: 'm2' | 'sqft', toUnit: 'm2' | 'sqft'): number => {
  if (fromUnit === toUnit) return area
  
  if (fromUnit === 'm2' && toUnit === 'sqft') {
    return Math.round(area * 10.764 * 100) / 100
  } else if (fromUnit === 'sqft' && toUnit === 'm2') {
    return Math.round(area / 10.764 * 100) / 100
  }
  
  return area
}

/**
 * Obtiene el área en la unidad especificada
 */
export const getProductArea = (product: MarketplaceProduct, unit: 'm2' | 'sqft' = 'm2'): number => {
  if (unit === 'm2') {
    return Number(product.area_m2) || 0
  } else {
    return Number(product.area_sqft) || convertArea(Number(product.area_m2) || 0, 'm2', 'sqft')
  }
} 