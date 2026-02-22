"use client"

import { Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/env"

export function GoogleLoginButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-center"
      onClick={() => {
        window.location.assign(`${API_BASE_URL}/auth/google`)
      }}
    >
      <Chrome aria-hidden="true" />
      Continue with Google
    </Button>
  )
}

