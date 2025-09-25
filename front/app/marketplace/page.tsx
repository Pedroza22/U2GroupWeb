"use client"

import { Suspense, useState, useEffect, useCallback, useMemo } from "react"
import Header from "@/components/layout/header"
import ControlsBar from "@/components/marketplace/controls-bar"
import PlanGrid from "@/components/marketplace/plan-grid"
import FilterSidebar from "@/components/marketplace/filter-sidebar"
import LoadingGrid from "@/components/marketplace/loading-grid"
import { FilterConfig, getFilterConfigs } from "@/lib/api-filters"
import { useRouter } from "next/navigation"
import { Package, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/layout/footer"
import { AuthProvider, useAuth } from "@/hooks/use-auth"

import { 
  getMarketplaceProducts, 
  MarketplaceProduct 
} from "@/lib/api-marketplace"

function MarketplaceContent() {
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [unit, setUnit] = useState<"sqft" | "m2">("m2")
  const [activeView, setActiveView] = useState<"images" | "plans">("images")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([])
  const [sortBy, setSortBy] = useState("trending")

  // Cargar productos del marketplace
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Marketplace - Cargando productos...');
      console.log('🔄 Marketplace - process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('🔄 Marketplace - window.location.href:', window.location.href);
      
      const productData = await getMarketplaceProducts();
      console.log('✅ Marketplace - Productos cargados:', productData);
      console.log('✅ Marketplace - Número de productos:', productData.length);
      console.log('✅ Marketplace - IDs de productos:', productData.map(p => ({ id: p.id, name: p.name })));
      
      // Log detallado de cada producto
      productData.forEach((product, index) => {
        console.log(`📦 Marketplace - Producto ${index + 1}: ${product.name}`);
        console.log(`   - ID: ${product.id}`);
        console.log(`   - Precio: $${product.price}`);
        console.log(`   - Área: ${product.area_m2} m²`);
        console.log(`   - Dormitorios: ${product.rooms}`);
        console.log(`   - Baños: ${product.bathrooms}`);
        console.log(`   - Estilo: ${product.style}`);
        console.log(`   - Imagen principal: ${product.image}`);
        console.log(`   - Imágenes adicionales: ${product.additional_images?.length || 0}`);
        console.log(`   - Activo: ${product.is_active}`);
      });
      
      setProducts(productData);
    } catch (error: any) {
      console.error('❌ Error loading marketplace products:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Aplicar filtros y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    
    console.log('🔍 Filtros aplicados:', filters);
    console.log('🔍 Productos antes de filtrar:', filtered.length);

    // Aplicar filtros
    if (filters.price && filters.price.length > 0) {
      filtered = filtered.filter(product => {
        return filters.price.some((range: string) => {
          if (range === "0-500") return product.price < 500;
          if (range === "500-1000") return product.price >= 500 && product.price <= 1000;
          if (range === "1000-2000") return product.price >= 1000 && product.price <= 2000;
          if (range === "2000+") return product.price > 2000;
          return true;
        });
      });
    }

    if (filters.area && filters.area.length > 0) {
      filtered = filtered.filter(product => {
        const area = unit === "m2" ? product.area_m2 : (product.area_sqft || product.area_m2 * 10.764);
        return filters.area.some((range: string) => {
          if (range === "0-100") return area < 100;
          if (range === "100-200") return area >= 100 && area <= 200;
          if (range === "200+") return area > 200;
          if (range === "0-1076") return area < 1076;
          if (range === "1076-2153") return area >= 1076 && area <= 2153;
          if (range === "2153+") return area > 2153;
          return true;
        });
      });
    }

    if (filters.bedrooms && filters.bedrooms.length > 0) {
      filtered = filtered.filter(product => 
        filters.bedrooms.includes(product.rooms.toString())
      );
    }

    if (filters.bathrooms && filters.bathrooms.length > 0) {
      filtered = filtered.filter(product => 
        filters.bathrooms.includes(product.bathrooms.toString())
      );
    }

    if (filters.garage && filters.garage.length > 0) {
      filtered = filtered.filter(product => 
        filters.garage.includes((product.garage_spaces || 0).toString())
      );
    }

    if (filters.architecturalStyle && filters.architecturalStyle.length > 0) {
      filtered = filtered.filter(product => 
        filters.architecturalStyle.includes(product.style)
      );
    }

    // Aplicar ordenamiento
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price_low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "trending":
      default:
        // Mantener orden original (trending)
        break;
    }

    console.log('🔍 Productos después de filtrar:', filtered.length);
    console.log('🔍 Productos filtrados:', filtered.map(p => ({ id: p.id, name: p.name, price: p.price })));

    return filtered;
  }, [products, filters, sortBy, unit]);

  // Modificar el efecto de scroll para una animación más suave
  useEffect(() => {
    let lastScroll = window.scrollY
    let ticking = false

    const handleScroll = () => {
      const currentScroll = window.scrollY

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScroll > lastScroll && currentScroll > 100) {
            setIsControlsVisible(false)
          } else if (currentScroll < lastScroll || currentScroll <= 100) {
            setIsControlsVisible(true)
          }
          lastScroll = currentScroll
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cargar configuraciones de filtros
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Temporalmente comentado hasta que se implemente la API de filtros
        // const configData = await getFilterConfigs();
        // setFilterConfigs(configData);
        setFilterConfigs([]);
      } catch (error) {
        console.error('Error fetching filter configs:', error);
        setFilterConfigs([]);
      }
    };
    fetchConfigs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentPage="marketplace" showMarketplaceElements={true} />

      <main className="flex-1 container mx-auto px-4 pt-2 pb-24">
        <div className={`sticky top-0 bg-white/80 backdrop-blur-sm z-20 -mx-4 px-4 transition-all duration-300 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-4">
              <ControlsBar
                isSticky={!isControlsVisible}
                activeView={activeView}
                setActiveView={setActiveView}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>
          </div>
        </div>

        <div className="py-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="animate-pulse">Cargando...</span>
            ) : (
              <>{(filteredAndSortedProducts?.length ?? 0).toLocaleString()} planes</>
            )}
          </h1>
        </div>

        <div className="flex gap-6 mt-4 min-h-[calc(100vh-24rem)]">
          <div className="flex-1">
            <Suspense fallback={<LoadingGrid />}>
              {loading ? (
                <LoadingGrid />
              ) : (
                <PlanGrid 
                  products={filteredAndSortedProducts} 
                  unit={unit} 
                  filters={filters} 
                  sortBy={sortBy}
                  onProductClick={(id) => router.push(`/marketplace/products/${id}`)}
                />
              )}
            </Suspense>
          </div>
          <div className="flex items-start">
            <FilterSidebar 
              unit={unit} 
              setUnit={setUnit}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <AuthProvider>
      <MarketplaceContent />
    </AuthProvider>
  )
}
