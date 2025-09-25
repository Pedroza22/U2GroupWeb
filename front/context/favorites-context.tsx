"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MarketplaceProduct } from '@/lib/api-marketplace';

interface FavoritesContextType {
  favorites: MarketplaceProduct[];
  favoritesCount: number;
  addToFavorites: (product: MarketplaceProduct) => void;
  removeFromFavorites: (productId: number) => void;
  clearFavorites: () => void;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<MarketplaceProduct[]>([]);

  useEffect(() => {
    // Load favorites from localStorage on initial render
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        // Verificar que los datos son válidos
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites);
        } else {
          // Si los datos no son válidos, limpiar
          localStorage.removeItem('favorites');
          setFavorites([]);
        }
      }
    } catch (error) {
      // Si hay error al parsear, limpiar
      localStorage.removeItem('favorites');
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    // Save favorites to localStorage whenever it changes
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (product: MarketplaceProduct) => {
    setFavorites(prevFavorites => {
      const itemExists = prevFavorites.find(item => item.id === product.id);
      if (itemExists) {
        return prevFavorites;
      }
      return [...prevFavorites, product];
    });
  };

  const removeFromFavorites = (productId: number) => {
    setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== productId));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const isFavorite = (productId: number) => {
    return favorites.some(item => item.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      favoritesCount: favorites.length, 
      addToFavorites, 
      removeFromFavorites, 
      clearFavorites,
      isFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
