"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth"
import { register } from "@/lib/api/auth"
import { getApiErrorMessage } from "@/lib/errors"
import { useAppDispatch } from "@/hooks/redux"
import { authSetUser } from "@/lib/redux/slices/auth-slice"
import { APP_ROUTES } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/shared/password-input"
import { FieldMessage, FormErrorMessage } from "@/components/shared/form-messages"
import { AuthShell } from "@/components/auth/auth-shell"

type FieldErrors = Partial<Record<keyof RegisterFormValues, string>>

export function RegisterForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [values, setValues] = useState<RegisterFormValues>({
    email: "",
    password: "",
    displayName: "",
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as keyof RegisterFormValues] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await register({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName || null,
      })
      dispatch(authSetUser(response.user))
      toast.success("Account created")
      router.replace(APP_ROUTES.vault)
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create account"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create account"
      description="Register with email and password. The backend creates your session and sets the sid cookie."
      footer={
        <>
          Already have an account?{" "}
          <Link href={APP_ROUTES.login} className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormErrorMessage message={formError} />
        <div className="space-y-2">
          <label htmlFor="displayName" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="name"
            value={values.displayName ?? ""}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, displayName: event.target.value }))
            }
            aria-invalid={fieldErrors.displayName ? true : undefined}
          />
          <FieldMessage message={fieldErrors.displayName} />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            aria-invalid={fieldErrors.email ? true : undefined}
          />
          <FieldMessage message={fieldErrors.email} />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            aria-invalid={fieldErrors.password ? true : undefined}
          />
          <FieldMessage message={fieldErrors.password} />
          <p className="text-xs text-muted-foreground">Password length must be 8-128 characters.</p>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}

