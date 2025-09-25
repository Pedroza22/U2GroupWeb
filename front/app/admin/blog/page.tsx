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
  User
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'archived';
  image?: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Por ahora usamos datos de ejemplo
      const mockPosts: BlogPost[] = [
        {
          id: 1,
          title: 'Tendencias en Diseño Arquitectónico 2023',
          content: 'Contenido completo del artículo...',
          excerpt: 'Descubre las últimas tendencias en diseño arquitectónico para este año.',
          author: 'Juan Pérez',
          date: '2023-08-23',
          status: 'published',
          image: '/images/blog/trends-2023.jpg',
          views: 1250,
          likes: 89,
          created_at: '2023-08-23T10:00:00Z',
          updated_at: '2023-08-23T10:00:00Z'
        },
        {
          id: 2,
          title: 'Cómo Elegir el Plan Perfecto para tu Casa',
          content: 'Contenido completo del artículo...',
          excerpt: 'Guía completa para seleccionar el plan arquitectónico ideal.',
          author: 'María García',
          date: '2023-08-20',
          status: 'published',
          image: '/images/blog/choose-plan.jpg',
          views: 890,
          likes: 67,
          created_at: '2023-08-20T10:00:00Z',
          updated_at: '2023-08-20T10:00:00Z'
        },
        {
          id: 3,
          title: 'Diseño Sostenible: El Futuro de la Arquitectura',
          content: 'Contenido completo del artículo...',
          excerpt: 'Exploramos las prácticas sostenibles en arquitectura moderna.',
          author: 'Carlos López',
          date: '2023-08-18',
          status: 'draft',
          image: '/images/blog/sustainable-design.jpg',
          views: 0,
          likes: 0,
          created_at: '2023-08-18T10:00:00Z',
          updated_at: '2023-08-18T10:00:00Z'
        }
      ];
      
      setPosts(mockPosts);
    } catch (err) {
      console.error('Error cargando posts:', err);
      setError('Error al cargar los artículos del blog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', label: 'Publicado' },
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Borrador' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Archivado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCreatePost = () => {
    // Aquí iría la lógica para crear un nuevo post
    console.log('Creando nuevo post');
    alert('Funcionalidad de crear post en desarrollo');
  };

  const handleEditPost = (id: number) => {
    // Aquí iría la lógica para editar el post
    console.log('Editando post:', id);
    alert('Funcionalidad de editar post en desarrollo');
  };

  const handleDeletePost = (id: number) => {
    if (confirm('¿Seguro que quieres eliminar este artículo?')) {
      try {
        console.log('Eliminando post:', id);
        setPosts(posts.filter(post => post.id !== id));
        alert('Artículo eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando post:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const handleViewPost = (id: number) => {
    // Aquí iría la lógica para ver el post
    console.log('Viendo post:', id);
    alert('Funcionalidad de ver post en desarrollo');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando blog...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión del Blog</h1>
        <p className="text-gray-600 mt-2">Administra los artículos del blog</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
            <p className="text-xs text-gray-600">Artículos creados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(post => post.status === 'published').length}
            </div>
            <p className="text-xs text-gray-600">Artículos publicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {posts.filter(post => post.status === 'draft').length}
            </div>
            <p className="text-xs text-gray-600">Artículos en borrador</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">Vistas totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Botón Crear */}
      <div className="mb-6">
        <Button onClick={handleCreatePost}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Artículo
        </Button>
      </div>

      {/* Lista de artículos */}
      <Card>
        <CardHeader>
          <CardTitle>Artículos del Blog</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadPosts}>Reintentar</Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay artículos publicados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        {getStatusBadge(post.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.date).toLocaleDateString('es-ES')}
                        </span>
                        <span>👁️ {post.views} vistas</span>
                        <span>❤️ {post.likes} likes</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewPost(post.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditPost(post.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeletePost(post.id)}
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



