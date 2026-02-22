"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setThemeMode } from "@/lib/redux/slices/ui-slice"

export function ThemeReduxSync() {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector((state) => state.ui.themeMode)
  const { resolvedTheme, setTheme } = useTheme()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) {
      return
    }

    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      dispatch(setThemeMode(resolvedTheme))
      initializedRef.current = true
      return
    }

    // Fallback for first paint before next-themes resolves.
    setTheme(themeMode)
    initializedRef.current = true
  }, [dispatch, resolvedTheme, setTheme, themeMode])

  return null
}

