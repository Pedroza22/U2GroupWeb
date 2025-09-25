"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Globe, Heart, ShoppingCart, User, Package, Settings, LogOut, LayoutGrid } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSiteConfig } from "@/hooks/use-site-config"


interface HeaderProps {
  currentPage?: string
  onLogoClick?: () => void
  showMarketplaceElements?: boolean
  onAddToCart?: () => void
  onAddToFavorites?: () => void
  favoritesCount?: number
  cartCount?: number
}

export default function Header({ 
  currentPage, 
  onLogoClick, 
  showMarketplaceElements = false,
  onAddToCart,
  onAddToFavorites,
  favoritesCount = 0,
  cartCount = 0
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { isAuthenticated, user, logout } = useAuth()
  const { config: siteConfig } = useSiteConfig()

  const router = useRouter()

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLanguageToggle = () => {
    setLanguage(language === "es" ? "en" : "es")
  }

  const handleLogout = () => {
    logout()
    setIsUserDropdownOpen(false)
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart()
    } else {
      router.push('/marketplace/cart')
    }
  }

  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites()
    } else {
      router.push('/marketplace/favorites')
    }
  }

  const navItems = [
    { id: "inicio", label: mounted ? t("inicio") : "Inicio", href: "/" },
    { id: "proyectos", label: mounted ? t("proyectos") : "Proyectos", href: "/proyectos" },
    { id: "nosotros", label: mounted ? t("nosotros") : "Nosotros", href: "/nosotros" },
    { id: "disena", label: mounted ? t("disena") : "Diseña", href: "/disena" },
    { id: "blog", label: mounted ? t("blog") : "Blog", href: "/blog" },
    { id: "contacto", label: mounted ? t("contacto") : "Contacto", href: "/contacto" },
    { id: "marketplace", label: "Marketplace", href: "/marketplace" },
  ]

  return (
    <header className="bg-white shadow-sm border-b neutra-font">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <a
            className="flex items-center cursor-pointer"
            onClick={onLogoClick ? (e) => { e.preventDefault(); onLogoClick(); } : undefined}
            href="/"
          >
            <Image src="/images/u2-logo.png" alt={siteConfig?.site_name || "U2 Group"} width={80} height={80} className="mr-2" />
            {/* Texto "U2 Group" removido según petición del usuario */}
          </a>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 transition-colors neutra-font ${
                  currentPage === item.id ? "text-blue-600 font-medium" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* BOTÓN DE IDIOMA Y MENÚ MÓVIL */}
          <div className="flex items-center space-x-4">
            {/* ELEMENTOS DEL MARKETPLACE */}
            {showMarketplaceElements && (
              <>
                <div className="relative cursor-pointer" onClick={handleAddToFavorites}>
                  <Heart className="h-6 w-6 text-gray-700 hover:text-blue-600 transition-colors" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#0D00FF] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </div>
                
                <div className="relative cursor-pointer" onClick={() => router.push('/cart')}>
                  <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-blue-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#0D00FF] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>

                <DropdownMenu open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <User className="h-6 w-6 cursor-pointer text-gray-700 hover:text-blue-600 transition-colors" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white text-gray-900 border-gray-200 shadow-lg">
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-3"
                      onClick={() => router.push('/marketplace')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span>Productos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-3"
                      onClick={() => router.push('/marketplace/orders')}
                    >
                      <Package className="h-4 w-4" />
                      <span>Órdenes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-3"
                      onClick={() => router.push('/marketplace/settings')}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-3 text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/*FIX DEL BOTÓN */}
            <Button
              onClick={handleLanguageToggle}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 neutra-font bg-transparent"
            >
              <Globe className="w-4 h-4" />
              {language === "es" ? "EN" : "ES"}
            </Button>

            {/* BOTÓN MENÚ MÓVIL */}
            <Button onClick={toggleMenu} variant="ghost" size="sm" className="md:hidden">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors neutra-font ${
                    currentPage === item.id ? "text-blue-600 font-medium bg-blue-50" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
