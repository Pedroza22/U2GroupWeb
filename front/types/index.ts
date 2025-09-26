export interface AdminBlog {
  id: string | number;
  title: string;
  content?: any;
  author?: string | { name: string; title: string; bio: string; image: string };
  created_at: string;
  updated_at?: string;
  featured_image?: string;
  extra_images?: string[];
  image?: string;
  images?: string[];
  category?: string;
  date?: string;
  readTime?: string;
  excerpt?: string;
  featured?: boolean;
  summary?: string;
  read_time?: string;
  tags?: string[];
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  projectType?: string;
  projectLocation?: string;
  timeline?: string;
  comments?: string;
}

export interface ContactResponse {
  status: 'success' | 'error';
  message?: string;
}
