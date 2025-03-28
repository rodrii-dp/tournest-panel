"use client";

import React, { useState, useEffect } from "react";
import { mockService } from "@/lib/mock-service";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { LogoutButton } from "@/app/components/logout-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const userData = await mockService.getCurrentUser();
      setUser(userData);
    }
    fetchUser();
  }, []);

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Menú lateral */}
      <div className={`fixed top-0 left-0 z-40 h-screen bg-white border-r shadow-sm w-64 transition-transform ${isMenuOpen ? "translate-x-0" : "-translate-x-64"}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 px-4 border-b bg-[#FF5A5F] flex items-center">
            <h1 className="text-xl font-bold text-white">Tour Admin</h1>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FFE8E8] flex items-center justify-center">
                <span className="text-[#FF5A5F] font-semibold">{user.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#FF5A5F] hover:bg-[#FFE8E8]">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/tours">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#FF5A5F] hover:bg-[#FFE8E8]">
                Mis Tours
              </Button>
            </Link>
            <Link href="/dashboard/reservations">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#FF5A5F] hover:bg-[#FFE8E8]">
                Reservas
              </Button>
            </Link>
            <Link href="/dashboard/analysis">
              <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-[#FF5A5F] hover:bg-[#FFE8E8]">
                Análisis
              </Button>
            </Link>
          </nav>

          <div className="p-4 border-t">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className={`flex-1 transition-all ${isMenuOpen ? "ml-64" : "ml-0"}`}>
        <header className="h-16 bg-white border-b px-4 flex items-center sticky top-0 z-30">
          <Button variant="ghost" size="icon" className="mr-4" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
