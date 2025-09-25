'use client';

import { useState, useEffect } from 'react';
import { createProject, updateProject, getProject } from '@/lib/api-projects';

interface ProjectEditorProps {
  projectId?: number;
  onSave?: (formData: any) => Promise<void>;
  onCancel?: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  year: string;
  location: string;
  latitude: string;
  longitude: string;
  show_on_map: boolean;
  status: string;
  featured: boolean;
  page_title: string;
  color: string;
  services: string;
  size: string;
}

export default function ProjectEditor({ projectId, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    type: '',
    year: '',
    location: '',
    latitude: '',
    longitude: '',
    show_on_map: false,
    status: 'Planning',
    featured: false,
    page_title: '',
    color: 'AZUL PRIMARIO',
    services: '',
    size: '145',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const project = await getProject(projectId!);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || '',
        type: project.type || '',
        year: project.year || '',
        location: project.location || '',
        latitude: project.latitude?.toString() || '',
        longitude: project.longitude?.toString() || '',
        show_on_map: project.show_on_map || false,
        status: project.status || 'Planning',
        featured: project.featured || false,
        page_title: project.title || '',
        color: 'AZUL PRIMARIO',
        services: project.description || '',
        size: '145',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleExtraImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const newExtraImages = [...extraImages];
      newExtraImages[index] = e.target.files[0];
      setExtraImages(newExtraImages);
    }
  };

  const addExtraImage = () => {
    setExtraImages([...extraImages, null as any]);
  };

  const removeExtraImage = (index: number) => {
    const newExtraImages = extraImages.filter((_, i) => i !== index);
    setExtraImages(newExtraImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar datos para enviar al dashboard
      const dataToSend = {
        ...formData,
        image: image,
        images: extraImages.filter(img => img !== null) // Filtrar imágenes nulas
      };

      console.log('📋 Enviando datos al dashboard:', dataToSend);
      console.log('📸 Imágenes adicionales:', extraImages);
      console.log('📸 Imágenes adicionales filtradas:', extraImages.filter(img => img !== null));

      // Llamar a la función onSave del dashboard
      if (onSave) {
        await onSave(dataToSend);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando proyecto');
    } finally {
      setLoading(false);
    }
  };

  if (loading && projectId) {
    return <div className="p-4">Cargando proyecto...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {projectId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-white hover:text-gray-200 text-3xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md">
              <div className="flex">
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del proyecto */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del proyecto <span className="text-red-500">*</span>
                  </label>
              <input
                type="text"
                    name="title"
                    value={formData.title}
                onChange={handleInputChange}
                required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Complejo Residencial Vista Hermosa"
              />
            </div>

                {/* Título de la página */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la página
                  </label>
              <input
                type="text"
                    name="page_title"
                    value={formData.page_title}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Título que aparece en la página de detalle (opcional)"
              />
          </div>

                {/* Color */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="AZUL PRIMARIO">AZUL PRIMARIO</option>
                    <option value="VERDE">VERDE</option>
                    <option value="ROJO">ROJO</option>
                    <option value="AMARILLO">AMARILLO</option>
              </select>
          </div>

                {/* Servicios */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicios <span className="text-red-500">*</span>
                  </label>
              <input
                type="text"
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Servicios ofrecidos"
              />
          </div>

                {/* Año */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año <span className="text-red-500">*</span>
                  </label>
              <input
                    type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                    min="2000"
                    max="2030"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="2023"
              />
            </div>

                {/* Categoría */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="institucional">Institucional</option>
                    <option value="industrial">Industrial</option>
              </select>
            </div>

                {/* Tipo */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="oficina">Oficina</option>
                    <option value="local">Local Comercial</option>
              </select>
          </div>

                {/* Tamaño */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño <span className="text-red-500">*</span>
                  </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="145"
              />
            </div>

                {/* Ubicación */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación <span className="text-red-500">*</span>
                  </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Zona Norte, La Paz"
              />
            </div>

                {/* Estado */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Planning">Planificación</option>
                    <option value="In Progress">En Progreso</option>
                    <option value="Completed">Completado</option>
                    <option value="On Hold">En Pausa</option>
              </select>
                </div>
            </div>
          </div>

            {/* Ubicación en el mapa */}
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Ubicación en el mapa
                </h3>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latitud */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
              onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ejemplo: 40.416775"
            />
                  <p className="text-xs text-gray-500 mt-1">Entre -90 y 90</p>
          </div>

                {/* Longitud */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ejemplo: -3.703790"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre -180 y 180</p>
                </div>

                {/* Mostrar en mapa */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="show_on_map"
                      checked={formData.show_on_map}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Mostrar en el mapa de la página de inicio
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-2">💡</div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Consejo:</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Puedes obtener las coordenadas buscando la ubicación en Google Maps, haciendo clic derecho y 
                      seleccionando las coordenadas que aparecen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Características */}
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-green-200 pb-2">
                Características
              </h3>
              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe las características principales del proyecto..."
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Agregar
                  </button>
            </div>
          </div>
            </div>

            {/* Imagen principal */}
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-blue-200 pb-2">
                Imagen principal
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta será la imagen destacada del proyecto
              </p>
              
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {image && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">{image.name}</p>
                    <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Imágenes adicionales */}
            <div className="bg-orange-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-orange-200 pb-2">
                Imágenes adicionales
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Las imágenes se mostrarán en una cuadrícula de 1-4 columnas que se adapta automáticamente
              </p>
              
            <div className="space-y-4">
                {extraImages.map((extraImage, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen {index + 1}
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleExtraImageChange(e, index)}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                      <button
                      type="button"
                        onClick={() => removeExtraImage(index)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                    {extraImage && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">{extraImage.name}</p>
                        <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(extraImage)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={addExtraImage}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
          </div>

            {/* Proyecto destacado */}
            <div className="bg-yellow-50 p-6 rounded-xl">
              <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
                  className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Proyecto destacado <span className="text-gray-500">(aparecerá en la página principal)</span>
                </span>
              </label>
          </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
              Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  projectId ? 'Actualizar Proyecto' : 'Crear Proyecto'
                )}
              </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}