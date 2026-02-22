import type {
  AuthUserResponse,
  LoginPayload,
  RegisterPayload,
  UpdatePasswordPayload,
} from "@/lib/types/auth"
import { apiRequest } from "@/lib/api/client"

export function register(payload: RegisterPayload) {
  return apiRequest<AuthUserResponse>("/auth/register", {
    method: "POST",
    body: payload,
  })
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthUserResponse>("/auth/login", {
    method: "POST",
    body: payload,
  })
}

export function getMe() {
  return apiRequest<AuthUserResponse>("/auth/me", {
    method: "GET",
  })
}

export function updatePassword(payload: UpdatePasswordPayload) {
  return apiRequest<{ user?: AuthUserResponse["user"] } | null>("/auth/password", {
    method: "PATCH",
    body: payload,
  })
}

export function logout() {
  return apiRequest<null>("/auth/logout", {
    method: "POST",
  })
}

