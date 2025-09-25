"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Product } from '@/lib/api-products';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import { getCart } from '@/lib/api-marketplace';
import { cartSessionManager, CartSessionItem } from '@/lib/cart-session-manager';
import { useAuth } from '@/hooks/use-auth';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { isAuthenticated } = useAuth();

  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 CartProvider initialized - cartItems:', cartItems, 'isAuthenticated:', isAuthenticated);
  }

  const syncCart = useCallback(async () => {
    console.log('🛒 syncCart called - isAuthenticated:', isAuthenticated);
    console.log('🛒 localStorage tokens:', {
      'accessToken': localStorage.getItem('accessToken'),
      'u2-admin-token': localStorage.getItem('u2-admin-token'),
      'token': localStorage.getItem('token')
    });
    
    // Verificar si estamos en una página del admin
    const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    console.log('🛒 Is admin page:', isAdminPage);
    
    // No sincronizar en páginas del admin
    if (isAdminPage) {
      console.log('🛒 Admin page detected, skipping cart sync');
      return;
    }
    
    // Para desarrollo, siempre sincronizar con el backend
    console.log('🛒 Development mode - always syncing with backend');

    try {
      console.log('🛒 Syncing with backend (authenticated)...');
      const backendCart = await getCart();
      console.log('🛒 Backend cart loaded:', backendCart);
      
      if (backendCart && backendCart.items && backendCart.items.length > 0) {
        // Convert backend cart items to local format
        const convertedItems = backendCart.items.map((item: any) => ({
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          area_m2: item.product.area_m2,
          area_sqft: item.product.area_sqft || item.product.area_m2 * 10.764,
          bedrooms: item.product.rooms,
          bathrooms: item.product.bathrooms,
          garage: item.product.garage_spaces || 0,
          price: item.price, // Usar el precio del item del carrito (que incluye el precio seleccionado)
          architectural_style: item.product.style || 'Modern',
          main_image: item.product.image || '',
          images: (item.product.images || []).map((image: string, index: number) => ({
            id: index,
            image: image,
            order: index
          })),
          created_at: item.product.created_at,
          updated_at: item.product.updated_at,
          quantity: item.quantity
        }));
        
        console.log('🛒 Converted cart items from backend:', convertedItems);
        console.log('🛒 Backend prices:', convertedItems.map(item => ({ name: item.name, price: item.price })));
        
        // Sincronizar con CartSessionManager
        cartSessionManager.clearCart();
        backendCart.items.forEach((item: any) => {
          cartSessionManager.addToCart(
            item.product,
            item.price,
            item.price > item.product.price ? 'pdf-editable' : 'pdf',
            item.quantity
          );
        });
        
        // Usar los datos del backend para asegurar precios actualizados
        setCartItems(convertedItems);
        
        // Guardar en localStorage como backup
        setLocalStorage('cart', JSON.stringify(convertedItems));
      } else {
        console.log('🛒 Backend cart is empty, clearing local cart');
        setCartItems([]);
        cartSessionManager.clearCart();
        setLocalStorage('cart', JSON.stringify([]));
      }
    } catch (error) {
      console.warn('🛒 Backend sync failed:', error);
      // Si falla la sincronización, intentar cargar desde localStorage como fallback
      const storedCart = getLocalStorage('cart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          console.log('🛒 Loading from localStorage as fallback:', parsedCart);
          setCartItems(parsedCart);
        } catch (parseError) {
          console.error('🛒 Error parsing localStorage cart:', parseError);
          setCartItems([]);
          setLocalStorage('cart', JSON.stringify([]));
        }
      } else {
        setCartItems([]);
        setLocalStorage('cart', JSON.stringify([]));
      }
    }
  }, [isAuthenticated]);

  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Sincronizar con el backend al inicializar o cuando cambie la autenticación
    // Evitar doble ejecución en StrictMode en desarrollo
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    syncCart();
  }, [syncCart]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (process.env.NODE_ENV === 'development') {
      console.log('🛒 Saving cart to localStorage:', cartItems);
    }
    setLocalStorage('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback(async (product: Product) => {
    console.log('🛒 Adding product to cart:', product);
    console.log('🛒 Current cart items before adding:', cartItems);
    
    try {
      // 1. Agregar al CartSessionManager primero
      const sessionItems = cartSessionManager.getItems();
      const existingItem = sessionItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Si ya existe, usar el precio seleccionado
        const { addToCart: addToCartAPI } = await import('@/lib/api-marketplace');
        await addToCartAPI(product.id, 1, existingItem.selectedPrice);
      } else {
        // Si es nuevo, usar el precio del producto
        const { addToCart: addToCartAPI } = await import('@/lib/api-marketplace');
        await addToCartAPI(product.id, 1, product.price);
      }
      
      // 2. Sincronizar completamente con el backend después de agregar
      await syncCart();
      
      console.log('✅ Product added to cart successfully and synced');
    } catch (error) {
      console.error('❌ Error adding product to cart:', error);
      // Si falla la API, mostrar error pero no actualizar el estado local
      // para mantener consistencia con el backend
      throw error;
    }
  }, [cartItems, syncCart]);

  const removeFromCart = useCallback(async (productId: number) => {
    try {
      // 1. Remover del CartSessionManager
      cartSessionManager.removeFromCart(productId);
      
      // 2. Llamar a la API para remover del carrito del backend
      const { removeCartItem } = await import('@/lib/api-marketplace');
      const { getCart } = await import('@/lib/api-marketplace');
      
      // Primero obtener el carrito actual para obtener el cartId y itemId
      const currentCart = await getCart();
      const itemToRemove = currentCart.items.find((item: any) => item.product.id === productId);
      
      if (itemToRemove) {
        await removeCartItem(currentCart.id, itemToRemove.id);
        console.log('🛒 Item removed from backend');
      } else {
        console.log('🛒 Item not found in backend cart');
      }
      
      // 3. Sincronizar completamente con el backend después de remover
      await syncCart();
      
      console.log('✅ Product removed from cart successfully and synced');
    } catch (error) {
      console.error('❌ Error removing product from cart:', error);
      // Si falla la API, no actualizar el estado local para mantener consistencia
      throw error;
    }
  }, [syncCart]);

  const clearCart = useCallback(async () => {
    try {
      // 1. Limpiar CartSessionManager
      cartSessionManager.clearCart();
      
      // 2. Para limpiar el carrito, podemos remover todos los items uno por uno
      const { getCart, removeCartItem } = await import('@/lib/api-marketplace');
      const currentCart = await getCart();
      
      // Remover todos los items del backend
      for (const item of currentCart.items) {
        await removeCartItem(currentCart.id, item.id);
      }
      
      // 3. Sincronizar completamente con el backend después de limpiar
      await syncCart();
      
      console.log('✅ Cart cleared successfully and synced');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      // Si falla la API, no actualizar el estado local para mantener consistencia
      throw error;
    }
  }, [syncCart]);

  return (
    <CartContext.Provider value={{ cartItems, cartCount: cartItems.length, addToCart, removeFromCart, clearCart, setCartItems, syncCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    console.error('🛒 useCart must be used within a CartProvider');
    throw new Error('useCart must be used within a CartProvider');
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 useCart hook called, cartCount:', context.cartCount);
  }
  return context;
} 