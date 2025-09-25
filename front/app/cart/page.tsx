"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowLeft, CreditCard, Package } from "lucide-react";
import Image from "next/image";
import { getLocalStorage } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getStripe } from '@/lib/stripe';
import { formatPrice } from "@/lib/api-marketplace";
import { useLocation } from "@/hooks/use-location";
import { convertPrice, formatPriceByCurrency, verifyCurrencyConversion, getExchangeRate } from "@/lib/currency-converter";
import dynamic from "next/dynamic";

// Cargar CurrencyDisplay sólo en cliente para evitar problemas de hidratación
const CurrencyDisplay = dynamic(() => import("@/components/ui/currency-display").then(m => m.CurrencyDisplay), { ssr: false });

// Cargar CartDebug sólo en desarrollo
const CartDebug = dynamic(() => import("@/components/debug/cart-debug").then(m => ({ default: m.CartDebug })), { 
  ssr: false,
  loading: () => <div>Loading debug panel...</div>
});

export default function CartPage() {
  const { cartItems, cartCount, removeFromCart, clearCart, syncCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { locationData, loading: locationLoading } = useLocation();

  // La sincronización inicial ahora la maneja CartProvider; evitar duplicar aquí
  useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('🛒 Cart page loaded');
    }
  }, [isClient]);

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Escuchar cambios de ubicación
  useEffect(() => {
    const handleLocationChange = () => {
      // Forzar re-render cuando cambie la ubicación
      console.log('🛒 Location changed, forcing re-render');
    };

    window.addEventListener('locationChanged', handleLocationChange);
    return () => {
      window.removeEventListener('locationChanged', handleLocationChange);
    };
  }, []);

  // Protección contra SSR
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando carrito...</h2>
        </div>
      </div>
    );
  }

  // Calcular precio total en USD y convertir a la moneda local
  const totalPriceUSD = cartItems?.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemTotal = itemPrice * item.quantity;
    console.log('🛒 Debug - item:', {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      itemPrice: itemPrice,
      itemTotal: itemTotal
    });
    return total + itemTotal;
  }, 0) || 0;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 Debug - totalPriceUSD:', totalPriceUSD, 'locationData:', locationData);
  }
  
  const totalPrice = locationData ? convertPrice(totalPriceUSD, locationData.currency) : totalPriceUSD;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 Debug - totalPrice after conversion:', totalPrice);
    console.log('🛒 Debug - cartItems:', cartItems);
  }

  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Validar monto mínimo
    if (totalPriceUSD < 0.50) {
      alert('El monto mínimo para el pago es $0.50 USD. Por favor, agrega más productos al carrito.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🛒 Iniciando checkout con items:', cartItems);
      
      // Obtener el token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      // Crear la sesión de Stripe (SIEMPRE en USD)
      const requestBody = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price, // SIEMPRE en USD
          quantity: item.quantity,
          image: item.main_image
        })),
        total: totalPriceUSD, // SIEMPRE en USD para Stripe
        currency: 'usd' // SIEMPRE USD para Stripe
      };
      
      console.log('🛒 Enviando request al checkout:', {
        url: '/api/create-checkout-session',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token?.substring(0, 20)}...`,
        },
        body: requestBody
      });
      
      // Usar ruta de Next que NO se reescribe al backend
      const response = await fetch('/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🛒 Respuesta de la API:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('❌ Error en la respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(errorData.error || `Error al crear la sesión de pago (${response.status})`);
      }

      const { sessionId } = await response.json();
      console.log('🛒 Session ID recibido:', sessionId);
      
      // Redirigir a Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        console.log('🛒 Stripe cargado, redirigiendo...');
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Error al redirigir a Stripe:', error);
          throw new Error(`Error al redirigir al pago: ${error.message}`);
        }
      } else {
        throw new Error('No se pudo cargar Stripe');
      }
    } catch (error) {
      console.error('Error en el checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Manejar errores específicos de Stripe
      if (errorMessage.includes('minimum 50 cents')) {
        alert('El monto mínimo para el pago es $0.50 USD. Por favor, agrega más productos al carrito.');
      } else {
        alert(`Error al procesar el pago: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            {/* Botón de debug */}
            <Button 
              onClick={() => {
                const stored = getLocalStorage('cart');
                console.log('🛒 Debug - localStorage cart:', stored);
                console.log('🛒 Debug - cartItems:', cartItems);
                console.log('🛒 Debug - cartCount:', cartCount);
                console.log('🛒 Debug - locationData:', locationData);
                console.log('🛒 Debug - totalPriceUSD:', totalPriceUSD);
                console.log('🛒 Debug - totalPrice:', totalPrice);
                
                // Verificar conversión de moneda
                if (locationData) {
                  const testConversion = convertPrice(1, locationData.currency);
                  console.log('🛒 Debug - Test conversion $1 USD to', locationData.currency, ':', testConversion);
                }
                
                alert(`Debug Info:\n\nlocalStorage: ${stored}\ncartItems: ${JSON.stringify(cartItems)}\ncartCount: ${cartCount}\ntotalPriceUSD: ${totalPriceUSD}\ntotalPrice: ${totalPrice}`);
              }}
              className="mb-4"
            >
              Debug Cart
            </Button>
            
            {/* Botón para forzar sincronización */}
            <Button 
              onClick={async () => {
                try {
                  console.log('🔄 Forzando sincronización del carrito...');
                  
                  // Limpiar localStorage
                  localStorage.removeItem('cart');
                  console.log('🗑️ localStorage limpiado');
                  
                  // Recargar la página para forzar nueva sincronización
                  window.location.reload();
                } catch (error) {
                  console.error('❌ Error forzando sincronización:', error);
                  alert('Error forzando sincronización: ' + error);
                }
              }}
              className="mb-4 ml-2"
              variant="outline"
            >
              🔄 Sincronizar Carrito
            </Button>
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Parece que aún no has agregado ningún producto a tu carrito. 
              Explora nuestro marketplace y encuentra el plano perfecto para tu proyecto.
            </p>
            <Link 
              href="/marketplace" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Package className="w-5 h-5" />
              Explorar Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-600">{cartCount} {cartCount === 1 ? 'producto' : 'productos'}</p>
                <CurrencyDisplay showSelector={true} />
              </div>
            </div>
          </div>
                      <div className="flex gap-2">
              <Button 
                onClick={syncCart}
                variant="outline"
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <Package className="w-4 h-4 mr-2" />
                Sincronizar
              </Button>
              <Button 
                onClick={clearCart}
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vaciar Carrito
              </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Productos en tu carrito</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {cartItems?.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.main_image || (typeof item.images?.[0] === 'string' ? item.images[0] : '/placeholder-product.svg')}
                          alt={item.name}
                          width={100}
                          height={100}
                          onError={(e) => {
                            console.warn('🖼️ Error cargando imagen en carrito para:', item.name);
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.svg';
                          }}
                          className="rounded-xl object-cover shadow-sm"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 overflow-hidden">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {item.area_m2} m²
                          </span>
                          <span>• {item.bedrooms} dormitorios</span>
                          <span>• {item.bathrooms} baños</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                        <p className="text-xl font-bold text-blue-600">
                          {locationData 
                            ? formatPriceByCurrency(convertPrice(item.price * item.quantity, locationData.currency), locationData.currency, locationData.currencySymbol)
                            : formatPrice(item.price * item.quantity)
                          }
                        </p>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen de Compra */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen de Compra</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'producto' : 'productos'})</span>
                  <span>
                    {locationData 
                      ? formatPriceByCurrency(totalPrice, locationData.currency, locationData.currencySymbol)
                      : formatPrice(totalPrice)
                    }
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {locationData 
                        ? formatPriceByCurrency(totalPrice, locationData.currency, locationData.currencySymbol)
                        : formatPrice(totalPrice)
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {totalPriceUSD < 0.50 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ El monto mínimo para el pago es $0.50 USD. Agrega más productos para continuar.
                    </p>
                  </div>
                )}
                
                {locationData && locationData.currency !== 'usd' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      💱 <strong>Información de Conversión:</strong>
                    </p>
                    <div className="text-xs space-y-1">
                      <p>• <strong>Precio en USD:</strong> ${totalPriceUSD.toFixed(2)}</p>
                      <p>• <strong>Precio en {locationData.currency.toUpperCase()}:</strong> {formatPriceByCurrency(totalPrice, locationData.currency, locationData.currencySymbol)}</p>
                      <p>• <strong>Tasa de cambio:</strong> 1 USD = {getExchangeRate(locationData.currency).toFixed(4)} {locationData.currency.toUpperCase()}</p>
                      <p>• <strong>Stripe procesará:</strong> ${totalPriceUSD.toFixed(2)} USD</p>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={handleCheckout}
                  disabled={isProcessing || totalPriceUSD < 0.50}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Proceder al Pago
                    </div>
                  )}
                </Button>
                
                <Link href="/marketplace">
                  <Button 
                    variant="outline" 
                    className="w-full py-3 rounded-xl border-gray-300 hover:bg-gray-50"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Descarga en 3 días hábiles</p>
                    <p>Recibirás los archivos PDF y editables por email en los próximos 3 días hábiles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Debug Panel - Solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">
            <CartDebug />
          </div>
        )}
      </div>
    </div>
  );
} 