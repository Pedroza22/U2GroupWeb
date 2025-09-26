import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://u2-group-backend.onrender.com/api";

// Interfaces para tipado
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface DesignService {
  id: number;
  name_en: string;
  name_es: string;
  price_min_usd?: number;
  area_max_m2?: number;
  max_units?: number;
  notes?: string;
  category_id: number;
  category_name?: string;
}

export interface DesignCategory {
  id: number;
  name: string;
  emoji: string;
  services: DesignService[];
}

export interface DesignEntry {
  id: number;
  title: string;
  description: string;
  image: string;
  created_at: string;
}

// Headers de autenticación para admin
const getAuthHeaders = () => {
  const adminToken = localStorage.getItem('u2-admin-token');
  return {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };
};

// Obtener todos los servicios de diseño
export async function getDesignServices(): Promise<ApiResponse<DesignCategory[]>> {
  try {
    console.log('🔧 Cargando servicios de diseño...');
    
    const response = await axios.get<ApiResponse<DesignCategory[]>>(`${API_URL}/admin/design/services/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Servicios cargados:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cargando servicios de diseño:', error);
    throw error;
  }
}

// Obtener categorías
export async function getDesignCategories() {
  try {
    console.log('🔧 Cargando categorías de diseño...');
    
    const response = await axios.get(`${API_URL}/admin/design/categories/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Categorías cargadas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cargando categorías:', error);
    throw error;
  }
}

// Crear nueva categoría
export async function createDesignCategory(categoryData: {
  name: string;
  emoji: string;
}) {
  try {
    console.log('🔧 Creando categoría de diseño:', categoryData);
    
    const response = await axios.post(`${API_URL}/admin/design/categories/create/`, categoryData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Categoría creada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando categoría:', error);
    throw error;
  }
}

// Actualizar categoría
export async function updateDesignCategory(categoryId: number, categoryData: {
  name: string;
  emoji: string;
}) {
  try {
    console.log('🔧 Actualizando categoría:', categoryId, categoryData);
    
    const response = await axios.put(`${API_URL}/admin/design/categories/${categoryId}/`, categoryData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Categoría actualizada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando categoría:', error);
    throw error;
  }
}

// Eliminar categoría
export async function deleteDesignCategory(categoryId: number) {
  try {
    console.log('🔧 Eliminando categoría:', categoryId);
    
    const response = await axios.delete(`${API_URL}/admin/design/categories/${categoryId}/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Categoría eliminada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error eliminando categoría:', error);
    throw error;
  }
}

// Crear nuevo servicio
export async function createDesignService(serviceData: {
  name_en: string;
  name_es: string;
  price_min_usd?: number;
  area_max_m2?: number;
  max_units?: number;
  notes?: string;
  category_id: number;
}) {
  try {
    console.log('🔧 Creando servicio de diseño:', serviceData);
    
    const response = await axios.post(`${API_URL}/admin/design/services/create/`, serviceData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Servicio creado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creando servicio:', error);
    throw error;
  }
}

// Actualizar servicio
export async function updateDesignService(serviceId: number, serviceData: {
  name_en: string;
  name_es: string;
  price_min_usd?: number;
  area_max_m2?: number;
  max_units?: number;
  notes?: string;
  category_id: number;
}) {
  try {
    console.log('🔧 Actualizando servicio:', serviceId, serviceData);
    
    const response = await axios.put(`${API_URL}/admin/design/services/${serviceId}/`, serviceData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Servicio actualizado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando servicio:', error);
    throw error;
  }
}

// Eliminar servicio
export async function deleteDesignService(serviceId: number) {
  try {
    console.log('🔧 Eliminando servicio:', serviceId);
    
    const response = await axios.delete(`${API_URL}/admin/design/services/${serviceId}/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Servicio eliminado:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error eliminando servicio:', error);
    throw error;
  }
}

// Obtener entradas de diseño
export async function getDesignEntries() {
  try {
    console.log('🔧 Cargando entradas de diseño...');
    
    const response = await axios.get(`${API_URL}/admin/design/entries/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Entradas cargadas:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cargando entradas:', error);
    throw error;
  }
}

// Obtener configuración de diseño
export async function getDesignConfig() {
  try {
    console.log('🔧 Cargando configuración de diseño...');
    
    const response = await axios.get(`${API_URL}/admin/design/config/`, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Configuración cargada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error cargando configuración:', error);
    throw error;
  }
}

// Actualizar configuración de diseño
export async function updateDesignConfig(configData: Record<string, string>) {
  try {
    console.log('🔧 Actualizando configuración de diseño:', configData);
    
    const response = await axios.put(`${API_URL}/admin/design/config/`, configData, {
      headers: getAuthHeaders()
    });
    
    console.log('✅ Configuración actualizada:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error actualizando configuración:', error);
    throw error;
  }
}
