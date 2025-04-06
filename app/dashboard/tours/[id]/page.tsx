// app/dashboard/tours/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { mockService } from "@/lib/mock-service";
import { TourForm } from "../../../components/tour-form";
import { Tour } from "@/types";

async function getTour(id: string) {
  try {
    return await mockService.getTourById(id);
  } catch (error) {
    return null;
  }
}

export default async function TourPage({ params }: { params: { id: string } }) {
  const isNewTour = params.id === "new";
  const tour = isNewTour ? null : await getTour(params.id);

  if (!isNewTour && !tour) {
    notFound();
  }

  const handleSubmit = async (data: Tour) => {
    "use server";
    if (isNewTour) {
      await mockService.createTour(data);
    } else {
      await mockService.updateTour(params.id, data);
    }
    redirect("/dashboard/tours");
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isNewTour ? "Crear nuevo tour" : "Editar tour"}
      </h1>
      <TourForm
        initialData={tour || undefined}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
}
