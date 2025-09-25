"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MarketplaceHeader from "@/components/layout/marketplace-header"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { ArrowLeft, CreditCard, Lock, CheckCircle, Shield, Globe, Mail } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("COP")
  const [email, setEmail] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvc, setCvc] = useState("")
  const [cardholderName, setCardholderName] = useState("")
  const [country, setCountry] = useState("Colombia")
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountPercentage, setDiscountPercentage] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login?redirect=/marketplace/cart")
      return
    }
  }, [router])

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "COP") {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount)
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount)
    }
  }

  const getConvertedAmount = (amount: number) => {
    if (selectedCurrency === "COP") {
      return amount * 4265.30 // Tasa de cambio aproximada
    }
    return amount
  }

  const getFinalAmount = (amount: number) => {
    const subtotal = getConvertedAmount(amount)
    const discount = discountApplied ? (subtotal * discountPercentage / 100) : 0
    return subtotal - discount
  }

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setError("Por favor ingresa un código de descuento")
      return
    }

    try {
      const response = await fetch("http://localhost:8000/api/stripe/validate-discount/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: discountCode,
          amount: getCartTotal() * 100, // En centavos
          currency: selectedCurrency === "COP" ? "cop" : "usd"
        })
      })

      const data = await response.json()

      if (response.ok) {
        setDiscountApplied(true)
        setDiscountPercentage(data.percentage)
        setDiscountAmount(data.amount)
        setError("")
        // Mostrar mensaje de éxito
        console.log("✅ Código de descuento aplicado:", data)
      } else {
        setError(data.error || "Código de descuento inválido")
        setDiscountApplied(false)
        setDiscountAmount(0)
        setDiscountPercentage(0)
      }
    } catch (err) {
      setError("Error al validar el código de descuento")
      setDiscountApplied(false)
      setDiscountAmount(0)
      setDiscountPercentage(0)
    }
  }

  const removeDiscount = () => {
    setDiscountApplied(false)
    setDiscountAmount(0)
    setDiscountPercentage(0)
    setDiscountCode("")
    setError("")
  }

  const handleCheckout = async () => {
    if (!email || !cardNumber || !expiryDate || !cvc || !cardholderName) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    setLoading(true)
    setError("")

    try {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

      // Crear la orden en el backend
      const orderData = {
        order_items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      }

      const response = await fetch("http://localhost:8000/api/orders/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error al crear la orden: ${response.status} - ${errorData}`)
      }

      const orderResult = await response.json()

      // Crear Payment Intent con Stripe
      const stripeResponse = await fetch("http://localhost:8000/api/stripe/create-payment-intent/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: getFinalAmount(getCartTotal()) * 100,
          currency: selectedCurrency === "COP" ? "cop" : "usd",
          order_id: orderResult.id,
          customer_email: email,
          discount_code: discountApplied ? discountCode : null,
          discount_amount: discountAmount * 100 // En centavos
        })
      })

      if (!stripeResponse.ok) {
        throw new Error("Error al inicializar el pago")
      }

      const stripeData = await stripeResponse.json()

      // Aquí redirigirías a Stripe Checkout o procesarías el pago
      console.log("✅ Pago procesado:", stripeData)
      
      // Limpiar carrito y redirigir
      clearCart()
      router.push("/marketplace/orders?success=true")
      
    } catch (err: any) {
      setError(err.message || "No se pudo procesar el pago")
      console.error("❌ Error en checkout:", err)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <MarketplaceHeader />
        <main className="container mx-auto px-4 pt-20">
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-8 text-lg">Agrega algunos productos increíbles para continuar</p>
              <button
                onClick={() => router.push("/marketplace")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explorar productos
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <MarketplaceHeader />

      <main className="container mx-auto px-4 pt-20 pb-20">
        <div className="mb-8">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver al Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Panel Izquierdo - Selección de Moneda */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">U2</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-medium">Entorno de prueba</span>
                <div className="text-xs text-gray-400">Pagos seguros con Stripe</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Elige una divisa:</h2>
            
            <div className="space-y-4 mb-8">
              <button
                onClick={() => setSelectedCurrency("COP")}
                className={`w-full p-6 border-2 rounded-xl flex items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedCurrency === "COP" 
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg" 
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                  CO
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">{formatCurrency(getConvertedAmount(getCartTotal()), "COP")}</div>
                  <div className="text-sm text-gray-500">Pesos Colombianos</div>
                </div>
                {selectedCurrency === "COP" && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedCurrency("USD")}
                className={`w-full p-6 border-2 rounded-xl flex items-center gap-4 transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedCurrency === "USD" 
                    ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg" 
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                  US
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">{formatCurrency(getCartTotal(), "USD")}</div>
                  <div className="text-sm text-gray-500">Dólares Estadounidenses</div>
                </div>
                {selectedCurrency === "USD" && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-600 mb-2">Tasa de cambio</div>
              <div className="font-semibold text-gray-800">1 USD = 4,265.30 COP</div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total a pagar</div>
              <div className="text-2xl font-bold">
                {formatCurrency(getFinalAmount(getCartTotal()), selectedCurrency)}
              </div>
              {discountApplied && (
                <div className="text-xs opacity-80 mt-2">
                  Incluye {discountPercentage}% de descuento
                </div>
              )}
          </div>
          </div>

          {/* Panel Derecho - Formulario de Pago */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 mb-8 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-6 h-6" />
              <span className="text-lg">Pagar con link</span>
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </button>

            <div className="flex items-center gap-3 mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-green-700 font-medium">Método de pago seguro</span>
              <Shield className="w-4 h-4 text-green-600" />
          </div>

            {/* Email */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  
            {/* Código de Descuento */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-lg">🎫</span>
                Código de descuento
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Ej: DESCUENTO20"
                  disabled={discountApplied}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm disabled:opacity-50"
                />
                {!discountApplied ? (
                      <button
                    onClick={applyDiscountCode}
                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                    Aplicar
                      </button>
                ) : (
                  <button
                    onClick={removeDiscount}
                    className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Quitar
                  </button>
                )}
              </div>
              {discountApplied && (
                <div className="mt-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="font-medium">¡Descuento aplicado!</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {discountPercentage}% de descuento - {formatCurrency(discountAmount, selectedCurrency)} ahorrados
                  </div>
                </div>
              )}
            </div>

            {/* Información de la tarjeta */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Información de la tarjeta
                </h3>
                
              <div className="mb-6">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 1234 1234 1234"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
                <div className="flex gap-3 mt-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-xs text-white flex items-center justify-center font-bold shadow-sm">V</div>
                  <div className="w-10 h-6 bg-gradient-to-r from-red-600 to-red-700 rounded text-xs text-white flex items-center justify-center font-bold shadow-sm">M</div>
                  <div className="w-10 h-6 bg-gradient-to-r from-orange-600 to-orange-700 rounded text-xs text-white flex items-center justify-center font-bold shadow-sm">J</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/AA"
                  className="p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Nombre del titular */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nombre del titular de la tarjeta</h3>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* País o región */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                País o región
              </h3>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              >
                <option value="Colombia">🇨🇴 Colombia</option>
                <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                <option value="México">🇲🇽 México</option>
                <option value="España">🇪🇸 España</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  {error}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-xl p-4">
              <Shield className="w-4 h-4 inline mr-2 text-gray-400" />
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </div>
          </div>
        </div>

        {/* Resumen del carrito */}
        <div className="mt-12 max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📋</span>
              </div>
              Resumen del pedido
            </h3>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                  </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(item.price * item.quantity, selectedCurrency)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-gray-200 mt-6 pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-700">Subtotal</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(getConvertedAmount(getCartTotal()), selectedCurrency)}
                </span>
              </div>
              
              {discountApplied && (
                <div className="flex justify-between items-center">
                  <span className="text-lg text-green-600 font-medium">Descuento ({discountPercentage}%)</span>
                  <span className="text-lg font-semibold text-green-600">
                    -{formatCurrency(discountAmount, selectedCurrency)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatCurrency(getFinalAmount(getCartTotal()), selectedCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 