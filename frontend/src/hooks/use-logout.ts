"use client"

import { useRouter } from "next/navigation"

export function useLogout() {
    const router = useRouter()

    const logout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            })

            router.push("/auth/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return logout
}