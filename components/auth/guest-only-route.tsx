"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAppSelector } from "@/hooks/redux"
import { APP_ROUTES } from "@/lib/routes"

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { initialized, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (initialized && status === "authenticated") {
      router.replace(APP_ROUTES.vault)
    }
  }, [initialized, router, status])

  if (!initialized || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    )
  }

  if (status === "authenticated") {
    return null
  }

  return <>{children}</>
}

