"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Check, X, Loader2, Upload, Plus, MapPin, Calendar, Trash2 } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { cn } from "../../lib/utils"
import { toast } from "../components/ui/use-toast"

import Image from "next/image"
import {Checkbox} from "@/app/components/ui/checkbox";

const CATEGORIES = ["gastronomía", "historia", "aventura", "naturaleza", "otros"]

const LANGUAGES = ["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Chino", "Japonés", "Ruso"]

const COUNTRIES = [
  "España",
  "Francia",
  "Italia",
  "Alemania",
  "Portugal",
  "Reino Unido",
  "Países Bajos",
  "Bélgica",
  "Suiza",
  "Austria",
]

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
        amount: z.number().optional(),
        description: z.string().optional(),
        validFrom: z.string().optional(),
        validTo: z.string().optional(),
      })
      .optional(),
  }),
  meetingPoint: z.string().min(1, "El punto de encuentro es requerido"),
  language: z.array(z.string()).min(1, "Debes seleccionar al menos un idioma"),
  location: z.object({
    name: z.string().min(1, "El nombre de la ubicación es requerido"),
    country: z.string().min(1, "El país es requerido"),
  }),
  stops: z
    .array(
      z.object({
        location: z.object({
          lat: z.number(),
          lng: z.number(),
          direction: z.string(),
        }),
        stopName: z.string().min(1, "El nombre de la parada es requerido"),
      }),
    )
    .optional(),
  images: z.array(z.instanceof(File)).optional(),
  nonAvailableDates: z
    .array(
      z.object({
        date: z.string(),
        hours: z.array(z.string()),
      }),
    )
    .optional(),
})

type TourFormValues = z.infer<typeof tourSchema>

interface TourFormProps {
  initialData?: Partial<TourFormValues>
  onSubmit: (data: TourFormValues) => Promise<void>
  isSubmitting: boolean
  isEditing?: boolean
}

