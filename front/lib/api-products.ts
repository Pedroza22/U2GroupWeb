export interface Product {
  id: number;
  name: string;
  description: string;
  area_m2: number;
  area_sqft: number;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  price: number;
  architectural_style: string;
  main_image: string;
  images: Array<{
    id: number;
    image: string;
    order: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export async function getProducts(filters: Record<string, any> = {}): Promise<ProductsResponse> {
  try {
    console.log('🛒 Cargando productos del marketplace desde backend...');
    
    // Usar el backend real en lugar del API route de Next.js
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://u2-group-backend.onrender.com/api";
    const response = await fetch(`${API_URL}/admin/marketplace/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Error en respuesta del backend:', response.status);
      throw new Error('Error al cargar los productos desde el backend');
    }

    const backendData = await response.json();
    console.log('✅ Productos cargados del backend:', backendData.length);
    
    // Convertir formato del backend al formato esperado por el frontend
    const convertedProducts: Product[] = backendData.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      area_m2: parseFloat(product.area_m2) || 0,
      area_sqft: parseFloat(product.area_sqft) || (parseFloat(product.area_m2) * 10.764) || 0,
      bedrooms: product.rooms || 0,
      bathrooms: product.bathrooms || 0,
      garage: product.garage_spaces || 0,
      price: parseFloat(product.price) || 0,
      architectural_style: product.style || 'modern',
      main_image: product.image || '/placeholder.svg',
      images: [], // TODO: Implementar imágenes adicionales si es necesario
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));

    // Aplicar filtros si es necesario
    let filteredProducts = convertedProducts;
    
    // Filtro de búsqueda por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por área mínima
    if (filters.min_area) {
      const minArea = parseFloat(filters.min_area);
      filteredProducts = filteredProducts.filter(product => 
        product.area_m2 >= minArea
      );
    }
    
    // Filtro por área máxima  
    if (filters.max_area) {
      const maxArea = parseFloat(filters.max_area);
      filteredProducts = filteredProducts.filter(product => 
        product.area_m2 <= maxArea
      );
    }
    
    // Filtro por precio mínimo
    if (filters.min_price) {
      const minPrice = parseFloat(filters.min_price);
      filteredProducts = filteredProducts.filter(product => 
        product.price >= minPrice
      );
    }
    
    // Filtro por precio máximo
    if (filters.max_price) {
      const maxPrice = parseFloat(filters.max_price);
      filteredProducts = filteredProducts.filter(product => 
        product.price <= maxPrice
      );
    }
    
    // Filtro por número de dormitorios
    if (filters.bedrooms) {
      const bedrooms = parseInt(filters.bedrooms);
      filteredProducts = filteredProducts.filter(product => 
        product.bedrooms >= bedrooms
      );
    }
    
    // Filtro por número de baños
    if (filters.bathrooms) {
      const bathrooms = parseInt(filters.bathrooms);
      filteredProducts = filteredProducts.filter(product => 
        product.bathrooms >= bathrooms
      );
    }
    
    console.log(`🔍 Filtros aplicados. Productos: ${convertedProducts.length} → ${filteredProducts.length}`);

    const result: ProductsResponse = {
      count: filteredProducts.length,
      next: null,
      previous: null,
      results: filteredProducts,
    };

    console.log(`📦 Retornando ${result.count} productos al frontend`);
    return result;
  } catch (error) {
    console.error('❌ Error fetching products from backend:', error);
    // Retornar respuesta vacía en caso de error
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

export async function getProduct(id: number): Promise<Product> {
  try {
    console.log(`🛒 Cargando producto ${id} desde backend...`);
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://u2-group-backend.onrender.com/api";
    const response = await fetch(`${API_URL}/admin/marketplace/${id}/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Error cargando producto ${id}:`, response.status);
      throw new Error('Error al cargar el producto desde el backend');
    }

    const backendProduct = await response.json();
    console.log(`✅ Producto ${id} cargado del backend`);
    
    // Convertir formato del backend al formato esperado por el frontend
    const convertedProduct: Product = {
      id: backendProduct.id,
      name: backendProduct.name,
      description: backendProduct.description,
      area_m2: parseFloat(backendProduct.area_m2) || 0,
      area_sqft: parseFloat(backendProduct.area_sqft) || (parseFloat(backendProduct.area_m2) * 10.764) || 0,
      bedrooms: backendProduct.rooms || 0,
      bathrooms: backendProduct.bathrooms || 0,
      garage: backendProduct.garage_spaces || 0,
      price: parseFloat(backendProduct.price) || 0,
      architectural_style: backendProduct.style || 'modern',
      main_image: backendProduct.image || '/placeholder.svg',
      images: [], // TODO: Implementar imágenes adicionales si es necesario
      created_at: backendProduct.created_at,
      updated_at: backendProduct.updated_at,
    };

    return convertedProduct;
  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error);
    throw error;
  }
}

export async function getFavoriteProducts(): Promise<Product[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  try {
    const response = await fetch('/api/products/favorites/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cargar los favoritos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    throw error;
  }
}

export async function toggleFavorite(productId: number): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Debes iniciar sesión para marcar favoritos');
  }

  try {
    const response = await fetch(`/api/products/${productId}/toggle_favorite/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sesión expirada');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar favorito');
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
} 