"use client"

import { useState, useEffect } from "react"
import axios from "axios";
import { getBlogImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import GoogleMapsWorking from "@/components/google-maps-working"
import IntroVideo from "@/components/intro-video"
import { useLanguage } from "@/hooks/use-language"
import PriceCalculator from "@/components/price-calculator"
import { useSiteConfig } from "@/hooks/use-site-config"

// Componente simple de calculadora
function SimpleCalculator() {
  const { t, language } = useLanguage();
  const [area, setArea] = useState(75)
  const PRICE_PER_M2 = 120
  const total = area * PRICE_PER_M2

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="max-w-800px mx-auto p-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          {t("calculatorTitle1")} <span className="text-blue-600 text-5xl md:text-7xl font-black">{t("calculatorTitle2")}</span>
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          {t("calculatorSubtitle1")} <span className="text-blue-600 text-3xl md:text-5xl font-black">${total.toLocaleString("en-US")} USD</span> {t("calculatorSubtitle2")}
        </p>
        <p className="text-lg md:text-xl text-gray-800 mb-8">
          <span className="text-blue-600 text-xl md:text-2xl font-bold">{area} m²</span> · ${PRICE_PER_M2} USD {t("calculatorPerM2")}
        </p>
        <input
          type="range"
          min={1}
          max={200}
          step={1}
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #0D00FF 0%, #0D00FF ${(area / 200) * 100}%, #ddd ${(area / 200) * 100}%, #ddd 100%)`,
          }}
        />
        <Link href="/disena">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full">
            {t("calculatorButton")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 25px;
          width: 25px;
          border-radius: 50%;
          background: #0D00FF;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(13, 0, 255, 0.3);
        }

        .slider::-moz-range-thumb {
          height: 25px;
          width: 25px;
          border-radius: 50%;
          background: #0D00FF;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(13, 0, 255, 0.3);
        }
      `}</style>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage();
  const { config: siteConfig, loading: configLoading } = useSiteConfig();

  
  
  // Debug logging para configuración del sitio
  console.log('🏠 HomePage - siteConfig:', siteConfig);
  console.log('🏠 HomePage - configLoading:', configLoading);
  
  // TODOS LOS HOOKS DEBEN IR AQUÍ, ANTES DE CUALQUIER RETURN O IF
  const [showMainContent, setShowMainContent] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [mounted, setMounted] = useState(false)

  
  // Blogs dinámicos
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [errorBlogs, setErrorBlogs] = useState("");

  useEffect(() => {
    setMounted(true)
    const hasVisited = sessionStorage.getItem("hasVisited")
    const forceShowVideo = sessionStorage.getItem("showIntroVideo") === "true"
    if (forceShowVideo || !hasVisited) {
      setShowVideo(true)
      setShowMainContent(false)
      sessionStorage.setItem("hasVisited", "true")
      sessionStorage.removeItem("showIntroVideo")
    } else {
      setShowVideo(false)
      setShowMainContent(true)
    }
  }, [])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
        const res = await axios.get(`${API_URL}/admin/blogs/`);
        setBlogs((res.data as any[]).slice(0, 4)); // Solo los 4 más recientes
        setErrorBlogs("");
      } catch (err) {
        setErrorBlogs("Error loading blogs");
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleVideoEnd = () => {
    setShowVideo(false)
    setShowMainContent(true)
  }

  const handleLogoClick = () => {
    sessionStorage.setItem("showIntroVideo", "true")
    setShowVideo(true)
    setShowMainContent(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    )
  }

  // Debug info
  console.log("🎯 Current render state:", { showVideo, showMainContent, mounted })

  // BLOGS Y NOTICIAS
  // Mapeo de categorías traducidas
  const categoryTranslationMap: Record<string, string> = {
    "Diseño Interior": t("interiorDesignCategory"),
    "Sostenibilidad": t("sustainabilityCategory"),
    "Corporativo": t("corporateCategory"),
    "Residencial": t("residentialCategory"),
    "Interior Design": t("interiorDesignCategory"),
    "Sustainability": t("sustainabilityCategory"),
    "Corporate": t("corporateCategory"),
    "Residential": t("residentialCategory"),
  };

  return (
    <div className="min-h-screen bg-white neutra-font">
      <Header currentPage="inicio" onLogoClick={handleLogoClick} />
      {/* VIDEO DE INTRO - Pantalla de carga */}
      {showVideo && <IntroVideo onVideoEnd={handleVideoEnd} />}
      {/* CONTENIDO PRINCIPAL */}
      {showMainContent && (
        <>
          {/* HERO PRINCIPAL */}
          <section className="w-full py-10 md:py-16 bg-gradient-to-b from-white via-blue-50 to-gray-100">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl neutra-font-black text-blue-700 mb-6 drop-shadow-md">
                  {t("homeHeroTitle")}
                </h1>
                <p className="text-2xl text-gray-700 mb-6 neutra-font max-w-2xl mx-auto">
                  {t("homeHeroDescription")}
                </p>
                <Link href="/disena">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-10 py-4 rounded-full neutra-font-black shadow-xl text-lg">
                    {t("startProject")}
                  </Button>
                </Link>
              </div>
            </div>
            {/* URBANUNITY TEXTO GIGANTE CON SCROLL - ANCHO COMPLETO */}
            <div className="w-full overflow-hidden whitespace-nowrap mb-6">
              <div className="inline-block text-8xl md:text-9xl lg:text-[12rem] font-black text-blue-600 animate-scroll-continuous">
                URBANUNITY URBANUNITY URBANUNITY URBANUNITY URBANUNITY URBANUNITY URBANUNITY URBANUNITY URBANUNITY
                URBANUNITY URBANUNITY URBANUNITY
              </div>
            </div>
            {/* VIDEO DE INTERIOR - ANCHO COMPLETO - SOLO .webm */}
            <div className="w-full mb-6">
                              <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden relative bg-gradient-to-br from-blue-100 to-gray-200">
                

                
                {/* Video element - now visible */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  controls={false}
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  onLoadStart={() => console.log('🎥 Video loading started')}
                  onCanPlay={() => {
                    console.log('🎥 Video can play');
                    // Intentar reproducir manualmente si no se reproduce automáticamente
                    const video = document.querySelector('video') as HTMLVideoElement;
                    if (video && video.paused) {
                      console.log('🎥 Attempting to play video manually');
                      video.play().catch(e => console.log('🎥 Manual play failed:', e));
                    }
                  }}
                  onLoadedData={() => console.log('🎥 Video data loaded')}
                  onPlay={() => console.log('🎥 Video started playing')}
                  onPause={() => console.log('🎥 Video paused')}
                  onError={(e) => {
                    console.log('🎥 Video error:', e);
                    const video = e.target as HTMLVideoElement;
                    console.log('🎥 Video error details:', {
                      error: video.error,
                      networkState: video.networkState,
                      readyState: video.readyState,
                      src: video.src
                    });
                  }}
                >
                  <source src="/videos/interior-video.webm" type="video/webm" />
                  <p>Tu navegador no soporta videos.</p>
                </video>
                

              </div>
            </div>
            <style jsx>{`
              @keyframes scroll-continuous {
                0% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .animate-scroll-continuous {
                animation: scroll-continuous 80s linear infinite;
              }
            `}</style>
          </section>
          <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-4" />
          {/* CALCULADORA */}
          <section className="w-full py-8 md:py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <PriceCalculator />
              </div>
            </div>
          </section>
          <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-4" />
          {/* PROYECTOS CON GOOGLE MAPS */}
          <section className="w-full py-10 md:py-16 bg-gradient-to-b from-blue-50 via-white to-gray-100">
            <div className="container mx-auto px-4">
              <div className="text-center mb-6">
                <h2 className="text-5xl md:text-6xl neutra-font-black text-blue-600 mb-4 drop-shadow-md">{t("projectsSectionTitle")}</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6 neutra-font">{t("projectsSectionDescription")}</p>
              </div>
              <div className="mb-6 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-xl">
                <GoogleMapsWorking
                  apiKey="AIzaSyC2NBqGaRtCaiAcFyKw2eB1jrLPD1rBKPA"
                  height="600px"
                  zoom={4}
                  center={{ lat: 10, lng: -40 }}
                />
              </div>
              <div className="text-center">
                <Link href="/proyectos">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-10 py-4 rounded-full neutra-font-black shadow-xl text-lg">
                    {t("viewAllProjects")}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-4" />
          {/* BLOGS/NOTICIAS */}
          <section className="w-full py-10 md:py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-6">
                <h2 className="text-5xl md:text-6xl neutra-font-black text-blue-600 mb-4 drop-shadow-md">{t("newsTitle")}</h2>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6 neutra-font">{t("newsSubtitle")}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-10 mb-8">
                {loadingBlogs ? (
                  <div className="col-span-2 text-center py-10 text-gray-500">{t("loading")}...</div>
                ) : errorBlogs ? (
                  <div className="col-span-2 text-center py-10 text-red-500">{errorBlogs}</div>
                ) : blogs.length === 0 ? (
                  <div className="col-span-2 text-center py-10 text-gray-500">{t("noBlogs")}</div>
                ) : (
                  blogs.map((post) => (
                  <Card key={post.id} className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-full md:w-1/3 flex items-center justify-center p-6">
                          <Image src={getBlogImageUrl(post)} alt={post.title || "Imagen del post"} width={150} height={120} className="rounded-xl object-cover border border-blue-100" />
                      </div>
                      <div className="w-full md:w-2/3 p-6">
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                            {categoryTranslationMap[post.category] || post.category}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                              • {post.date} • {post.read_time || post.readTime}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-4 text-lg leading-tight">{post.title}</h3>
                        <Link href={`/blog/${post.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent shadow-md"
                          >
                            {t("readArticle")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </div>
              <div className="text-center">
                <Link href="/blog">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-10 py-4 rounded-full neutra-font-black shadow-xl text-lg">
                    {t("viewAllArticles")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-4" />
          <Footer />
        </>
      )}
    </div>
  )
}
