"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useAppDispatch } from "@/hooks/redux"
import { setCreateVaultDialogOpen } from "@/lib/redux/slices/ui-slice"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/vault", label: "Vault", icon: Home },
  { href: "/account", label: "Account", icon: Settings },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const dispatch = useAppDispatch()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/vault" className="inline-flex items-center gap-2 font-semibold">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Shield className="size-4" aria-hidden="true" />
            </span>
            <span>VaultFlow</span>
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button key={item.href} variant={isActive ? "secondary" : "ghost"} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => dispatch(setCreateVaultDialogOpen(true))}
              className="hidden sm:inline-flex"
            >
              <Plus aria-hidden="true" />
              New item
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-4 pb-24 sm:py-6 sm:pb-6">
        {children}
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm sm:hidden"
        aria-label="Primary"
      >
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-medium",
                  isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="mb-1 size-4" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => dispatch(setCreateVaultDialogOpen(true))}
            className="flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-medium text-primary"
          >
            <Plus className="mb-1 size-4" aria-hidden="true" />
            New item
          </button>
        </div>
      </nav>
    </div>
  )
}
