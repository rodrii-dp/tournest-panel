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

export default async function TourPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const isNewTour = id === "new";
  const tour = isNewTour ? null : await getTour(id);

  if (!isNewTour && !tour) {
    notFound();
  }

  const handleSubmit = async (data: Tour & { images?: File[] }) => {
    "use server";
    const imageUrls: string[] = [];

    if (data.images && data.images.length > 0) {
      for (const image of data.images) {
        const imageUrl = await uploadImageToCloudinary(image);
        if (imageUrl) {
          imageUrls.push(imageUrl);
        } else {
          // Handle upload failure - maybe show an error to the user
          console.error("Failed to upload one or more images.");
          return; // Or handle differently
        }
      }
    }

    const tourData: Omit<Tour, "id" | "images"> & { images: string[] } = {
      title: data.title,
      category: data.category,
      description: data.description,
      duration: data.duration,
      price: {
        value: data.price.value,
        basedOnTips: data.price.basedOnTips,
      },
      meetingPoint: data.meetingPoint,
      language: data.language,
      images: imageUrls,
    };

    if (isNewTour) {
      await mockService.createTour(tourData);
    } else {
      await mockService.updateTour(id, tourData);
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
