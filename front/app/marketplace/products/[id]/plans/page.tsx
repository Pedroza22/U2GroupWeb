"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Car,
  Bed,
  Bath,
  Square,
  Heart,
  User,
  ShoppingCart,
  Camera,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  X,
  ArrowLeft,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getMarketplaceProduct, getImageUrl, addToFavorites } from "@/lib/api-marketplace"
import { MarketplaceProduct } from "@/lib/api-marketplace"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/context/cart-context"
import { addToCart as addToCartAPI, getCart } from "@/lib/api-marketplace"
import { cartSessionManager } from "@/lib/cart-session-manager"
import LoginModal from "@/components/marketplace/login-modal"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/hooks/use-language"

export default function ProductPlansPage() {
  const params = useParams()
  const router = useRouter()
  const productId = Number(params.id)
  const [product, setProduct] = useState<MarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedPlanSet, setSelectedPlanSet] = useState("pdf")
  const [selectedUnit, setSelectedUnit] = useState("sqft")
  const [isHeartFilled, setIsHeartFilled] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginAction, setLoginAction] = useState<'cart' | 'favorites' | 'view_plan' | null>(null)
  const [activeSection, setActiveSection] = useState('planInfo')
  const { isAuthenticated, user } = useAuth()
  const { addToCart, cartCount, cartItems, setCartItems } = useCart()
  const { t } = useLanguage()
  
  // Estado para el contador de favoritos
  const [favoritesCount, setFavoritesCount] = useState(0)

  // Estados para los modales
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPriceMatchModal, setShowPriceMatchModal] = useState(false)
  const [showImprovePlanModal, setShowImprovePlanModal] = useState(false)
  const [priceMatchForm, setPriceMatchForm] = useState({ url: '', email: '' })
  const [improvePlanForm, setImprovePlanForm] = useState({ email: '', modifications: '' })

  // Refs for scrolling to sections
  const planInfoRef = useRef<HTMLDivElement>(null)
  const floorPlanRef = useRef<HTMLDivElement>(null)
  const planDetailsRef = useRef<HTMLDivElement>(null)
  const whatsIncludedRef = useRef<HTMLDivElement>(null)
  const whatsNotIncludedRef = useRef<HTMLDivElement>(null)
  const relatedPlansRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Verificar autenticación antes de cargar el producto
    if (!isAuthenticated) {
      setShowLoginModal(true)
      setLoginAction('view_plan')
      return
    }

    const loadProduct = async () => {
      try {
        setLoading(true)
        const productData = await getMarketplaceProduct(productId)
        setProduct(productData)
        
        // Verificar si el producto ya está en favoritos
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isAlreadyFavorite = favorites.find((f: any) => f.product === productId);
        setIsHeartFilled(!!isAlreadyFavorite);
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

  // Actualizar contador de favoritos
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoritesCount(favorites.length);
  }, [favoritesCount]) // Agregar dependencia para que se actualice cuando cambie

  // Intersection Observer para detectar cuando mostrar el popup y actualizar sección activa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === planDetailsRef.current) {
            setShowPopup(entry.isIntersecting)
          }
          
          // Actualizar sección activa basada en qué sección está visible
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')
            if (sectionId) {
              setActiveSection(sectionId)
            }
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px -100px 0px",
      },
    )

    // Observar todas las secciones
    const sections = [
      { ref: planInfoRef, id: 'planInfo' },
      { ref: floorPlanRef, id: 'floorPlan' },
      { ref: planDetailsRef, id: 'planDetails' },
      { ref: whatsIncludedRef, id: 'whatsIncluded' },
      { ref: whatsNotIncludedRef, id: 'whatsNotIncluded' }
    ]

    sections.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', id)
        observer.observe(ref.current)
      }
    })

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  const handleAddToCart = async () => {
    console.log('🛒 handleAddToCart called');
    console.log('🛒 isAuthenticated:', isAuthenticated);
    console.log('🛒 product:', product);
    
    if (!isAuthenticated) {
      console.log('🛒 User not authenticated, showing login modal');
      setLoginAction('cart')
      setShowLoginModal(true)
      return
    }
    
    if (!product) {
      console.log('🛒 No product available');
      setSuccessMessage('No hay producto disponible para agregar al carrito.')
      setShowSuccessModal(true)
      return
    }
    
    try {
      console.log('🛒 Adding to cart session...');
      
      // 1. Agregar al CartSessionManager (Singleton)
      const selectedPrice = getPlanSetPrice();
      const planType = selectedPlanSet as 'pdf' | 'editable';
      
      cartSessionManager.addToCart(product, selectedPrice, planType, 1);
      console.log('🛒 Successfully added to cart session with price:', selectedPrice);
      
      // 2. Agregar al backend con el precio seleccionado
      await addToCartAPI(product.id, 1, selectedPrice);
      console.log('🛒 Successfully added to backend with price:', selectedPrice);
      
      // 3. Sincronizar con el contexto del carrito
      const cartProduct = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        area_m2: product.area_m2,
        area_sqft: product.area_sqft || product.area_m2 * 10.764,
        bedrooms: product.rooms,
        bathrooms: product.bathrooms,
        garage: product.garage_spaces || 0,
        price: selectedPrice,
        architectural_style: product.style || 'Modern',
        main_image: product.image || '',
        images: (product.images || []).map((image, index) => ({
          id: index,
          image: image,
          order: index
        })),
        created_at: product.created_at,
        updated_at: product.updated_at,
        quantity: 1
      };
      
      addToCart(cartProduct);
      console.log('🛒 Added to local cart context');
      
      setSuccessMessage('¡Producto agregado al carrito!')
      setShowSuccessModal(true)
      
    } catch (error) {
      console.error('🛒 Error in handleAddToCart:', error);
      setSuccessMessage('Error al agregar al carrito. Inténtalo de nuevo.')
      setShowSuccessModal(true)
    }
  }

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      setLoginAction('favorites')
      setShowLoginModal(true)
    } else {
      try {
        console.log('🖤 Adding product to favorites:', productId);
        
        // Verificar si ya está en favoritos
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const isAlreadyFavorite = favorites.find((f: any) => f.product === productId);
        
        if (isAlreadyFavorite) {
          setSuccessMessage('Este producto ya está en tus favoritos')
          setIsHeartFilled(true)
        } else {
          await addToFavorites(productId)
          setIsHeartFilled(true)
          setSuccessMessage('Producto agregado a favoritos')
          // Actualizar contador de favoritos
          setFavoritesCount(favorites.length + 1)
        }
        
        setShowSuccessModal(true)
      } catch (err) {
        console.error('🖤 Error adding to favorites:', err)
        setSuccessMessage('Error al agregar a favoritos. Inténtalo de nuevo.')
        setShowSuccessModal(true)
      }
    }
  }

  const handleLoginSuccess = () => {
    if (loginAction === 'cart') {
      handleAddToCart()
    } else if (loginAction === 'favorites') {
      handleAddToFavorites()
    } else if (loginAction === 'view_plan') {
      // Recargar la página para mostrar el producto después del login
      window.location.reload()
    }
  }

  const handlePriceMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Price match request:', priceMatchForm)
    
    try {
      const response = await fetch('/api/admin/send-contact-message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Cliente',
          last_name: 'Marketplace',
          email: priceMatchForm.email,
          phone: '',
          project_location: '',
          timeline: '',
          message: `Solicitud de igualación de precio para el producto "${product?.name}" (ID: ${product?.id})

URL del competidor: ${priceMatchForm.url}
Email del cliente: ${priceMatchForm.email}

Mensaje: ¿Viste este diseño en otro sitio? Si encontraste un proyecto parecido y más económico, déjanos el enlace. Te damos un descuento especial.`
        }),
      })

      if (response.ok) {
        setSuccessMessage('Solicitud de igualación de precio enviada exitosamente. Te contactaremos pronto.')
        setShowSuccessModal(true)
      } else {
        throw new Error('Error al enviar la solicitud')
      }
    } catch (error) {
      console.error('Error sending price match request:', error)
      setSuccessMessage('Error al enviar la solicitud. Por favor, intenta nuevamente.')
      setShowSuccessModal(true)
    }
    
    setShowPriceMatchModal(false)
    setPriceMatchForm({ url: '', email: '' })
  }

  const handleImprovePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Improve plan request:', improvePlanForm)
    
    try {
      const response = await fetch('/api/admin/send-contact-message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: 'Cliente',
          last_name: 'Marketplace',
          email: improvePlanForm.email,
          phone: '',
          project_location: '',
          timeline: '',
          message: `Solicitud de mejora de plan para el producto "${product?.name}" (ID: ${product?.id})

Email del cliente: ${improvePlanForm.email}
Modificaciones solicitadas: ${improvePlanForm.modifications}

Mensaje: Cuéntanos qué cambios necesitas y en máximo 3 días hábiles te enviamos una cotización personalizada, sin costo.`
        }),
      })

      if (response.ok) {
        setSuccessMessage('Solicitud de mejora de plan enviada exitosamente. Te contactaremos en máximo 3 días hábiles.')
        setShowSuccessModal(true)
      } else {
        throw new Error('Error al enviar la solicitud')
      }
    } catch (error) {
      console.error('Error sending improve plan request:', error)
      setSuccessMessage('Error al enviar la solicitud. Por favor, intenta nuevamente.')
      setShowSuccessModal(true)
    }
    
    setShowImprovePlanModal(false)
    setImprovePlanForm({ email: '', modifications: '' })
  }

  const nextImage = () => {
    if (!product) return
    const images = product.images || [product.image || '']
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (!product) return
    const images = product.images || [product.image || '']
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, sectionName: string) => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
    setActiveSection(sectionName)
  }

  const getPlanSetPrice = () => {
    if (selectedPlanSet === "pdf") {
      return product.price;
    } else if (selectedPlanSet === "editable") {
      return Math.round(product.price * 1.5);
    }
    return product.price;
  };

  // Conversion functions
  const convertArea = (sqft: number) => {
    return selectedUnit === "sqft" ? sqft : Math.round(sqft * 0.092903)
  }

  const convertLinear = (feet: number) => {
    return selectedUnit === "sqft" ? feet : Math.round(feet * 0.3048 * 100) / 100
  }

  const getUnitLabel = () => {
    return selectedUnit === "sqft" ? "sq. ft." : "m²"
  }

  const getLinearUnitLabel = () => {
    return selectedUnit === "sqft" ? "'" : "m"
  }

  // Mostrar loading mientras se verifica autenticación o carga el producto
  if (loading || (!isAuthenticated && !showLoginModal)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
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
      {/* Header principal con elementos del marketplace */}
      <Header 
        showMarketplaceElements={true}
        onAddToCart={handleAddToCart}
        onAddToFavorites={handleAddToFavorites}
        favoritesCount={favoritesCount}
        cartCount={cartCount}
      />

      {/* Popup de Add to Cart con opción de unidades */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-gray-900">Quick Purchase</h4>
              <button onClick={() => setShowPopup(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-[#0D00FF] mb-1">Starting at</p>
              <p className="text-3xl font-bold text-[#0D00FF]">${getPlanSetPrice()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 font-medium text-gray-900">Plan Set</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-900 font-medium justify-between"
                    >
                      {selectedPlanSet === "pdf" ? `PDF - $${product.price.toLocaleString()}` : `Archivo Editable - $${Math.round(product.price * 1.5).toLocaleString()}`}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                    <DropdownMenuItem
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                      onSelect={() => setSelectedPlanSet("pdf")}
                    >
                      PDF - ${product.price.toLocaleString()}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                      onSelect={() => setSelectedPlanSet("editable")}
                    >
                      Archivo Editable - ${Math.round(product.price * 1.5).toLocaleString()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-sm mt-3 text-[#0D00FF] font-medium">
                  Plan seleccionado: {selectedPlanSet === "pdf" ? "PDF" : "Archivo Editable"} - ${getPlanSetPrice()}
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 font-medium text-gray-900">Options</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-900 font-medium justify-between"
                    >
                      {selectedUnit === "sqft" ? "sq.ft" : "m²"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                    <DropdownMenuItem
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                      onSelect={() => setSelectedUnit("sqft")}
                    >
                      sq.ft
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                      onSelect={() => setSelectedUnit("m2")}
                    >
                      m²
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button 
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 text-base rounded-xl border-0 shadow-lg"
              >
                Add to Cart
              </Button>
              
              {/* Botón de debug */}
                          <Button 
              onClick={() => {
                console.log('🛒 Debug - cartItems:', cartItems);
                console.log('🛒 Debug - cartCount:', cartCount);
                console.log('🛒 Debug - product:', product);
                console.log('🛒 Debug - localStorage cart:', localStorage.getItem('cart'));
                alert(`cartItems: ${JSON.stringify(cartItems)}\ncartCount: ${cartCount}\nproduct: ${JSON.stringify(product)}\nlocalStorage: ${localStorage.getItem('cart')}`);
              }}
              variant="outline"
              className="w-full mt-2"
            >
              Debug Cart
            </Button>

              <Button
                onClick={() => setShowPriceMatchModal(true)}
                variant="outline"
                className="w-full border-2 border-gray-400 text-gray-900 hover:bg-gray-200 bg-transparent font-semibold py-3 rounded-xl backdrop-blur-sm"
              >
                ¿Viste este diseño en otro sitio?
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl">
              <h4 className="font-bold mb-2 text-lg text-gray-900">Mejora este plan</h4>
              <p className="text-sm mb-4 text-gray-700">
                Cuéntanos qué cambios necesitas y en máximo 3 días hábiles te enviamos una cotización personalizada, sin costo.
              </p>
              <Button
                onClick={() => setShowImprovePlanModal(true)}
                variant="outline"
                className="border-2 border-gray-400 text-gray-900 hover:bg-gray-200 bg-transparent font-semibold py-2 px-4 rounded-xl backdrop-blur-sm"
              >
                Mejora este plan
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Image Section */}
        <div className="relative mb-6">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <Image 
              src={getImageUrl(currentImage)} 
              alt={product.name} 
              fill 
              className="object-cover" 
            />
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="absolute right-4 top-4 space-y-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={`w-20 h-12 rounded border-2 overflow-hidden cursor-pointer ${
                  index === currentImageIndex ? "border-blue-500" : "border-white"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={getImageUrl(image || '')}
                  alt={`Thumbnail ${index + 1}`}
                  width={80}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded text-sm">{images.length} Images</div>
        </div>

        {/* Navegación interna del producto */}
        <div className="mb-6">
          <nav className="flex flex-wrap gap-4">
            <button 
              onClick={() => scrollToSection(planInfoRef, 'planInfo')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'planInfo' 
                  ? 'bg-[#0D00FF] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {product.name}
            </button>
            <button 
              onClick={() => scrollToSection(floorPlanRef, 'floorPlan')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'floorPlan' 
                  ? 'bg-[#0D00FF] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Floor Plans
            </button>
            <button 
              onClick={() => scrollToSection(planDetailsRef, 'planDetails')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'planDetails' 
                  ? 'bg-[#0D00FF] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Plan Detail
            </button>
            <button 
              onClick={() => scrollToSection(whatsIncludedRef, 'whatsIncluded')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'whatsIncluded' 
                  ? 'bg-[#0D00FF] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              What's Included
            </button>
            <button 
              onClick={() => scrollToSection(whatsNotIncludedRef, 'whatsNotIncluded')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'whatsNotIncluded' 
                  ? 'bg-[#0D00FF] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              What's not included
            </button>
          </nav>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8 overflow-hidden">
            {/* Plan Info */}
            <div ref={planInfoRef}>
              <p className="text-sm text-gray-600 mb-2">commercial</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{convertArea(product.area_m2)}</span>
                  <span className="text-gray-600">{getUnitLabel()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{product.rooms}</span>
                  <span className="text-gray-600">bedrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{product.bathrooms}</span>
                  <span className="text-gray-600">bathrooms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">1</span>
                  <span className="text-gray-600">story</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold">{product.garage_spaces || 0}</span>
                  <span className="text-gray-600">garage</span>
                </div>
              </div>
            </div>

            

            {/* Floor Plans - imágenes sin recuadro */}
            <div ref={floorPlanRef} className="space-y-6">
              <h3 className="text-lg font-semibold">Main Level</h3>
              <div className="w-full">
                <Image
                  src={getImageUrl(currentImage)}
                  alt="Main level floor plan"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Plan Details */}
            <div ref={planDetailsRef} className="space-y-6">
              <h3 className="text-xl font-bold">Plan Details</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed break-words overflow-hidden">
                  {product.description || 'This modern residential design features an open-concept layout with optimal space utilization. The plan includes well-proportioned rooms, efficient traffic flow, and contemporary architectural elements that create a comfortable and functional living environment.'}
                </p>
              </div>
            </div>

            {/* What's Included Section */}
            <div ref={whatsIncludedRef} className="space-y-6">
              <h4 className="font-semibold text-xl">What's Included</h4>
              <ul className="space-y-1 text-sm">
                <li>• Complete architectural design</li>
                <li>• Detailed construction plans</li>
                <li>• Electrical and plumbing layouts</li>
                <li>• Structural engineering drawings</li>
                <li>• Material specifications</li>
                <li>• Building permit documentation</li>
              </ul>
            </div>

            {/* What's Not Included Section */}
            <div ref={whatsNotIncludedRef} className="space-y-6">
              <h4 className="font-semibold text-xl">What's Not Included</h4>
              <ul className="space-y-1 text-sm">
                <li>• Physical construction work</li>
                <li>• Construction materials</li>
                <li>• Labor and equipment</li>
                <li>• Site preparation and excavation</li>
                <li>• Foundation and structural work</li>
                <li>• Building permits and fees</li>
              </ul>
            </div>
          </div>

          {/* Right Column - ESTÁTICO SIN STICKY */}
          <div className="lg:col-span-1">
            {/* Contenido con glassmorphism - SIN STICKY */}
            <div className="space-y-6">
              {/* Pricing Card con glassmorphism y colores azules - SIN STICKY */}
              <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <p className="text-sm text-[#0D00FF] mb-1">Starting at</p>
                  <p className="text-4xl font-bold text-[#0D00FF]">${getPlanSetPrice()}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 font-medium text-gray-900">Plan Set</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-900 font-medium focus:border-cyan-400 focus:outline-none justify-between"
                        >
                          {selectedPlanSet === "pdf" ? `PDF - $${product.price.toLocaleString()}` : `Archivo Editable - $${Math.round(product.price * 1.5).toLocaleString()}`}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                        <DropdownMenuItem
                          className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                          onSelect={() => setSelectedPlanSet("pdf")}
                        >
                          PDF - ${product.price.toLocaleString()}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                          onSelect={() => setSelectedPlanSet("editable")}
                        >
                          Archivo Editable - ${Math.round(product.price * 1.5).toLocaleString()}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <p className="text-sm mt-3 text-[#0D00FF] font-medium">
                      Plan seleccionado: {selectedPlanSet === "pdf" ? "PDF" : "Archivo Editable"} - ${getPlanSetPrice()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-medium text-gray-900">Options</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full p-3 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200 text-gray-900 font-medium focus:border-cyan-400 focus:outline-none justify-between"
                        >
                          {selectedUnit === "sqft" ? "sq.ft" : "m²"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
                        <DropdownMenuItem
                          className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                          onSelect={() => setSelectedUnit("sqft")}
                        >
                          sq.ft
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                          onSelect={() => setSelectedUnit("m2")}
                        >
                          m²
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#0D00FF] hover:bg-[#0D00FF]/90 text-white font-bold py-4 text-lg rounded-xl border-0 shadow-lg"
                  >
                    Add to Cart
                  </Button>

                  <Button
                    onClick={() => setShowPriceMatchModal(true)}
                    variant="outline"
                    className="w-full border-2 border-gray-400 text-gray-900 hover:bg-gray-200 bg-transparent font-semibold py-3 rounded-xl backdrop-blur-sm"
                  >
                    ¿Viste este diseño en otro sitio?
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <h4 className="font-bold mb-2 text-lg text-gray-900">Mejora este plan</h4>
                  <p className="text-sm mb-4 text-gray-700">
                    Cuéntanos qué cambios necesitas y en máximo 3 días hábiles te enviamos una cotización personalizada, sin costo.
                  </p>
                  <Button
                    onClick={() => setShowImprovePlanModal(true)}
                    variant="outline"
                    className="border-2 border-gray-400 text-gray-900 hover:bg-gray-200 bg-transparent font-semibold py-2 px-4 rounded-xl backdrop-blur-sm"
                  >
                    Mejora este plan
                  </Button>
                </div>
              </div>

              {/* Specifications con glassmorphism */}
              <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="space-y-0">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Square Footage Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Heated Area</span>
                        <span className="font-semibold text-gray-900">
                          {convertArea(product.area_m2)} {getUnitLabel()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Beds/Baths</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Bedrooms</span>
                        <span className="font-semibold text-gray-900">{product.rooms}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Full bathrooms</span>
                        <span className="font-semibold text-gray-900">{product.bathrooms}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Foundation Type</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Standard Foundations</span>
                        <span className="font-semibold text-gray-900">Concrete</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Garage</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type</span>
                        <span className="font-semibold text-gray-900">Attached</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Count</span>
                        <span className="font-semibold text-gray-900">{product.garage_spaces || 0} Cars</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Architectural Style</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-900 hover:bg-gray-200">
                        Modern
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-900 hover:bg-gray-200">
                        Commercial
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold mb-3 text-lg text-gray-900">Special Features</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Open-concept living area</p>
                      <p>Modern kitchen with island</p>
                      <p>Master bedroom with ensuite</p>
                      <p>Efficient storage solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Login Modal */}
       <LoginModal
         isOpen={showLoginModal}
         onClose={() => {
           setShowLoginModal(false)
           setLoginAction(null)
         }}
         onSuccess={handleLoginSuccess}
         title="Iniciar Sesión"
         message={
           loginAction === 'cart' 
             ? t("login_to_add_cart")
             : loginAction === 'favorites'
             ? t("login_to_add_favorites")
             : t("login_to_view_plan")
         }
       />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="relative w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Éxito!</h3>
              <p className="text-sm text-gray-600 mb-6">{successMessage}</p>
              <div className="flex space-x-3">
                {successMessage.includes('carrito') ? (
                  <>
                    <Button 
                      onClick={() => router.push('/cart')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Ir a pagar
                    </Button>
                    <Button 
                      onClick={() => setShowSuccessModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Seguir comprando
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Entendido
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Match Modal */}
      {showPriceMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowPriceMatchModal(false)} />
          <div className="relative w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">¿Viste este diseño en otro sitio?</h3>
              <p className="text-sm text-gray-600 mt-2">
                Si encontraste un proyecto parecido y más económico, déjanos el enlace. Te damos un descuento especial.
              </p>
            </div>
            <form onSubmit={handlePriceMatchSubmit} className="space-y-4">
              <div>
                <Label htmlFor="url">URL del competidor</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={priceMatchForm.url}
                  onChange={(e) => setPriceMatchForm({ ...priceMatchForm, url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Tu email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={priceMatchForm.email}
                  onChange={(e) => setPriceMatchForm({ ...priceMatchForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowPriceMatchModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Improve Plan Modal */}
      {showImprovePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowImprovePlanModal(false)} />
          <div className="relative w-full max-w-md bg-white/85 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mejora este plan</h3>
              <p className="text-sm text-gray-600 mt-2">
                Cuéntanos qué cambios necesitas y en máximo 3 días hábiles te enviamos una cotización personalizada, sin costo.
              </p>
            </div>
            <form onSubmit={handleImprovePlanSubmit} className="space-y-4">
              <div>
                <Label htmlFor="improve-email">Tu email</Label>
                <Input
                  id="improve-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={improvePlanForm.email}
                  onChange={(e) => setImprovePlanForm({ ...improvePlanForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="modifications">¿Qué modificaciones necesitas?</Label>
                <Textarea
                  id="modifications"
                  placeholder="Describe los cambios que necesitas..."
                  value={improvePlanForm.modifications}
                  onChange={(e) => setImprovePlanForm({ ...improvePlanForm, modifications: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowImprovePlanModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Enviar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 