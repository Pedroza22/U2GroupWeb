"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useLanguage } from "@/hooks/use-language"
import { getDesignCategories, getBasicCategories, BASE_PRICE, type DesignOption } from "@/data/design-options"
import { CalEmbed } from "@/components/cal-embed"
import axios from "axios"
import { useRouter } from "next/navigation"

// Tipos para los datos de la API
interface Category {
  id: number;
  name: string;
  emoji?: string;
}
interface Service {
  id: number;
  category_id: number;
  name_en: string;
  name_es: string;
  price_min_usd: number | null;
  area_max_m2: number | null;
  max_units: number | null;
  notes?: string;
  image?: string;
}
interface ConfigItem {
  key: string;
  value: string;
}

// Mapeo de áreas máximas y máximos permitidos por servicio (extraído de README_U2Group.md)
const SERVICE_AREA_MAX: Record<string, number | undefined> = {
  // Espacios básicos
  "Large room": 18,
  "Medium room": 14,
  "Small room": 10,
  "Large full bathroom": 16,
  "Medium full bathroom": 14,
  "Small full bathroom": 6,
  "Large social bathroom (half bath)": 6,
  "Small social bathroom (half bath)": 2,
  "Floor": undefined,
  "Attic": undefined,
  "Basement": undefined,
  "Parking": 14,
  "Laundry and storage room": 8,
  // Funcionalidad del hogar
  "Multifunctional garage": 40,
  "Walking closet": 10,
  "Accessible room for the elderly": 14,
  "Space for pets": 6,
  // Trabajo & Creatividad
  "Personal office or hybrid coworking": 16,
  "Executive or board room": 20,
  "Recording studio / podcast": 16,
  "Creative craft workshop": 18,
  "Mini warehouse / e-commerce logistics": 10,
  "Convertible flexible space": 12,
  // Bienestar & Salud
  "Home gym": 20,
  "Sauna or steam bath": 6,
  "Meditation / yoga / mindfulness": 10,
  "Library or reading room": 14,
  "Sensory / therapeutic room": 14,
  // Naturaleza & Sustentabilidad
  "Indoor garden / green wall": undefined,
  "Green roof or living terrace": undefined,
  "Urban vegetable garden (outdoor/indoor)": undefined,
  "Rainwater harvesting system": undefined,
  "Outdoor multifunctional space (gardening)": undefined,
  "Composting": 12,
  "Drying": 12,
  "Greenhouse": 12,
  "Solar panels + backup": undefined,
  // Entretenimiento & Social
  "Game room / indoor cinema": 20,
  "Integrated bar or cellar": 8,
  "BBQ + outdoor kitchen + covered dining room": 26,
  "Firepit + chill zone": 12,
  "Social rooftop with veranda": undefined,
  "Projector or outdoor cinema": 18,
  "Outdoor playground": 20,
  "Swimming pool": 18,
};
const SERVICE_MAX_UNITS: Record<string, number | undefined> = {
  "Large room": 5,
  "Large full bathroom": 5,
  "Large social bathroom (half bath)": 3,
  "Parking": 5,
  "Laundry and storage room": 2,
  "Floor": 3,
};

