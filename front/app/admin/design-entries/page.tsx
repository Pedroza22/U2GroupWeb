"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Mail,
  Eye,
  Download,
  Users,
  Home,
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface DesignEntry {
  id: number;
  area_total: number;
  area_basica: number;
  area_disponible: number;
  area_usada: number;
  porcentaje_ocupado: number;
  precio_total: number;
  correo?: string;
  created_at: string;
  opciones_count: number;
}

export default function AdminDesignEntriesPage() {
  const [entries, setEntries] = useState<DesignEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { getDesignEntries } = await import('@/lib/api-design');
      const data = await getDesignEntries() as any;
      
      if (data.success) {
        setEntries(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar entradas');
      }
    } catch (err: any) {
      console.error('Error cargando entradas:', err);
      setError('Error al cargar las entradas de diseño');
      toast.error('Error', 'No se pudieron cargar las entradas de diseño');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleViewDetails = (entry: DesignEntry) => {
    toast.info('Ver detalles', `Entrada #${entry.id} - ${entry.area_total}m² - $${entry.precio_total}`);
    // Aquí se podría abrir un modal con más detalles
  };

  const handleDownloadReport = (entry: DesignEntry) => {
    toast.info('Descargar reporte', `Generando reporte para entrada #${entry.id}`);
    // Aquí se implementaría la descarga del reporte
  };

  const handleSendEmail = (entry: DesignEntry) => {
    if (entry.correo) {
      toast.info('Enviar email', `Enviando email a ${entry.correo}`);
      // Aquí se implementaría el envío de email
    } else {
      toast.error('Error', 'No hay email registrado para esta entrada');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando entradas...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Entradas de Diseño</h1>
        <p className="text-gray-600 mt-2">Gestiona las entradas de diseño de los usuarios</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
            <p className="text-xs text-gray-600">Entradas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${entries.reduce((sum, entry) => sum + entry.precio_total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Valor total generado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Promedio</CardTitle>
            <Home className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.area_total, 0) / entries.length) : 0} m²
            </div>
            <p className="text-xs text-gray-600">Área promedio por entrada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opciones Promedio</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.opciones_count, 0) / entries.length) : 0}
            </div>
            <p className="text-xs text-gray-600">Opciones por entrada</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de entradas */}
      <Card>
        <CardHeader>
          <CardTitle>Entradas de Diseño ({entries.length} entradas)</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadEntries}>Reintentar</Button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay entradas de diseño registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">Entrada #{entry.id}</h3>
                        <Badge variant="outline" className="text-xs">
                          {new Date(entry.created_at).toLocaleDateString('es-ES')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-gray-500">Área Total:</span>
                          <div className="font-medium">{entry.area_total} m²</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Área Usada:</span>
                          <div className="font-medium">{entry.area_usada} m² ({entry.porcentaje_ocupado.toFixed(1)}%)</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Opciones:</span>
                          <div className="font-medium">{entry.opciones_count} servicios</div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Precio Total:</span>
                          <div className="font-medium text-green-600">${entry.precio_total}</div>
                        </div>
                      </div>
                      
                      {entry.correo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{entry.correo}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(entry)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(entry)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Reporte
                      </Button>
                      {entry.correo && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendEmail(entry)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      )}
                    </div>
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








