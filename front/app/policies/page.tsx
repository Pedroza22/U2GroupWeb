"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, ExternalLink } from "lucide-react"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

const policies = [
  {
    title: "Términos y Condiciones de Uso",
    description: "Términos legales que rigen el uso de nuestro sitio web y servicios",
    file: "/politicas/Terms and Conditions of Use.pdf",
    icon: FileText
  },
  {
    title: "Política de Privacidad",
    description: "Cómo recopilamos, usamos y protegemos tu información personal",
    file: "/politicas/Privacy Policy.pdf",
    icon: FileText
  },
  {
    title: "Política de Precios",
    description: "Información sobre nuestros precios, pagos y facturación",
    file: "/politicas/Pricing Policy.pdf",
    icon: FileText
  },
  {
    title: "Política de Devolución y Reembolso",
    description: "Nuestras políticas para devoluciones y reembolsos",
    file: "/politicas/Return & Refund Policy.pdf",
    icon: FileText
  },
  {
    title: "Política de Envío y Entrega",
    description: "Información sobre el envío y entrega de nuestros productos digitales",
    file: "/politicas/Shipping & Delivery Policy.pdf",
    icon: FileText
  },
  {
    title: "Política de Derechos de Autor y Propiedad Intelectual",
    description: "Protección de derechos de autor y propiedad intelectual",
    file: "/politicas/Copyright & Intellectual Property Policy.pdf",
    icon: FileText
  },
  {
    title: "Reportar Infracción de Derechos de Autor",
    description: "Cómo reportar presuntas infracciones de derechos de autor",
    file: "/politicas/Report Alleged Copyright Infringement.pdf",
    icon: FileText
  },
  {
    title: "Acuerdo de Licencia para Planos Pre-Diseñados",
    description: "Términos de licencia para planos de casas pre-diseñados",
    file: "/politicas/License Agreement for Pre-Designed House Plans.pdf",
    icon: FileText
  },
  {
    title: "Acuerdo de Licencia para Proyectos de Diseño Personalizado",
    description: "Términos de licencia para proyectos de diseño personalizado",
    file: "/politicas/License Agreement for Custom Design Projects.pdf",
    icon: FileText
  },
  {
    title: "¿Qué está Incluido?",
    description: "Detalles sobre lo que incluye cada tipo de producto y servicio",
    file: "/politicas/What's Included .pdf",
    icon: FileText
  }
]

export default function PoliciesPage() {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)

  const handleViewPolicy = (file: string) => {
    setSelectedPolicy(file)
    window.open(file, '_blank')
  }

  const handleDownloadPolicy = (file: string, title: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = `${title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Políticas y Términos Legales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Aquí encontrarás todas nuestras políticas, términos y condiciones que rigen el uso de nuestros servicios y productos.
          </p>
        </div>

        {/* Grid de Políticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <policy.icon className="w-6 h-6 text-blue-600" />
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {policy.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewPolicy(policy.file)}
                    className="flex-1"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    onClick={() => handleDownloadPolicy(policy.file, policy.title)}
                    variant="outline"
                    size="icon"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información Adicional */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Información Importante
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📋 Términos de Uso
              </h3>
              <p className="text-gray-600">
                Al usar nuestros servicios, aceptas cumplir con todos los términos y condiciones establecidos en estas políticas.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔒 Privacidad
              </h3>
              <p className="text-gray-600">
                Tu privacidad es importante para nosotros. Revisa nuestra política de privacidad para entender cómo protegemos tu información.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💰 Precios y Pagos
              </h3>
              <p className="text-gray-600">
                Todos los precios están en USD y son finales. Consulta nuestra política de precios para más detalles sobre facturación.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📦 Productos Digitales
              </h3>
              <p className="text-gray-600">
                Nuestros productos son digitales y se entregan por email. Revisa nuestras políticas de envío y licencias.
              </p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            ¿Tienes preguntas sobre nuestras políticas?
          </p>
          <Button asChild>
            <a href="/contact" className="bg-blue-600 hover:bg-blue-700">
              Contactar Soporte
            </a>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
