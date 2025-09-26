"use client";

import { useEffect, useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Aquí podrías hacer una llamada a tu API para obtener los detalles de la orden
      // Por ahora, simulamos los datos
      setTimeout(() => {
        setOrderDetails({
          id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          total: 120.00,
          items: [
            { name: 'Plano Residencial Moderno', quantity: 1 }
          ]
        });
        setIsLoading(false);
      }, 2000);
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Procesando tu pago...</h2>
          <p className="text-gray-600 mt-2">Por favor espera un momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Tu orden ha sido procesada correctamente
          </p>
          <p className="text-sm text-gray-500">
            Orden #{orderDetails?.id}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detalles de tu Compra</h2>
          
          <div className="space-y-4 mb-6">
            {orderDetails?.items.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="text-gray-600">Cantidad: {item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Pagado</span>
              <span className="text-green-600">${orderDetails?.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">¿Qué sigue?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Email de Confirmación</p>
                <p className="text-sm text-blue-700">Recibirás un email con los enlaces de descarga en los próximos minutos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Descarga Inmediata</p>
                <p className="text-sm text-blue-700">Los archivos PDF y editables estarán disponibles para descargar.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/marketplace">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold">
              <Package className="w-5 h-5 mr-2" />
              Seguir Comprando
            </Button>
          </Link>
                                <Link href="/disena">
                        <Button variant="outline" className="w-full sm:w-auto px-8 py-3 rounded-xl border-gray-300 hover:bg-gray-50">
                          <ArrowRight className="w-5 h-5 mr-2" />
                          Crea tu Propio Diseño
                        </Button>
                      </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}