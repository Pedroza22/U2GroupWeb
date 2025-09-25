'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { FavoritesProvider } from '@/context/favorites-context';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </AuthProvider>
  );
} 