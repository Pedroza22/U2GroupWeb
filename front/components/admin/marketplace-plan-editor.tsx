'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Home, 
  Bed, 
  Bath, 
  Car, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X, 
  Plus, 
  Save, 
  Edit, 
  Trash2
} from 'lucide-react'
import { MarketplaceProduct } from '@/lib/api-marketplace'

interface Props {
  product?: MarketplaceProduct
  onSave: (product: MarketplaceProduct | FormData) => void
  onDelete?: (id: number) => void
  onClose: () => void
  isEditing?: boolean
}

export default function MarketplacePlanEditor(props: Props) {
  const { product, onSave, onDelete, onClose, isEditing = false } = props
  
  // Key estable para evitar problemas de renderizado
  const componentKey = product?.id || 'new-product'
  
  const [isEditingMode, setIsEditingMode] = useState(isEditing)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('floor-plan')
  
  // Para manejar archivos de imagen
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [formData, setFormData] = useState<MarketplaceProduct>({
    id: product?.id || 0,
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'residential',
    style: product?.style || 'modern',
    price: product?.price || 0,
    area_m2: product?.area_m2 || 0,
    rooms: product?.rooms || 1,
    bathrooms: product?.bathrooms || 1,
    floors: product?.floors || 1,
    features: product?.features || [],
    is_featured: product?.is_featured || false,
    is_active: product?.is_active !== false,
    image: product?.image || '',
    images: product?.images || [],
    included_items: product?.included_items || [
      'Elevations',
      'Fully Dimensioned Floor Plans', 
      'Roof Plan & Sections',
      'Foundation plan',
      'Framing plans',
      'Suggested Electrical Layout'
    ],
    not_included_items: product?.not_included_items || [
      'Engineering Stamp - Handled locally if required',
      'Site plan - Handled locally when site mapping',
      'HVAC or equipment and duct work - your subcontractor handles this',
      'Plumbing Drawings - your subcontractor handles this',
      'Energy calculations - handled locally when required'
    ],
    price_pdf_m2: product?.price_pdf_m2 || 1000,
    price_pdf_sqft: product?.price_pdf_sqft || 1000,
    price_editable_m2: product?.price_editable_m2 || 1500,
    price_editable_sqft: product?.price_editable_sqft || 1500,
    area_sqft: product?.area_sqft || 0,
    area_unit: product?.area_unit || 'sqft',
    garage_spaces: product?.garage_spaces || 2,
    main_level_images: product?.main_level_images || [],
    created_at: product?.created_at || new Date().toISOString(),
    updated_at: product?.updated_at || new Date().toISOString()
  })

  // Log cuando se inicializa el componente
  useEffect(() => {
    console.log('🎬 MarketplacePlanEditor inicializado')
    console.log('🎬 product:', product)
    console.log('🎬 formData.id:', formData.id)
    console.log('🎬 isEditing:', isEditing)
  }, [product, formData.id, isEditing])

  // Limpiar URLs de blob cuando se desmonte el componente
  useEffect(() => {
    return () => {
      // Limpiar URLs de blob para evitar memory leaks
      if (mainImageFile) {
        const imageUrl = formData.image
        if (imageUrl && imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl)
        }
      }
      
      imageFiles.forEach(file => {
        const imageUrl = URL.createObjectURL(file)
        URL.revokeObjectURL(imageUrl)
      })
    }
  }, [mainImageFile, imageFiles])

  // Inicializar imágenes existentes cuando se carga un producto para editar
  useEffect(() => {
    if (product && product.id) {
      console.log('🖼️ Inicializando imágenes existentes para producto:', product.id)
      console.log('🖼️ Imagen principal:', product.image)
      console.log('🖼️ Imágenes múltiples:', product.images)
      console.log('🖼️ Cantidad de imágenes:', product.images?.length || 0)
      
      // Asegurar que las imágenes se muestren correctamente
      setFormData(prev => {
        const updatedFormData = {
          ...prev,
          image: product.image || '',
          images: product.images || []
        }
        console.log('🖼️ formData actualizado con imágenes:', updatedFormData.images)
        
        // Limpiar archivos de imagen previos
        setMainImageFile(null)
        setImageFiles([])
        
        return updatedFormData
      })
    }
  }, [product])

  const nextImage = () => {
    const totalImages = (formData.images || []).filter(Boolean).length
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages)
    }
  }

  const prevImage = () => {
    const totalImages = (formData.images || []).filter(Boolean).length
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (file: File) => {
    console.log('🖼️ handleImageChange llamado con:', file.name, file.size, file.type)
    setMainImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    console.log('🖼️ URL de blob creada:', imageUrl)
    setFormData(prev => {
      const updated = {
        ...prev,
        image: imageUrl,
        // Agregar la imagen principal al array de imágenes también
        images: [imageUrl, ...(prev.images || []).filter(img => img !== prev.image)]
      }
      console.log('🖼️ formData actualizado:', updated)
      return updated
    })
    setCurrentImageIndex(0)
  }

  const handleMultipleImagesChange = (files: FileList) => {
    console.log('🖼️ handleMultipleImagesChange llamado con:', files.length, 'archivos')
    const newFiles = Array.from(files)
    setImageFiles(newFiles)
    
    // Solo crear URLs de blob para las nuevas imágenes
    const newImageUrls = newFiles.map(file => {
      const url = URL.createObjectURL(file)
      console.log('🖼️ URL de blob creada para:', file.name, '->', url)
      return url
    })
    
    // Mantener las imágenes existentes del servidor y agregar las nuevas
    setFormData(prev => {
      const existingServerImages = (prev.images || []).filter(img => 
        img && !img.startsWith('blob:') && (img.startsWith('http') || img.startsWith('/media/'))
      )
      
      console.log('🖼️ Imágenes existentes del servidor:', existingServerImages.length)
      console.log('🖼️ Nuevas imágenes (blobs):', newImageUrls.length)
      
      const updated = {
        ...prev,
        images: [...existingServerImages, ...newImageUrls]
      }
      console.log('🖼️ formData actualizado con imágenes:', updated.images)
      return updated
    })
    setCurrentImageIndex(0)
  }

  const handleRemoveImage = (index: number) => {
    console.log('🗑️ Eliminando imagen en índice:', index)
    
    setFormData(prev => {
      const newImages = [...(prev.images || [])]
      const removedImage = newImages.splice(index, 1)[0]
      
      console.log('🗑️ Imagen eliminada:', removedImage)
      console.log('🗑️ Imágenes restantes:', newImages.length)
      
      // Ajustar el índice actual si es necesario
      if (currentImageIndex >= newImages.length && newImages.length > 0) {
        setCurrentImageIndex(newImages.length - 1)
      } else if (newImages.length === 0) {
        setCurrentImageIndex(0)
      } else if (currentImageIndex >= index && currentImageIndex > 0) {
        setCurrentImageIndex(currentImageIndex - 1)
      }
      
      return {
        ...prev,
        images: newImages
      }
    })
  }

  const handleIncludedItemChange = (index: number, value: string) => {
    const newItems = [...(formData.included_items || [])]
    newItems[index] = value
    setFormData(prev => ({ ...prev, included_items: newItems }))
  }

  const handleNotIncludedItemChange = (index: number, value: string) => {
    const newItems = [...(formData.not_included_items || [])]
    newItems[index] = value
    setFormData(prev => ({ ...prev, not_included_items: newItems }))
  }

  const addIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      included_items: [...(prev.included_items || []), '']
    }))
  }

  const addNotIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      not_included_items: [...(prev.not_included_items || []), '']
    }))
  }

  const removeIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      included_items: prev.included_items?.filter((_, i) => i !== index) || []
    }))
  }

  const removeNotIncludedItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      not_included_items: prev.not_included_items?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSave = async () => {
    console.log('💾 Iniciando guardado de producto...')
    console.log('📊 Estado actual:', {
      productId: formData.id,
      isEditing: !!product,
      mainImageFile: mainImageFile ? `${mainImageFile.name} (${mainImageFile.size} bytes)` : 'null',
      imageFiles: imageFiles.length,
      formData: formData
    })
    
    // Determinar si hay archivos nuevos para enviar
    const hasNewMainImage = mainImageFile !== null
    const hasNewImages = imageFiles.length > 0
    
    // Crear FormData para enviar archivos (siempre usar FormData para actualizaciones con imágenes)
    const formDataToSend = new FormData()
    
    // Agregar datos básicos
    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description || '')
    formDataToSend.append('category', formData.category)
    formDataToSend.append('style', formData.style)
    formDataToSend.append('price', formData.price.toString())
    formDataToSend.append('area_m2', formData.area_m2.toString())
    formDataToSend.append('rooms', formData.rooms.toString())
    formDataToSend.append('bathrooms', formData.bathrooms.toString())
    formDataToSend.append('floors', formData.floors.toString())
    formDataToSend.append('features', JSON.stringify(formData.features || []))
    formDataToSend.append('is_featured', formData.is_featured.toString())
    formDataToSend.append('is_active', formData.is_active.toString())
    formDataToSend.append('included_items', JSON.stringify(formData.included_items || []))
    formDataToSend.append('not_included_items', JSON.stringify(formData.not_included_items || []))
    formDataToSend.append('price_editable_m2', (formData.price_editable_m2 || 0).toString())
    formDataToSend.append('price_editable_sqft', (formData.price_editable_sqft || 0).toString())
    formDataToSend.append('price_pdf_m2', (formData.price_pdf_m2 || 0).toString())
    formDataToSend.append('price_pdf_sqft', (formData.price_pdf_sqft || 0).toString())
    formDataToSend.append('area_sqft', (formData.area_sqft || 0).toString())
    formDataToSend.append('area_unit', formData.area_unit || 'm2')
    formDataToSend.append('garage_spaces', (formData.garage_spaces || 0).toString())
    formDataToSend.append('main_level_images', JSON.stringify(formData.main_level_images || []))
    
    // Agregar ID si existe (para actualizaciones)
    if (formData.id) {
      formDataToSend.append('id', formData.id.toString())
    }
    
    // Agregar imagen principal si existe
    if (hasNewMainImage) {
      console.log('📤 Agregando imagen principal nueva al FormData:', mainImageFile!.name, mainImageFile!.size, mainImageFile!.type)
      formDataToSend.append('image', mainImageFile!)
    } else if (formData.image && formData.image.startsWith('blob:')) {
      console.log('📤 Agregando imagen principal desde blob URL')
      // Si no hay archivo pero hay una URL de blob, convertirla a archivo
      try {
        const response = await fetch(formData.image)
        const blob = await response.blob()
        const file = new File([blob], 'main_image.jpg', { type: blob.type })
        formDataToSend.append('image', file)
        console.log('📤 Imagen principal convertida y agregada')
      } catch (error) {
        console.error('❌ Error convirtiendo imagen principal:', error)
      }
    }
    
    // Agregar imágenes múltiples si existen
    if (hasNewImages) {
      console.log('📤 Agregando imágenes múltiples nuevas:', imageFiles.length)
      imageFiles.forEach((imageFile, index) => {
        console.log(`📤 Imagen nueva ${index + 1}:`, imageFile.name, imageFile.size)
        formDataToSend.append(`images`, imageFile)
      })
    } else {
      // Agregar imágenes desde blob URLs si no hay archivos nuevos
      const blobImages = (formData.images || []).filter(img => img && img.startsWith('blob:'))
      if (blobImages.length > 0) {
        console.log('📤 Agregando imágenes desde blob URLs:', blobImages.length)
        for (let i = 0; i < blobImages.length; i++) {
          try {
            const response = await fetch(blobImages[i])
            const blob = await response.blob()
            const file = new File([blob], `image_${i}.jpg`, { type: blob.type })
            formDataToSend.append('images', file)
            console.log(`📤 Imagen ${i + 1} convertida y agregada`)
          } catch (error) {
            console.error(`❌ Error convirtiendo imagen ${i + 1}:`, error)
          }
        }
      }
    }
    
    // Para actualizaciones, enviar solo las URLs de imágenes del servidor (no blobs)
    if (product && formData.id) {
      console.log('📤 Procesando imágenes para actualización...')
      
      // Filtrar solo las imágenes que son URLs del servidor (no blobs)
      const serverImages = (formData.images || []).filter(img => 
        img && !img.startsWith('blob:') && (img.startsWith('http') || img.startsWith('/media/'))
      )
      
      console.log('📤 Imágenes del servidor a mantener:', serverImages.length)
      console.log('📤 URLs de imágenes del servidor:', serverImages)
      
      formDataToSend.append('updated_images', JSON.stringify(serverImages))
    }
    
    // Verificar contenido del FormData
    console.log('📋 Contenido del FormData:')
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    console.log('🚀 Enviando FormData al servidor...')
    
    // Enviar FormData
    onSave(formDataToSend as any)
  }

  const handleDelete = () => {
    if (product?.id && onDelete) {
      onDelete(product.id)
    }
  }

  const handlePriceChange = (type: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleMainLevelImagesChange = (files: FileList) => {
    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      const imageUrl = URL.createObjectURL(file)
      newImages.push(imageUrl)
    })
    setFormData(prev => ({
      ...prev,
      main_level_images: [...(prev.main_level_images || []), ...newImages]
    }))
  }

  const removeMainLevelImage = (index: number) => {
    const newImages = formData.main_level_images?.filter((_, i) => i !== index) || []
    setFormData(prev => ({ ...prev, main_level_images: newImages }))
  }

  return (
    <div key={componentKey} className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">U2Group Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            {isEditingMode ? (
              <>
                <Button 
                  onClick={async () => {
                    try {
                      await handleSave()
                    } catch (error) {
                      console.error('❌ Error en handleSave:', error)
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button onClick={() => setIsEditingMode(false)} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditingMode(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                {product && (
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
                <Button onClick={onClose} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cerrar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <div className="aspect-[4/3] relative overflow-hidden rounded-2xl">
            <Image
              src={(() => {
                const validImages = (formData.images || []).filter(Boolean);
                console.log('🖼️ Renderizando imagen principal:');
                console.log('  - validImages:', validImages.length);
                console.log('  - currentImageIndex:', currentImageIndex);
                console.log('  - formData.image:', formData.image);
                
                if (validImages.length > 0 && currentImageIndex < validImages.length) {
                  const selectedImage = validImages[currentImageIndex];
                  console.log('  - Usando imagen de array:', selectedImage);
                  return selectedImage;
                }
                
                if (formData.image) {
                  console.log('  - Usando imagen principal:', formData.image);
                  return formData.image;
                }
                
                console.log('  - Usando placeholder');
                return '/placeholder.svg';
              })()}
              alt={formData.name || 'Imagen del producto'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                console.error('❌ Error cargando imagen:', e);
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            
            {(() => {
              const validImages = (formData.images || []).filter(Boolean);
              if (validImages.length > 1) {
                return (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                );
              }
              return null;
            })()}

            {isEditingMode && (
              <div className="absolute top-4 left-4 space-y-2">
                <Button
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-900"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) handleImageChange(file)
                    }
                    input.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar Imagen Principal
                </Button>
                <Button
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-900"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files
                      if (files) handleMultipleImagesChange(files)
                    }
                    input.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Multiples Imagenes
                </Button>
              </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {(() => {
                const validImages = (formData.images || []).filter(Boolean);
                const totalImages = validImages.length || 1;
                const currentIndex = Math.min(currentImageIndex + 1, totalImages);
                return `${currentIndex} / ${totalImages} Images`;
              })()}
            </div>
          </div>

          {(() => {
            const validImages = (formData.images || []).filter(Boolean);
            if (validImages.length > 1) {
              return (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {validImages.map((image, index) => (
                    <div key={`thumbnail-${index}-${image}`} className="relative flex-shrink-0">
                      <button
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image || '/placeholder.svg'}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </button>
                      {isEditingMode && (
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          title="Eliminar imagen"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })()}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Plan {product?.id || 'Nuevo'}</p>
          {isEditingMode ? (
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="text-2xl font-bold text-gray-900 mb-4 border-2 border-blue-300 focus:border-blue-500"
              placeholder="Nombre del plan"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {formData.name || 'Nuevo Plan de Casa'}
            </h1>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.area_unit === 'sqft'}
              onChange={(e) => setFormData(prev => ({ ...prev, area_unit: e.target.checked ? 'sqft' : 'm2' }))}
              className="w-4 h-4 text-blue-600"
              disabled={!isEditingMode}
            />
            <input
              type="number"
              value={formData.area_sqft || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, area_sqft: Number(e.target.value) }))}
              placeholder="0"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">sq. ft.</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-gray-600" />
            <input
              type="number"
              value={formData.rooms || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, rooms: Number(e.target.value) }))}
              placeholder="1"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">bedrooms</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Bath className="h-5 w-5 text-gray-600" />
            <input
              type="number"
              value={formData.bathrooms || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
              placeholder="1"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">bathrooms</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-gray-600" />
            <input
              type="number"
              value={formData.floors || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, floors: Number(e.target.value) }))}
              placeholder="1"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">story</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-gray-600" />
            <input
              type="number"
              value={formData.garage_spaces || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, garage_spaces: Number(e.target.value) }))}
              placeholder="2"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">garage</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.area_unit === 'm2'}
              onChange={(e) => setFormData(prev => ({ ...prev, area_unit: e.target.checked ? 'm2' : 'sqft' }))}
              className="w-4 h-4 text-blue-600"
              disabled={!isEditingMode}
            />
            <input
              type="number"
              value={formData.area_m2 || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, area_m2: Number(e.target.value) }))}
              placeholder="0"
              className={`w-16 text-center border rounded px-2 py-1 ${isEditingMode ? 'border-gray-300' : 'border-transparent bg-transparent'}`}
              disabled={!isEditingMode}
            />
            <span className="text-sm text-gray-600">m2</span>
          </div>
        </div>

        {isEditingMode && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <h3 className="font-semibold mb-4">Precios Dinamicos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">PDF m2</label>
                <Input
                  type="number"
                  value={formData.price_pdf_m2 || 1000}
                  onChange={(e) => handlePriceChange('price_pdf_m2', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">PDF sq.ft</label>
                <Input
                  type="number"
                  value={formData.price_pdf_sqft || 1000}
                  onChange={(e) => handlePriceChange('price_pdf_sqft', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Editable m2</label>
                <Input
                  type="number"
                  value={formData.price_editable_m2 || 1500}
                  onChange={(e) => handlePriceChange('price_editable_m2', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Editable sq.ft</label>
                <Input
                  type="number"
                  value={formData.price_editable_sqft || 1500}
                  onChange={(e) => handlePriceChange('price_editable_sqft', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Precio Base</label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Precio base"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('floor-plan')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'floor-plan'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Floor Plan
            </button>
            <button
              onClick={() => setActiveTab('plan-details')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'plan-details'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Plan details
            </button>
            <button
              onClick={() => setActiveTab('included')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'included'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Whats Included
            </button>
            <button
              onClick={() => setActiveTab('not-included')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'not-included'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Whats not included
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'floor-plan' && (
              <div>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  {formData.main_level_images && formData.main_level_images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.main_level_images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image}
                            alt={`Main Level ${index + 1}`}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          {isEditingMode && (
                            <button
                              onClick={() => removeMainLevelImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No hay imagenes del Main Level</p>
                    </div>
                  )}
                  
                  {isEditingMode && (
                    <div className="mt-4">
                      <Button
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.multiple = true
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files
                            if (files) handleMainLevelImagesChange(files)
                          }
                          input.click()
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Cargar Imagenes del Main Level
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'plan-details' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Plan Details</h3>
                <div className="prose max-w-none">
                  {isEditingMode ? (
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full min-h-[200px] border-2 border-blue-300 focus:border-blue-500"
                      placeholder="Descripcion detallada del plan..."
                    />
                  ) : (
                    <p>{formData.description || 'Descripcion del plan de casa...'}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'included' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Whats Included</h3>
                {isEditingMode ? (
                  <div className="space-y-3">
                    {formData.included_items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-600">•</span>
                        <Input
                          value={item}
                          onChange={(e) => handleIncludedItemChange(index, e.target.value)}
                          className="flex-1 border-2 border-blue-300 focus:border-blue-500"
                          placeholder="Elemento incluido"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeIncludedItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addIncludedItem}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar elemento
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {formData.included_items?.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'not-included' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Whats Not Included</h3>
                {isEditingMode ? (
                  <div className="space-y-3">
                    {formData.not_included_items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-gray-600">•</span>
                        <Input
                          value={item}
                          onChange={(e) => handleNotIncludedItemChange(index, e.target.value)}
                          className="flex-1 border-2 border-blue-300 focus:border-blue-500"
                          placeholder="Elemento no incluido"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeNotIncludedItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addNotIncludedItem}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar elemento
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {formData.not_included_items?.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
