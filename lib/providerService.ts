import {apiClient} from "@/lib/apiClient";
import {Provider} from "@/types";

export const providerService = {
  createProvider: async (provider: Partial<Provider>) => {
    const response = await apiClient.post('/providers', provider);
    return response.data;
  },

  getProviders: async () => {
    const response = await apiClient.get('/providers');
    return response.data;
  },

  getProviderById: async (id: string) => {
    const response = await apiClient.get(`/providers/${id}`);
    return response.data;
  },

  updateProvider: async (providerId: string, update: Partial<Provider>) => {
    const response = await apiClient.patch(`/providers/${providerId}`, update);
    return response.data;
  },

  deleteProvider: async (providerId: string) => {
    const response = await apiClient.delete(`/providers/${providerId}`);
    return response.data;
  },
}
