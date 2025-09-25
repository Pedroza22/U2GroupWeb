"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getMarketplaceProducts, createMarketplaceProduct, updateMarketplaceProduct, deleteMarketplaceProduct, MarketplaceProduct } from "@/lib/api-marketplace";
import MarketplacePlanEditor from "./marketplace-plan-editor";



interface MarketplaceEditorProps {
  products?: MarketplaceProduct[]
  onRefresh?: () => void
}

export default function MarketplaceEditor({ products: initialProducts, onRefresh }: MarketplaceEditorProps) {
  // Estado para productos/planos
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  // Cargar productos desde la API
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Cargando productos del marketplace...');
      const data = await getMarketplaceProducts();
      console.log('Productos cargados:', data);
      setProducts(data);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('Error al cargar productos. Verifica que el servidor esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setIsLoading(false);
    } else {
      // Solo ejecutar en el cliente si no tenemos productos iniciales
      if (typeof window !== 'undefined') {
        loadProducts();
      }
    }
  }, [initialProducts]);

  // Crear producto
  const handleSaveProduct = async (product: MarketplaceProduct | FormData) => {
    try {
      console.log('Guardando producto:', product);
      console.log('Producto seleccionado:', selectedProduct);
      
      if (product instanceof FormData) {
        // Si es FormData, verificar si es actualización o creación
        if (selectedProduct && selectedProduct.id) {
          console.log('Actualizando producto existente con FormData:', selectedProduct.id);
          await updateMarketplaceProduct(selectedProduct.id, product);
        } else {
          console.log('Creando nuevo producto con FormData');
          await createMarketplaceProduct(product);
        }
      } else if (product.id) {
        console.log('Actualizando producto existente con JSON:', product.id);
        await updateMarketplaceProduct(product.id, product);
      } else {
        console.log('Creando nuevo producto con JSON');
        await createMarketplaceProduct(product);
      }
      
      setShowDetailView(false);
      setSelectedProduct(null);
      await loadProducts();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error guardando producto:', err);
      setError('Error al guardar el producto.');
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este producto/plano?")) {
      try {
        await deleteMarketplaceProduct(id);
        setShowDetailView(false);
        setSelectedProduct(null);
        await loadProducts();
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Error eliminando producto:', err);
        setError('Error al eliminar el producto.');
      }
    }
  };

  // Abrir vista detallada
  const handleViewProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setShowDetailView(true);
  };

  // Crear nuevo producto
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setShowDetailView(true);
  };

  // Cerrar vista detallada
  const handleCloseDetail = () => {
    setShowDetailView(false);
    setSelectedProduct(null);
  };

  const categoryLabels = {
    residential: "Residencial",
    commercial: "Comercial",
    industrial: "Industrial",
    specialized: "Especializado"
  }

  const styleLabels = {
    modern: "Moderno",
    contemporary: "Contemporáneo",
    traditional: "Tradicional",
    minimalist: "Minimalista",
    industrial: "Industrial"
  }

  // Si estamos en vista detallada, mostrar el componente de detalle
  if (showDetailView) {
    return (
      <MarketplacePlanEditor
        product={selectedProduct || undefined}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        onClose={handleCloseDetail}
        isEditing={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
          <Button onClick={loadProducts} size="sm" className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {/* Header con botón de crear */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productos/Planos del Marketplace</h2>
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar nuevo plano
        </Button>
      </div>

      {/* Lista de productos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay productos/planos registrados</p>
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer plano
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={product.image || "/placeholder.svg"} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewProduct(product)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {product.is_featured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Destacado
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price.toLocaleString()}
                    </span>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {styleLabels[product.style as keyof typeof styleLabels] || product.style}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                    <div>
                      <div className="font-bold">{product.area_m2}</div>
                      <div className="text-gray-600">m²</div>
                    </div>
                    <div>
                      <div className="font-bold">{product.rooms}</div>
                      <div className="text-gray-600">Habs</div>
                    </div>
                    <div>
                      <div className="font-bold">{product.bathrooms}</div>
                      <div className="text-gray-600">Baños</div>
                    </div>
                    <div>
                      <div className="font-bold">{product.floors}</div>
                      <div className="text-gray-600">Pisos</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProduct(product)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProduct(product)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 