import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from "@/lib/redux/slices/auth-slice"
import { uiReducer } from "@/lib/redux/slices/ui-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
