"use server"

import { cookies } from "next/headers"

export async function login(email: string, password: string) {
  try {
    const response = await fetch("YOUR_API_URL/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

    if (data.user.role !== "proveedor") {
      throw new Error("Acceso no autorizado")
    }

    (await cookies()).set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function logout() {
  (await cookies()).delete("token")
}
