import CardWrapper from "@/app/components/card-wrapper";
import TourList from "@/app/components/TourList";
import { Suspense } from "react";
import { LoadingIndicator } from "@/app/components/ui/LoadingIndicator";
import {tourService} from "@/lib/tourService";

async function getTours() {
  return tourService.getTours();
}

export default async function DashboardPage() {
  const tours = await getTours();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardWrapper title="Total Tours" content={tours.length} />
        <CardWrapper title="Reservas Totales" content="124" />
        <CardWrapper title="Ingresos" content="$12,345" />
        <CardWrapper title="Rating Promedio" content="4.8" />
      </div>

      <Suspense fallback={<LoadingIndicator progress={0} />}>
        <TourList />
      </Suspense>
    </div>
  );
}
