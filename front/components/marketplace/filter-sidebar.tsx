"use client"

import { useState } from "react"
import { X, ChevronDown, ChevronUp } from "lucide-react"

interface FilterSidebarProps {
  unit: "sqft" | "m2"
  setUnit: (unit: "sqft" | "m2") => void
  filters: Record<string, any>
  setFilters: (filters: Record<string, any>) => void
}

export default function FilterSidebar({ unit, setUnit, filters, setFilters }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    area: true,
    bedrooms: true,
    bathrooms: true,
    garage: true,
    architecturalStyle: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleFilter = (category: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category]?.includes(value)
        ? prev[category].filter((item: string) => item !== value)
        : [...(prev[category] || []), value],
    }))
  }

  const clearAllFilters = () => {
    setFilters({})
  }

  const areaOptions = {
    m2: [
      { label: "Menos de 100", value: "0-100" },
      { label: "100-200", value: "100-200" },
      { label: "200+", value: "200+" },
    ],
    sqft: [
      { label: "Menos de 1,076", value: "0-1076" },
      { label: "1,076-2,153", value: "1076-2153" },
      { label: "2,153+", value: "2153+" },
    ],
  }

  const bedroomOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4+", value: "4" },
  ]

  const bathroomOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3+", value: "3" },
  ]

  const garageOptions = [
    { label: "0", value: "0" },
    { label: "1", value: "1" },
    { label: "2+", value: "2" },
  ]

  const priceOptions = [
    { label: "Menos de $500", value: "0-500" },
    { label: "$500 - $1,000", value: "500-1000" },
    { label: "$1,000 - $2,000", value: "1000-2000" },
    { label: "$2,000+", value: "2000+" },
  ]

  const styleOptions = [
    { label: "Modern", value: "Modern" },
    { label: "Contemporary", value: "Contemporary" },
    { label: "Traditional", value: "Traditional" },
    { label: "Minimalist", value: "Minimalist" },
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 p-3 rounded-l-xl shadow-xl z-10 hover:bg-white/30 transition-all duration-300"
      >
        Filtros
      </button>
    )
  }

  return (
    <div className="w-80 sticky top-[calc(6rem+2rem)] h-[calc(100vh-16rem)] mt-0">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden h-full flex flex-col">
        {/* Gradient overlay for extra glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl"></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Filter</h2>
              <div className="flex gap-2">
                <button 
                  onClick={clearAllFilters}
                  className="text-[#0D00FF] text-sm hover:text-[#0D00FF]/80 transition-colors"
                >
                  Clear All
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <button className="w-full bg-[#0D00FF] backdrop-blur-sm text-white py-3 rounded-xl hover:bg-[#0D00FF]/90 transition-all duration-300 shadow-lg border border-[#0D00FF]/30">
              Save Search
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <div className="space-y-6">
              {/* Price Filter */}
              <div>
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Price Range</span>
                  {expandedSections.price ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.price && (
                  <div className="space-y-2">
                    {priceOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.price?.includes(option.value) || false}
                          onChange={() => toggleFilter('price', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Area Filter */}
              <div>
                <button
                  onClick={() => toggleSection('area')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Area ({unit === "m2" ? "m²" : "sq.ft"})</span>
                  {expandedSections.area ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.area && (
                  <div className="space-y-2">
                    {areaOptions[unit].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.area?.includes(option.value) || false}
                          onChange={() => toggleFilter('area', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Bedrooms Filter */}
              <div>
                <button
                  onClick={() => toggleSection('bedrooms')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Bedrooms</span>
                  {expandedSections.bedrooms ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.bedrooms && (
                  <div className="space-y-2">
                    {bedroomOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.bedrooms?.includes(option.value) || false}
                          onChange={() => toggleFilter('bedrooms', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Bathrooms Filter */}
              <div>
                <button
                  onClick={() => toggleSection('bathrooms')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Bathrooms</span>
                  {expandedSections.bathrooms ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.bathrooms && (
                  <div className="space-y-2">
                    {bathroomOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.bathrooms?.includes(option.value) || false}
                          onChange={() => toggleFilter('bathrooms', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Garage Filter */}
              <div>
                <button
                  onClick={() => toggleSection('garage')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Garage Spaces</span>
                  {expandedSections.garage ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.garage && (
                  <div className="space-y-2">
                    {garageOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.garage?.includes(option.value) || false}
                          onChange={() => toggleFilter('garage', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Architectural Style Filter */}
              <div>
                <button
                  onClick={() => toggleSection('architecturalStyle')}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <span className="font-semibold text-gray-800">Architectural Style</span>
                  {expandedSections.architecturalStyle ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                
                {expandedSections.architecturalStyle && (
                  <div className="space-y-2">
                    {styleOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.architecturalStyle?.includes(option.value) || false}
                          onChange={() => toggleFilter('architecturalStyle', option.value)}
                          className="rounded border-gray-300 text-[#0D00FF] focus:ring-[#0D00FF]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
