"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { GoogleLoginButton } from "@/components/auth/google-login-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function getFriendlyOauthError(params: {
  code: string | null
  message: string | null
  provider: string
}) {
  const rawMessage = params.message?.trim()

  if (rawMessage) {
    return rawMessage
  }

  switch (params.code) {
    case "AUTH_OAUTH_GOOGLE_ACCESS_DENIED":
      return "Google sign-in was canceled or access was denied."
    case "AUTH_OAUTH_STATE_INVALID":
      return "The Google sign-in session expired or was invalid. Please try again."
    default:
      return `Unable to complete ${params.provider} sign-in. Please try again.`
  }
}

function OAuthErrorPageContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  const provider = searchParams.get("provider") || "google"
  const friendlyMessage = getFriendlyOauthError({ code, message, provider })

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.96_0.02_250/.55),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.96_0.03_20/.25),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.28_0.04_250/.5),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.28_0.08_20/.18),transparent_60%)]" />
      <Card className="relative w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-lg">Google sign-in failed</CardTitle>
          <CardDescription>
            We couldn&apos;t complete your {provider} login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {friendlyMessage}
          </div>

          {code ? (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              Error code: <code>{code}</code>
            </div>
          ) : null}

          <div className="space-y-2">
            <GoogleLoginButton />
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to login page</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If backend OAuth redirect URLs are not configured, the backend callback may return JSON instead of redirecting here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <OAuthErrorPageContent />
    </Suspense>
  )
}
