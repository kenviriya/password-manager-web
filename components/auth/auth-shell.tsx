import type { ReactNode } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.96_0.02_250/.6),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.92_0.03_120/.35),transparent_50%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.28_0.04_250/.55),transparent_55%),radial-gradient(circle_at_bottom,oklch(0.24_0.04_120/.35),transparent_50%)]" />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="relative w-full max-w-md border shadow-lg">
        <CardHeader>
          <Link href="/" className="mb-2 inline-flex w-fit items-center gap-2 text-sm font-medium">
            <span className="rounded-md bg-primary/10 p-2 text-primary">
              <Shield className="size-4" aria-hidden="true" />
            </span>
            VaultFlow
          </Link>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer ? <div className="px-6 pb-6 text-sm text-muted-foreground">{footer}</div> : null}
      </Card>
    </div>
  )
}
