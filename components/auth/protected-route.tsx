"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppSelector } from "@/hooks/redux"
import { APP_ROUTES } from "@/lib/routes"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { initialized, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!initialized) {
      return
    }

    if (status === "unauthenticated") {
      const next = pathname && pathname !== APP_ROUTES.login ? `?next=${encodeURIComponent(pathname)}` : ""
      router.replace(`${APP_ROUTES.login}${next}`)
    }
  }, [initialized, pathname, router, status])

  if (!initialized || status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading authentication status</span>
      </div>
    )
  }

  if (status !== "authenticated") {
    return null
  }

  return <>{children}</>
}

