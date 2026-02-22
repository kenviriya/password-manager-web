export type VaultItemType = "login" | string

export type VaultCustomField = {
  key: string
  value: string
}

export type VaultItemPayload = {
  username?: string
  password?: string
  notes?: string
  otpSecret?: string | null
  customFields?: VaultCustomField[]
  [key: string]: unknown
}

export type VaultItemMetadata = {
  id: string
  title: string
  itemType: VaultItemType
  websiteUrl: string | null
  favorite: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type VaultItemDetail = VaultItemMetadata & {
  payload: VaultItemPayload
}

export type CreateVaultItemPayload = {
  title: string
  itemType: "login"
  websiteUrl?: string | null
  favorite?: boolean
  payload: VaultItemPayload
}

export type UpdateVaultItemPayload = Partial<{
  title: string
  itemType: "login"
  websiteUrl: string | null
  favorite: boolean
  payload: VaultItemPayload
}>

export type VaultListResponse = {
  items: VaultItemMetadata[]
  total?: number
}

export type VaultItemResponse = {
  item: VaultItemDetail
}

export type VaultItemMetadataResponse = {
  item: VaultItemMetadata
}

