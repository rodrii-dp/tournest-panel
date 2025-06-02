import {apiClient} from './apiClient';
import {Booking} from "@/types";

export const bookingService = {
  createBooking: async (booking: Partial<Booking>) => {
    const response = await apiClient.post('/bookings', booking);
    return response.data;
  },

  getBookings: async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  getBookingsByUserId: async (userId: string | undefined) => {
    const response = await apiClient.get(`/bookings/user/${userId}`);
    return response.data;
  },

  getBookingsByTourId: async (tourId: string) => {
    const response = await apiClient.get(`/bookings/tour/${tourId}`);
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await apiClient.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  updateBooking: async (bookingId: string, update: Partial<Booking>) => {
    const response = await apiClient.patch(`/bookings/${bookingId}`, update);
    return response.data;
  },
};
