"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { getMarketplaceProduct, getImageUrl, addToFavorites } from "@/lib/api-marketplace"
import { MarketplaceProduct } from "@/lib/api-marketplace"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Heart, Home, Bed, Bath, Car, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import LoginModal from "@/components/marketplace/login-modal"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.id)
  const [product, setProduct] = useState<MarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<'view-plans' | 'favorites' | null>(null)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const productData = await getMarketplaceProduct(productId)
        setProduct(productData)
        
        // Verificar si el producto está en favoritos
        if (isAuthenticated) {
          const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
          const isFavorited = favorites.find((f: any) => f.product === productId)
          setIsInFavorites(!!isFavorited)
        }
      } catch (err) {
        setError('Error al cargar el producto')
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId, isAuthenticated])

  // Verificar si el usuario se autenticó recientemente y redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated && loginAction === 'view-plans') {
      // Si el usuario está autenticado y la acción era ver planos, redirigir automáticamente
      console.log('Usuario autenticado, redirigiendo a planos...')
      router.push(`/marketplace/products/${productId}/plans`)
    }
  }, [isAuthenticated, loginAction, productId, router])

  // Verificar si hay un parámetro de redirección en la URL después del login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirectParam = params.get('redirect')
    if (redirectParam && isAuthenticated) {
      console.log('Redirección detectada:', redirectParam)
      router.replace(redirectParam)
    }
  }, [isAuthenticated, router])

  const handleViewPlans = () => {
    console.log('handleViewPlans llamado, isAuthenticated:', isAuthenticated)
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, mostrando modal de login')
      setLoginAction('view-plans')
      setShowLoginModal(true)
    } else {
      console.log('Usuario autenticado, redirigiendo a planos')
      // Redirigir a la página de planos
      router.push(`/marketplace/products/${productId}/plans`)
    }
  }

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      setLoginAction('favorites')
      setShowLoginModal(true)
    } else {
      try {
        await addToFavorites(productId)
        setIsInFavorites(true)
        setShowSuccessMessage(true)
        console.log('Producto agregado a favoritos')
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      } catch (err) {
        console.error('Error adding to favorites:', err)
        alert('Error al agregar a favoritos')
      }
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    setLoginAction(null)
    
    if (loginAction === 'view-plans') {
      // Redirigir directamente a la página de planos
      router.push(`/marketplace/products/${productId}/plans`)
    } else if (loginAction === 'favorites') {
      handleAddToFavorites()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe'}</p>
            <Link href="/marketplace">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Marketplace
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const images = product.images || [product.image || '']
  const currentImage = images[currentImageIndex] || product.image || '/placeholder.svg'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link href="/marketplace" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Marketplace
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(currentImage)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={getImageUrl(image || '')}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-blue-600">${product.price.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{product.area_m2}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
              <div className="text-center">
                <Bed className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                <div className="text-lg font-semibold text-gray-900">{product.rooms}</div>
                <div className="text-sm text-gray-600">Habitaciones</div>
              </div>
              <div className="text-center">
                <Bath className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                <div className="text-lg font-semibold text-gray-900">{product.bathrooms}</div>
                <div className="text-sm text-gray-600">Baños</div>
              </div>
              <div className="text-center">
                <Car className="w-6 h-6 mx-auto mb-1 text-gray-600" />
                <div className="text-lg font-semibold text-gray-900">{product.garage_spaces || 0}</div>
                <div className="text-sm text-gray-600">Garaje</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 break-words overflow-hidden">
                {product.description || 'Sin descripción disponible'}
              </p>
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleViewPlans}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Ver Planos
              </Button>
                             <button 
                 onClick={handleAddToFavorites}
                 className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                   isInFavorites ? 'bg-red-50 border-red-300' : ''
                 }`}
                 title={isInFavorites ? "Ya está en favoritos" : "Agregar a Favoritos"}
               >
                 <Heart 
                   className={`w-5 h-5 transition-colors ${
                     isInFavorites ? 'text-red-600 fill-red-600' : 'text-gray-600'
                   }`} 
                 />
               </button>
            </div>
          </div>
        </div>
             </main>
       <Footer />

       {/* Mensaje de éxito */}
       {showSuccessMessage && (
         <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right">
           <div className="flex items-center space-x-2">
             <div className="w-2 h-2 bg-white rounded-full"></div>
             <span>¡Producto agregado a favoritos!</span>
           </div>
         </div>
       )}

       <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false)
          setLoginAction(null)
        }}
        onSuccess={handleLoginSuccess}
        title="Iniciar Sesión"
        message={
          loginAction === 'view-plans' 
            ? "Necesitas iniciar sesión para ver los planos de este producto"
            : "Necesitas iniciar sesión para agregar productos a favoritos"
        }
      />
    </div>
  )
}