/**
 * Utilidades para manejar URLs de imágenes del backend
 */

const MEDIA_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + "/media/" || "https://u2-group-backend.onrender.com/media/";

/**
 * Convierte una ruta de imagen relativa a una URL completa del servidor de media
 * @param imagePath - Ruta de la imagen (puede ser relativa o URL completa)
 * @returns URL completa de la imagen o placeholder si no hay imagen
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Sin+Imagen";
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si la ruta ya empieza con /media/, solo agregar el dominio
  if (imagePath.startsWith('/media/')) {
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://u2-group-backend.onrender.com'}${imagePath}`;
  }
  
  // Si es una ruta relativa sin /media/, agregar el prefijo completo
  return `${MEDIA_URL}${imagePath}`;
};

/**
 * Obtiene la URL de la imagen principal de un blog
 * @param blog - Objeto blog que puede tener image o images
 * @returns URL de la imagen principal o placeholder
 */
export const getBlogImageUrl = (blog: any): string => {
  console.log('🔍 getBlogImageUrl llamado con:', {
    blogId: blog.id,
    blogTitle: blog.title,
    image: blog.image,
    images: blog.images,
    extra_images: blog.extra_images
  });
  
  // Primero intentar con la imagen principal
  if (blog.image) {
    const url = getImageUrl(blog.image);
    console.log('✅ Usando imagen principal:', url);
    return url;
  }
  
  // Luego intentar con la primera imagen adicional
  if (blog.images && blog.images.length > 0) {
    const url = getImageUrl(blog.images[0].image);
    console.log('✅ Usando primera imagen adicional:', url);
    return url;
  }
  
  // También verificar extra_images por si acaso
  if (blog.extra_images && blog.extra_images.length > 0) {
    const url = getImageUrl(blog.extra_images[0].image);
    console.log('✅ Usando primera extra_image:', url);
    return url;
  }
  
  console.log('❌ No se encontró imagen, usando placeholder');
  return "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Sin+Imagen";
};