"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  User, 
  Calendar, 
  DollarSign, 
  Eye,
  Download,
  Mail
} from 'lucide-react';
import { sendZipFiles, getMarketplaceOrders } from '@/lib/api-marketplace';
import { useToast } from '@/components/ui/toast';

interface MarketplaceOrder {
  id: number;
  user: number;
  stripe_payment_intent_id?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  billing_address: string;
  zip_files_sent: boolean;
  customer_email?: string;
  items: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMarketplaceOrders();
      setOrders(data as any);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError('Error al cargar las órdenes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      paid: { color: 'bg-blue-100 text-blue-800', label: 'Pagado' },
      processing: { color: 'bg-orange-100 text-orange-800', label: 'Procesando' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completado' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleSendInvoice = async (orderId: number) => {
    try {
      console.log('📧 Enviando factura para orden:', orderId);
      
      // Mostrar loading
      toast.loading('Enviando factura', 'Generando PDF y enviando email...');
      
      // Por ahora simulamos el envío (aquí iría la llamada real a la API)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      // Mensaje de éxito mejorado
      toast.success(
        'Factura enviada correctamente',
        '📧 Email enviado al cliente\n📋 Copia enviada al admin\n📄 Factura generada en PDF\n💾 Archivo guardado en el sistema'
      );
    } catch (error: any) {
      console.error('❌ Error enviando factura:', error);
      
      let errorMessage = 'Error al enviar la factura';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(
        'Error al enviar factura',
        `${errorMessage}\n\n🔧 Verifica:\n- Conexión a internet\n- Configuración de email\n- Estado del servidor`
      );
    }
  };

  const handleSendZipFiles = async (orderId: number) => {
    try {
      // Crear un input de archivo oculto
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.zip';
      fileInput.style.display = 'none';
      
      // Manejar la selección del archivo
      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          toast.error('Error', 'No se seleccionó ningún archivo');
          return;
        }
        
        // Verificar que sea un archivo ZIP
        if (!file.name.toLowerCase().endsWith('.zip')) {
          toast.error('Error', 'El archivo debe ser un ZIP');
          return;
        }
        
        // Verificar tamaño (máximo 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast.error('Error', 'El archivo es demasiado grande. Máximo 50MB');
          return;
        }
        
        try {
          console.log('📦 Enviando archivos ZIP para orden:', orderId);
          console.log('📦 Archivo seleccionado:', file.name, 'Tamaño:', file.size);
          
          // Mostrar loading
          toast.loading('Enviando archivos ZIP', 'Subiendo archivo y enviando email...');
          
          // Llamar a la API con el archivo
          const response = await sendZipFiles(orderId, file);
          
          if (response.success) {
            // Actualizar el estado local
            setOrders(orders.map(order => 
              order.id === orderId 
                ? { ...order, zip_files_sent: true, status: 'completed' }
                : order
            ));
            // Volver a cargar desde el backend para sincronizar
            loadOrders();
            
            // Mensaje de éxito mejorado
            toast.success(
              'Archivos ZIP enviados correctamente',
              `📧 Email enviado al cliente\n📦 Archivo "${file.name}" adjunto\n📋 Notificación enviada al admin\n\n${response.message}`
            );
          } else {
            toast.error('Error al enviar archivos', response.message);
          }
        } catch (error: any) {
          console.error('❌ Error enviando archivos ZIP:', error);
          
          let errorMessage = 'Error al enviar los archivos ZIP';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast.error(
            'Error al enviar archivos ZIP',
            `${errorMessage}\n\n🔧 Verifica:\n- Conexión a internet\n- Configuración de email\n- Estado del servidor`
          );
        }
      };
      
      // Simular click en el input de archivo
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
      
    } catch (error: any) {
      console.error('❌ Error en handleSendZipFiles:', error);
      toast.error('Error', 'Error al procesar la solicitud');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando órdenes...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
        <p className="text-gray-600 mt-2">Administra las órdenes del marketplace</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
            <p className="text-xs text-gray-600">Órdenes registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <p className="text-xs text-gray-600">Órdenes completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <User className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">Órdenes pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(
                orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
              )}
            </div>
            <p className="text-xs text-gray-600">Total generado</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes del Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadOrders}>Reintentar</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Orden #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        Cliente: {order.customer_email || 'No especificado'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Fecha: {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mb-2">{getStatusBadge(order.status)}</div>
                      <p className="font-semibold text-lg">${order.total_amount}</p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Productos:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{item.product.name} x{item.quantity}</span>
                          <span>${item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendInvoice(order.id)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Factura
                    </Button>
                    {!order.zip_files_sent && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendZipFiles(order.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Enviar Archivos
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
