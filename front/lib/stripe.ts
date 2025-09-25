import { loadStripe } from '@stripe/stripe-js';

// Verificar que la clave esté disponible
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

console.log('🔑 Stripe publishable key:', publishableKey ? 'Configurada' : 'NO CONFIGURADA');

if (!publishableKey) {
  console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada');
}

// Cargar Stripe solo en el cliente para evitar errores de SSR
let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey || '');
  }
  return stripePromise;
};

export { getStripe };

// Funciones para convertir precios a/desde el formato de Stripe (centavos)
// Stripe maneja precios en centavos, por eso multiplicamos/dividimos por 100
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};
