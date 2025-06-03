// Recoge datos de usuario y providerData, y los envía juntos
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { register } from "../../lib/authService"
import Link from "next/link"

export default function RegisterProviderPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Datos de usuario
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Datos de providerData
    const providerData = {
      name: formData.get("providerName") as string,
      direction: formData.get("providerDirection") as string,
      contact: formData.get("providerContact") as string,
    }

    try {
      await register({
        name,
        email,
        password,
        providerData,
      })
      router.push("/login")
      router.refresh()
    } catch (err) {
      setError("Error al registrar proveedor")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Cuenta de Proveedor</CardTitle>
          <CardDescription>Regístrate como proveedor de tours</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b pb-2 mb-2">
              <h3 className="font-semibold text-lg">Datos de usuario</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="border-b pb-2 mb-2 mt-4">
              <h3 className="font-semibold text-lg">Datos de proveedor</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerName">Nombre del proveedor</Label>
              <Input id="providerName" name="providerName" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerDirection">Dirección</Label>
              <Input id="providerDirection" name="providerDirection" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="providerContact">Contacto</Label>
              <Input id="providerContact" name="providerContact" type="text" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta de proveedor"}
            </Button>
            <div className="text-center text-sm">
              <span className="text-gray-600">¿Ya tienes cuenta? </span>
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
