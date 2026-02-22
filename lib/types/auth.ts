export type SafeUser = {
  id: string
  email: string
  emailVerifiedAt: string | null
  displayName: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

export type RegisterPayload = {
  email: string
  password: string
  displayName?: string | null
}

export type LoginPayload = {
  email: string
  password: string
}

export type UpdatePasswordPayload = {
  currentPassword?: string
  newPassword: string
}

export type AuthUserResponse = {
  user: SafeUser
}

