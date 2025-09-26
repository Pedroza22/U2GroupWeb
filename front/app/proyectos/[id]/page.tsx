"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useLanguage } from "@/hooks/use-language"
import { useParams, useRouter } from "next/navigation"
import axios from "axios";
import { useState, useEffect } from "react";
import { getProjectLikeFavorite, toggleProjectLike, toggleProjectFavorite, getProjectLikeFavoriteCount } from "@/lib/api-projects";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface BackendProject {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  year: string;
  utilization: string;
  services: string;
  size: string;
  location: string;
  image: string | null;
  images: Array<{id: number; image: string}>;
  created_at: string;
}

export default function ProjectDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  
  // Agregar estilos CSS personalizados
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .img-card {
        width: 100%;
        height: 220px;
        overflow: hidden;
        border-radius: 16px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        cursor: zoom-in;
        display: inline-block;
        position: relative;
      }

      .img-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.45s cubic-bezier(.2,.8,.2,1), filter 0.25s;
        transform-origin: center center;
        will-change: transform;
      }

      .img-card:hover img,
      .img-card:focus-within img {
        transform: scale(1.25);
        filter: saturate(1.08) contrast(1.02);
      }

      @media (hover: none) {
        .img-card:active img { 
          transform: scale(1.25); 
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const projectId = params.id;
  const [project, setProject] = useState<BackendProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likeState, setLikeState] = useState<{ liked: boolean; favorited: boolean } | null>(null);
  const [likeCount, setLikeCount] = useState({ likes: 0, favorites: 0 });
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ id: number; image: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      console.log('Fetching project with ID:', projectId, 'Type:', typeof projectId);
      
      // Validar que projectId sea un número válido
      const numericId = Number(projectId);
      if (isNaN(numericId)) {
        console.error('Invalid project ID:', projectId);
        setError("ID de proyecto inválido");
        setProject(null);
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(`${API_URL}/admin/projects/${numericId}/`);
        console.log('Project data:', res.data);
        const projectData = res.data as BackendProject;
        console.log('📋 Imágenes del proyecto:', projectData.images);
        console.log('📋 Imagen principal:', projectData.image);
        setProject(projectData);
        setError("");
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(t("errorLoadingProject"));
        setProject(null);
      }
      setLoading(false);
    };
    if (projectId) fetchProject();
  }, [projectId, t]);

  // Cargar estado de likes y favoritos
  useEffect(() => {
    const loadLikeState = async () => {
      if (!projectId) return;
      console.log('Loading like state for project ID:', projectId, 'Type:', typeof projectId);
      
      // Validar que projectId sea un número válido
      const numericId = Number(projectId);
      if (isNaN(numericId)) {
        console.error('Invalid project ID for like state:', projectId);
        return;
      }
      
      try {
        const [likeStateData, likeCountData] = await Promise.all([
          getProjectLikeFavorite(numericId),
          getProjectLikeFavoriteCount(numericId)
        ]);
        
        console.log('Like state data:', likeStateData);
        console.log('Like count data:', likeCountData);
        
        setLikeState(likeStateData ? { 
          liked: likeStateData.liked, 
          favorited: likeStateData.favorited 
        } : { liked: false, favorited: false });
        
        setLikeCount({ 
          likes: likeCountData.likeCount || 0, 
          favorites: likeCountData.favoriteCount || 0 
        });
      } catch (error) {
        console.error('Error loading like state:', error);
      }
    };
    
    if (projectId) {
      loadLikeState();
    }
  }, [projectId]);

  const handleLike = async () => {
    if (!project || likeLoading) return;
    console.log('Intentando dar like al proyecto:', project.id);
    setLikeLoading(true);
    try {
      const result = await toggleProjectLike(project.id);
      console.log('Resultado del like:', result);
      setLikeState(prev => prev ? { 
        ...prev, 
        liked: result.liked 
      } : { liked: result.liked, favorited: false });
      setLikeCount({ likes: result.like_count, favorites: result.favorite_count });
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!project || likeLoading) return;
    console.log('Intentando marcar como favorito el proyecto:', project.id);
    setLikeLoading(true);
    try {
      const result = await toggleProjectFavorite(project.id);
      console.log('Resultado del favorito:', result);
      setLikeState(prev => prev ? { 
        ...prev, 
        favorited: result.favorited 
      } : { liked: false, favorited: result.favorited });
      setLikeCount({ likes: result.like_count, favorites: result.favorite_count });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLikeLoading(false);
    }
  };



  const getAllImages = () => {
    if (!project) return [];
    const images = [];
    
    // Agregar imagen principal si existe
    if (project.image) {
      images.push({ id: 0, image: project.image });
    }
    
    // Agregar imágenes adicionales si existen
    if (project.images && Array.isArray(project.images)) {
      images.push(...project.images);
    }
    
    console.log('📸 Todas las imágenes del proyecto:', images);
    return images;
  };

  const openImageModal = (image: { id: number; image: string }) => {
    console.log('🔍 Abriendo modal con imagen:', image);
    console.log('🔍 URL de la imagen:', image.image);
    console.log('🔍 Tipo de imagen:', typeof image.image);
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("loading")}
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || t("error")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white neutra-font">
      <Header currentPage="proyectos" />

      {/* BOTÓN VOLVER */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="outline" 
          className="neutra-font bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToProjects")}
        </Button>
      </div>

      {/* CONTENIDO PRINCIPAL DEL PROYECTO */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* IMAGEN PRINCIPAL Y TÍTULO */}
          <div className="space-y-6">
            {/* Imagen principal */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              {getAllImages().length > 0 ? (
              <Image
                  src={getAllImages()[0]?.image || "/placeholder.svg"}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Título del proyecto */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl neutra-font-black text-gray-900 leading-tight mb-4">
                {project.title}
              </h1>
              
              {/* Botones de interacción */}
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <Button
                  onClick={handleLike}
                  disabled={likeLoading}
                  size="sm"
                  variant={likeState?.liked ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-colors duration-200 ${likeState?.liked ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{likeCount.likes}</span>
                </Button>
                
                <Button
                  onClick={handleFavorite}
                  disabled={likeLoading}
                  size="sm"
                  variant={likeState?.favorited ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-colors duration-200 ${likeState?.favorited ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{likeCount.favorites}</span>
                </Button>
              </div>
            </div>

          </div>

          {/* DETALLES DEL PROYECTO */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl neutra-font-bold text-blue-600 mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              Detalles del Proyecto
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Tipo de Proyecto */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tipo</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.type}</p>
                </div>
              </div>

              {/* Categoría */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Categoría</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.category}</p>
                </div>
              </div>

              {/* Año de Diseño */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Año</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.year}</p>
                </div>
              </div>

              {/* Superficie */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Superficie</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.size}</p>
                </div>
              </div>

              {/* Utilización */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Utilización</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.utilization}</p>
                </div>
              </div>

              {/* Servicios Incluidos */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Servicios</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.services}</p>
                </div>
            </div>

              {/* Ubicación */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ubicación</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{project.location}</p>
                </div>
            </div>

              {/* Fecha de Registro */}
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300 aspect-square">
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Registro</span>
                  <p className="text-sm font-semibold text-blue-600 leading-tight">{new Date(project.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GALERÍA ADICIONAL DE IMÁGENES */}
        {getAllImages().length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl neutra-font-bold text-blue-600 mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              Galería Adicional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getAllImages().slice(1).map((image, index) => (
                <div 
                  key={image.id || index + 1} 
                  className="img-card cursor-zoom-in"
                  onClick={() => openImageModal(image)}
                  tabIndex={0}
                >
                  <img
                    src={image.image}
                    alt={`${project.title} - Imagen ${index + 2}`}
                    onError={(e) => {
                      console.error('Error cargando imagen en galería:', image.image);
                    }}
                  />
                  
                  {/* Badge de número */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center z-10">
                    <span className="text-sm font-bold text-gray-900">{index + 2}</span>
                  </div>
                  
                  {/* Overlay con información */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Vista {index + 2}</p>
                        <p className="text-xs text-gray-600">Haz clic para ampliar</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONCEPTO ARQUITECTÓNICO */}
        {project.description && (
          <div className="mt-16 max-w-4xl">
            <h3 className="text-2xl neutra-font-bold text-blue-600 mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
              Concepto Arquitectónico
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-800 neutra-font leading-relaxed mb-4">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Diseño arquitectónico profesional</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <span>Concepto innovador</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTROS PROYECTOS */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600 neutra-font text-sm uppercase tracking-wider">Más proyectos</span>
          </div>

          <h2 className="text-4xl md:text-6xl neutra-font-black text-blue-600 mb-12">Proyectos destacados</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/proyectos">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <Image
                  src="/placeholder.svg"
                  alt="Ver todos los proyectos"
                  fill
                  className="object-cover transition-all duration-300 group-hover:brightness-75"
                />

                <div className="absolute top-4 right-4 text-gray-600 neutra-font-bold text-lg opacity-70">U2</div>

                <div className="absolute bottom-6 left-6">
                  <h3 className="text-3xl md:text-4xl neutra-font-black text-white">Ver todos los proyectos</h3>
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
                  style={{ backgroundColor: `#000000CC` }}
                >
                  <div className="text-center text-white">
                    <h3 className="text-3xl md:text-4xl neutra-font-black mb-2">Ver todos los proyectos</h3>
                    <p className="text-lg neutra-font opacity-90">Explora nuestra cartera completa</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL PARA AMPLIAR IMÁGENES */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Imagen ampliada */}
            <div className="relative w-full h-full max-w-6xl max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
              <img
                src={selectedImage.image}
                alt={`${project.title} - Imagen ampliada`}
                className="w-full h-full object-contain"
                onLoad={(e) => {
                  console.log('✅ Imagen cargada exitosamente:', selectedImage.image);
                }}
                onError={(e) => {
                  console.error('❌ Error cargando imagen:', selectedImage.image);
                  console.error('❌ Elemento que falló:', e.currentTarget);
                  e.currentTarget.style.display = 'none';
                  // Mostrar mensaje de error
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'flex items-center justify-center w-full h-full text-white text-center';
                  errorDiv.innerHTML = `
                    <div>
                      <p class="text-xl font-semibold mb-2">Error cargando imagen</p>
                      <p class="text-sm opacity-75">URL: ${selectedImage.image}</p>
                    </div>
                  `;
                  if (e.currentTarget.parentNode) {
                    e.currentTarget.parentNode.appendChild(errorDiv);
                  }
                }}
              />
            </div>
            
            {/* Información de la imagen */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <p className="text-lg font-semibold text-white">{project.title}</p>
                <p className="text-sm text-gray-300">Vista ampliada</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
