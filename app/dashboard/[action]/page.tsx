import { Metadata } from "next";
import TourForm from "../../components/tour-form";

interface PageProps {
  params: Promise<{
    action: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const action = resolvedParams.action;

  return { title: action === "new" ? "Nuevo Tour" : "Editar Tour" };
}

export default function Page({ params }: PageProps) {
  return <TourForm params={params} />;
}
