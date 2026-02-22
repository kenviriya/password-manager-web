"use client"

import * as React from "react"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthBootstrap } from "@/components/auth/auth-bootstrap"
import { ThemeReduxSync } from "@/components/providers/theme-redux-sync"
import { AppToaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ReduxProvider>
        <ThemeReduxSync />
        <AuthBootstrap />
        {children}
        <AppToaster />
      </ReduxProvider>
    </ThemeProvider>
  )
}
