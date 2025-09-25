import React from 'react';

/**
 * CartSessionManager - Singleton para manejar la sesión del carrito
 * Mantiene el estado del carrito, precios seleccionados y sesión del usuario
 */

export interface CartSessionItem {
  productId: number;
  name: string;
  description: string;
  price: number;
  selectedPrice: number; // Precio seleccionado (PDF o PDF+Editable)
  planType: 'pdf' | 'pdf-editable';
  quantity: number;
  image?: string;
  area_m2: number;
  area_sqft?: number;
  bedrooms: number;
  bathrooms: number;
  garage?: number;
  created_at: string;
  updated_at: string;
}

export interface CartSession {
  id: string;
  userId?: number;
  items: CartSessionItem[];
  total: number;
  currency: string;
  lastUpdated: string;
  isActive: boolean;
}

class CartSessionManager {
  private static instance: CartSessionManager;
  private session: CartSession;
  private listeners: ((session: CartSession) => void)[] = [];

  private constructor() {
    this.session = this.loadFromStorage();
    this.setupStorageListener();
  }

  public static getInstance(): CartSessionManager {
    if (!CartSessionManager.instance) {
      CartSessionManager.instance = new CartSessionManager();
    }
    return CartSessionManager.instance;
  }

  /**
   * Agregar producto al carrito con precio seleccionado
   */
  public addToCart(
    product: any,
    selectedPrice: number,
    planType: 'pdf' | 'pdf-editable' = 'pdf',
    quantity: number = 1
  ): void {
    console.log('🛒 CartSessionManager.addToCart:', {
      productId: product.id,
      selectedPrice,
      planType,
      quantity
    });

    const existingItemIndex = this.session.items.findIndex(
      item => item.productId === product.id && item.planType === planType
    );

    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      this.session.items[existingItemIndex].quantity += quantity;
      this.session.items[existingItemIndex].updated_at = new Date().toISOString();
    } else {
      // Agregar nuevo item
      const newItem: CartSessionItem = {
        productId: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        selectedPrice,
        planType,
        quantity,
        image: product.image,
        area_m2: product.area_m2,
        area_sqft: product.area_sqft || product.area_m2 * 10.764,
        bedrooms: product.rooms,
        bathrooms: product.bathrooms,
        garage: product.garage_spaces || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.session.items.push(newItem);
    }

    this.updateTotal();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Remover producto del carrito
   */
  public removeFromCart(productId: number, planType?: 'pdf' | 'pdf-editable'): void {
    console.log('🛒 CartSessionManager.removeFromCart:', { productId, planType });

    if (planType) {
      this.session.items = this.session.items.filter(
        item => !(item.productId === productId && item.planType === planType)
      );
    } else {
      this.session.items = this.session.items.filter(item => item.productId !== productId);
    }

    this.updateTotal();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Actualizar cantidad de un producto
   */
  public updateQuantity(productId: number, quantity: number, planType?: 'pdf' | 'pdf-editable'): void {
    console.log('🛒 CartSessionManager.updateQuantity:', { productId, quantity, planType });

    const item = this.session.items.find(
      item => item.productId === productId && (!planType || item.planType === planType)
    );

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId, planType);
      } else {
        item.quantity = quantity;
        item.updated_at = new Date().toISOString();
        this.updateTotal();
        this.saveToStorage();
        this.notifyListeners();
      }
    }
  }

  /**
   * Limpiar carrito
   */
  public clearCart(): void {
    console.log('🛒 CartSessionManager.clearCart');
    this.session.items = [];
    this.updateTotal();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Obtener sesión actual
   */
  public getSession(): CartSession {
    return { ...this.session };
  }

  /**
   * Obtener items del carrito
   */
  public getItems(): CartSessionItem[] {
    return [...this.session.items];
  }

  /**
   * Obtener total del carrito
   */
  public getTotal(): number {
    return this.session.total;
  }

  /**
   * Verificar si el carrito está vacío
   */
  public isEmpty(): boolean {
    return this.session.items.length === 0;
  }

  /**
   * Obtener cantidad de items
   */
  public getItemCount(): number {
    return this.session.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Establecer usuario
   */
  public setUser(userId: number): void {
    this.session.userId = userId;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Establecer moneda
   */
  public setCurrency(currency: string): void {
    this.session.currency = currency;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Suscribirse a cambios
   */
  public subscribe(listener: (session: CartSession) => void): () => void {
    this.listeners.push(listener);
    // Devolver función para desuscribirse
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Sincronizar con backend
   */
  public async syncWithBackend(): Promise<void> {
    try {
      console.log('🔄 CartSessionManager.syncWithBackend');
      
      // Aquí puedes implementar la sincronización con el backend
      // Por ahora, solo actualizamos el timestamp
      this.session.lastUpdated = new Date().toISOString();
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('❌ Error syncing with backend:', error);
    }
  }

  /**
   * Actualizar total del carrito
   */
  private updateTotal(): void {
    this.session.total = this.session.items.reduce(
      (total, item) => total + (item.selectedPrice * item.quantity),
      0
    );
    this.session.lastUpdated = new Date().toISOString();
  }

  /**
   * Guardar en localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartSession', JSON.stringify(this.session));
    }
  }

  /**
   * Cargar desde localStorage
   */
  private loadFromStorage(): CartSession {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cartSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
            isActive: true
          };
        }
      } catch (error) {
        console.error('❌ Error loading cart session from storage:', error);
      }
    }

    // Sesión por defecto
    return {
      id: `cart_${Date.now()}`,
      items: [],
      total: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      isActive: true
    };
  }

  /**
   * Configurar listener para cambios en localStorage
   */
  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'cartSession') {
          this.session = this.loadFromStorage();
          this.notifyListeners();
        }
      });
    }
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.session });
      } catch (error) {
        console.error('❌ Error in cart session listener:', error);
      }
    });
  }
}

// Exportar instancia singleton
export const cartSessionManager = CartSessionManager.getInstance();

// Hook para usar en componentes React
export const useCartSession = () => {
  const [session, setSession] = React.useState<CartSession>(cartSessionManager.getSession());

  React.useEffect(() => {
    const unsubscribe = cartSessionManager.subscribe(setSession);
    return unsubscribe;
  }, []);

  return {
    session,
    addToCart: cartSessionManager.addToCart.bind(cartSessionManager),
    removeFromCart: cartSessionManager.removeFromCart.bind(cartSessionManager),
    updateQuantity: cartSessionManager.updateQuantity.bind(cartSessionManager),
    clearCart: cartSessionManager.clearCart.bind(cartSessionManager),
    syncWithBackend: cartSessionManager.syncWithBackend.bind(cartSessionManager),
    setUser: cartSessionManager.setUser.bind(cartSessionManager),
    setCurrency: cartSessionManager.setCurrency.bind(cartSessionManager)
  };
};


