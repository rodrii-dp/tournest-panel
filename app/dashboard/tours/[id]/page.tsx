import { notFound, redirect } from "next/navigation";
import TourForm from "../../../components/tour-form";
import {tourService} from "@/lib/tourService";

async function getTour(id: string) {
  try {
    return await tourService.getTourById(id);
  } catch (error) {
    return null;
  }
}

async function uploadImageToCloudinary(file: File): Promise<string | null> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary credentials not configured.");
    return null;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("cloud_name", cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("Cloudinary upload failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
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

  const handleSubmit = async (data: {
    category: string;
    title: string;
    description: string;
    duration: string;
    language: string[];
    price: { value: number; basedOnTips?: boolean };
    meetingPoint: string;
    images?: File[];
  }) => {
    "use server";
    const imageUrls: string[] = [];

    if (data.images && data.images.length > 0) {
      for (const image of data.images) {
        const imageUrl = await uploadImageToCloudinary(image);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        } else {
          console.error("Failed to upload one or more images.");
          return;
        }
      }
    }

    const images = imageUrls.map((url) => ({ imageUrl: url }));

    const tourData = {
      ...data,
      price: {
        ...data.price,
        basedOnTips: data.price.basedOnTips ?? false,
      },
      images,
    };

    if (isNewTour) {
      await tourService.createTour(tourData);
    } else {
      await tourService.updateTour(id, tour?.provider?._id ?? "", tourData);
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
