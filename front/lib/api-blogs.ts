import axios from "axios";
import { getVisitorId } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://u2-group-backend.onrender.com/api";

interface BlogLikeFavoriteResponse {
  id: number;
  blog: number;
  visitor_id: string;
  liked: boolean;
  favorited: boolean;
  like_count: number;
  favorite_count: number;
}

export async function getBlogs() {
  console.log('📋 Obteniendo blogs...');
  const res = await axios.get(`${API_URL}/admin/blogs/`);
  console.log('✅ Blogs obtenidos:', res.data);
  
  // Manejar tanto formato DRF directo como formato con success/data
  if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
    console.log('📦 Formato con success/data detectado');
    return res.data.data;
  }
  
  return res.data;
}

export async function getBlog(id: number) {
  const res = await axios.get(`${API_URL}/admin/blogs/${id}/`);
  return res.data;
}

export async function createBlog(data: FormData) {
  const res = await axios.post(`${API_URL}/admin/blogs/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateBlog(id: number, data: FormData) {
  const res = await axios.patch(`${API_URL}/admin/blogs/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteBlog(id: number) {
  const res = await axios.delete(`${API_URL}/admin/blogs/${id}/`);
  return res.data;
}

export async function uploadBlogImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await axios.post(`${API_URL}/admin/upload-blog-image/`, formData, {
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
  });
  return res.data;
}

// LIKE/FAVORITE API
export async function getBlogLikeFavorite(blogId: number): Promise<BlogLikeFavoriteResponse | null> {
  const visitorId = getVisitorId();
  const res = await axios.get<BlogLikeFavoriteResponse[]>(`${API_URL}/admin/blog-interactions/?blog=${blogId}&visitor_id=${visitorId}`);
  return res.data[0] || null;
}

export async function toggleBlogLike(blogId: number): Promise<BlogLikeFavoriteResponse> {
  console.log('toggleBlogLike - blogId:', blogId);
  const res = await axios.post<BlogLikeFavoriteResponse>(`${API_URL}/admin/toggle-blog-interaction/`, {
    blog: blogId,
    action: 'like'
  });
  console.log('toggleBlogLike - respuesta:', res.data);
  return res.data;
}

export async function toggleBlogFavorite(blogId: number): Promise<BlogLikeFavoriteResponse> {
  console.log('toggleBlogFavorite - blogId:', blogId);
  const res = await axios.post<BlogLikeFavoriteResponse>(`${API_URL}/admin/toggle-blog-interaction/`, {
    blog: blogId,
    action: 'favorite'
  });
  console.log('toggleBlogFavorite - respuesta:', res.data);
  return res.data;
}

export async function getBlogLikeFavoriteCount(blogId: number) {
  const res = await axios.get(`${API_URL}/admin/blog-interactions/?blog=${blogId}`);
  const all = res.data as any[];
  return {
    likes: all.filter((item: any) => item.liked).length,
    favorites: all.filter((item: any) => item.favorited).length,
  };
}