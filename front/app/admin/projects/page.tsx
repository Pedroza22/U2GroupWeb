"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Heart
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'featured';
  likes: number;
  views: number;
  author: string;
  created_at: string;
  updated_at: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por ahora usamos datos de ejemplo
      const mockProjects: Project[] = [
        {
          id: 1,
          title: 'Casa Moderna Minimalista',
          description: 'Diseño contemporáneo con líneas limpias y espacios abiertos',
          category: 'Residencial',
          image: '/images/projects/modern-house.jpg',
          status: 'active',
          likes: 45,
          views: 1200,
          author: 'Juan Pérez',
          created_at: '2023-08-23T10:00:00Z',
          updated_at: '2023-08-23T10:00:00Z'
        },
        {
          id: 2,
          title: 'Edificio Corporativo U2',
          description: 'Oficinas modernas con enfoque en productividad y bienestar',
          category: 'Comercial',
          image: '/images/projects/corporate-building.jpg',
          status: 'featured',
          likes: 78,
          views: 2100,
          author: 'María García',
          created_at: '2023-08-20T10:00:00Z',
          updated_at: '2023-08-20T10:00:00Z'
        }
      ];
      
      setProjects(mockProjects);
    } catch (err) {
      console.error('Error cargando proyectos:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Activo' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactivo' },
      featured: { color: 'bg-blue-100 text-blue-800', label: 'Destacado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCreateProject = () => {
    console.log('Creando nuevo proyecto');
    alert('Funcionalidad de crear proyecto en desarrollo');
  };

  const handleEditProject = (id: number) => {
    console.log('Editando proyecto:', id);
    alert('Funcionalidad de editar proyecto en desarrollo');
  };

  const handleDeleteProject = (id: number) => {
    if (confirm('¿Seguro que quieres eliminar este proyecto?')) {
      try {
        setProjects(projects.filter(project => project.id !== id));
        alert('Proyecto eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando proyecto:', error);
        alert('Error al eliminar el proyecto');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando proyectos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
        <p className="text-gray-600 mt-2">Administra los proyectos de arquitectura</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <p className="text-xs text-gray-600">Proyectos creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter(project => project.status === 'active').length}
            </div>
            <p className="text-xs text-gray-600">Proyectos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destacados</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter(project => project.status === 'featured').length}
            </div>
            <p className="text-xs text-gray-600">Proyectos destacados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {projects.reduce((sum, project) => sum + project.likes, 0)}
            </div>
            <p className="text-xs text-gray-600">Likes totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Botón Crear */}
      <div className="mb-6">
        <Button onClick={handleCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Proyecto
        </Button>
      </div>

      {/* Lista de proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos de Arquitectura</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadProjects}>Reintentar</Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay proyectos registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {project.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(project.created_at).toLocaleDateString('es-ES')}
                        </span>
                        <span>👁️ {project.views} vistas</span>
                        <span>❤️ {project.likes} likes</span>
                        <span>📁 {project.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditProject(project.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id)}
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