export function TourForm({ initialData, onSubmit, isSubmitting, isEditing = false }: TourFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: initialData || {
      title: "",
      category: "",
      description: "",
      duration: "",
      price: {
        value: 0,
        basedOnTips: false,
      },
      meetingPoint: "",
      language: [],
      location: {
        name: "",
        country: "",
      },
      stops: [],
      images: [],
      nonAvailableDates: [],
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
    fields: dateFields,
    append: appendDate,
    remove: removeDate,
  } = useFieldArray({
    control,
    name: "nonAvailableDates",
  })

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialData?.language || [])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      if (initialData.language) {
        setSelectedLanguages(initialData.language)
      }
      if (initialData.images && Array.isArray(initialData.images)) {
        setImageFiles(initialData.images as File[])
        setImagePreviews(initialData.images.map((file) => URL.createObjectURL(file)))
        setValue("images", initialData.images)
      }
      if (initialData.price?.discount) {
        setShowDiscount(true)
      }
    }
  }, [initialData, reset, setValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
    setValue("images", newFiles)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: `${files.length} imagen${files.length === 1 ? "" : "es"} añadida${files.length === 1 ? "" : "s"}`,
      description: `Se han añadido ${files.length} imagen${files.length === 1 ? "" : "es"} correctamente`,
    })
  }

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles]
    newFiles.splice(index, 1)
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
    setSelectedLanguages((current) => {
      const updated = current.includes(language) ? current.filter((l) => l !== language) : [...current, language]
      setValue("language", updated)
      return updated
    })
  }

  const addStop = () => {
    appendStop({
      location: {
        lat: 0,
        lng: 0,
        direction: "",
      },
      stopName: "",
    })
  }

  const addNonAvailableDate = () => {
    appendDate({
      date: "",
      hours: [],
    })
  }

  const unselectedLanguages = LANGUAGES.filter((lang) => !selectedLanguages.includes(lang))

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Tour" : "Nuevo Tour"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información básica</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" {...register("title")} placeholder="Ej: Tour por el casco histórico" />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select onValueChange={(value) => setValue("category", value)} defaultValue={watch("category")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location.name">Ciudad/Lugar</Label>
                  <Input
                    id="location.name"
                    {...register("location.name")}
                    placeholder="Ej: Madrid, Barcelona, Sevilla"
                  />
                  {errors.location?.name && <p className="text-sm text-destructive">{errors.location.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location.country">País</Label>
                  <Select
                    onValueChange={(value) => setValue("location.country", value)}
                    defaultValue={watch("location.country")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un país" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location?.country && (
                    <p className="text-sm text-destructive">{errors.location.country.message}</p>
                  )}
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
            </div>

            {/* Paradas del tour */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Paradas del tour</h3>
                <Button type="button" onClick={addStop} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir parada
                </Button>
              </div>

              {stopFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Parada {index + 1}</h4>
                    <Button type="button" onClick={() => removeStop(index)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la parada</Label>
                      <Input {...register(`stops.${index}.stopName`)} placeholder="Ej: Catedral de Santiago" />
                    </div>

                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <Input
                        {...register(`stops.${index}.location.direction`)}
                        placeholder="Ej: Plaza del Obradoiro, s/n"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Latitud</Label>
                      <Input
                        type="number"
                        step="any"
                        {...register(`stops.${index}.location.lat`, { valueAsNumber: true })}
                        placeholder="42.8805"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Longitud</Label>
                      <Input
                        type="number"
                        step="any"
                        {...register(`stops.${index}.location.lng`, { valueAsNumber: true })}
                        placeholder="-8.5456"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Detalles del tour */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles del tour</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input id="duration" {...register("duration")} placeholder="Ej: 2 horas" />
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
                    placeholder="0.00"
                  />
                  {errors.price?.value && <p className="text-sm text-destructive">{errors.price.value.message}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basedOnTips"
                  checked={watch("price.basedOnTips")}
                  onCheckedChange={(checked) => setValue("price.basedOnTips", checked as boolean)}
                />
                <Label htmlFor="basedOnTips">Basado en propinas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="showDiscount" checked={showDiscount} onCheckedChange={setShowDiscount} />
                <Label htmlFor="showDiscount">Añadir descuento</Label>
              </div>

              {showDiscount && (
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Configuración de descuento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de descuento</Label>
                      <Select
                        onValueChange={(value) => setValue("price.discount.type", value as "porcentaje" | "valor")}
                        defaultValue={watch("price.discount.type")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="porcentaje">Porcentaje</SelectItem>
                          <SelectItem value="valor">Valor fijo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        {...register("price.discount.amount", { valueAsNumber: true })}
                        placeholder={watch("price.discount.type") === "porcentaje" ? "10" : "5.00"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Input
                        {...register("price.discount.description")}
                        placeholder="Ej: Descuento por reserva anticipada"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Válido desde</Label>
                      <Input type="date" {...register("price.discount.validFrom")} />
                    </div>

                    <div className="space-y-2">
                      <Label>Válido hasta</Label>
                      <Input type="date" {...register("price.discount.validTo")} />
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Idiomas */}
            <div className="space-y-2">
              <Label>Idiomas</Label>

              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedLanguages.map((language) => (
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

              <div className="flex flex-wrap gap-2 mb-3">
                {unselectedLanguages.map((language) => (
                  <Badge
                    key={language}
                    variant="outline"
                    className="flex items-center gap-1 cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors"
                    onClick={() => toggleLanguage(language)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {language}
                  </Badge>
                ))}
              </div>

              <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languagePopoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedLanguages.length > 0
                      ? `${selectedLanguages.length} idioma${selectedLanguages.length > 1 ? "s" : ""} seleccionado${
                        selectedLanguages.length > 1 ? "s" : ""
                      }`
                      : "Buscar idiomas"}
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
                                selectedLanguages.includes(language) ? "opacity-100" : "opacity-0",
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

              {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
            </div>

            {/* Fechas no disponibles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechas no disponibles
                </h3>
                <Button type="button" onClick={addNonAvailableDate} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir fecha
                </Button>
              </div>

              {dateFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Fecha no disponible {index + 1}</h4>
                    <Button type="button" onClick={() => removeDate(index)} variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input type="date" {...register(`nonAvailableDates.${index}.date`)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Horas no disponibles (separadas por comas)</Label>
                      <Input
                        {...register(`nonAvailableDates.${index}.hours`)}
                        placeholder="Ej: 09:00, 14:00, 18:00"
                        onChange={(e) => {
                          const hours = e.target.value
                            .split(",")
                            .map((h) => h.trim())
                            .filter((h) => h)
                          setValue(`nonAvailableDates.${index}.hours`, hours)
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Imágenes */}
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
                        width={100}
                        height={100}
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
              <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
    </>
  )
}
