import type { Tour, User } from "@/types"

export const mockUser: User = {
  id: "1",
  name: "Juan Proveedor",
  email: "juan@provider.com",
  password: "123456",
  role: "proveedor",
}

export const mockTours: Tour[] = [
  {
    id: "1",
    category: "Aventura",
    title: "Senderismo en los Alpes",
    images: [{ id: "1", imageUrl: "/placeholder.svg?height=200&width=200" }],
    provider: {
      id: "1",
      name: "Juan Proveedor",
      tours: ["1"],
      direction: "Calle Principal 123",
      contact: "+1234567890",
      verificationStatus: "verificado",
    },
    rating: 4.5,
    reviews: [
      {
        id: "1",
        title: "Excelente tour",
        userId: "2",
        date: "2024-02-23",
        rating: 5,
        comment: "¡Una experiencia increíble!",
      },
    ],
    description: "Una aventura inolvidable por los Alpes suizos.",
    duration: "8 horas",
    language: ["Español", "Inglés"],
    price: {
      value: 99.99,
      basedOnTips: false,
    },
    stops: [
      {
        location: {
          lat: 46.5197,
          lng: 6.6323,
          direction: "Norte",
        },
        stopName: "Punto de inicio",
      },
    ],
    location: {
      name: "Alpes Suizos",
      country: "Suiza",
    },
    meetingPoint: "Estación Central",
    availableDates: [
      {
        date: "2024-03-01",
        hours: ["09:00", "14:00"],
      },
    ],
  },
  {
    id: "2",
    category: "Cultural",
    title: "Tour por el Casco Antiguo",
    images: [{ id: "2", imageUrl: "/placeholder.svg?height=200&width=200" }],
    provider: {
      id: "1",
      name: "Juan Proveedor",
      tours: ["1", "2"],
      direction: "Calle Principal 123",
      contact: "+1234567890",
      verificationStatus: "verificado",
    },
    rating: 4.8,
    reviews: [],
    description: "Descubre la historia de la ciudad antigua.",
    duration: "3 horas",
    language: ["Español"],
    price: {
      value: 29.99,
      basedOnTips: false,
    },
    stops: [
      {
        location: {
          lat: 41.3851,
          lng: 2.1734,
          direction: "Este",
        },
        stopName: "Plaza Mayor",
      },
    ],
    location: {
      name: "Barcelona",
      country: "España",
    },
    meetingPoint: "Plaza Catalunya",
    availableDates: [
      {
        date: "2024-03-02",
        hours: ["10:00", "16:00"],
      },
    ],
  },
]
