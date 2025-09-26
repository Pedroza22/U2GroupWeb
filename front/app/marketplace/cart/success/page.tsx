"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowLeft, Mail, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function PaymentSuccessContent() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Obtener el session_id de los parámetros de la URL
        const sessionId = searchParams.get('session_id')
        
        if (sessionId) {
          console.log('🎉 Pago exitoso detectado, session_id:', sessionId)
          
          // Simular un pequeño delay para mostrar la animación
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          console.log('✅ Pago procesado exitosamente')
          console.log('📧 La factura se enviará automáticamente desde el backend')
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Error en handlePaymentSuccess:', error)
        setIsLoading(false)
      }
    }

    handlePaymentSuccess()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Procesando pago...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 mb-4">
          Tu pago ha sido procesado correctamente.
        </p>

        {/* Información sobre la factura */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Mail className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Factura enviada automáticamente
            </span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Revisa tu email para la confirmación de compra
          </p>
        </div>

        <div className="space-y-6">
          <Link href="/marketplace">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Marketplace
            </Button>
          </Link>
          
          <Link href="/marketplace/orders">
            <Button variant="outline" className="w-full">
              Ver mis pedidos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}