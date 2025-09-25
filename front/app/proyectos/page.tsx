"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useLanguage } from "@/hooks/use-language"
import { useState, useEffect } from "react"
import { getProjects } from "@/lib/api-projects"

interface BackendProject {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string | null;
  created_at: string;
}

export default function ProyectosPage() {
  const { t } = useLanguage()
  const [projects, setProjects] = useState<BackendProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        const data = await getProjects()
        console.log('Projects data from API:', data);
        setProjects(data as unknown as BackendProject[])
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white neutra-font">
        <Header currentPage="proyectos" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loading")}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white neutra-font">
      <Header currentPage="proyectos" />
      <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white via-blue-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl neutra-font-black text-blue-700 mb-8 drop-shadow-md">{t("projectsTitle")}</h1>
            <p className="text-2xl text-gray-700 mb-8 neutra-font max-w-2xl mx-auto">{t("projectsSubtitle")}</p>
          </div>
        </div>
      </section>
      <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />
      <section className="w-full py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl neutra-font-black text-blue-600 mb-4 drop-shadow-md">{t("projectsHighlights")}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
            {projects.map((project) => {
              console.log('Project for link:', project);
              return (
                <Link key={project.id} href={`/proyectos/${project.id}`}>
                  <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow cursor-pointer overflow-hidden group">
                    <div className="relative h-56 w-full">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title || "Imagen del proyecto"}
                        fill
                        className="object-cover w-full h-full group-hover:brightness-90 transition-all duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 right-4 text-blue-600 neutra-font-bold text-lg opacity-80 bg-white bg-opacity-70 px-3 py-1 rounded-full">
                        {new Date(project.created_at).getFullYear()}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl neutra-font-black text-blue-700 mb-2">{project.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">Proyecto</span>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Arquitectura</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 neutra-font">Lat: {project.latitude}, Lng: {project.longitude}</p>
                      <p className="text-gray-700 text-sm neutra-font line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <div className="w-full h-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 my-8" />
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl neutra-font-bold mb-4 text-blue-700">{t("haveProject")}</h2>
          <p className="text-xl mb-8 text-blue-900 neutra-font">{t("contactTeam")}</p>
          <Link href="/contacto">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-10 py-4 rounded-full neutra-font-black shadow-xl text-lg">
              {t("startProject")}
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
