import { mockService } from "@/lib/mock-service"
import { notFound } from "next/navigation"
import TourForm from "../../../components/tour-form"

async function getTour(id: string) {
  try {
    return await mockService.getTourById(id)
  } catch (error) {
    return null
  }
}

export default async function TourPage({ params }: { params: { id: string } }) {
  const isNewTour = params.id === "new"
  const tour = isNewTour ? null : await getTour(params.id)

  if (!isNewTour && !tour) {
    notFound()
  }

  return <TourForm params={{action: isNewTour ? "new" : params.id}} />
}

