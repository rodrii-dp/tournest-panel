import { mockTours, mockUser } from "./mock-data"
import type { Tour } from "@/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getStoredTours = (): Tour[] => {
  if (typeof window === "undefined") return mockTours
  const stored = localStorage.getItem("tours")
  return stored ? JSON.parse(stored) : mockTours
}

const setStoredTours = (tours: Tour[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("tours", JSON.stringify(tours))
}

export const mockService = {
  async getCurrentUser() {
    await delay(300)
    return mockUser
  },

  async getTours(): Promise<Tour[]> {
    await delay(500)
    return getStoredTours()
  },

  async getTourById(id: string): Promise<Tour> {
    await delay(300)
    const tours = getStoredTours()
    const tour = tours.find((t) => t.id === id)
    if (!tour) throw new Error("Tour no encontrado")
    return tour
  },

  async createTour(tourData: Partial<Tour>): Promise<Tour> {
    await delay(700)
    const tours = getStoredTours()
    const newTour: Tour = {
      ...tourData,
      id: crypto.randomUUID(),
      provider: mockUser as never,
      rating: 0,
      reviews: [],
      images: [],
      stops: [],
      availableDates: [],
    } as Tour

    tours.push(newTour)
    setStoredTours(tours)
    return newTour
  },

  async updateTour(id: string, tourData: Partial<Tour>): Promise<Tour> {
    await delay(700)
    const tours = getStoredTours()
    const index = tours.findIndex((t) => t.id === id)
    if (index === -1) throw new Error("Tour no encontrado")

    const updatedTour = {
      ...tours[index],
      ...tourData,
      id,
    }

    tours[index] = updatedTour
    setStoredTours(tours)
    return updatedTour
  },

  async deleteTour(id: string): Promise<void> {
    await delay(500)
    const tours = getStoredTours()
    const filteredTours = tours.filter((t) => t.id !== id)
    setStoredTours(filteredTours)
  },
}
