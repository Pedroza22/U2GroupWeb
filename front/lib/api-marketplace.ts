import axios from 'axios';
import { getLocalStorage } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://u2-group-backend.onrender.com/api';

// Tipos de datos
export interface MarketplaceProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  style: string;
  price: number;
  area_m2: number;
  rooms: number;
  bathrooms: number;
  floors: number;
  image?: string;
  images?: string[];
  additional_images?: Array<{id: number, image: string, created_at: string}>;
  zip_file?: string;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  included_items?: string[];
  not_included_items?: string[];
  price_editable_m2?: number;
  price_editable_sqft?: number;
  price_pdf_m2?: number;
  price_pdf_sqft?: number;
  area_sqft?: number;
  area_unit?: string;
  garage_spaces?: number;
  main_level_images?: string[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: MarketplaceProduct;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MarketplaceOrderItem {
  id: number;
  product: MarketplaceProduct;
  quantity: number;
  price: number;
  subtotal: number;
  zip_sent: boolean;
  zip_sent_at?: string;
}

export interface MarketplaceOrder {
  id: number;
  user: number;
  stripe_payment_intent_id?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  shipping_address: string;
  billing_address: string;
  zip_files_sent: boolean;
  items: MarketplaceOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface ProductFavorite {
  id: number;
  user: number;
  product: MarketplaceProduct;
  created_at: string;
}

// Funciones de autenticación
const getAuthHeaders = () => {
  // Para desarrollo, no enviar token de autorización ya que el backend usa usuario hardcodeado
  console.log('🔐 Development mode - no auth headers needed');
  
  return {};
};

// Productos del marketplace
export async function getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
  try {
    console.log('🌐 getMarketplaceProducts - API_URL:', API_URL);
    console.log('🌐 getMarketplaceProducts - process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🌐 getMarketplaceProducts - URL completa:', `${API_URL}/admin/marketplace/`);
    console.log('🌐 getMarketplaceProducts - Haciendo petición a:', `${API_URL}/admin/marketplace/`);
    const res = await axios.get(`${API_URL}/admin/marketplace/`);
    console.log('✅ getMarketplaceProducts - Respuesta completa:', res);
    console.log('✅ getMarketplaceProducts - Tipo de res.data:', typeof res.data);
    console.log('✅ getMarketplaceProducts - res.data:', res.data);
    console.log('✅ getMarketplaceProducts - res.data keys:', Object.keys(res.data || {}));
    console.log('✅ getMarketplaceProducts - res.data stringified:', JSON.stringify(res.data, null, 2));
    
    // Verificar si res.data es un array
    if (Array.isArray(res.data)) {
      console.log('✅ getMarketplaceProducts - IDs de productos:', res.data.map(p => ({ id: p.id, name: p.name })));
      return res.data;
    } else {
      console.warn('⚠️ getMarketplaceProducts - res.data no es un array, intentando extraer productos...');
      console.log('⚠️ getMarketplaceProducts - Estructura de res.data:', JSON.stringify(res.data, null, 2));
      
      // Intentar extraer productos de diferentes estructuras posibles
      const data = res.data as any;
      if (data && data.results && Array.isArray(data.results)) {
        console.log('✅ getMarketplaceProducts - Encontrados productos en res.data.results');
        return data.results;
      } else if (data && data.data && Array.isArray(data.data)) {
        console.log('✅ getMarketplaceProducts - Encontrados productos en res.data.data');
        return data.data;
      } else if (data && data.products && Array.isArray(data.products)) {
        console.log('✅ getMarketplaceProducts - Encontrados productos en res.data.products');
        return data.products;
      } else {
        console.error('❌ getMarketplaceProducts - No se pudo encontrar array de productos en la respuesta');
        console.error('❌ getMarketplaceProducts - Devolviendo array vacío');
        return [];
      }
    }
  } catch (error: any) {
    console.error('❌ getMarketplaceProducts - Error:', error);
    console.error('❌ getMarketplaceProducts - Tipo de error:', typeof error);
    console.error('❌ getMarketplaceProducts - Error message:', error?.message);
    console.error('❌ getMarketplaceProducts - Error response:', error?.response);
    console.error('❌ getMarketplaceProducts - Error status:', error?.response?.status);
    console.error('❌ getMarketplaceProducts - Error data:', error?.response?.data);
    console.error('❌ getMarketplaceProducts - Devolviendo array vacío por error');
    return [];
  }
}

export async function getMarketplaceProduct(id: number): Promise<MarketplaceProduct> {
  const res = await axios.get<MarketplaceProduct>(`${API_URL}/admin/marketplace/${id}/`);
  return res.data;
}

export async function addToCart(productId: number, quantity: number = 1, price?: number, planInfo?: { plan_type?: string; area_unit?: string }): Promise<Cart> {
  try {
    console.log('🛒 Adding to cart via API, productId:', productId, 'quantity:', quantity, 'price:', price, 'planInfo:', planInfo);
    console.log('🛒 Auth headers:', getAuthHeaders());
    
    const requestData: any = { quantity };
    if (price !== undefined) {
      requestData.price = price;
    }
    if (planInfo) {
      requestData.plan_type = planInfo.plan_type;
      requestData.area_unit = planInfo.area_unit;
    }
    
    const res = await axios.post<Cart>(
      `${API_URL}/admin/marketplace/${productId}/add_to_cart/`,
      requestData,
      { headers: getAuthHeaders() }
    );
    
    console.log('🛒 Cart API response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('🛒 Error adding to cart via API:', error);
    if (error.response) {
      console.error('🛒 Error response:', error.response?.data);
      console.error('🛒 Error status:', error.response?.status);
    }
    throw error;
  }
}

export async function toggleProductFavorite(productId: number): Promise<{ favorited: boolean }> {
  const res = await axios.post<{ favorited: boolean }>(
    `${API_URL}/admin/marketplace/${productId}/toggle_favorite/`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// Carrito de compras
export async function getCart(): Promise<Cart> {
  try {
    console.log('🛒 Getting cart from API...');
    console.log('🛒 URL:', `${API_URL}/admin/cart/`);
    console.log('🛒 Auth headers:', getAuthHeaders());
    
    const res = await axios.get<Cart>(`${API_URL}/admin/cart/`, { headers: getAuthHeaders() });
    
    console.log('🛒 Cart API response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('🛒 Error getting cart:', error);
    if (error.response) {
      console.error('🛒 Error response:', error.response?.data);
      console.error('🛒 Error status:', error.response?.status);
      
      // Si es un error de autenticación, devolver un carrito vacío
      if (error.response?.status === 401) {
        console.log('🛒 Authentication error, returning empty cart');
        return {
          id: 0,
          user: 0,
          items: [],
          total: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        };
      }
    }
    throw error;
  }
}

export async function updateCartItem(cartId: number, itemId: number, quantity: number): Promise<Cart> {
  const res = await axios.post<Cart>(
    `${API_URL}/admin/cart/${cartId}/update_item/`,
    { item_id: itemId, quantity },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function removeCartItem(cartId: number, itemId: number): Promise<Cart> {
  const res = await axios.post<Cart>(
    `${API_URL}/admin/cart/${cartId}/remove_item/`,
    { item_id: itemId },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function checkoutCart(cartId: number): Promise<{
  order_id: number;
  client_secret: string;
  total: number;
}> {
  const res = await axios.post<{
    order_id: number;
    client_secret: string;
    total: number;
  }>(
    `${API_URL}/admin/cart/${cartId}/checkout/`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

// Órdenes
export async function getMarketplaceOrders(): Promise<MarketplaceOrder[]> {
  try {
    console.log('📦 Obteniendo órdenes del marketplace...');
    console.log('📦 URL:', `${API_URL}/admin/marketplace-orders/`);
    console.log('📦 Headers:', getAuthHeaders());
    
    const res = await axios.get<MarketplaceOrder[]>(`${API_URL}/admin/marketplace-orders/`, { headers: getAuthHeaders() });
    
    console.log('📦 Respuesta del servidor:', res.data);
    console.log('📦 Número de órdenes:', res.data.length);
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo órdenes:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
    throw error;
  }
}

export async function getMarketplaceOrder(id: number): Promise<MarketplaceOrder> {
  const res = await axios.get<MarketplaceOrder>(`${API_URL}/admin/marketplace-orders/${id}/`, { headers: getAuthHeaders() });
  return res.data;
}

export async function confirmPayment(orderId: number): Promise<{ status: string; message: string }> {
  const res = await axios.post<{ status: string; message: string }>(
    `${API_URL}/admin/marketplace-orders/${orderId}/confirm_payment/`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
}

export async function sendInvoiceToAdmin(orderId: number): Promise<{ status: string; message: string }> {
  try {
    console.log('📧 Enviando factura al admin para orden:', orderId);
    console.log('📧 Auth headers:', getAuthHeaders());
    console.log('📧 URL:', `${API_URL}/admin/marketplace-orders/${orderId}/send_invoice/`);
    
    const requestData = {
      admin_email: 'julianpedrozaospina@gmail.com',
      message: 'Se ha realizado una nueva compra. Los archivos serán enviados al cliente en los próximos 3 días hábiles.'
    };
    console.log('📧 Request data:', requestData);
    
    const res = await axios.post<{ status: string; message: string }>(
      `${API_URL}/admin/marketplace-orders/${orderId}/send_invoice/`,
      requestData,
      { headers: getAuthHeaders() }
    );
    
    console.log('📧 Response status:', res.status);
    console.log('📧 Response data:', res.data);
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error sending invoice to admin:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
    }
    throw error;
  }
}

export async function sendZipFiles(orderId: number, zipFile: File): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📦 Enviando archivos ZIP para orden:', orderId);
    console.log('📦 Archivo:', zipFile.name, 'Tamaño:', zipFile.size);
    console.log('📦 Auth headers:', getAuthHeaders());
    console.log('📦 URL:', `${API_URL}/admin/marketplace/orders/${orderId}/send-zip-files/`);
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('zip_file', zipFile);
    
    const res = await axios.post<{ success: boolean; message: string }>(
      `${API_URL}/admin/marketplace/orders/${orderId}/send-zip-files/`,
      formData,
      { 
        headers: {
          ...getAuthHeaders(),
          'Authorization': 'Bearer authenticated',
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('📦 Response status:', res.status);
    console.log('📦 Response data:', res.data);
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error sending ZIP files:', error);
    if (error.response?.data) {
      console.error('❌ Error response:', error.response.data);
      console.error('❌ Error status:', error.response.status);
      
      // Si el error es 400, mostrar el mensaje específico del backend
      if (error.response.status === 400) {
        const errorMessage = error.response.data.message || 'Error al enviar archivos ZIP';
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
}

// Favoritos
export async function getProductFavorites(): Promise<ProductFavorite[]> {
  try {
    const res = await axios.get<ProductFavorite[]>(`${API_URL}/product-favorites/`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.warn('🖤 Error getting favorites from backend, using localStorage fallback:', error);
    
    // Fallback: usar localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites;
  }
}

export async function getFavoritesCount(): Promise<{ count: number }> {
  try {
    const res = await axios.get<{ count: number }>(`${API_URL}/product-favorites/count/`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.warn('Error getting favorites count from backend, using localStorage fallback');
    // Fallback: usar localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return { count: favorites.length };
  }
}

export async function addToFavorites(productId: number): Promise<ProductFavorite> {
  try {
    console.log('🖤 Adding to favorites, productId:', productId);
    
    const response = await axios.post<ProductFavorite>(
      `${API_URL}/product-favorites/`,
      { product: productId },
      { headers: getAuthHeaders() }
    );
    console.log('🖤 Added to favorites (backend):', response.data);
    return response.data;
  } catch (error) {
    console.warn('🖤 Backend error, using localStorage fallback:', error);
    
    // Fallback: usar localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const existingFavorite = favorites.find((f: any) => f.product === productId);
    
    if (existingFavorite) {
      console.log('🖤 Product already in favorites (localStorage)');
      return existingFavorite;
    }
    
    const newFavorite = {
      id: Date.now(), // ID temporal
      product: productId as any,
      created_at: new Date().toISOString(),
      user: 1 // ID temporal del usuario
    } as ProductFavorite;
    
    favorites.push(newFavorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('🖤 Added to favorites (localStorage):', newFavorite);
    
    return newFavorite;
  }
}

export async function removeFromFavorites(favoriteId: number): Promise<void> {
  await axios.delete(`${API_URL}/product-favorites/${favoriteId}/`, { headers: getAuthHeaders() });
}

export async function createMarketplaceProduct(product: Partial<MarketplaceProduct> | FormData): Promise<MarketplaceProduct> {
  try {
    console.log('🆕 Creando nuevo producto');
    console.log('📊 Tipo de datos:', product instanceof FormData ? 'FormData' : 'JSON');
    
    const headers = getAuthHeaders();
    
    // Si es FormData, no agregar Content-Type para que el navegador lo establezca automáticamente
    if (product instanceof FormData) {
      console.log('📤 Enviando FormData con archivos');
      const res = await axios.post<MarketplaceProduct>(
        `${API_URL}/admin/marketplace/`,
        product,
        { headers }
      );
      console.log('✅ Producto creado exitosamente');
      return res.data;
    } else {
      console.log('📤 Enviando datos JSON');
      // Si es JSON, agregar Content-Type
      const res = await axios.post<MarketplaceProduct>(
        `${API_URL}/admin/marketplace/`,
        product,
        { 
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Producto creado exitosamente');
      return res.data;
    }
  } catch (error: any) {
    console.error('❌ Error creando producto:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response.data);
      console.error('❌ Error status:', error.response.status);
    }
    throw error;
  }
}

export async function updateMarketplaceProduct(id: number, product: Partial<MarketplaceProduct> | FormData): Promise<MarketplaceProduct> {
  try {
    console.log('🔄 Actualizando producto #', id);
    console.log('📊 Tipo de datos:', product instanceof FormData ? 'FormData' : 'JSON');
    
    const headers = getAuthHeaders();
    
    // Siempre usar PATCH para actualizaciones (permite actualizaciones parciales)
    if (product instanceof FormData) {
      console.log('📤 Enviando FormData con archivos');
      const res = await axios.patch<MarketplaceProduct>(
        `${API_URL}/admin/marketplace/${id}/`,
        product,
        { headers }
      );
      console.log('✅ Producto actualizado exitosamente');
      return res.data;
    } else {
      console.log('📤 Enviando datos JSON');
      // Si es JSON, usar PATCH en lugar de PUT
      const res = await axios.patch<MarketplaceProduct>(
        `${API_URL}/admin/marketplace/${id}/`,
        product,
        { 
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Producto actualizado exitosamente');
      return res.data;
    }
  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response.data);
      console.error('❌ Error status:', error.response.status);
    }
    throw error;
  }
}

export async function deleteMarketplaceProduct(id: number): Promise<void> {
  await axios.delete(`${API_URL}/admin/marketplace/${id}/`, { headers: getAuthHeaders() });
}

export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<any> {
  try {
    console.log('🔍 Buscando orden por payment_intent_id:', paymentIntentId);
    
    const res = await axios.get(
      `${API_URL}/admin/marketplace-orders/get_order_by_payment_intent/?payment_intent_id=${paymentIntentId}`,
      { headers: getAuthHeaders() }
    );
    
    console.log('✅ Orden encontrada:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error obteniendo orden por payment_intent_id:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
    }
    throw error;
  }
}

// Utilidades
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

export const getImageUrl = (imagePath: string, additionalImages?: string[]): string => {
  console.log('🖼️ getImageUrl llamado con:', imagePath);
  console.log('🖼️ getImageUrl - Imágenes adicionales:', additionalImages);
  
  // Si hay una imagen principal válida, usarla
  if (imagePath && imagePath !== 'null' && imagePath !== 'undefined' && imagePath !== '') {
    // Si ya es una URL completa (incluyendo localhost:8000)
    if (imagePath.startsWith('http')) {
      console.log('🖼️ URL completa detectada:', imagePath);
      return imagePath;
    }
    
    // Si es una blob URL
    if (imagePath.startsWith('blob:')) {
      console.log('🖼️ Blob URL detectada:', imagePath);
      return imagePath;
    }
    
    // Si empieza con /media/, construir URL completa
    if (imagePath.startsWith('/media/')) {
      const fullUrl = `${API_URL.replace('/api', '')}${imagePath}`;
      console.log('🖼️ URL construida para /media/:', fullUrl);
      return fullUrl;
    }
    
    // Si no empieza con /, agregar /media/ por defecto
    if (!imagePath.startsWith('/')) {
      const fullUrl = `${API_URL.replace('/api', '')}/media/${imagePath}`;
      console.log('🖼️ URL construida con /media/:', fullUrl);
      return fullUrl;
    }
    
    // Caso por defecto
    const fullUrl = `${API_URL.replace('/api', '')}${imagePath}`;
    console.log('🖼️ URL construida por defecto:', fullUrl);
    return fullUrl;
  }
  
  // Si no hay imagen principal pero hay imágenes adicionales, usar la primera
  if (additionalImages && additionalImages.length > 0) {
    const firstAdditionalImage = additionalImages[0];
    console.log('🖼️ Usando primera imagen adicional como fallback:', firstAdditionalImage);
    
    // Si ya es una URL completa
    if (firstAdditionalImage.startsWith('http')) {
      return firstAdditionalImage;
    }
    
    // Si empieza con /media/, construir URL completa
    if (firstAdditionalImage.startsWith('/media/')) {
      const fullUrl = `${API_URL.replace('/api', '')}${firstAdditionalImage}`;
      return fullUrl;
    }
    
    // Si no empieza con /, agregar /media/ por defecto
    if (!firstAdditionalImage.startsWith('/')) {
      const fullUrl = `${API_URL.replace('/api', '')}/media/${firstAdditionalImage}`;
      return fullUrl;
    }
    
    // Caso por defecto
    const fullUrl = `${API_URL.replace('/api', '')}${firstAdditionalImage}`;
    return fullUrl;
  }
  
  // Si no hay ninguna imagen, usar placeholder
  console.log('🖼️ No hay imagen principal ni adicionales, usando placeholder');
  return '/placeholder-product.svg';
}; 