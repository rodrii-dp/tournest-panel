"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Plus, BarChart3, Calendar, Users, MapPin } from "lucide-react"
import Link from "next/link"
import type { User, Provider } from "@/types"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null)

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      const providerData = localStorage.getItem("provider")
      const token = localStorage.getItem("access_token")

      if (!userData || !token) {
        router.push("/login")
        return
      }

      if (userData) {
        setUser(JSON.parse(userData) as User)
      }
      if (providerData) {
        setProvider(JSON.parse(providerData) as Provider)
      }
    }
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("provider")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard de {provider?.name || "Proveedor"}</h2>
          <p className="text-gray-600">Gestiona tus tours, reservas y configuración desde aquí</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tours Activos</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">+0% desde el mes pasado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€0</div>
              <p className="text-xs text-muted-foreground">+0% desde el mes pasado</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Crear Nuevo Tour
              </CardTitle>
              <CardDescription>Agrega un nuevo tour a tu catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/create">
                <Button className="w-full">Crear Tour</Button>
              </Link>
            </CardContent>
          </Card>

          {/*
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Gestionar Tours
              </CardTitle>
              <CardDescription>Ver y editar tus tours existentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/tours">
                <Button variant="outline" className="w-full">
                  Ver Tours
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Reservas
              </CardTitle>
              <CardDescription>Gestiona las reservas de tus tours</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/bookings">
                <Button variant="outline" className="w-full">
                  Ver Reservas
                </Button>
              </Link>
            </CardContent>
          </Card>
          */}
        </div>

        {/* Recent Activity
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">No hay actividad reciente para mostrar</div>
            </CardContent>
          </Card>
        </div>*/}
      </div>
    </div>
  )
}
