"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  DollarSign,
  Users,
  Home,
  Brain,
  Leaf,
  Film,
  Target
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Service {
  id: number;
  name_en: string;
  name_es: string;
  price_min_usd: number | null;
  area_max_m2: number | null;
  max_units: number | null;
  notes?: string;
  image?: string;
  category_id: number;
  category_name: string;
  category_emoji: string;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_es: '',
    price_min_usd: '',
    area_max_m2: '',
    max_units: '',
    notes: '',
    category_id: ''
  });
  const toast = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar servicios desde la API usando la función helper
      const { getDesignServices } = await import('@/lib/api-design');
      const data = await getDesignServices();
      
      if (data.success) {
        // Aplanar los servicios de todas las categorías
        const allServices: Service[] = [];
        data.data.forEach((category: any) => {
          category.services.forEach((service: any) => {
            allServices.push({
              ...service,
              category_name: category.name,
              category_emoji: category.emoji
            });
          });
        });
        setServices(allServices);
      } else {
        throw new Error(data.error || 'Error al cargar servicios');
      }
    } catch (err: any) {
      console.error('Error cargando servicios:', err);
      setError('Error al cargar los servicios');
      toast.error('Error', 'No se pudieron cargar los servicios de diseño');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { getDesignCategories } = await import('@/lib/api-design');
      const data = await getDesignCategories();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadServices();
  }, []);

  const handleCreateService = async () => {
    try {
      console.log('Creando servicio:', formData);
      
      const { createDesignService } = await import('@/lib/api-design');
      const data = await createDesignService({
        name_en: formData.name_en,
        name_es: formData.name_es,
        price_min_usd: formData.price_min_usd ? parseFloat(formData.price_min_usd) : undefined,
        area_max_m2: formData.area_max_m2 ? parseFloat(formData.area_max_m2) : undefined,
        max_units: formData.max_units ? parseInt(formData.max_units) : undefined,
        notes: formData.notes,
        category_id: parseInt(formData.category_id)
      });

      if (data.success) {
        toast.success('Servicio creado', 'El servicio se ha creado correctamente');
        setFormData({ name_en: '', name_es: '', price_min_usd: '', area_max_m2: '', max_units: '', notes: '', category_id: '' });
        setShowForm(false);
        loadServices(); // Recargar servicios
      } else {
        throw new Error(data.error || 'Error al crear servicio');
      }
    } catch (error: any) {
      console.error('Error creando servicio:', error);
      toast.error('Error', 'No se pudo crear el servicio');
    }
  };

  const handleUpdateService = async (id: number) => {
    try {
      console.log('Actualizando servicio:', id, formData);
      
      const { updateDesignService } = await import('@/lib/api-design');
      const data = await updateDesignService(id, {
        name_en: formData.name_en,
        name_es: formData.name_es,
        price_min_usd: formData.price_min_usd ? parseFloat(formData.price_min_usd) : undefined,
        area_max_m2: formData.area_max_m2 ? parseFloat(formData.area_max_m2) : undefined,
        max_units: formData.max_units ? parseInt(formData.max_units) : undefined,
        notes: formData.notes,
        category_id: parseInt(formData.category_id)
      });

      if (data.success) {
        toast.success('Servicio actualizado', 'El servicio se ha actualizado correctamente');
        setFormData({ name_en: '', name_es: '', price_min_usd: '', area_max_m2: '', max_units: '', notes: '', category_id: '' });
        setEditingId(null);
        loadServices(); // Recargar servicios
      } else {
        throw new Error(data.error || 'Error al actualizar servicio');
      }
    } catch (error: any) {
      console.error('Error actualizando servicio:', error);
      toast.error('Error', 'No se pudo actualizar el servicio');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (confirm('¿Seguro que quieres eliminar este servicio?')) {
      try {
        console.log('Eliminando servicio:', id);
        
        const { deleteDesignService } = await import('@/lib/api-design');
        const data = await deleteDesignService(id);

        if (data.success) {
          toast.success('Servicio eliminado', 'El servicio se ha eliminado correctamente');
          loadServices(); // Recargar servicios
        } else {
          throw new Error(data.error || 'Error al eliminar servicio');
        }
      } catch (error: any) {
        console.error('Error eliminando servicio:', error);
        toast.error('Error', 'No se pudo eliminar el servicio');
      }
    }
  };

  const startEditing = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name_en: service.name_en,
      name_es: service.name_es,
      price_min_usd: service.price_min_usd?.toString() || '',
      area_max_m2: service.area_max_m2?.toString() || '',
      max_units: service.max_units?.toString() || '',
      notes: service.notes || '',
      category_id: service.category_id.toString()
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name_en: '', name_es: '', price_min_usd: '', area_max_m2: '', max_units: '', notes: '', category_id: '' });
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Espacios básicos':
        return <Home className="w-4 h-4" />;
      case 'Funcionalidad del hogar':
        return <Home className="w-4 h-4" />;
      case 'Trabajo & Creatividad':
        return <Target className="w-4 h-4" />;
      case 'Bienestar & Salud':
        return <Brain className="w-4 h-4" />;
      case 'Naturaleza & Sustentabilidad':
        return <Leaf className="w-4 h-4" />;
      case 'Entretenimiento & Social':
        return <Film className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando servicios...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios de Diseño</h1>
        <p className="text-gray-600 mt-2">Administra los 44 servicios de diseño arquitectónico</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
            <Palette className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <p className="text-xs text-gray-600">Servicios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{categories.length}</div>
            <p className="text-xs text-gray-600">Categorías disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${services.length > 0 ? Math.round(services.reduce((sum, service) => sum + (service.price_min_usd || 0), 0) / services.length) : 0}
            </div>
            <p className="text-xs text-gray-600">Precio promedio USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios con Límites</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {services.filter(service => service.max_units !== null).length}
            </div>
            <p className="text-xs text-gray-600">Con límite de unidades</p>
          </CardContent>
        </Card>
      </div>

      {/* Botón Crear */}
      <div className="mb-6">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Servicio
        </Button>
      </div>

      {/* Formulario de Crear/Editar */}
      {(showForm || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Nombre (Inglés)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Large room"
                  />
                </div>
                <div>
                  <Label htmlFor="name_es">Nombre (Español)</Label>
                  <Input
                    id="name_es"
                    value={formData.name_es}
                    onChange={(e) => setFormData({ ...formData, name_es: e.target.value })}
                    placeholder="Habitación grande"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_min_usd">Precio Mínimo (USD)</Label>
                  <Input
                    id="price_min_usd"
                    type="number"
                    value={formData.price_min_usd}
                    onChange={(e) => setFormData({ ...formData, price_min_usd: e.target.value })}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label htmlFor="area_max_m2">Área Máxima (m²)</Label>
                  <Input
                    id="area_max_m2"
                    type="number"
                    value={formData.area_max_m2}
                    onChange={(e) => setFormData({ ...formData, area_max_m2: e.target.value })}
                    placeholder="18"
                  />
                </div>
                <div>
                  <Label htmlFor="max_units">Máximo de Unidades</Label>
                  <Input
                    id="max_units"
                    type="number"
                    value={formData.max_units}
                    onChange={(e) => setFormData({ ...formData, max_units: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category_id">Categoría</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionales sobre el servicio"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => editingId ? handleUpdateService(editingId) : handleCreateService()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
                <Button variant="outline" onClick={editingId ? cancelEditing : () => setShowForm(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de servicios */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios de Diseño ({services.length} servicios)</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadServices}>Reintentar</Button>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay servicios registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{service.category_emoji}</span>
                        <h3 className="font-semibold text-lg">{service.name_es}</h3>
                        <Badge variant="outline" className="text-xs">
                          {service.category_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.name_en}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {service.price_min_usd && (
                          <span>💰 ${service.price_min_usd} USD</span>
                        )}
                        {service.area_max_m2 && (
                          <span>📐 {service.area_max_m2} m²</span>
                        )}
                        {service.max_units && (
                          <span>🔢 Máx: {service.max_units} unidades</span>
                        )}
                      </div>
                      {service.notes && (
                        <p className="text-xs text-gray-500 mt-2">{service.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => startEditing(service)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
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
