import { apiRequest, apiRequestEnvelope } from "@/lib/api/client"
import type {
  CreateVaultItemPayload,
  UpdateVaultItemPayload,
  VaultItemMetadataResponse,
  VaultItemResponse,
  VaultListResponse,
} from "@/lib/types/vault"

export async function listVaultItems() {
  const envelope = await apiRequestEnvelope<{ items: VaultListResponse["items"] }>(
    "/vault/items",
    { method: "GET" },
  )
  return {
    items: envelope.data.items,
    total:
      typeof envelope.meta?.total === "number"
        ? envelope.meta.total
        : envelope.data.items.length,
    meta: envelope.meta,
    message: envelope.message,
  }
}

export function createVaultItem(payload: CreateVaultItemPayload) {
  return apiRequest<VaultItemMetadataResponse>("/vault/items", {
    method: "POST",
    body: payload,
  })
}

export function getVaultItem(id: string) {
  return apiRequest<VaultItemResponse>(`/vault/items/${id}`, {
    method: "GET",
  })
}

export function updateVaultItem(id: string, payload: UpdateVaultItemPayload) {
  return apiRequest<VaultItemResponse | VaultItemMetadataResponse>(`/vault/items/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteVaultItem(id: string) {
  return apiRequest<null>(`/vault/items/${id}`, {
    method: "DELETE",
  })
}

