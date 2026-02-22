import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { SafeUser } from "@/lib/types/auth"

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"

type AuthState = {
  status: AuthStatus
  user: SafeUser | null
  initialized: boolean
}

const initialState: AuthState = {
  status: "idle",
  user: null,
  initialized: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authBootstrapStarted(state) {
      state.status = "loading"
    },
    authSetUser(state, action: PayloadAction<SafeUser>) {
      state.user = action.payload
      state.status = "authenticated"
      state.initialized = true
    },
    authSetLoggedOut(state) {
      state.user = null
      state.status = "unauthenticated"
      state.initialized = true
    },
    authSetInitialized(state) {
      state.initialized = true
      if (state.status === "idle") {
        state.status = "unauthenticated"
      }
    },
  },
})

export const {
  authBootstrapStarted,
  authSetUser,
  authSetLoggedOut,
  authSetInitialized,
} = authSlice.actions

export const authReducer = authSlice.reducer

