"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Heart, Star, Twitter } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useLanguage } from "@/hooks/use-language"
import { useParams } from "next/navigation"
import { AdminDataManager } from "@/data/admin-data"
import { useState, useEffect } from "react"
import type { AdminBlog } from "@/types"
import axios from "axios";
import { getBlogLikeFavorite, toggleBlogLike, toggleBlogFavorite, getBlogLikeFavoriteCount } from "@/lib/api-blogs";
import { getBlogImageUrl, getImageUrl } from "@/lib/image-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function BlogPostPage() {
  const { t } = useLanguage()
  const params = useParams()
  const blogId = params.id

  // Estado para manejar los datos del blog desde el admin
  const [blogPost, setBlogPost] = useState<AdminBlog | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<AdminBlog[]>([])
  const [latestBlogs, setLatestBlogs] = useState<AdminBlog[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para likes/favoritos
  const [likeState, setLikeState] = useState<{ liked: boolean; favorited: boolean } | null>(null);
  const [likeCount, setLikeCount] = useState<{ likes: number; favorites: number }>({ likes: 0, favorites: 0 });
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/admin/blogs/${blogId}/`);
        const blogData = res.data as any;
        console.log('📋 Blog cargado:', blogData);
        console.log('📋 Imagen del blog:', blogData.image);
        console.log('📋 Imágenes adicionales:', blogData.images);
        console.log('📋 Extra imágenes:', blogData.extra_images);
        console.log('📋 URL de imagen generada:', getBlogImageUrl(blogData));
        console.log('📋 Tipo de extra imágenes:', typeof blogData.extra_images);
        console.log('📋 Longitud de extra imágenes:', blogData.extra_images ? blogData.extra_images.length : 0);
        setBlogPost(blogData);
        setError("");
      } catch (err: any) {
        console.error('❌ Error cargando blog:', err);
        setError("No se pudo cargar el blog.");
        setBlogPost(null);
      }
      setLoading(false);
    };
    if (blogId) fetchBlog();
  }, [blogId]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/blogs/`);
        const blogs: AdminBlog[] = res.data as AdminBlog[];
        if (blogPost) {
          setRelatedBlogs(blogs.filter((b) => b.category === blogPost.category && b.id !== blogPost.id).slice(0, 3));
          setLatestBlogs(blogs.filter((b) => b.id !== blogPost.id).slice(0, 4));
        }
      } catch {}
    };
    if (blogPost) fetchBlogs();
  }, [blogPost]);

  // Cargar estado de like/favorito y conteo
  useEffect(() => {
    if (blogPost) {
      getBlogLikeFavorite(Number(blogPost.id)).then((data) => {
        setLikeState(data ? { liked: data.liked, favorited: data.favorited } : { liked: false, favorited: false });
      }).catch(error => {
        console.error('Error al cargar estado de like/favorito:', error);
        setLikeState({ liked: false, favorited: false });
      });
      getBlogLikeFavoriteCount(Number(blogPost.id)).then(setLikeCount).catch(error => {
        console.error('Error al cargar conteo de likes/favoritos:', error);
        setLikeCount({ likes: 0, favorites: 0 });
      });
    }
  }, [blogPost]);

  const handleLike = async () => {
    if (!blogPost || likeLoading) return;
    console.log('Intentando dar like al blog:', blogPost.id);
    setLikeLoading(true);
    try {
      const result = await toggleBlogLike(Number(blogPost.id));
      console.log('Resultado del like:', result);
      setLikeState(prev => prev ? { 
        ...prev, 
        liked: result.liked 
      } : { 
        liked: result.liked, 
        favorited: false 
      });
      setLikeCount({
        likes: result.like_count,
        favorites: result.favorite_count
      });
    } catch (error) {
      console.error('Error al dar like:', error);
    }
    setLikeLoading(false);
  };

  const handleFavorite = async () => {
    if (!blogPost || likeLoading) return;
    console.log('Intentando marcar como favorito el blog:', blogPost.id);
    setLikeLoading(true);
    try {
      const result = await toggleBlogFavorite(Number(blogPost.id));
      console.log('Resultado del favorito:', result);
      setLikeState(prev => prev ? { 
        ...prev, 
        favorited: result.favorited 
      } : { 
        liked: false, 
        favorited: result.favorited 
      });
      setLikeCount({
        likes: result.like_count,
        favorites: result.favorite_count
      });
    } catch (error) {
      console.error('Error al marcar como favorito:', error);
    }
    setLikeLoading(false);
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) {
    return <div>Loading blog...</div>;
  }
  if (error || !blogPost) {
    return <div className="text-red-600">{error || "Blog no encontrado."}</div>;
  }

  // Verificar si el blog está completo
  const isBlogIncomplete = !blogPost?.title || !blogPost?.summary || !blogPost?.content || !blogPost?.author || !blogPost?.date || !blogPost?.category || !blogPost?.read_time || !blogPost?.image;

  return (
    <div className="min-h-screen bg-white neutra-font">
      {/* Header de navegación */}
      <Header currentPage="blog" />

      {/* Contenido principal del blog */}
      {isBlogIncomplete && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p>Este blog está incompleto. Faltan uno o más campos obligatorios. Por favor, edítalo para completarlo.</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Columna principal - contenido del blog */}
          <div className="lg:col-span-2">
            {/* Encabezado del artículo */}
            <div className="mb-8">
              {/* Título principal */}
              <h1 className="text-4xl md:text-6xl neutra-font-black text-blue-600 leading-tight mb-6">
                {blogPost.title || "(Por llenar)"}
              </h1>

              {/* Metadatos del artículo */}
              <div className="flex items-center gap-4 mb-8">
                {blogPost.category && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm neutra-font">
                    {blogPost.category}
                  </span>
                )}
                <span className="text-gray-500 neutra-font">
                  {blogPost.date && `• ${blogPost.date}`} {blogPost.read_time && `• ${blogPost.read_time}`}
                </span>
                <span className="ml-auto flex items-center gap-2">
                  <button 
                    title="Me gusta" 
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-1 transition-colors ${likeState?.liked ? 'text-red-600' : 'text-blue-600 hover:text-red-600'}`}
                  >
                    <Heart className={`w-4 h-4 ${likeState?.liked ? 'fill-current' : ''}`} /> {likeCount.likes}
                  </button>
                  <button 
                    title="Favoritos" 
                    onClick={handleFavorite}
                    disabled={likeLoading}
                    className={`flex items-center gap-1 transition-colors ${likeState?.favorited ? 'text-yellow-600' : 'text-yellow-500 hover:text-yellow-600'}`}
                  >
                    <Star className={`w-4 h-4 ${likeState?.favorited ? 'fill-current' : ''}`} /> {likeCount.favorites}
                  </button>
                </span>
              </div>

              {/* Imagen principal del artículo */}
              <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={getBlogImageUrl(blogPost)}
                  alt={blogPost.title || "Imagen del blog"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error('❌ Error cargando imagen del blog:', blogPost.id, getBlogImageUrl(blogPost));
                    e.currentTarget.src = "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Imagen+no+disponible";
                  }}
                  onLoad={(e) => {
                    console.log('✅ Imagen del blog cargada:', blogPost.id, getBlogImageUrl(blogPost));
                  }}
                />
              </div>

              {/* Resumen del artículo */}
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <p className="text-gray-700 text-lg leading-relaxed neutra-font">
                  {blogPost.summary || blogPost.excerpt || "(Por llenar)"}
                </p>
              </div>
            </div>

            {/* Contenido del artículo */}
            <div className="prose max-w-none">
              {typeof blogPost.content === "string" ? (
                <p className="text-lg text-gray-700 mb-6 neutra-font leading-relaxed">
                  {blogPost.content}
                </p>
              ) : (
                <p className="text-lg text-gray-700 mb-6 neutra-font leading-relaxed">(Por llenar)</p>
              )}

              {/* Galería de imágenes adicionales */}
              {blogPost?.extra_images && Array.isArray(blogPost.extra_images) && blogPost.extra_images.length > 0 && (
                <div className="my-12">
                  <h3 className="text-2xl neutra-font-bold text-blue-600 mb-6">Galería de Imágenes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPost.extra_images.map((img: string, idx: number) => {
                      const imageUrl = img;
                      return (
                        <div 
                          key={`img-${idx}`} 
                          className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                          onClick={() => openImageModal(imageUrl)}
                        >
                          <Image 
                            src={imageUrl} 
                            alt={`Imagen ${idx + 1}`} 
                            fill 
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.error('❌ Error cargando imagen adicional:', imageUrl);
                              e.currentTarget.src = "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Imagen+no+disponible";
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

                          {/* Botones de interacción */}
              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-200">
                <Button
                  onClick={handleLike}
                  disabled={likeLoading}
                  variant={likeState?.liked ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-colors duration-200 ${likeState?.liked ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{likeCount.likes}</span>
                </Button>
                
                <Button
                  onClick={handleFavorite}
                  disabled={likeLoading}
                  variant={likeState?.favorited ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-colors duration-200 ${likeState?.favorited ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{likeCount.favorites}</span>
                </Button>
              </div>
          </div>

          {/* Sidebar derecho */}
          <div className="lg:col-span-1">
            {/* Últimos blogs publicados */}
            <div className="mb-12">
              <h3 className="text-3xl neutra-font-black text-blue-600 mb-6">Últimos Blogs</h3>
              <div className="space-y-6">
                {latestBlogs.length > 0 ? (
                  latestBlogs.map((blog) => (
                    <div key={blog.id} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getBlogImageUrl(blog)}
                          alt={blog.title || "Blog"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 neutra-font">{blog.date}</p>
                        <Link href={`/blog/${blog.id}`}>
                          <h4 className="text-sm neutra-font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight">
                            {blog.title || "(Por llenar)"}
                          </h4>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 neutra-font">(To be filled - No blogs available)</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal para ampliar imágenes */}
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
                  src={selectedImage}
                  alt="Imagen ampliada"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('❌ Error cargando imagen en modal:', selectedImage);
                    e.currentTarget.src = "https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Error+cargando+imagen";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Blogs relacionados */}
        <div className="mt-16">
          <h2 className="text-4xl neutra-font-black text-blue-600 mb-8">Blogs Relacionados</h2>
          {relatedBlogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {relatedBlogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video">
                    <Image
                      src={getBlogImageUrl(blog)}
                      alt={blog.title || "Blog relacionado"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="neutra-font-bold text-gray-900 text-lg leading-tight mb-4">
                      {blog.title || "(Por llenar)"}
                    </h3>
                    <Link href={`/blog/${blog.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white neutra-font bg-transparent"
                      >
                        Leer Artículo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 neutra-font mb-8">
              No related blogs available
            </div>
          )}

          {/* Botón para ver todos los blogs */}
          <div className="text-center">
            <Link href="/blog">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full neutra-font">
                Ver Todos los Blogs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer del sitio */}
      <Footer />
    </div>
  )
}
