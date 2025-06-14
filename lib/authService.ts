import {apiClient} from './apiClient';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "cliente" | "proveedor";
  providerData: {
    name: string;
    direction: string;
    contact: string;
  };
}

export interface RegisterResponse {
  message: string;
  user?: never;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: { name: string; email: string };
}

export const register = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    '/auth/register',
    data,
  );
  return response.data;
};

export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  return response.data;
};
