"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getLocalStorage } from "@/lib/utils";

export function CartDebug() {
  const { cartItems, cartCount, syncCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      console.log('🛒 Manual sync triggered');
      await syncCart();
      
      // Obtener información de debug
      const token = getLocalStorage('token');
      const localStorageCart = getLocalStorage('cart');
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        token: token ? 'Present' : 'Missing',
        localStorageCart: localStorageCart ? JSON.parse(localStorageCart) : null,
        cartItems,
        cartCount
      });
      
      console.log('🛒 Manual sync completed');
    } catch (error) {
      console.error('🛒 Manual sync failed:', error);
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setIsLoading(true);
    try {
      const { getCart } = await import('@/lib/api-marketplace');
      const cart = await getCart();
      setDebugInfo({
        apiResponse: cart,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('🛒 API test failed:', error);
      setDebugInfo({
        apiError: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">🛒 Cart Debug Panel</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Cart Items:</strong> {cartCount}</p>
        <p><strong>Items:</strong> {cartItems?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'None'}</p>
      </div>
      
      <div className="space-x-2 mb-4">
        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? 'Syncing...' : '🔄 Sync Cart'}
        </Button>
        
        <Button 
          onClick={handleTestAPI} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? 'Testing...' : '🧪 Test API'}
        </Button>
      </div>
      
      {debugInfo && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
