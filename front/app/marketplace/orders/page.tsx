'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getMarketplaceOrders, MarketplaceOrder, formatPrice } from '@/lib/api-marketplace';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Package, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Cargando órdenes...');
      console.log('📦 Usuario autenticado:', isAuthenticated);
      
      // Verificar el token y decodificarlo
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('📦 Token decodificado:', payload);
          console.log('📦 Usuario del token:', payload.username || payload.user_id);
        } catch (e) {
          console.log('📦 Error decodificando token:', e);
        }
      }
      
      const ordersData = await getMarketplaceOrders();
      console.log('📦 Órdenes cargadas:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Procesando';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h2>
          <p className="text-gray-600">
            Debes iniciar sesión para ver tus órdenes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage="marketplace" showMarketplaceElements={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando órdenes...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes órdenes aún
              </h3>
              <p className="text-gray-600 mb-6">
                Cuando realices una compra, aparecerá aquí.
              </p>
              
              {/* Botón de debug */}
              <button
                onClick={() => {
                  console.log('🔍 Debug - Estado de autenticación:', isAuthenticated);
                  console.log('🔍 Debug - Token en localStorage:', localStorage.getItem('token'));
                  
                  // Decodificar token
                  const token = localStorage.getItem('token');
                  if (token) {
                    try {
                      const payload = JSON.parse(atob(token.split('.')[1]));
                      console.log('🔍 Debug - Token decodificado:', payload);
                      console.log('🔍 Debug - Usuario del token:', payload.username || payload.user_id);
                    } catch (e) {
                      console.log('🔍 Debug - Error decodificando token:', e);
                    }
                  }
                  
                  console.log('🔍 Debug - Intentando cargar órdenes manualmente...');
                  loadOrders();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
              >
                🔍 Debug - Verificar Estado
              </button>
              
              <a
                href="/marketplace"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir al marketplace
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Orden #{order.id}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-medium text-gray-600">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.subtotal)}
                            </p>
                            {item.zip_sent && (
                              <div className="flex items-center gap-1 text-green-600 text-sm">
                                <Download className="w-4 h-4" />
                                <span>Archivo enviado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.zip_files_sent && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            Archivos ZIP enviados a tu email
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 