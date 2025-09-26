"use client"

import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PolicyLayoutProps {
  title: string
  children: React.ReactNode
}

export default function PolicyLayout({ title, children }: PolicyLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 font-medium">Inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <div className="px-6 py-5">
            {children}
          </div>
        </div>
        
        {/* Botón de volver */}
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="rounded-full px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </main>
    </div>
  )
}