export default function DisenaPage() {
  const { t, language } = useLanguage()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
  const router = useRouter();

  // Mapeo de traducciones para categorías
  const categoryTranslationMap: Record<string, string> = {
    "Espacios básicos": t("basicSpaces"),
    "Funcionalidad del hogar": t("homeFunction"),
    "Trabajo & Creatividad": t("workAndCreativity"),
    "Bienestar & Salud": t("wellnessAndHealth"),
    "Naturaleza & Sustentabilidad": t("natureAndSustainability"),
    "Entretenimiento & Social": t("entertainmentAndSocial"),
  };

  // Estado para datos dinámicos
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [config, setConfig] = useState<ConfigItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estado para selección
  const [activeTab, setActiveTab] = useState<string>("")
  const [selectedOptions, setSelectedOptions] = useState<Record<number, Record<number, number>>>({} as Record<number, Record<number, number>>)
  const [showQuote, setShowQuote] = useState(false)
  const [currentMainImage, setCurrentMainImage] = useState<string>("/images/u2-logo.png")
  // Estado para el área total
  const [areaTotal, setAreaTotal] = useState<number>(0)
  // Estado para mostrar alerta de área insuficiente al intentar cotizar
  const [showAreaAlert, setShowAreaAlert] = useState(false)
  // Estado para mostrar alerta de área excedida al intentar cotizar
  const [showAreaExceededAlert, setShowAreaExceededAlert] = useState(false)

  // Estado para el email y feedback
  const [cotizacionEmail, setCotizacionEmail] = useState("");
  const [enviandoFactura, setEnviandoFactura] = useState(false);
  const [facturaEnviada, setFacturaEnviada] = useState(false);
  const [errorEnvioFactura, setErrorEnvioFactura] = useState("");

  const [totalArea, setTotalArea] = useState(80);
  const [showMaxAreaAlert, setShowMaxAreaAlert] = useState(false);

  // Estado para mostrar el modal de sugerencias
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

  // Estados para modal de área excedida
  const [showAreaExceededModal, setShowAreaExceededModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [areaRequerida, setAreaRequerida] = useState(0);
  const [areaDisponible, setAreaDisponible] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0); // Para forzar re-renderizado

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Si el valor está vacío, permitir que el input esté vacío temporalmente
    if (value === '') {
      setTotalArea(0); // Permitir campo vacío
      setShowMaxAreaAlert(false);
      return;
    }
    
    const numValue = Number(value);
    
    // Si no es un número válido, no hacer nada
    if (isNaN(numValue)) {
      return;
    }
    
    if (numValue > 1000) {
      setTotalArea(1000);
      setShowMaxAreaAlert(true);
    } else if (numValue < 80) {
      setTotalArea(numValue); // Permitir valores menores a 80
      setShowMaxAreaAlert(false);
    } else {
      setTotalArea(numValue);
      setShowMaxAreaAlert(false);
    }
    
    console.log('🏠 Área cambiada a:', numValue);
    setForceUpdate(prev => prev + 1); // Forzar re-renderizado
  };

  // Botón de cotizar: mostrar modal de sugerencias si falta área
  const handleCotizar = () => {
    if (areaPercent !== 100) {
      setShowSuggestionsModal(true);
      setShowAreaAlert(false);
      setShowAreaExceededAlert(false);
      return;
    }
    if (areaTotal > 0 && calculateAreaUsed() > areaTotal) {
      setShowAreaAlert(false);
      setShowAreaExceededAlert(true);
      return;
    }
    setShowAreaAlert(false);
    setShowAreaExceededAlert(false);
    setShowQuote(true);
  };

  // Cargar datos desde la API
  useEffect(() => {
    setLoading(true)
    setError("")
    
    const loadData = async () => {
      try {
        console.log('Cargando datos de diseño...')
        
        const [catRes, servRes, confRes] = await Promise.all([
          axios.get(`${API_URL}/categorias/`),
          axios.get(`${API_URL}/servicios/`),
          axios.get(`${API_URL}/configuracion/`)
        ])
        
        console.log('Categorías cargadas:', catRes.data)
        console.log('Servicios cargados:', servRes.data)
        console.log('Configuración cargada:', confRes.data)
        
        setCategories(catRes.data as Category[])
        setServices(servRes.data as Service[])
        setConfig(confRes.data as ConfigItem[])
        setActiveTab((catRes.data as Category[])[0]?.id?.toString() || "")
        
      } catch (err: any) {
        console.error('Error cargando datos:', err)
        const errorMsg = err.response?.status === 404 
          ? "Servidor no encontrado. Verifica que Django esté corriendo en puerto 8000."
          : `Error cargando datos: ${err.message}`
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Selección por defecto de espacios básicos (suma 40m²)
  useEffect(() => {
    if (services.length === 0) return;
    // Filtrar los servicios por nombre usando basicElements
    const defaultServices = services.filter(s => basicElements.includes(s.name_en));
    // Agrupar por categoría
    const grouped: Record<number, Record<number, number>> = {};
    defaultServices.forEach(s => {
      if (!grouped[s.category_id]) grouped[s.category_id] = {};
      grouped[s.category_id][s.id] = 1;
    });
    setSelectedOptions(grouped);
    // Actualizar imagen principal con los servicios por defecto
    updateMainImage(grouped);
  }, [services]);

  // Función para manejar selección de servicios (con cantidad y validación de área)
  const handleOptionQuantity = (categoryId: number, service: Service, delta: number, maxUnits?: number) => {
    // Si está tratando de agregar (+1), verificar si hay área disponible
    if (delta > 0) {
      const serviceArea = SERVICE_AREA_MAX[service.name_en] || 0;
      const areaRequerida = serviceArea * delta;
      
      // Calcular área disponible actual
      const currentAreaUsed = calculateAreaUsed();
      const currentAreaPersonalizacion = Math.round((totalArea || 80) * 0.5);
      const currentAreaDisponible = currentAreaPersonalizacion - currentAreaUsed;
      
      // Si no hay suficiente área, mostrar modal de advertencia
      if (areaRequerida > currentAreaDisponible) {
        setSelectedService(service);
        setAreaRequerida(areaRequerida);
        setAreaDisponible(currentAreaDisponible);
        setShowAreaExceededModal(true);
        return;
      }
    }

    setSelectedOptions((prev) => {
      const cat = prev[categoryId] || {};
      const currentQty = cat[service.id] || 0;
      let newQty = currentQty + delta;
      if (newQty < 0) newQty = 0;
      if (maxUnits && newQty > maxUnits) newQty = maxUnits;
      const newCat = { ...cat, [service.id]: newQty };
      if (newQty === 0) delete newCat[service.id];
      const newOptions = { ...prev, [categoryId]: newCat };
      updateMainImage(newOptions);
      
      console.log('➕ Cantidad cambiada:', {
        servicio: service.name_es,
        cantidadAnterior: currentQty,
        nuevaCantidad: newQty,
        delta
      });
      
      // Forzar re-renderizado después de cambiar las opciones
      setTimeout(() => setForceUpdate(prev => prev + 1), 0);
      
      return newOptions;
    });
  };

  // Actualizar imagen principal (muestra la imagen del último servicio seleccionado con imagen)
  const updateMainImage = (options: Record<number, Record<number, number>>) => {
    // Generar un array de servicios seleccionados según la cantidad
    const allSelected: Service[] = [];
    Object.entries(options).forEach(([catId, servicesObj]) => {
      Object.entries(servicesObj).forEach(([serviceId, qty]) => {
        const service = services.find(s => s.id === Number(serviceId));
        if (service) {
          for (let i = 0; i < qty; i++) {
            allSelected.push(service);
          }
        }
      });
    });
    
    if (allSelected.length > 0) {
      // Buscar el último servicio que tenga imagen (priorizar servicios no básicos)
      const servicesWithImage = allSelected.filter(s => s.image && s.image.trim() !== '');
      const nonBasicServicesWithImage = servicesWithImage.filter(s => !basicElements.includes(s.name_en));
      
      let selectedService = null;
      
      // Priorizar servicios no básicos con imagen
      if (nonBasicServicesWithImage.length > 0) {
        selectedService = nonBasicServicesWithImage[nonBasicServicesWithImage.length - 1];
      }
      // Si no hay servicios no básicos con imagen, usar cualquier servicio con imagen
      else if (servicesWithImage.length > 0) {
        selectedService = servicesWithImage[servicesWithImage.length - 1];
      }
      
      if (selectedService && selectedService.image) {
        const imageUrl = selectedService.image.startsWith('http')
          ? selectedService.image
          : `http://localhost:8000/media/${selectedService.image.startsWith('services/') ? selectedService.image : 'services/' + selectedService.image}`;
        
        console.log('Actualizando imagen a:', selectedService.name_es, imageUrl);
        setCurrentMainImage(imageUrl);
        return;
      }
    }
    
    console.log('Usando imagen por defecto');
    setCurrentMainImage("/images/u2-logo.png");
  };

  // Elementos básicos que NO afectan el precio (solo área)
  const basicElements = [
    "Small room",
    "Small full bathroom", 
    "Small social bathroom (half bath)",
    "Parking",
    "Laundry and storage room"
  ];

  // Calcular precio total (excluyendo elementos básicos)
  const calculateServicesTotal = () => {
    let total = 0;
    Object.entries(selectedOptions).forEach(([catId, servicesObj]) => {
      Object.entries(servicesObj).forEach(([serviceId, qty]) => {
        const service = services.find(s => s.id === Number(serviceId));
        if (service && !basicElements.includes(service.name_en)) {
          const servicePrice = (service.price_min_usd || 0) * qty;
          total += servicePrice;
          console.log(`💰 Servicio: ${service.name_es}, Cantidad: ${qty}, Precio: $${servicePrice}`);
        }
      });
    });
    console.log(`📊 Total servicios: $${total}`);
    return total;
  };
  
  // Calcular precio total usando useMemo para forzar re-renderizado
  const totalPrice = useMemo(() => {
    const servicesTotal = calculateServicesTotal();
    const areaNumeric = Number.isFinite(Number(totalArea)) ? Number(totalArea) : 80;
    const areaCost = areaNumeric > 0 ? areaNumeric : 80;
    const total = servicesTotal + areaCost;
    console.log('🔄 Calculando precio total:', {
      servicesTotal,
      areaCost,
      total,
      selectedOptions: Object.keys(selectedOptions).length,
      totalArea: areaNumeric
    });
    return total;
  }, [selectedOptions, totalArea, services, forceUpdate]);
  
  const calculateTotal = () => totalPrice;
  
  // Calcular área ocupada por los servicios seleccionados usando useMemo
  const areaUsed = useMemo(() => {
    let total = 0;
    Object.entries(selectedOptions).forEach(([catId, servicesObj]) => {
      Object.entries(servicesObj).forEach(([serviceId, qty]) => {
        const service = services.find(s => s.id === Number(serviceId));
        if (service) {
          const area = SERVICE_AREA_MAX[service.name_en] || 0;
          total += area * qty;
        }
      });
    });
    console.log('📐 Área utilizada calculada:', total);
    return total;
  }, [selectedOptions, services, forceUpdate]);
  
  const calculateAreaUsed = () => areaUsed;

  // Cálculo de áreas según la nueva lógica del 50%
  const effectiveArea = totalArea || 80; // Usar 80 como valor por defecto si el campo está vacío
  const areaInfraestructura = Math.round(effectiveArea * 0.5); // 50% para infraestructura fija
  const areaPersonalizacion = Math.round(effectiveArea * 0.5); // 50% para personalización (básicos + adicionales)
  
  // Calcular área total ocupada por productos seleccionados (ya calculada arriba con useMemo)
  
  // Calcular área ocupada por elementos básicos
  const areaUsedByBasics = Object.entries(selectedOptions).reduce((sum, [catId, servicesObj]) => {
    return sum + Object.entries(servicesObj).reduce((catSum, [serviceId, qty]) => {
      const service = services.find(s => s.id === Number(serviceId));
      if (service && basicElements.includes(service.name_en)) {
        const area = SERVICE_AREA_MAX[service.name_en] || 0;
        return catSum + (area * qty);
      }
      return catSum;
    }, 0);
  }, 0);
  
  // Calcular área ocupada por elementos adicionales (no básicos)
  const areaUsedByAdditional = areaUsed - areaUsedByBasics;
  
  // Área disponible restante para personalización
  const areaPersonalizacionRestante = areaPersonalizacion - areaUsed;
  
  // Porcentaje de área de personalización ocupada (solo del 50% disponible)
  const areaPercent = areaPersonalizacion > 0 ? Math.round((areaUsed / areaPersonalizacion) * 100) : 0;
  const areaMissing = areaTotal > 0 ? Math.max(areaTotal - areaUsed, 0) : 0

  // Sugerencias de servicios que caben en el área faltante
  const serviceSuggestions = Object.entries(SERVICE_AREA_MAX)
    .filter(([name, area]) => area && areaMissing >= area)
    .map(([name, area]) => {
      // Buscar el servicio en la lista para obtener el nombre en español
      const service = services.find(s => s.name_en === name)
      return service ? `${service.name_es} (${service.name_en}, ${area} m²)` : `${name} (${area} m²)`
    })

  // Renderizado
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header currentPage="disena" />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando servicios de diseño...</h2>
            <p className="text-gray-600">Conectando con la base de datos</p>
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header currentPage="disena" />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error cargando datos</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Categorías: {categories.length}</p>
                <p className="text-sm text-gray-600">Servicios: {services.length}</p>
                <p className="text-sm text-gray-600">Configuración: {config.length}</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de cotización final con Cal.com integrado
  if (showQuote) {
    return (
      <div className="min-h-screen bg-white neutra-font">
        <Header currentPage="disena" />
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white via-blue-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl neutra-font-black text-blue-700 mb-8 drop-shadow-md">{t("getYourQuote")}</h1>
              <p className="text-2xl text-gray-700 mb-8 neutra-font max-w-2xl mx-auto">{t("readyToStart")}</p>
            </div>
          </div>
        </section>
        <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />
        {/* Contenido de la cotización con Cal.com */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* LADO IZQUIERDO - Resumen del proyecto */}
            <div className="lg:col-span-1">
              <div className="text-center">
                {/* Imagen del proyecto */}
                <div className="mb-8">
                  <Image
                    src={currentMainImage || "/placeholder.svg"}
                    alt="House Design"
                    width={600}
                    height={300}
                    className="w-full rounded-2xl object-cover border-2 border-blue-100 shadow-lg"
                  />
                </div>
                {/* Información del proyecto */}
                <div className="mb-6">
                  <h2 className="text-2xl neutra-font-bold text-blue-600 mb-2">
                    {t("interestedIn") || "Estás interesado en"}
                  </h2>
                  <p className="text-xl neutra-font-bold text-gray-900">{t("architecturalDesign")}</p>
                </div>
                {/* Código del proyecto */}
                <div className="mb-6">
                  <h3 className="text-lg neutra-font-bold text-gray-900 mb-2">
                    {t("designSummary") || "RESUMEN DE DISEÑO"}
                  </h3>
                  <p className="text-blue-600 neutra-font">
                    {t("projectCode") || "Código de Proyecto"}: <span className="neutra-font-bold">U2-84806G</span>
                  </p>
                </div>
                {/* Desglose de costos por categoría */}
                <div className="space-y-4 mb-8 text-left">
                  {categories.map((category) => {
                    const servicesObj = selectedOptions[category.id] || {};
                    if (Object.keys(servicesObj).length === 0) return null;
                    const categoryTotal = (Object.entries(servicesObj) as [string, number][]).reduce((sum, [serviceId, qty]) => sum + ((services.find(s => s.id === Number(serviceId))?.price_min_usd || 0) * qty), 0);
                    return (
                      <div key={category.id} className="border-b pb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="neutra-font-bold text-blue-600 capitalize">{categoryTranslationMap[category.name] || category.name}</h4>
                          <span className="neutra-font-bold">${categoryTotal}</span>
                        </div>
                        {(Object.entries(servicesObj) as [string, number][]).map(([serviceId, cantidad]) => {
                          const service = services.find(s => s.id === Number(serviceId));
                          if (!service || cantidad === 0) return null;
                          return (
                            <div key={serviceId} className="flex justify-between text-sm text-gray-600 ml-4">
                              <span className="neutra-font">{language === "es" ? service.name_es : service.name_en} x {cantidad}</span>
                              <span className="neutra-font">${(service.price_min_usd || 0) * cantidad}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                 {/* Desglose del total de servicios */}
                 <div className="border-b pb-2">
                   <div className="flex justify-between items-center">
                     <h4 className="neutra-font-bold text-blue-600">{t("totalServices") || "Servicios adicionales"}</h4>
                     <span className="neutra-font-bold">${calculateServicesTotal()}</span>
                   </div>
                 </div>
                                  {/* Resumen de área */}
                 <div className="border-b pb-2">
                   <div className="flex justify-between items-center">
                     <h4 className="neutra-font-bold text-blue-600">Resumen de área</h4>
                   </div>
                   <div className="space-y-1 ml-4 text-sm text-gray-600">
                     <div className="flex justify-between">
                       <span>Área total del proyecto:</span>
                       <span>{(totalArea || 80)} m²</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>• Infraestructura (50%):</span>
                       <span>{areaInfraestructura} m²</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>• Personalización (50%):</span>
                       <span>{areaPersonalizacion} m²</span>
                     </div>
                     <div className="border-t pt-1 mt-2">
                       <div className="flex justify-between">
                         <span>Elementos básicos:</span>
                         <span>{areaUsedByBasics} m²</span>
                       </div>
                       <div className="flex justify-between">
                         <span>Servicios adicionales:</span>
                         <span>{areaUsedByAdditional} m²</span>
                       </div>
                       <div className="flex justify-between font-semibold">
                         <span>Área personalización usada:</span>
                         <span>{areaUsed} m² ({areaPercent}%)</span>
                       </div>
                       <div className="flex justify-between text-green-600 font-medium">
                         <span>Área disponible:</span>
                         <span>{Math.max(areaPersonalizacionRestante, 0)} m²</span>
                       </div>
                     </div>
                   </div>
                 </div>
                 {/* Desglose del área total */}
                 <div className="border-b pb-2">
                   <div className="flex justify-between items-center">
                     <h4 className="neutra-font-bold text-blue-600">{t("totalArea") || "Total área"}</h4>
                     <span className="neutra-font-bold">${(totalArea || 80)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-600 ml-4">
                     <span className="neutra-font">{(totalArea || 80)} m² x $1 USD</span>
                     <span className="neutra-font">${(totalArea || 80)}</span>
                   </div>
                 </div>
                </div>
                {/* Precio total */}
                <div className="text-center mb-8">
                  <div className="text-4xl neutra-font-black text-blue-600 mb-4">
                    ${calculateTotal()} <span className="text-lg neutra-font">USD</span>
                  </div>
                  <p className="text-gray-600 neutra-font mb-6">
                    {t("readyToStart") || "¿Listo para comenzar tu proyecto?"}
                  </p>
                </div>
                {/* Input para el correo Gmail en la cotización */}
                <div className="mt-6 mb-6 max-w-md mx-auto">
                  <label htmlFor="cotizacionEmail" className="block text-blue-700 font-bold mb-2">{t("gmailForInvoice") || "Correo Gmail para recibir la factura:"}</label>
                  <input
                    id="cotizacionEmail"
                    type="email"
                    placeholder="tucorreo@gmail.com"
                    className="w-full border border-blue-200 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={cotizacionEmail}
                    onChange={e => setCotizacionEmail(e.target.value)}
                    disabled={enviandoFactura}
                  />
                  <button
                    className="mt-4 w-full bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 disabled:opacity-50"
                    onClick={async () => {
                      setEnviandoFactura(true);
                      setFacturaEnviada(false);
                      setErrorEnvioFactura("");
                      try {
                        // Construir productos a partir de los servicios seleccionados
                        const productos = Object.entries(selectedOptions).flatMap(([catId, servicesObj]) =>
                          Object.entries(servicesObj).map(([serviceId, qty]) => ({
                            name: services.find(s => s.id === Number(serviceId))?.name_es || "",
                            price: (services.find(s => s.id === Number(serviceId))?.price_min_usd || 0) * qty,
                          }))
                        );
                        await axios.post(`${API_URL}/send-invoice/`, {
                          email: cotizacionEmail,
                          products: productos,
                        });
                        setFacturaEnviada(true);
                      } catch (err) {
                        setErrorEnvioFactura(t("invoiceError") || "No se pudo enviar la factura. Verifica el correo o intenta de nuevo.");
                      } finally {
                        setEnviandoFactura(false);
                      }
                    }}
                    disabled={enviandoFactura || !cotizacionEmail || Object.values(selectedOptions).flat().length === 0}
                  >
                    {enviandoFactura ? t("sending") || "Enviando..." : t("sendInvoice") || "Enviar factura"}
                  </button>
                  {facturaEnviada && <p className="text-green-600 mt-2">{t("invoiceSent") || "¡Factura enviada correctamente!"}</p>}
                  {errorEnvioFactura && <p className="text-red-600 mt-2">{errorEnvioFactura}</p>}
                </div>
                {/* Botones de navegación */}
                <div className="flex gap-4">
                  <Button onClick={() => {
                    setShowQuote(false);
                  }} variant="outline" className="flex-1 neutra-font">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("back") || "Atrás"}
                  </Button>
                  <Link href="/contacto" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white neutra-font-black shadow-xl text-lg">
                      {t("contactUs") || "Contáctanos"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            {/* LADO DERECHO - Calendario Cal.com */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h3 className="text-2xl neutra-font-bold text-blue-600 mb-4">
                  {t("scheduleConsultation") || "Agenda una Consulta"}
                </h3>
                <p className="text-gray-600 neutra-font mb-6">
                  {t("bookMeeting") || "Reserva una reunión con nuestro equipo para discutir tu proyecto en detalle."}
                </p>
              </div>
              {/* Integración de Cal.com */}
              <div className="bg-white rounded-2xl shadow-lg p-4 min-h-[500px] border-2 border-blue-100">
                <CalEmbed
                  calLink="jara-u2group-lrzdfm/consulta-arquitectura?overlayCalendar=true"
                  showDemo={false}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Pantalla principal de configuración
  return (
    <div className="min-h-screen bg-white neutra-font">
      <Header currentPage="disena" />
      <section className="w-full py-10 md:py-20 bg-gradient-to-b from-white via-blue-50 to-gray-100">
        <div className="w-full px-2 md:container md:mx-auto md:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl neutra-font-black text-blue-700 mb-8 drop-shadow-md">{t("designTitle")}</h1>
            <p className="text-2xl text-gray-700 mb-8 neutra-font max-w-2xl mx-auto">{t("designSubtitle")}</p>
          </div>
        </div>
      </section>
      <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />
      {/* Navegación de pestañas */}
      <div className="bg-white border-b">
        <div className="w-full px-2 md:container md:mx-auto md:px-4">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 py-4 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id.toString())}
                  className={`px-3 py-1 rounded-md text-sm neutra-font transition-colors shadow-sm ${
                    activeTab === cat.id.toString()
                      ? "bg-blue-600 text-white scale-100"
                      : "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {categoryTranslationMap[cat.name] || cat.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-yellow-600 text-xl mb-2">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías disponibles</h3>
                <p className="text-sm text-gray-600">Los datos de diseño se están cargando...</p>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Servicios cargados: {services.length}</p>
                  <p>Categorías cargadas: {categories.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imagen principal del diseño - DINÁMICA */}
          <div className="lg:col-span-2">
            {/* Input para el área total */}
            <div className="mb-4 flex items-center gap-4">
              <label htmlFor="areaTotal" className="font-bold text-blue-700">{t("designAreaTitle")}</label>
              <input
                id="areaTotal"
                type="number"
                value={totalArea === 0 ? '' : totalArea}
                min={1}
                max={1000}
                onChange={handleAreaChange}
                placeholder="80"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showMaxAreaAlert && (
                <div className="text-red-600 font-bold text-xs mt-1">{t("designAreaExceeded")}</div>
              )}
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden mb-8 bg-white border-2 border-blue-100 shadow-lg">
              <Image
                src={currentMainImage || "/placeholder.svg"}
                alt="Design Preview"
                fill
                className="object-contain transition-all duration-500"
                priority
              />
              {/* Indicador de imagen activa */}
              <div className="absolute bottom-4 left-4 bg-blue-700 bg-opacity-80 text-white px-3 py-1 rounded-full text-sm neutra-font">
                {currentMainImage === "/images/u2-logo.png" ? t("defaultView") : t("customView")}
              </div>
            </div>
            {/* Barra de progreso de selección de categorías */}
            <div className="flex items-center gap-2 mb-2 px-2">
              <div className="w-8 h-8">
                <Image
                  src="/images/CASA.svg"
                  alt="Casa"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden relative">
                <div className="h-4 bg-gradient-to-r from-blue-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${areaPercent}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-700">
                  {areaPercent}% del área de personalización usado
                </div>
              </div>
            </div>
          </div>
          {/* Panel de configuración lateral con altura fija y scroll */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg flex flex-col border-2 border-blue-100 h-[630px] overflow-y-auto">
              {/* Header del panel */}
              <div className="p-4 border-b flex-shrink-0">
                <h2 className="text-xl neutra-font-bold text-blue-600">
                  {t("chooseThe")} {categories.find((c) => c.id.toString() === activeTab)?.name}
                </h2>
              </div>
              {/* Contenido scrolleable */}
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                  {(() => {
                    const categoryServices = services.filter((s) => s.category_id.toString() === activeTab);
                    if (categoryServices.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="text-gray-400 text-2xl mb-2">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay servicios disponibles</h3>
                            <p className="text-sm text-gray-600">Esta categoría no tiene servicios configurados aún.</p>
                            <div className="mt-4 text-xs text-gray-500">
                              <p>Total servicios: {services.length}</p>
                              <p>Categoría activa: {activeTab}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return categoryServices.map((service) => {
                    const maxUnits = SERVICE_MAX_UNITS[service.name_en];
                    const selectedQty = selectedOptions[service.category_id]?.[service.id] || 0;
                    return (
                      <Card
                        key={service.id}
                        className={`p-3 transition-all hover:shadow-md ${selectedQty > 0 ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          {service.image && (
                            <Image
                              src={
                                service.image.startsWith('http')
                                  ? service.image
                                  : `http://localhost:8000/media/${service.image.startsWith('services/') ? service.image : 'services/' + service.image}`
                              }
                              alt={service.name_es}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="neutra-font-bold text-gray-900 text-sm">{language === "es" ? service.name_es : service.name_en}</h4>
                              {basicElements.includes(service.name_en) && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Incluido
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-blue-600 neutra-font">
                              {basicElements.includes(service.name_en) 
                                ? "Sin costo adicional" 
                                : `$${service.price_min_usd || 0} USD`
                              }
                            </p>
                            {SERVICE_AREA_MAX[service.name_en] && (
                              <p className="text-xs text-gray-500">{t("area")}: {SERVICE_AREA_MAX[service.name_en]} m²</p>
                            )}
                          </div>
                          {/* Selector de cantidad uniforme para todos los servicios */}
                          <div className="flex items-center gap-2">
                            <button
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold text-lg"
                              onClick={() => handleOptionQuantity(service.category_id, service, -1, maxUnits)}
                              disabled={selectedQty === 0}
                            >-</button>
                            <span className="font-bold text-blue-700 min-w-[20px] text-center">{selectedQty}</span>
                            <button
                              className="px-2 py-1 bg-blue-600 text-white rounded font-bold text-lg"
                              onClick={() => handleOptionQuantity(service.category_id, service, 1, maxUnits)}
                              disabled={maxUnits ? selectedQty >= maxUnits : false}
                            >+</button>
                          </div>
                          {/* Checkmark para opciones seleccionadas */}
                          {selectedQty > 0 && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Alerta visual si excede el máximo */}
                        {maxUnits && selectedQty > maxUnits && (
                          <div className="text-red-600 font-bold text-xs mt-2">{t("maxUnitsExceeded").replace("{{max}}", maxUnits.toString())}</div>
                        )}
                      </Card>
                    );
                  });
                  })()}
                  </div>
              </div>
              {/* Panel de precio total - FIJO en la parte inferior */}
              <div className="border-t p-4 bg-white rounded-b-lg flex-shrink-0">
                <div className="text-center mb-4">
                  <p className="text-sm neutra-font-bold text-gray-700">{t("designCost")}</p>
                  <div className="text-2xl neutra-font-black text-blue-600">
                    ${calculateTotal()} <span className="text-sm neutra-font">USD</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    *Elementos básicos incluidos sin costo adicional
                  </p>
                </div>
                {/* Botones de acción */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCotizar}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white py-2 neutra-font-black text-sm shadow-xl"
                  >
                    {t("getYourQuote")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {/* Modal flotante de sugerencias al intentar cotizar si falta área */}
                  {showSuggestionsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in border-2 border-blue-100">
                        <button
                          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold"
                          onClick={() => setShowSuggestionsModal(false)}
                          aria-label="Cerrar"
                        >
                        </button>
                        <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">{t("suggestionsTitle")}</h2>
                        <p className="text-gray-700 mb-4 text-center">{t("suggestionsDescription")}</p>
                        <ul className="space-y-3 max-h-80 overflow-y-auto">
                          {services
                            .filter(s => {
                              const area = SERVICE_AREA_MAX[s.name_en] || 0;
                              // No sugerir los que ya están seleccionados ni los de los defaults
                              const yaSeleccionado = Object.entries(selectedOptions).some(([catId, servicesObj]) => 
                                Object.keys(servicesObj).includes(s.id.toString())
                              );
                              const esDefault = basicElements.includes(s.name_en);
                              return area > 0 && area <= areaPersonalizacionRestante && !yaSeleccionado && !esDefault;
                            })
                            .length === 0 ? (
                              <li className="text-center text-gray-500 flex flex-col items-center gap-4">
                                {t("noSuggestionsAvailable")}
                                <div className="flex gap-3 justify-center mt-2">
                                  {calculateAreaUsed() > 80 && (
                                    <button
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded shadow text-sm"
                                      onClick={() => {
                                        setTotalArea(Math.max(calculateAreaUsed(), 80)); // Disminuir área restante, nunca menos de 80
                                        setShowSuggestionsModal(false);
                                      }}
                                    >
                                      {t("decreaseRemainingArea")}
                                    </button>
                                  )}
                                  <button
                                    className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-1 px-3 rounded shadow text-sm"
                                    onClick={() => {
                                      setShowSuggestionsModal(false);
                                      setTimeout(() => {
                                        const input = document.querySelector('input[type="number"]#areaTotal') as HTMLInputElement;
                                        if (input) input.focus();
                                      }, 100);
                                    }}
                                  >
                                    {t("increaseTotalArea")}
                                  </button>
                                </div>
                              </li>
                            ) : (
                              services
                                .filter(s => {
                                  const area = SERVICE_AREA_MAX[s.name_en] || 0;
                                  const yaSeleccionado = Object.entries(selectedOptions).some(([catId, servicesObj]) => 
                                    Object.keys(servicesObj).includes(s.id.toString())
                                  );
                                  const esDefault = basicElements.includes(s.name_en);
                                  return area > 0 && area <= areaPersonalizacionRestante && !yaSeleccionado && !esDefault;
                                })
                                .map(s => (
                                  <li key={s.id} className="flex items-center justify-between bg-blue-50 rounded p-3 border border-blue-100">
                                    <div>
                                      <span className="font-bold text-gray-800">{s.name_es}</span>
                                      <span className="text-xs text-blue-700 ml-2">{SERVICE_AREA_MAX[s.name_en]} m²</span>
                                    </div>
                                    <button
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded shadow text-sm"
                                      onClick={() => {
                                        setSelectedOptions(prev => {
                                          const current = prev[s.category_id] || {};
                                          return { ...prev, [s.category_id]: { ...current, [s.id]: (current[s.id] || 0) + 1 } };
                                        });
                                      }}
                                    >
                                      {t("add")}
                                    </button>
                                  </li>
                                ))
                            )}
                        </ul>
                        <div className="flex justify-center gap-3 mt-6">
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-bold"
                            onClick={() => setShowSuggestionsModal(false)}
                          >
                            {t("close")}
                          </button>
                          <Button
                            onClick={() => {
                              setShowSuggestionsModal(false);
                              setShowQuote(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
                          >
                            {t("getYourQuote")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Alerta visual si excede el área, solo al intentar cotizar */}
                  {showAreaExceededAlert && (
                    <div className="text-red-600 font-bold text-sm mt-2">{t("areaExceededAlert")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Modal de área excedida */}
      {showAreaExceededModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Área insuficiente</h2>
              <p className="text-gray-600 mb-4">
                El servicio <strong>{language === "es" ? selectedService?.name_es : selectedService?.name_en}</strong> requiere {areaRequerida} m², pero solo tienes {areaDisponible} m² disponibles.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Área total:</span>
                    <span>{(totalArea || 80)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Área para personalización (50%):</span>
                    <span>{Math.round((totalArea || 80) * 0.5)} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Área ya ocupada:</span>
                    <span>{calculateAreaUsed()} m²</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Área disponible:</span>
                    <span>{areaDisponible} m²</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    const nuevaArea = Math.ceil((calculateAreaUsed() + areaRequerida) / 0.5);
                    setTotalArea(Math.max(nuevaArea, 80));
                    setShowAreaExceededModal(false);
                    // Intentar agregar el servicio nuevamente
                    setTimeout(() => {
                      if (selectedService) {
                        handleOptionQuantity(selectedService.category_id, selectedService, 1);
                      }
                    }, 100);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ampliar área del proyecto a {Math.ceil((calculateAreaUsed() + areaRequerida) / 0.5)} m²
                </Button>
                
                <Button
                  onClick={() => setShowAreaExceededModal(false)}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Ajustar elementos manualmente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      

    </div>
  )
}
