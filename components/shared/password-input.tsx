"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  canReveal?: boolean
}

export function PasswordInput({
  canReveal = true,
  className,
  ...props
}: PasswordInputProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={canReveal && revealed ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      {canReveal ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setRevealed((value) => !value)}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label={revealed ? "Hide password" : "Show password"}
        >
          {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      ) : null}
    </div>
  )
}

