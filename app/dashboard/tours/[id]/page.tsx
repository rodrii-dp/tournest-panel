import { notFound } from "next/navigation";
import TourForm from "../../../components/tour-form";
import {tourService} from "@/lib/tourService";

async function getTour(id: string) {
  try {
    return await tourService.getTourById(id);
  } catch (error) {
    return null;
  }
}

export default async function TourPage({ params }: { params: Promise<{id: string}> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const isNewTour = id === "new";
  const tour = isNewTour ? null : await getTour(id);

  if (!isNewTour && !tour) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isNewTour ? "Crear nuevo tour" : "Editar tour"}
      </h1>
      <TourForm
        initialData={tour || undefined}
      />
    </div>
  );
}
