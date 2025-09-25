'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getProductFavorites, removeFromFavorites, addToCart, formatPrice, getImageUrl, ProductFavorite, getMarketplaceProducts } from '@/lib/api-marketplace';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<ProductFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('🖤 Loading favorites...');
      const favoritesData = await getProductFavorites();
      console.log('🖤 Favorites data:', favoritesData);
      
      // Si los datos vienen de localStorage, necesitamos obtener la información completa del producto
      if (favoritesData.length > 0 && typeof favoritesData[0].product === 'number') {
        console.log('🖤 Detected localStorage format, fetching product details...');
        
        // Obtener todos los productos para mapear los IDs
        const allProducts = await getMarketplaceProducts();
        
        // Convertir el formato de localStorage al formato esperado
        const convertedFavorites = favoritesData.map((fav: any) => {
          const product = allProducts.find(p => p.id === fav.product);
          return {
            id: fav.id,
            user: fav.user,
            product: product || {
              id: fav.product,
              name: `Producto ${fav.product}`,
              description: '',
              category: '',
              style: '',
              price: 0,
              area_m2: 0,
              rooms: 0,
              bathrooms: 0,
              floors: 0,
              image: '',
              features: [],
              is_featured: false,
              is_active: true,
              created_at: fav.created_at,
              updated_at: fav.created_at
            },
            created_at: fav.created_at
          };
        });
        
        console.log('🖤 Converted favorites:', convertedFavorites);
        setFavorites(convertedFavorites);
      } else {
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      await removeFromFavorites(favoriteId);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId);
      alert('Producto agregado al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso requerido
          </h2>
          <p className="text-gray-600">
            Debes iniciar sesión para ver tus favoritos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage="marketplace" />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando favoritos...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes favoritos aún
              </h3>
              <p className="text-gray-600 mb-6">
                Agrega productos a tus favoritos para verlos aquí.
              </p>
              <a
                href="/marketplace"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar productos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(favorite.product.image || '')}
                      alt={favorite.product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {favorite.product.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Categoría:</span>
                        <span className="font-medium">{favorite.product.category}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Estilo:</span>
                        <span className="font-medium">{favorite.product.style}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Área:</span>
                        <span className="font-medium">{favorite.product.area_m2} m²</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Habitaciones:</span>
                        <span className="font-medium">{favorite.product.rooms}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(favorite.product.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(favorite.product.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 