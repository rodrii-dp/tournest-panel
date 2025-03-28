"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import { mockService } from "@/lib/mock-service"

export function DeleteTourButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("¿Estás seguro de que quieres eliminar este tour?")) {
      return
    }

    try {
      setIsDeleting(true)
      await mockService.deleteTour(id)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar el tour:", error)
      alert("Error al eliminar el tour")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[#FF5A5F] border-[#FFE8E8] hover:bg-[#FFE8E8] hover:text-[#E00007]"
    >
      {isDeleting ? "Eliminando..." : "Eliminar"}
    </Button>
  )
}
