"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Save,
  ShieldAlert,
  Star,
  StarOff,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { deleteVaultItem, getVaultItem, updateVaultItem } from "@/lib/api/vault"
import type { VaultItemDetail } from "@/lib/types/vault"
import type { VaultItemFormValues } from "@/lib/schemas/vault"
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/errors"
import { authSetLoggedOut } from "@/lib/redux/slices/auth-slice"
import { setSelectedVaultItemId } from "@/lib/redux/slices/ui-slice"
import { useAppDispatch } from "@/hooks/redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CopyButton } from "@/components/shared/copy-button"
import { ErrorState, LoadingState } from "@/components/shared/page-state"
import { VaultItemForm, normalizeVaultFormValues } from "@/components/vault/vault-item-form"

function displayDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function secretMask(value?: string | null) {
  if (!value) {
    return "Not set"
  }
  return "•".repeat(Math.min(Math.max(value.length, 8), 20))
}

export function VaultDetailClient({ itemId }: { itemId: string }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [item, setItem] = useState<VaultItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(setSelectedVaultItemId(itemId))
    return () => {
      dispatch(setSelectedVaultItemId(null))
    }
  }, [dispatch, itemId])

  async function loadItem() {
    setLoading(true)
    setError(null)
    try {
      const response = await getVaultItem(itemId)
      setItem(response.item)
    } catch (err) {
      if (isUnauthorizedError(err)) {
        dispatch(authSetLoggedOut())
        return
      }
      setError(getApiErrorMessage(err, "Unable to load vault item"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItem()
    // itemId is the route param; dispatch is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, itemId])

  const initialFormValues = (() => {
    if (!item) {
      return undefined
    }

    return normalizeVaultFormValues({
      title: item.title,
      websiteUrl: item.websiteUrl ?? "",
      favorite: item.favorite,
      payload: {
        username: typeof item.payload.username === "string" ? item.payload.username : "",
        password: typeof item.payload.password === "string" ? item.payload.password : "",
        notes: typeof item.payload.notes === "string" ? item.payload.notes : "",
        otpSecret:
          typeof item.payload.otpSecret === "string" || item.payload.otpSecret === null
            ? item.payload.otpSecret
            : "",
        customFields: Array.isArray(item.payload.customFields)
          ? item.payload.customFields
              .filter(
                (field): field is { key: string; value: string } =>
                  Boolean(field) &&
                  typeof field === "object" &&
                  typeof (field as { key?: unknown }).key === "string" &&
                  typeof (field as { value?: unknown }).value === "string",
              )
              .map((field) => ({ key: field.key, value: field.value }))
          : [],
      },
    })
  })()

  async function handleUpdate(values: VaultItemFormValues) {
    setFormError(null)
    try {
      await updateVaultItem(itemId, {
        title: values.title,
        websiteUrl: values.websiteUrl?.trim() ? values.websiteUrl.trim() : null,
        favorite: values.favorite,
        payload: {
          username: values.payload.username || undefined,
          password: values.payload.password || undefined,
          notes: values.payload.notes || undefined,
          otpSecret:
            values.payload.otpSecret === "" || values.payload.otpSecret === undefined
              ? null
              : values.payload.otpSecret,
          customFields: values.payload.customFields,
        },
      })
      const refreshed = await getVaultItem(itemId)
      setItem(refreshed.item)
      setEditing(false)
      toast.success("Vault item updated")
    } catch (err) {
      if (isUnauthorizedError(err)) {
        dispatch(authSetLoggedOut())
      }
      setFormError(getApiErrorMessage(err, "Unable to update vault item"))
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteVaultItem(itemId)
      toast.success("Vault item deleted")
      router.replace("/vault")
    } catch (err) {
      if (isUnauthorizedError(err)) {
        dispatch(authSetLoggedOut())
        return
      }
      toast.error(getApiErrorMessage(err, "Unable to delete vault item"))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingState label="Loading vault item..." />
  }

  if (error) {
    return (
      <ErrorState
        description={error}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/vault">Back to vault</Link>
            </Button>
            <Button onClick={() => void loadItem()}>Retry</Button>
          </div>
        }
      />
    )
  }

  if (!item) {
    return (
      <ErrorState
        title="Vault item not found"
        description="This item may have been deleted."
        action={
          <Button variant="outline" asChild>
            <Link href="/vault">Back to vault</Link>
          </Button>
        }
      />
    )
  }

  const passwordValue =
    typeof item.payload.password === "string" ? item.payload.password : undefined
  const usernameValue =
    typeof item.payload.username === "string" ? item.payload.username : undefined
  const otpValue = typeof item.payload.otpSecret === "string" ? item.payload.otpSecret : undefined
  const notesValue = typeof item.payload.notes === "string" ? item.payload.notes : undefined
  const customFields = Array.isArray(item.payload.customFields)
    ? item.payload.customFields.filter(
        (field): field is { key: string; value: string } =>
          Boolean(field) &&
          typeof field === "object" &&
          typeof (field as { key?: unknown }).key === "string" &&
          typeof (field as { value?: unknown }).value === "string",
      )
    : []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/vault">
            <ArrowLeft aria-hidden="true" />
            Back
          </Link>
        </Button>
        <Button
          variant={editing ? "secondary" : "outline"}
          onClick={() => {
            setFormError(null)
            setEditing((value) => !value)
          }}
        >
          {editing ? <Save aria-hidden="true" /> : <Pencil aria-hidden="true" />}
          {editing ? "Cancel edit" : "Edit"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this vault item?</AlertDialogTitle>
              <AlertDialogDescription>
                The backend performs a soft delete. You will be returned to the vault list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {item.title}
            {item.favorite ? (
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                <Star className="size-3 fill-current" aria-hidden="true" />
                Favorite
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                <StarOff className="size-3" aria-hidden="true" />
                Standard
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {item.websiteUrl || "No website URL"} · Updated {displayDate(item.updatedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing && initialFormValues ? (
            <VaultItemForm
              initialValues={initialFormValues}
              submitLabel="Save changes"
              submittingLabel="Saving..."
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              formError={formError}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Username</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="break-all text-sm">{usernameValue || "Not set"}</p>
                    {usernameValue ? <CopyButton value={usernameValue} label="Username copied" /> : null}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Password</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="font-mono text-sm">
                      {showPassword ? passwordValue || "Not set" : secretMask(passwordValue)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <ShieldAlert className="size-4" aria-hidden="true" />
                      </Button>
                      {passwordValue ? <CopyButton value={passwordValue} label="Password copied" /> : null}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">OTP Secret</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="break-all font-mono text-sm">{otpValue || "Not set"}</p>
                    {otpValue ? <CopyButton value={otpValue} label="OTP secret copied" /> : null}
                  </div>
                </div>
                <div className="rounded-lg border p-3 sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{notesValue || "No notes"}</p>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">Custom fields</p>
                {customFields.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No custom fields</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {customFields.map((field, index) => (
                      <div
                        key={`${field.key}-${index}`}
                        className="flex flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{field.key}</p>
                          <p className="break-all text-sm">{field.value}</p>
                        </div>
                        <CopyButton value={field.value} label={`${field.key} copied`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
