"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createVaultItem } from "@/lib/api/vault"
import type { VaultItemFormValues } from "@/lib/schemas/vault"
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/errors"
import { VaultItemForm } from "@/components/vault/vault-item-form"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setCreateVaultDialogOpen } from "@/lib/redux/slices/ui-slice"
import { authSetLoggedOut } from "@/lib/redux/slices/auth-slice"

export function CreateVaultItemDialog({
  onCreated,
}: {
  onCreated?: (itemId: string) => void
}) {
  const dispatch = useAppDispatch()
  const open = useAppSelector((state) => state.ui.createVaultDialogOpen)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(values: VaultItemFormValues) {
    setFormError(null)
    try {
      const response = await createVaultItem({
        title: values.title,
        itemType: "login",
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
      dispatch(setCreateVaultDialogOpen(false))
      toast.success("Vault item created")
      onCreated?.(response.item.id)
    } catch (error) {
      if (isUnauthorizedError(error)) {
        dispatch(authSetLoggedOut())
      }
      setFormError(getApiErrorMessage(error, "Unable to create vault item"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => dispatch(setCreateVaultDialogOpen(next))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create vault item</DialogTitle>
          <DialogDescription>
            Save a login item. The backend encrypts secrets before storing them.
          </DialogDescription>
        </DialogHeader>
        <VaultItemForm
          submitLabel="Create item"
          submittingLabel="Creating..."
          formError={formError}
          onSubmit={handleSubmit}
          onCancel={() => dispatch(setCreateVaultDialogOpen(false))}
        />
      </DialogContent>
    </Dialog>
  )
}
