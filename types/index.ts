export interface Service {
  id: string
  name: string
  icon: string
}

export interface Stop {
  location: {
    lat: number
    lng: number
    direction: string
  }
  stopName: string
}

export interface Provider {
  id: string
  name: string
  tours: string[]
  direction: string
  contact: string
  verificationStatus: "verificado" | "pendiente" | "no verificado"
}

export interface Review {
  id: string
  title: string
  userId: string
  date: string
  rating: number
  comment: string
}

export interface User {
  id?: string
  name: string
  email: string
  password: string
  role: "cliente" | "proveedor"
}

export interface ImageTour {
  id: string
  imageUrl: string
}

export interface Availability {
  date: string
  hours: string[]
}

export interface Tour {
  id: string
  category: string
  title: string
  images: ImageTour[]
  provider: Provider
  rating: number
  reviews: Review[]
  description: string
  duration: string
  language: string[]
  price: {
    value: number
    basedOnTips: boolean
  }
  stops: Stop[]
  location: {
    name: string
    country: string
  }
  meetingPoint: string
  availableDates: Availability[]
}

export interface TourFormInputs {
  title: string
  category: string
  description: string
  duration: string
  price: {
    value: number
    basedOnTips: boolean
  }
  meetingPoint: string
  language: string[]
  location: {
    name: string
    country: string
  }
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  status?: number
}

export type ApiResponse<T> = {
  data?: T
  error?: ApiError
}

export interface DashboardStats {
  totalTours: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
}

export interface Booking {
  id: string
  tourId: string
  userId: string
  date: string
  hour: string
  status: "pendiente" | "confirmado" | "cancelado"
  numberOfPeople: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface BookingWithTour extends Booking {
  tour: Tour
}

export interface PaymentInfo {
  id: string
  bookingId: string
  amount: number
  status: "pendiente" | "completado" | "fallido"
  paymentMethod: "tarjeta" | "efectivo" | "transferencia"
  transactionId?: string
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export interface FilterOptions {
  category?: string
  priceRange?: {
    min: number
    max: number
  }
  duration?: string
  location?: string
  date?: string
  language?: string
}

export interface SortOptions {
  field: "price" | "rating" | "date"
  order: "asc" | "desc"
}

export interface PaginationOptions {
  page: number
  limit: number
}

export interface QueryOptions {
  filters?: FilterOptions
  sort?: SortOptions
  pagination?: PaginationOptions
}

export interface ProviderStats {
  totalRevenue: number
  totalBookings: number
  averageRating: number
  popularTours: {
    tourId: string
    title: string
    bookings: number
  }[]
  recentReviews: Review[]
  monthlyStats: {
    month: string
    revenue: number
    bookings: number
  }[]
}

export interface TourAvailability {
  tourId: string
  dates: {
    date: string
    availableSpots: number
    hours: {
      hour: string
      available: boolean
      bookedSpots: number
    }[]
  }[]
}

export interface TourUpdateInput extends Partial<Tour> {
  id: string
}
