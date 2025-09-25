'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  checkoutCart,
  sendInvoiceToAdmin,
  formatPrice,
  getImageUrl,
  Cart as CartType,
  CartItem as CartItemType
} from '../../lib/api-marketplace';
import { useLocation } from '@/hooks/use-location';
import { convertPrice, formatPriceByCurrency } from '@/lib/currency-converter';
import { getStripe } from '@/lib/stripe';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { locationData } = useLocation();
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadCart();
    }
  }, [isOpen, isAuthenticated]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (!cart) return;

    try {
      const updatedCart = await updateCartItem(cart.id, itemId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!cart) return;

    try {
      const updatedCart = await removeCartItem(cart.id, itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleCheckout = async () => {
    if (!cart) return;

    try {
      setIsCheckingOut(true);
      const { client_secret, order_id } = await checkoutCart(cart.id);

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: {} as any, // Placeholder para la información de la tarjeta
          billing_details: {
            name: 'Cliente',
          },
        },
      });

      if (error) {
        console.error('Payment error:', error);
        alert('Error en el pago: ' + error.message);
      } else {
        // Enviar factura al admin
        try {
          console.log('Enviando factura al admin para orden:', order_id);
          const invoiceResult = await sendInvoiceToAdmin(order_id);
          console.log('Resultado del envío de factura:', invoiceResult);
          
          if (invoiceResult.status === 'success') {
            console.log('Factura enviada al admin exitosamente');
            alert('Pago exitoso! Los archivos ZIP serán enviados a tu email en los próximos 3 días hábiles.');
          } else {
            console.error('Error en el resultado de la factura:', invoiceResult);
            alert('Pago exitoso, pero hubo un problema enviando la factura. Contacta al administrador.');
          }
        } catch (invoiceError) {
          console.error('Error enviando factura al admin:', invoiceError);
          // Mostrar mensaje más específico al usuario
          alert('Pago exitoso, pero hubo un problema enviando la factura. Contacta al administrador.');
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error en el checkout: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Función de prueba para enviar factura
  const handleTestInvoice = async () => {
    if (!cart) return;
    
    try {
      console.log('🧪 Probando envío de factura para carrito:', cart.id);
      console.log('📦 Items en el carrito:', cart.items);
      
      // Primero crear una orden de prueba
      console.log('🔄 Creando orden de prueba...');
      const { client_secret, order_id } = await checkoutCart(cart.id);
      console.log('✅ Orden de prueba creada:', order_id);
      console.log('🔑 Client secret:', client_secret ? 'Recibido' : 'No recibido');
      
      // Enviar factura de prueba
      console.log('📧 Enviando factura de prueba...');
      const invoiceResult = await sendInvoiceToAdmin(order_id);
      console.log('📧 Resultado del envío de factura de prueba:', invoiceResult);
      
      if (invoiceResult.status === 'success') {
        console.log('✅ Factura enviada exitosamente!');
        alert('✅ Factura de prueba enviada exitosamente!\n\nRevisa:\n- urbanunitystudios@gmail.com (admin)\n- Tu email de usuario (cliente)');
      } else {
        console.error('❌ Error en el resultado de la factura:', invoiceResult);
        alert('❌ Error enviando factura de prueba: ' + invoiceResult.message);
      }
    } catch (error) {
      console.error('❌ Error en prueba de factura:', error);
      console.error('❌ Detalles del error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      alert('❌ Error en prueba de factura: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tu carrito</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8">
            <p>Cargando carrito...</p>
          </div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.items.map((item: CartItemType) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded">
                  <img
                    src={getImageUrl(item.product.image || '')}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600">{item.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {locationData 
                        ? formatPriceByCurrency(convertPrice(item.price, locationData.currency), locationData.currency, locationData.currencySymbol)
                        : formatPrice(item.price)
                      }
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {locationData 
                        ? formatPriceByCurrency(convertPrice(item.subtotal, locationData.currency), locationData.currency, locationData.currencySymbol)
                        : formatPrice(item.subtotal)
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  {locationData 
                    ? formatPriceByCurrency(convertPrice(cart.total, locationData.currency), locationData.currency, locationData.currencySymbol)
                    : formatPrice(cart.total)
                  }
                </span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mb-2"
              >
                {isCheckingOut ? 'Procesando...' : 'Proceder al pago'}
              </button>
              
              {/* Botón de prueba para facturas */}
              <button
                onClick={handleTestInvoice}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 text-sm"
              >
                🧪 Probar envío de factura
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 