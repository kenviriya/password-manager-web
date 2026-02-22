"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getMe } from "@/lib/api/auth"
import { authSetLoggedOut, authSetUser } from "@/lib/redux/slices/auth-slice"
import { useAppDispatch } from "@/hooks/redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/vault"
  }

  return value
}

function OAuthSuccessPageContent() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(true)
  const [manualFallback, setManualFallback] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) {
      return
    }
    startedRef.current = true

    const nextPath = safeNextPath(searchParams.get("next"))

    void getMe()
      .then((response) => {
        dispatch(authSetUser(response.user))
        router.replace(nextPath)
      })
      .catch(() => {
        dispatch(authSetLoggedOut())
        router.replace("/login")
      })
      .finally(() => {
        setVerifying(false)
      })
  }, [dispatch, router, searchParams])

  useEffect(() => {
    if (!verifying) {
      return
    }

    const timer = window.setTimeout(() => {
      setManualFallback(true)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [verifying])

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.96_0.02_250/.55),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.9_0.03_130/.3),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.28_0.04_250/.5),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.23_0.04_130/.3),transparent_60%)]" />
      <Card className="relative w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Finalizing Google sign-in</CardTitle>
          <CardDescription>
            Verifying your session cookie with the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Checking <code className="rounded bg-muted px-1 py-0.5">/auth/me</code>...
          </div>
          {manualFallback ? (
            <Button className="w-full" onClick={() => router.replace("/vault")}>
              Continue to Vault
            </Button>
          ) : null}
          <p className="text-center text-xs text-muted-foreground">
            You will be redirected automatically if session verification succeeds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OAuthSuccessPageContent />
    </Suspense>
  )
}
