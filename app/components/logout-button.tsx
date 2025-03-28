"use client"

import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      localStorage.removeItem("tours")
      localStorage.removeItem("token")

      await fetch("/auth/logout", {
        method: "POST",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar sesión
    </Button>
  )
}
