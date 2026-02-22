"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { setThemeMode } from "@/lib/redux/slices/ui-slice"

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector((state) => state.ui.themeMode)
  const { setTheme } = useTheme()
  const isDark = themeMode === "dark"

  function handleToggle() {
    const next = isDark ? "light" : "dark"
    dispatch(setThemeMode(next))
    setTheme(next)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Sun className="hidden dark:block" aria-hidden="true" />
      <Moon className="dark:hidden" aria-hidden="true" />
    </Button>
  )
}
