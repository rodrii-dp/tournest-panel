"use client"

import type React from "react"
import { useFieldArray } from "react-hook-form"
import { Plus } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Check, X, Loader2, Upload } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "../components/ui/use-toast"
import Image from "next/image"
import { use } from "react"
import { tourService } from "@/lib/tourService"

const CATEGORIES = ["gastronomía", "historia", "naturaleza", "aventura", "otros"]

const LANGUAGES = ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Japonés", "Ruso"]

const tourSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().min(1, "La descripción es requerida"),
  duration: z.string().min(1, "La duración es requerida"),
  price: z.object({
    value: z.number().min(0, "El precio debe ser un número positivo"),
    basedOnTips: z.boolean().optional(),
    discount: z
      .object({
        type: z.enum(["porcentaje", "valor"]).optional(),
        amount: z.number().min(0, "El descuento debe ser un número positivo").optional(),
        description: z.string().optional(),
        validFrom: z.string().optional(),
        validTo: z.string().optional(),
      })
      .optional(),
  }),
  meetingPoint: z.string().min(1, "El punto de encuentro es requerido"),
  language: z.array(z.string()).min(1, "Debes seleccionar al menos un idioma"),
  location: z.object({
    name: z.string().min(1, "La ciudad es requerida"),
    country: z.string().min(1, "El país es requerido"),
  }),
  stops: z
    .array(
      z.object({
        stopName: z.string(),
        location: z.object({
          lat: z.number(),
          lng: z.number(),
          direction: z.string(),
        }),
      }),
    )
    .optional(),
  nonAvailableDates: z
    .array(
      z.object({
        date: z.string().min(1, "La fecha es requerida"),
        hours: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  images: z.array(z.instanceof(File)).optional(),
})

type TourFormValues = z.infer<typeof tourSchema>

interface ImagePreview {
  file: File
  url: string
}

interface TourFormProps {
  // Pattern 1: Simple usage with params (existing)
  params?: Promise<{
    action: string
  }>

  // Pattern 2: Complex usage with external state management (new)
  initialData?: {
    category: string
    title: string
    description: string
    duration: string
    language: string[]
    price: { value: number; basedOnTips?: boolean }
    meetingPoint: string
    images?: { imageUrl: string }[]
    provider?: { _id: string }
  }
  onSubmit?: (data: {
    category: string
    title: string
    description: string
    duration: string
    language: string[]
    price: { value: number; basedOnTips?: boolean }
    meetingPoint: string
    images?: File[]
  }) => Promise<void>
  isSubmitting?: boolean
}

export default function TourForm({ params, initialData, onSubmit, isSubmitting: externalIsSubmitting }: TourFormProps) {
  const router = useRouter()

  // Determine which pattern is being used
  const isExternalMode = !params && (initialData !== undefined || onSubmit !== undefined)

  // Handle params resolution only if params is provided
  const resolvedParams = params ? use(params) : null
  const isEditing = isExternalMode ? !!initialData : resolvedParams?.action !== "new"

  // Use external isSubmitting if provided, otherwise use internal state
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const isSubmittingState = isExternalMode ? (externalIsSubmitting ?? false) : internalIsSubmitting

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false)

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [pendingImages, setPendingImages] = useState<ImagePreview[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    control,
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "",
      description: initialData?.description || "",
      duration: initialData?.duration || "",
      price: {
        value: initialData?.price?.value || 0,
        basedOnTips: initialData?.price?.basedOnTips || false,
      },
      meetingPoint: initialData?.meetingPoint || "",
      language: initialData?.language || [],
      location: { name: "", country: "" },
      images: [],
    },
  })

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
  } = useFieldArray({
    control,
    name: "stops",
  })

  const {
    fields: nonAvailableFields,
    append: appendNonAvailable,
    remove: removeNonAvailable,
  } = useFieldArray({
    control,
    name: "nonAvailableDates",
  })

  const watchedLanguages = watch("language")

  // Only run this effect in internal mode (when params is provided)
  useEffect(() => {
    if (!isExternalMode && isEditing && resolvedParams) {
      const fetchTour = async () => {
        try {
          const response = await fetch(`/api/tours/${resolvedParams.action}`)
          if (!response.ok) throw new Error("No se pudo cargar el tour")

          const tourData = await response.json()

          reset({
            title: tourData.title,
            category: tourData.category,
            description: tourData.description,
            duration: tourData.duration,
            price: {
              value: tourData.price.value,
              basedOnTips: tourData.price.basedOnTips,
            },
            meetingPoint: tourData.meetingPoint,
            language: tourData.language,
          })
        } catch (error) {
          console.error("Error fetching tour:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar la información del tour",
            variant: "destructive",
          })
        }
      }

      fetchTour()
    }
  }, [isExternalMode, isEditing, resolvedParams, reset])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Crear previsualizaciones para las imágenes seleccionadas
    const newPendingImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))

    setPendingImages(newPendingImages)
    setCurrentImageIndex(0)
    setIsImageDialogOpen(true)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const confirmCurrentImage = () => {
    if (pendingImages.length === 0 || currentImageIndex >= pendingImages.length) return

    const currentImage = pendingImages[currentImageIndex]

    // Añadir la imagen a las imágenes confirmadas
    const updatedFiles = [...imageFiles, currentImage.file]
    setImageFiles(updatedFiles)
    setImagePreviews((prev) => [...prev, currentImage.url])

    // Actualizar el valor del formulario
    setValue("images", updatedFiles)

    // Pasar a la siguiente imagen o cerrar el diálogo si es la última
    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      closeImageDialog()
    }

    toast({
      title: "Imagen añadida",
      description: "La imagen se ha añadido correctamente",
    })
  }

  const rejectCurrentImage = () => {
    if (pendingImages.length === 0 || currentImageIndex >= pendingImages.length) return

    URL.revokeObjectURL(pendingImages[currentImageIndex].url)

    if (currentImageIndex < pendingImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      closeImageDialog()
    }
  }

  const closeImageDialog = () => {
    // Solo revocar las URLs de las imágenes pendientes que NO han sido aceptadas
    pendingImages.forEach((img, index) => {
      // Si la URL no está en imagePreviews, se puede revocar
      if (!imagePreviews.includes(img.url) && index >= currentImageIndex) {
        URL.revokeObjectURL(img.url)
      }
    })

    setIsImageDialogOpen(false)
    setPendingImages([])
    setCurrentImageIndex(0)
  }

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    newFiles.splice(index, 1)

    // Update form value
    setValue("images", newFiles)
    setImageFiles(newFiles)

    URL.revokeObjectURL(imagePreviews[index])
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)

    toast({
      title: "Imagen eliminada",
      description: "La imagen se ha eliminado correctamente",
    })
  }

  const toggleLanguage = (language: string) => {
    const updated = watchedLanguages.includes(language)
      ? watchedLanguages.filter((l) => l !== language)
      : [...watchedLanguages, language]
    setValue("language", updated, { shouldValidate: true })
  }

  const handleFormSubmit = async (data: TourFormValues) => {
    if (isExternalMode && onSubmit) {
      // External mode: use the provided onSubmit function
      await onSubmit({
        ...data,
        images: data.images || [],
      })
    } else {
      // Internal mode: use existing submission logic
      setInternalIsSubmitting(true)

      try {
        console.log("HELLO")
        const uploadedImageUrls = []

        // Validar configuración de Cloudinary antes de subir imágenes
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (data.images && data.images.length > 0 && (!cloudName || !uploadPreset)) {
          toast({
            title: "Error de configuración",
            description:
              "Faltan las variables de entorno de Cloudinary. Por favor, configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
            variant: "destructive",
          })
          setInternalIsSubmitting(false)
          return
        }

        if (data.images && data.images.length > 0) {
          for (const file of data.images) {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("upload_preset", uploadPreset!)

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: "POST",
              body: formData,
            })

            if (!response.ok) {
              throw new Error("Error al subir una imagen a Cloudinary")
            }

            const result = await response.json()
            uploadedImageUrls.push(result.secure_url)
          }
        }

        const discount =
          data.price.discount &&
          data.price.discount.type &&
          typeof data.price.discount.amount === "number" &&
          data.price.discount.amount > 0
            ? {
              type: data.price.discount.type,
              amount: data.price.discount.amount,
              description: data.price.discount.description || "",
              validFrom: data.price.discount.validFrom || "",
              validTo: data.price.discount.validTo || "",
            }
            : undefined

        const tourData = {
          title: data.title,
          category: data.category,
          description: data.description,
          duration: data.duration,
          price: {
            value: data.price.value,
            basedOnTips: data.price.basedOnTips ?? false,
            ...(discount ? { discount } : {}),
          },
          meetingPoint: data.meetingPoint,
          language: data.language,
          location: data.location,
          stops: data.stops,
          nonAvailableDates: data.nonAvailableDates?.map((item) => ({
            date: item.date,
            hours: item.hours ?? [],
          })),
          images: uploadedImageUrls.map((url) => ({ imageUrl: url })), // URLs de Cloudinary
        }

        if (isEditing && resolvedParams) {
          await tourService.updateTour(resolvedParams.action, "", tourData)
        } else {
          await tourService.createTour(tourData)
        }

        toast({
          title: "Éxito",
          description: isEditing ? "Tour actualizado correctamente" : "Tour creado correctamente",
        })

        router.push("/dashboard")
        router.refresh()
      } catch (error) {
        console.error("Error:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el tour. Inténtalo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setInternalIsSubmitting(false)
      }
    }
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Tour" : "Nuevo Tour"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register("title")} placeholder="Ej: Tour por el casco histórico" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={watch("category")}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="bg-white">
                      {category[0].toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe tu tour en detalle"
                className="min-h-[120px]"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            {/* Duración y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Input id="duration" {...register("duration")} />
                {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (€)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("price.value", { valueAsNumber: true })}
                />
                {errors.price?.value && <p className="text-sm text-destructive">{errors.price.value.message}</p>}
              </div>
            </div>
            {/* Descuento */}
            <div className="space-y-2">
              <Label>Descuento</Label>
              <p className="text-sm text-muted-foreground mb-2">Opcional - Deja en blanco si no hay descuento</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={(v) => setValue("price.discount.type", v as "porcentaje" | "valor")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">Porcentaje</SelectItem>
                    <SelectItem value="valor">Valor</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Cantidad"
                  {...register("price.discount.amount", { valueAsNumber: true })}
                />
                <Input placeholder="Descripción" {...register("price.discount.description")} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input type="date" placeholder="Desde" {...register("price.discount.validFrom")} />
                <Input type="date" placeholder="Hasta" {...register("price.discount.validTo")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingPoint">Punto de encuentro</Label>
              <Input
                id="meetingPoint"
                {...register("meetingPoint")}
                placeholder="Ej: Plaza Mayor, junto a la estatua"
              />
              {errors.meetingPoint && <p className="text-sm text-destructive">{errors.meetingPoint.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Idiomas</Label>
              <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languagePopoverOpen}
                    className="w-full justify-between"
                  >
                    {watchedLanguages.length > 0
                      ? `${watchedLanguages.length} idioma${watchedLanguages.length > 1 ? "s" : ""} seleccionado${
                        watchedLanguages.length > 1 ? "s" : ""
                      }`
                      : "Selecciona idiomas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar idioma..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                      <CommandGroup>
                        {LANGUAGES.map((language) => (
                          <CommandItem key={language} value={language} onSelect={() => toggleLanguage(language)}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watchedLanguages.includes(language) ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {language}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {watchedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedLanguages.map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <button
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Eliminar {language}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Ciudad" {...register("location.name")} />
                <Input placeholder="País" {...register("location.country")} />
              </div>
            </div>
            {/* Paradas */}
            <div className="space-y-2">
              <Label>Paradas</Label>
              {stopFields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mb-2">
                  <Input placeholder="Nombre" {...register(`stops.${idx}.stopName` as const)} />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Lat"
                    {...register(`stops.${idx}.location.lat` as const, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="any"
                    placeholder="Lng"
                    {...register(`stops.${idx}.location.lng` as const, { valueAsNumber: true })}
                  />
                  <Input placeholder="Dirección" {...register(`stops.${idx}.location.direction` as const)} />
                  <Button type="button" variant="destructive" onClick={() => removeStop(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendStop({ stopName: "", location: { lat: 0, lng: 0, direction: "" } })}
              >
                <Plus className="h-4 w-4 mr-1" /> Añadir parada
              </Button>
              {errors.stops && (
                <p className="text-sm text-destructive">
                  {Array.isArray(errors.stops)
                    ? errors.stops.map((err, i) => err?.message && <span key={i}>{err.message}</span>)
                    : (errors.stops as { message?: string })?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fechas no disponibles</Label>
              {nonAvailableFields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-2">
                  <Input type="date" {...register(`nonAvailableDates.${idx}.date` as const)} />
                  <Input
                    placeholder="Horas (ej: 10:00,12:00)"
                    {...register(`nonAvailableDates.${idx}.hours.0` as const)}
                  />
                  <Button type="button" variant="destructive" onClick={() => removeNonAvailable(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendNonAvailable({ date: "", hours: [] })}>
                <Plus className="h-4 w-4 mr-1" /> Añadir fecha no disponible
              </Button>
              {errors.nonAvailableDates && (
                <p className="text-sm text-destructive">
                  {(errors.nonAvailableDates as { message?: string })?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Imágenes</Label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Vista previa ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                        width={200}
                        height={200}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 rounded-full p-1 text-white"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Eliminar imagen</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Haz clic para seleccionar imágenes</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG o WEBP (MAX. 10MB)</p>
                      {imagePreviews.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {imagePreviews.length} {imagePreviews.length === 1 ? "imagen subida" : "imágenes subidas"}
                        </p>
                      )}
                    </div>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Limpiar todas las imágenes
                      setImageFiles([])
                      setImagePreviews((prev) => {
                        prev.forEach((url) => URL.revokeObjectURL(url))
                        return []
                      })
                      setValue("images", [])
                      toast({
                        title: "Imágenes eliminadas",
                        description: "Todas las imágenes han sido eliminadas",
                      })
                    }}
                  >
                    Eliminar todas las imágenes
                  </Button>
                )}
              </div>

              {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmittingState}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingState}>
                {isSubmittingState ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Guardando..." : "Creando..."}
                  </>
                ) : isEditing ? (
                  "Guardar cambios"
                ) : (
                  "Crear tour"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar imagen</DialogTitle>
          </DialogHeader>

          {pendingImages.length > 0 && currentImageIndex < pendingImages.length && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full h-64 bg-muted rounded-md overflow-hidden">
                <Image
                  src={pendingImages[currentImageIndex].url || "/placeholder.svg"}
                  alt="Vista previa de imagen"
                  className="w-full h-full object-contain"
                  width={400}
                  height={400}
                />
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Imagen {currentImageIndex + 1} de {pendingImages.length}
              </div>

              <div className="flex justify-center gap-4 w-full">
                <Button variant="outline" onClick={rejectCurrentImage}>
                  Rechazar
                </Button>
                <Button onClick={confirmCurrentImage}>Aceptar y subir</Button>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={closeImageDialog}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
