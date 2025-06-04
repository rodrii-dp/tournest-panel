import React, { useState } from 'react';
import { Plus, X, MapPin, Calendar, Euro, Tag } from 'lucide-react';
import type { Tour, Stop, Availability } from "@/types";

const CreateTourForm = () => {
  // Estado del formulario tipado correctamente
  const [formData, setFormData] = useState<Omit<Partial<Tour>, '_id' | 'provider' | 'rating' | 'reviews'>>({
    title: '',
    category: '',
    description: '',
    duration: '',
    language: [],
    price: {
      value: 0,
      basedOnTips: false,
      discount: undefined
    },
    meetingPoint: '',
    location: {
      name: '',
      country: ''
    },
    images: [],
    stops: [],
    nonAvailableDates: []
  });

  const [showDiscount, setShowDiscount] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [newStop, setNewStop] = useState<Stop>({
    stopName: '',
    location: { lat: 0, lng: 0, direction: '' }
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAvailability, setNewAvailability] = useState<Availability>({
    date: '',
    hours: []
  });
  const [newHour, setNewHour] = useState('');

  const categories = [
    'Turismo Cultural',
    'Naturaleza y Aventura',
    'Gastronomía',
    'Historia',
    'Arte y Museos',
    'Deportes',
    'Vida Nocturna',
    'Compras',
    'Familiar'
  ];

  const languages = [
    'Español', 'Inglés', 'Francés', 'Alemán', 'Italiano',
    'Portugués', 'Catalán', 'Euskera', 'Gallego'
  ];

  const handleInputChange = (field: keyof typeof formData | string, value: unknown) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [keyof typeof formData, string];
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as Record<string, unknown> ?? {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addLanguage = (lang: string) => {
    if (lang && Array.isArray(formData.language) && !formData.language.includes(lang)) {
      setFormData(prev => ({
        ...prev,
        language: [...(prev.language ?? []), lang]
      }));
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      language: (prev.language ?? []).filter(l => l !== lang)
    }));
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const validFiles = files.filter(file => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} no es una imagen válida`);
        return false;
      }
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande. Máximo 10MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<{ secure_url: string }> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir ${file.name} a Cloudinary`);
    }

    return await response.json();
  };

  const addStop = () => {
    if (newStop.stopName.trim()) {
      setFormData(prev => ({
        ...prev,
        stops: [...(prev.stops ?? []), { ...newStop }]
      }));
      setNewStop({
        stopName: '',
        location: { lat: 0, lng: 0, direction: '' }
      });
    }
  };

  const removeStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: (prev.stops ?? []).filter((_, i) => i !== index)
    }));
  };

  const addHourToAvailability = () => {
    if (newHour) {
      setNewAvailability(prev => ({
        ...prev,
        hours: [...prev.hours, newHour]
      }));
      setNewHour('');
    }
  };

  const removeHourFromAvailability = (hour: string) => {
    setNewAvailability(prev => ({
      ...prev,
      hours: prev.hours.filter(h => h !== hour)
    }));
  };

  const addAvailability = () => {
    if (newAvailability.date && newAvailability.hours.length > 0) {
      setFormData(prev => ({
        ...prev,
        nonAvailableDates: [...(prev.nonAvailableDates ?? []), { ...newAvailability }]
      }));
      setNewAvailability({ date: '', hours: [] });
    }
  };

  const removeAvailability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nonAvailableDates: (prev.nonAvailableDates ?? []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.title || !formData.category || !formData.description) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedImageUrls: string[] = [];

      // Validar configuración de Cloudinary si hay imágenes
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (selectedFiles.length > 0 && (!cloudName || !uploadPreset)) {
        alert('Error de configuración: Faltan las variables de entorno de Cloudinary.');
        setIsSubmitting(false);
        return;
      }

      // Subir imágenes a Cloudinary
      if (selectedFiles.length > 0) {
        console.log(`Subiendo ${selectedFiles.length} imágenes a Cloudinary...`);

        for (const file of selectedFiles) {
          try {
            const result = await uploadToCloudinary(file);
            uploadedImageUrls.push(result.secure_url);
            console.log(`✓ ${file.name} subida exitosamente`);
          } catch (error) {
            console.error(`Error subiendo ${file.name}:`, error);
            throw new Error(`Error al subir ${file.name}`);
          }
        }
      }

      // Preparar el descuento si existe
      const discount = showDiscount && formData.price && formData.price.discount &&
        formData.price.discount.type &&
        typeof formData.price.discount.amount === 'number' &&
        formData.price.discount.amount > 0
        ? {
            type: formData.price.discount.type,
            amount: formData.price.discount.amount,
            description: formData.price.discount.description || '',
            validFrom: formData.price.discount.validFrom || '',
            validTo: formData.price.discount.validTo || '',
          }
        : undefined;

      // Preparar los datos del tour
      const tourData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        duration: formData.duration,
        price: {
          value: formData.price?.value ?? 0,
          basedOnTips: formData.price?.basedOnTips ?? false,
          ...(discount ? { discount } : {}),
        },
        meetingPoint: formData.meetingPoint,
        language: formData.language ?? [],
        location: formData.location ?? { name: '', country: '' },
        stops: formData.stops ?? [],
        nonAvailableDates: (formData.nonAvailableDates ?? []).map((item) => ({
          date: item.date,
          hours: item.hours || [],
        })),
        images: uploadedImageUrls.map((url) => ({ imageUrl: url })),
      };

      console.log('Datos del tour a enviar:', tourData);

      // Llamar al servicio para crear el tour
      // await tourService.createTour(tourData);

      alert('¡Tour creado exitosamente!');
      console.log('Tour creado con éxito:', tourData);

    } catch (error) {
      let message = 'Error desconocido';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      alert(`Error al crear el tour: ${message}`);
      console.error('Error al crear el tour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // safeFormData mejorado para asegurar arrays y objetos nunca undefined
  const safeFormData = {
    ...formData,
    price: formData.price ?? { value: 0, basedOnTips: false },
    location: formData.location ?? { name: '', country: '' },
    language: formData.language ?? [],
    stops: formData.stops ?? [],
    nonAvailableDates: formData.nonAvailableDates ?? [],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Tour</h1>
        <p className="text-gray-600">Completa la información para crear tu tour</p>
      </div>

      <div className="space-y-8">
        {/* Información Básica */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Tour *
              </label>
              <input
                type="text"
                value={safeFormData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={safeFormData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración *
              </label>
              <input
                type="text"
                value={safeFormData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="ej: 2 horas, 1 día"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Punto de Encuentro *
              </label>
              <input
                type="text"
                value={safeFormData.meetingPoint}
                onChange={(e) => handleInputChange('meetingPoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={safeFormData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                value={safeFormData.location.name}
                onChange={(e) => handleInputChange('location.name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País *
              </label>
              <input
                type="text"
                value={safeFormData.location.country}
                onChange={(e) => handleInputChange('location.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Euro className="w-5 h-5 mr-2" />
            Precio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (€) *
              </label>
              <input
                type="number"
                value={safeFormData.price.value}
                onChange={(e) => handleInputChange('price.value', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="basedOnTips"
                checked={safeFormData.price.basedOnTips}
                onChange={(e) => handleInputChange('price.basedOnTips', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="basedOnTips" className="text-sm text-gray-700">
                Basado en propinas
              </label>
            </div>
          </div>

          {/* Descuento Opcional */}
          <div className="mt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="showDiscount"
                checked={showDiscount}
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showDiscount" className="text-sm font-medium text-gray-700">
                Agregar descuento (opcional)
              </label>
            </div>

            {showDiscount && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Descuento
                  </label>
                  <select
                    value={safeFormData.price.discount?.type || 'porcentaje'}
                    onChange={(e) => handleInputChange('price.discount', {
                      ...safeFormData.price.discount,
                      type: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="valor">Valor fijo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={safeFormData.price.discount?.amount || 0}
                    onChange={(e) => handleInputChange('price.discount', {
                      ...safeFormData.price.discount,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={safeFormData.price.discount?.description || ''}
                    onChange={(e) => handleInputChange('price.discount', {
                      ...safeFormData.price.discount,
                      description: e.target.value
                    })}
                    placeholder="ej: Descuento de temporada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Idiomas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Idiomas</h2>

          <div className="mb-4">
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
            >
              <option value="">Seleccionar idioma</option>
              {languages.filter(lang => !safeFormData.language.includes(lang)).map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                addLanguage(newLanguage);
                setNewLanguage('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Agregar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {safeFormData.language.map(lang => (
              <span
                key={lang}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
              >
                {lang}
                <button
                  type="button"
                  onClick={() => removeLanguage(lang)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Imágenes del Tour</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Imágenes
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelection}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Puedes seleccionar múltiples imágenes. Máximo 10MB por imagen.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Imágenes Seleccionadas ({selectedFiles.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full h-32 bg-gray-100 rounded-md border overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-md flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-1">
                      <p className="text-xs text-gray-600 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedFiles.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-gray-600">No hay imágenes seleccionadas</p>
              <p className="text-sm text-gray-400">Haz clic en &ldquo;Seleccionar Imágenes&rdquo; para agregar fotos</p>
            </div>
          )}
        </div>

        {/* Paradas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Paradas del Tour</h2>

          <div className="mb-4 p-4 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <input
                  type="text"
                  value={newStop.stopName}
                  onChange={(e) => setNewStop(prev => ({ ...prev, stopName: e.target.value }))}
                  placeholder="Nombre de la parada"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newStop.location.direction}
                  onChange={(e) => setNewStop(prev => ({
                    ...prev,
                    location: { ...prev.location, direction: e.target.value }
                  }))}
                  placeholder="Dirección"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <input
                  type="number"
                  value={newStop.location.lat}
                  onChange={(e) => setNewStop(prev => ({
                    ...prev,
                    location: { ...prev.location, lat: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="Latitud"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={newStop.location.lng}
                  onChange={(e) => setNewStop(prev => ({
                    ...prev,
                    location: { ...prev.location, lng: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="Longitud"
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addStop}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Agregar Parada
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {safeFormData.stops.map((stop, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">{stop.stopName}</p>
                  <p className="text-sm text-gray-600">{stop.location.direction}</p>
                  <p className="text-xs text-gray-500">
                    Lat: {stop.location.lat}, Lng: {stop.location.lng}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeStop(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fechas No Disponibles */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Fechas No Disponibles
          </h2>

          <div className="mb-4 p-4 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newAvailability.date}
                  onChange={(e) => setNewAvailability(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar Hora
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newHour}
                    onChange={(e) => setNewHour(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addHourToAvailability}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {newAvailability.hours.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Horas seleccionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {newAvailability.hours.map(hour => (
                    <span
                      key={hour}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center"
                    >
                      {hour}
                      <button
                        type="button"
                        onClick={() => removeHourFromAvailability(hour)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addAvailability}
              disabled={!newAvailability.date || newAvailability.hours.length === 0}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Agregar Fecha No Disponible
            </button>
          </div>

          <div className="space-y-2">
            {safeFormData.nonAvailableDates.map((availability, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                <div>
                  <p className="font-medium">{availability.date}</p>
                  <p className="text-sm text-gray-600">
                    Horas: {availability.hours.join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex-1 sm:flex-none disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {selectedFiles.length > 0 ? 'Subiendo imágenes...' : 'Creando tour...'}
              </>
            ) : (
              'Crear Tour'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTourForm;
