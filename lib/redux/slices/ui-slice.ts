import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type UiState = {
  mobileNavOpen: boolean
  createVaultDialogOpen: boolean
  selectedVaultItemId: string | null
  themeMode: "light" | "dark"
}

const initialState: UiState = {
  mobileNavOpen: false,
  createVaultDialogOpen: false,
  selectedVaultItemId: null,
  themeMode: "light",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    setCreateVaultDialogOpen(state, action: PayloadAction<boolean>) {
      state.createVaultDialogOpen = action.payload
    },
    setSelectedVaultItemId(state, action: PayloadAction<string | null>) {
      state.selectedVaultItemId = action.payload
    },
    setThemeMode(state, action: PayloadAction<UiState["themeMode"]>) {
      state.themeMode = action.payload
    },
  },
})

export const {
  setMobileNavOpen,
  setCreateVaultDialogOpen,
  setSelectedVaultItemId,
  setThemeMode,
} = uiSlice.actions

export const uiReducer = uiSlice.reducer
