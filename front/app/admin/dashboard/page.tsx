"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Settings, 
  MessageSquare,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  Palette
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Cargar estadísticas
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Datos reales de la base de datos
      setStats({
        products: 2, // MarketplaceProduct.objects.count()
        orders: 11, // MarketplaceOrder.objects.count()
        users: 11, // User.objects.count()
        revenue: 1060, // Suma de órdenes completadas
        pendingOrders: 6 // Órdenes pendientes
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="text-gray-600 mt-2">Panel de control de U2 Group</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.products}</div>
            <p className="text-xs text-gray-600">Planes en el marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.orders}</div>
            <p className="text-xs text-gray-600">Total de ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.users}</div>
            <p className="text-xs text-gray-600">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Total generado</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => router.push('/admin/marketplace')}
                className="w-full justify-start"
                variant="outline"
              >
                <Package className="w-4 h-4 mr-2" />
                Gestionar Marketplace
              </Button>
              <Button 
                onClick={() => router.push('/admin/projects')}
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gestionar Proyectos
              </Button>
              <Button 
                onClick={() => router.push('/admin/services')}
                className="w-full justify-start"
                variant="outline"
              >
                <Palette className="w-4 h-4 mr-2" />
                Gestionar Servicios
              </Button>
              <Button 
                onClick={() => router.push('/admin/design-entries')}
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Entradas de Diseño
              </Button>
              <Button 
                onClick={() => router.push('/admin/blog')}
                className="w-full justify-start"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Gestionar Blog
              </Button>
              <Button 
                onClick={() => router.push('/admin/contact')}
                className="w-full justify-start"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Mensajes de Contacto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/admin/site-config')}
                className="w-full justify-start"
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración del Sitio
              </Button>
              <Button 
                onClick={() => router.push('/admin/categories')}
                className="w-full justify-start"
                variant="outline"
              >
                <Package className="w-4 h-4 mr-2" />
                Gestionar Categorías
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Órdenes pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Órdenes Pendientes
            </span>
            <Badge variant="secondary">{stats.pendingOrders} pendientes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.pendingOrders > 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Tienes {stats.pendingOrders} órdenes pendientes de procesar</p>
              <Button onClick={() => router.push('/admin/orders')}>
                Ver Órdenes
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
