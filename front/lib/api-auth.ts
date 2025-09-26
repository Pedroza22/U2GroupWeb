import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://u2-group-backend.onrender.com/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  email: string;
  accepted_policies: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface UserResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  message: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    // Store tokens in localStorage
    const data = response.data as AuthResponse;
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<UserResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/`, data);
    return response.data as UserResponse;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) throw new Error('No refresh token available');

    const response = await axios.post(`${API_URL}/auth/refresh/`, {
      refresh,
    });
    const data = response.data as AuthResponse;
    localStorage.setItem('accessToken', data.access);
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};