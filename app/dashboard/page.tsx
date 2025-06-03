// app/dashboard/page.tsx (client component)

"use client";

import CardWrapper from "@/app/components/card-wrapper";
import TourList from "@/app/components/TourList";
import { useEffect, useState } from "react";
import { LoadingIndicator } from "@/app/components/ui/LoadingIndicator";
import { tourService } from "@/lib/tourService";

export default function DashboardPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tourService.getTours()
      .then(setTours)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingIndicator progress={0} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardWrapper title="Total Tours" content={tours.length} />
        <CardWrapper title="Reservas Totales" content="124" />
        <CardWrapper title="Ingresos" content="$12,345" />
        <CardWrapper title="Rating Promedio" content="4.8" />
      </div>

      <TourList tours={tours} />
    </div>
  );
}
