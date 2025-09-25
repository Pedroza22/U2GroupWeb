"use client"

import Image from "next/image"
import { MarketplaceProduct, getImageUrl } from "@/lib/api-marketplace"

interface PlanGridProps {
  products: MarketplaceProduct[];
  unit: "sqft" | "m2";
  filters: Record<string, any>;
  sortBy: string;
  onProductClick: (id: number) => void;
}

export default function PlanGrid({
  products,
  unit,
  filters,
  sortBy,
  onProductClick
}: PlanGridProps) {
  // Debug: verificar productos y sus IDs
  console.log('🔍 PlanGrid - Productos recibidos:', products);
  console.log('🔍 PlanGrid - IDs de productos:', products.map(p => ({ id: p.id, name: p.name })));
  
  // Verificar si hay IDs duplicados
  const ids = products.map(p => p.id);
  const uniqueIds = [...new Set(ids)];
  if (ids.length !== uniqueIds.length) {
    console.warn('⚠️ PlanGrid - IDs duplicados detectados:', ids);
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id || `product-${index}`}
          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProductClick(product.id)}
        >
          <div className="relative aspect-square">
            <Image
              src={getImageUrl(product.image || '', product.additional_images?.map(img => img.image))}
              alt={`Imagen de ${product.name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.warn('🖼️ Error cargando imagen para producto:', product.name, {
                  mainImage: product.image,
                  additionalImages: product.additional_images
                });
                // Fallback a placeholder si la imagen falla
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-product.svg';
              }}
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-blue-600">
                ${(product.price || 0).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">{unit === "m2" ? product.area_m2 : (product.area_sqft || 0)}</p>
                <p className="text-xs">{unit === "m2" ? "m²" : "sq.ft"}</p>
              </div>
              <div>
                <p className="font-medium">{product.rooms}</p>
                <p className="text-xs">Bed</p>
              </div>
              <div>
                <p className="font-medium">{product.bathrooms}</p>
                <p className="text-xs">Bath</p>
              </div>
              <div>
                <p className="font-medium">{product.garage_spaces || 0}</p>
                <p className="text-xs">Cars</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
