"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, User, Heart, Settings, LogOut, Package, Globe, ChevronDown } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/context/auth-context"

interface HeaderProps {
  isVisible: boolean
  cartCount: number
  favoritesCount: number
  sortBy: string
  setSortBy: (sort: string) => void
  activeView: "images" | "plans"
  setActiveView: (view: "images" | "plans") => void
}

export default function Header({
  isVisible,
  cartCount,
  favoritesCount,
  sortBy,
  setSortBy,
  activeView,
  setActiveView,
}: HeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleUserClick = () => {
    if (!user) {
      router.push('/login' as any);
    } else {
      setIsUserDropdownOpen((open) => !open);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    router.push('/' as any);
  };

  const userMenuItems = [
    { icon: User, label: t("Mi perfil"), onClick: () => { setIsUserDropdownOpen(false); router.push('/profile' as any); } },
    { icon: Package, label: t("Mis pedidos"), onClick: () => { setIsUserDropdownOpen(false); router.push('/profile/orders' as any); } },
    { icon: Settings, label: t("Configuración"), onClick: () => { setIsUserDropdownOpen(false); router.push('/profile/settings' as any); } },
    { icon: LogOut, label: t("Cerrar sesión"), onClick: handleLogout },
  ];

  return (
    <header className={`sticky top-0 z-30 w-full bg-white border-b border-gray-200 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView("images")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium ${
                activeView === "images" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("Imágenes")}
            </button>
            
            <button
              onClick={() => setActiveView("plans")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium ${
                activeView === "plans" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("Planos de planta")}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <span>{t("Ordenar por")}: {sortBy}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {["Relevancia", "Precio: bajo a alto", "Precio: alto a bajo", "Más recientes", "Más populares"].map((option) => (
                      <button
                        key={option}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          sortBy === option ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } hover:bg-gray-100`}
                        onClick={() => {
                          setSortBy(option);
                          setIsSortDropdownOpen(false);
                        }}
                      >
                        {t(option)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/profile/favorites" className="relative p-2 text-gray-700 hover:text-primary">
              <Heart className="w-6 h-6" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={handleUserClick}
                className="p-2 text-gray-700 hover:text-primary"
              >
                <User className="w-6 h-6" />
              </button>

              {isUserDropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      {(user as any).first_name || (user as any).username}
                    </div>
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={item.onClick}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


