"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  FolderOpen,
  Hash
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface Category {
  id: number;
  name: string;
  emoji: string;
  services_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emoji: ''
  });
  const toast = useToast();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { getDesignCategories } = await import('@/lib/api-design');
      const data = await getDesignCategories() as any;
      
      if (data.success) {
        setCategories(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar categorías');
      }
    } catch (err: any) {
      console.error('Error cargando categorías:', err);
      setError('Error al cargar las categorías');
      toast.error('Error', 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      if (!formData.name.trim() || !formData.emoji.trim()) {
        toast.error('Error', 'El nombre y emoji son obligatorios');
        return;
      }

      console.log('Creando categoría:', formData);
      
      const { createDesignCategory } = await import('@/lib/api-design');
      const data = await createDesignCategory({
        name: formData.name.trim(),
        emoji: formData.emoji.trim()
      }) as any;

      if (data.success) {
        toast.success('Categoría creada', 'La categoría se ha creado correctamente');
        setFormData({ name: '', emoji: '' });
        setShowForm(false);
        loadCategories();
      } else {
        throw new Error(data.error || 'Error al crear categoría');
      }
    } catch (error: any) {
      console.error('Error creando categoría:', error);
      toast.error('Error', 'No se pudo crear la categoría');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    try {
      if (!formData.name.trim() || !formData.emoji.trim()) {
        toast.error('Error', 'El nombre y emoji son obligatorios');
        return;
      }

      console.log('Actualizando categoría:', id, formData);
      
      const { updateDesignCategory } = await import('@/lib/api-design');
      const data = await updateDesignCategory(id, {
        name: formData.name.trim(),
        emoji: formData.emoji.trim()
      }) as any;

      if (data.success) {
        toast.success('Categoría actualizada', 'La categoría se ha actualizado correctamente');
        setFormData({ name: '', emoji: '' });
        setEditingId(null);
        loadCategories();
      } else {
        throw new Error(data.error || 'Error al actualizar categoría');
      }
    } catch (error: any) {
      console.error('Error actualizando categoría:', error);
      toast.error('Error', 'No se pudo actualizar la categoría');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('¿Seguro que quieres eliminar esta categoría? Esto también eliminará todos los servicios asociados.')) {
      try {
        console.log('Eliminando categoría:', id);
        
        const { deleteDesignCategory } = await import('@/lib/api-design');
        const data = await deleteDesignCategory(id) as any;

        if (data.success) {
          toast.success('Categoría eliminada', 'La categoría se ha eliminado correctamente');
          loadCategories();
        } else {
          throw new Error(data.error || 'Error al eliminar categoría');
        }
      } catch (error: any) {
        console.error('Error eliminando categoría:', error);
        toast.error('Error', 'No se pudo eliminar la categoría');
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      emoji: category.emoji
    });
    setShowForm(true);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: '', emoji: '' });
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({ name: '', emoji: '' });
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="h-8 w-8 text-blue-600" />
            Gestión de Categorías - Diseña
          </h1>
          <p className="text-gray-600 mt-2">Administra las categorías de servicios de diseño</p>
        </div>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Servicios</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? Math.round(categories.reduce((acc, cat) => acc + (cat.services_count || 0), 0) / categories.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Crear/Editar */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Categoría</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Arquitectura Residencial"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🏠"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingId ? () => handleUpdateCategory(editingId) : handleCreateCategory}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
              <Button variant="outline" onClick={cancelEditing} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Categorías */}
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={loadCategories} className="mt-2">Reintentar</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.emoji}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {category.services_count || 0} servicios
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    ID: {category.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(category)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {categories.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay categorías creadas</p>
              <p className="text-sm">Crea tu primera categoría para comenzar</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
