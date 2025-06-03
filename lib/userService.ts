import {apiClient} from './apiClient';
import {User} from "@/types";

export const userService = {
  createUser: async (user: Partial<User>) => {
    const response = await apiClient.post('/users', user);
    return response.data;
  },

  findByEmail: async (email: string) => {
    const response = await apiClient.get(`/users/${email}`);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    console.log("Registering user with data:", userData);
    const response = await apiClient.post("/auth/register", {
      ...userData,
      role: userData.role || "proveedor",
    })
    return response.data
  },

  login: async (credentials: { email: string; password: string }) => {
    console.log("Logging in with credentials:", credentials)
    const response = await apiClient.post("/auth/login", credentials)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    if (response.data.provider) {
      localStorage.setItem('provider', JSON.stringify(response.data.provider));
    }
    return response.data
  },
};
