"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { login } from "@/lib/auth"
import {userService} from "@/lib/userService";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await userService.login({email, password});

    console.log("Login result:", result)

    if (result.statusCode !== 404 || result.statusCode !== 401) {
      router.push("/dashboard")
      router.refresh()
    } else {
      setError(result.error || "Error al iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Panel de Administración</CardTitle>
          <CardDescription>Inicia sesión para gestionar tus tours</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="email@example.com" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" placeholder="Tu contraseña" name="password" type="password" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">¿No tienes cuenta? </span>
              <Link href="/login" className="text-blue-600 hover:underline">
                Regístrate como proveedor
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
