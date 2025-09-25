import type { Project } from "@/data/projects";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://u2-group-backend.onrender.com/api";

export async function getProjects(): Promise<Project[]> {
  console.log('📋 Obteniendo proyectos...');
  
  const res = await fetch(`${API_URL}/projects/`);
  
  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    throw new Error(`Error obteniendo proyectos: ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('✅ Proyectos obtenidos:', data);
  
  // Manejar tanto formato DRF directo como formato con success/data
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    console.log('📦 Formato con success/data detectado');
    return data.data;
  }
  
  // Django REST Framework devuelve directamente el array
  return data;
}

export async function getProject(id: number): Promise<Project> {
  console.log(`📋 Obteniendo proyecto ${id}...`);
  
  const res = await fetch(`${API_URL}/projects/${id}/`);
  
  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    throw new Error(`Error obteniendo proyecto: ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('✅ Proyecto obtenido:', data);
  
  // Django REST Framework devuelve directamente el objeto, no con success/data
  return data;
}

export async function createProject(formData: FormData): Promise<Project> {
  console.log('🚀 Creando proyecto...');
  
  const res = await fetch(`${API_URL}/projects/`, {
    method: 'POST',
    body: formData,
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    
    const errorText = await res.text();
    console.error('📄 Respuesta del servidor:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.message || errorData.detail || errorData.errors || `Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error(`Error ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const responseData = await res.json();
  console.log('✅ Proyecto creado:', responseData);
  
  // Django REST Framework devuelve directamente el objeto, no con success/data
  return responseData;
}

export async function updateProject(id: number, formData: FormData): Promise<Project> {
  console.log(`🔄 Actualizando proyecto ${id}...`);
  
  const res = await fetch(`${API_URL}/projects/${id}/`, {
    method: 'PUT',
    body: formData,
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    
    const errorText = await res.text();
    console.error('📄 Respuesta del servidor:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.message || errorData.detail || errorData.errors || `Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error(`Error ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const responseData = await res.json();
  console.log('✅ Proyecto actualizado:', responseData);
  
  // Django REST Framework devuelve directamente el objeto, no con success/data
  return responseData;
}

export async function deleteProject(id: number): Promise<void> {
  console.log(`🗑️ Eliminando proyecto ${id}...`);
  
  const res = await fetch(`${API_URL}/projects/${id}/`, {
    method: 'DELETE',
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    throw new Error(`Error eliminando proyecto: ${res.statusText}`);
  }

  console.log('✅ Proyecto eliminado');
}

export async function uploadProjectImage(projectId: number, imageFile: File): Promise<{ id: number; image: string }> {
  console.log(`📸 Subiendo imagen adicional para proyecto ${projectId}...`);
  
  const formData = new FormData();
  formData.append('project_id', projectId.toString());
  formData.append('image', imageFile);
  
  const res = await fetch(`${API_URL}/upload-project-image/`, {
    method: 'POST',
    body: formData,
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    
    const errorText = await res.text();
    console.error('📄 Respuesta del servidor:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.message || errorData.detail || errorData.errors || `Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error(`Error ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const responseData = await res.json();
  console.log('✅ Imagen adicional subida:', responseData);
  
  return responseData.data;
}

// Funciones para likes y favoritos de proyectos
export async function getProjectLikeFavorite(projectId: number): Promise<{ liked: boolean; favorited: boolean }> {
  console.log(`📋 Obteniendo estado de like/favorito para proyecto ${projectId}...`);
  
  const res = await fetch(`${API_URL}/project-interactions/?project=${projectId}`);
  
  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    return { liked: false, favorited: false };
  }
  
  const data = await res.json();
  console.log('✅ Estado de like/favorito obtenido:', data);
  
  if (data.success && data.data && data.data.length > 0) {
    const interaction = data.data[0];
    return { liked: interaction.liked, favorited: interaction.favorited };
  }
  
  return { liked: false, favorited: false };
}

export async function getProjectLikeFavoriteCount(projectId: number): Promise<{ likeCount: number; favoriteCount: number }> {
  console.log(`📋 Obteniendo conteo de likes/favoritos para proyecto ${projectId}...`);
  
  const res = await fetch(`${API_URL}/project-interactions/?project=${projectId}`);
  
  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    return { likeCount: 0, favoriteCount: 0 };
  }
  
  const data = await res.json();
  console.log('✅ Conteo de likes/favoritos obtenido:', data);
  
  if (data.success && data.data) {
    const likeCount = data.data.filter((item: any) => item.liked).length;
    const favoriteCount = data.data.filter((item: any) => item.favorited).length;
    return { likeCount, favoriteCount };
  }
  
  return { likeCount: 0, favoriteCount: 0 };
}

export async function toggleProjectLike(projectId: number): Promise<{ liked: boolean; like_count: number; favorite_count: number }> {
  console.log(`🔄 Alternando like para proyecto ${projectId}...`);
  
  const res = await fetch(`${API_URL}/toggle-project-interaction/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: projectId,
      action: 'like',
    }),
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    throw new Error(`Error alternando like: ${res.statusText}`);
  }

  const responseData = await res.json();
  console.log('✅ Like alternado:', responseData);
  
  return { 
    liked: responseData.liked, 
    like_count: responseData.like_count, 
    favorite_count: responseData.favorite_count 
  };
}

export async function toggleProjectFavorite(projectId: number): Promise<{ favorited: boolean; like_count: number; favorite_count: number }> {
  console.log(`🔄 Alternando favorito para proyecto ${projectId}...`);
  
  const res = await fetch(`${API_URL}/toggle-project-interaction/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project: projectId,
      action: 'favorite',
    }),
  });

  console.log(`📊 Status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    console.error(`❌ Error HTTP ${res.status}: ${res.statusText}`);
    throw new Error(`Error alternando favorito: ${res.statusText}`);
  }

  const responseData = await res.json();
  console.log('✅ Favorito alternado:', responseData);
  
  return { 
    favorited: responseData.favorited, 
    like_count: responseData.like_count, 
    favorite_count: responseData.favorite_count 
  };
} 