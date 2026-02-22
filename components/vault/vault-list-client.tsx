"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Plus, RefreshCcw, RotateCw, Star } from "lucide-react"
import { listVaultItems } from "@/lib/api/vault"
import type { VaultItemMetadata } from "@/lib/types/vault"
import { getApiErrorMessage, isUnauthorizedError } from "@/lib/errors"
import { authSetLoggedOut } from "@/lib/redux/slices/auth-slice"
import { setCreateVaultDialogOpen } from "@/lib/redux/slices/ui-slice"
import { useAppDispatch } from "@/hooks/redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CopyButton } from "@/components/shared/copy-button"
import { CreateVaultItemDialog } from "@/components/vault/create-vault-item-dialog"
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/page-state"

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/"

type PasswordGeneratorConfig = {
  length: number
  useLowercase: boolean
  useUppercase: boolean
  useNumbers: boolean
  useSymbols: boolean
}

function randomIndex(max: number) {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0] % max
}

function pickChar(source: string) {
  return source[randomIndex(source.length)]
}

function shuffleChars(chars: string[]) {
  const next = [...chars]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1)
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function generateStrongPassword(config: PasswordGeneratorConfig) {
  const groups = [
    config.useLowercase ? LOWERCASE : "",
    config.useUppercase ? UPPERCASE : "",
    config.useNumbers ? NUMBERS : "",
    config.useSymbols ? SYMBOLS : "",
  ].filter(Boolean)

  if (groups.length === 0) {
    throw new Error("Select at least one character type")
  }

  const targetLength = Math.max(config.length, groups.length)
  const all = groups.join("")
  const chars = groups.map((group) => pickChar(group))

  while (chars.length < targetLength) {
    chars.push(pickChar(all))
  }

  return shuffleChars(chars).join("")
}

function clampPasswordLength(length: number) {
  if (!Number.isFinite(length)) {
    return 16
  }

  return Math.min(64, Math.max(4, Math.floor(length)))
}

export function VaultListClient() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [items, setItems] = useState<VaultItemMetadata[]>([])
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatorConfig, setGeneratorConfig] = useState<PasswordGeneratorConfig>({
    length: 16,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSymbols: true,
  })
  const [generatorError, setGeneratorError] = useState<string | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string>(() =>
    generateStrongPassword({
      length: 16,
      useLowercase: true,
      useUppercase: true,
      useNumbers: true,
      useSymbols: true,
    }),
  )

  function regeneratePassword(nextConfig = generatorConfig) {
    try {
      setGeneratorError(null)
      setGeneratedPassword(generateStrongPassword(nextConfig))
    } catch (err) {
      setGeneratorError(getApiErrorMessage(err, "Unable to generate password"))
    }
  }

  function updateGeneratorToggle<K extends keyof Omit<PasswordGeneratorConfig, "length">>(
    key: K,
    checked: boolean,
  ) {
    const nextConfig = { ...generatorConfig, [key]: checked }
    setGeneratorConfig(nextConfig)
    if (
      nextConfig.useLowercase ||
      nextConfig.useUppercase ||
      nextConfig.useNumbers ||
      nextConfig.useSymbols
    ) {
      regeneratePassword(nextConfig)
    } else {
      setGeneratorError("Select at least one character type.")
    }
  }

  function updateGeneratorLength(raw: string) {
    const numeric = Number(raw)
    const nextConfig = { ...generatorConfig, length: clampPasswordLength(numeric) }
    setGeneratorConfig(nextConfig)
    regeneratePassword(nextConfig)
  }

  function toggleGeneratorOption(
    key: keyof Omit<PasswordGeneratorConfig, "length">,
    current: boolean,
  ) {
    updateGeneratorToggle(key, !current)
  }

  async function loadItems() {
    setLoading(true)
    setError(null)
    try {
      const response = await listVaultItems()
      setItems(response.items)
      setTotal(response.total)
    } catch (err) {
      if (isUnauthorizedError(err)) {
        dispatch(authSetLoggedOut())
        return
      }
      setError(getApiErrorMessage(err, "Unable to load vault items"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
    // dispatch is stable from redux; loadItems is recreated each render.
    // We intentionally run only on mount for the initial fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vault</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading items..." : `${total} item${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadItems()}
            disabled={loading}
          >
            <RefreshCcw aria-hidden="true" />
            Refresh
          </Button>
          <Button type="button" onClick={() => dispatch(setCreateVaultDialogOpen(true))}>
            <Plus aria-hidden="true" />
            New item
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" aria-hidden="true" />
            Password Generator
          </CardTitle>
          <CardDescription>
            Generates a strong password with lowercase, uppercase, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[120px_1fr] sm:items-center">
            <label htmlFor="password-length" className="text-sm font-medium">
              Length
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="password-length"
                type="number"
                min={4}
                max={64}
                inputMode="numeric"
                value={generatorConfig.length}
                onChange={(event) => updateGeneratorLength(event.target.value)}
                className="w-28"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => regeneratePassword()}
              >
                <RotateCw aria-hidden="true" />
                Regenerate
              </Button>
            </div>
          </div>

          {generatorError ? (
            <p className="text-sm text-destructive">{generatorError}</p>
          ) : null}

          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm">
              {generatedPassword}
            </code>
            <CopyButton value={generatedPassword} label="Password copied" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              aria-pressed={generatorConfig.useLowercase}
              onClick={() =>
                toggleGeneratorOption("useLowercase", generatorConfig.useLowercase)
              }
              className={`rounded-full border px-3 py-1.5 transition-colors ${
                generatorConfig.useLowercase
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Lowercase (a-z)
            </button>
            <button
              type="button"
              aria-pressed={generatorConfig.useUppercase}
              onClick={() =>
                toggleGeneratorOption("useUppercase", generatorConfig.useUppercase)
              }
              className={`rounded-full border px-3 py-1.5 transition-colors ${
                generatorConfig.useUppercase
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Uppercase (A-Z)
            </button>
            <button
              type="button"
              aria-pressed={generatorConfig.useNumbers}
              onClick={() => toggleGeneratorOption("useNumbers", generatorConfig.useNumbers)}
              className={`rounded-full border px-3 py-1.5 transition-colors ${
                generatorConfig.useNumbers
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Numbers (0-9)
            </button>
            <button
              type="button"
              aria-pressed={generatorConfig.useSymbols}
              onClick={() => toggleGeneratorOption("useSymbols", generatorConfig.useSymbols)}
              className={`rounded-full border px-3 py-1.5 transition-colors ${
                generatorConfig.useSymbols
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Symbols (!@#$)
            </button>
            <span className="rounded-full border px-3 py-1.5 text-muted-foreground">
              length {generatorConfig.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {loading ? <LoadingState label="Loading vault items..." /> : null}
      {!loading && error ? (
        <ErrorState
          description={error}
          action={
            <Button type="button" variant="outline" onClick={() => void loadItems()}>
              Try again
            </Button>
          }
        />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No vault items yet"
          description="Create your first login item to get started."
          action={
            <Button type="button" onClick={() => dispatch(setCreateVaultDialogOpen(true))}>
              <Plus aria-hidden="true" />
              Create item
            </Button>
          }
        />
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id} className="hover:bg-muted/30 transition-colors">
              <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="break-all">
                    {item.websiteUrl || "No website URL"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.itemType}</Badge>
                  {item.favorite ? (
                    <Badge className="gap-1">
                      <Star className="size-3 fill-current" aria-hidden="true" />
                      Favorite
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Updated {formatDate(item.updatedAt)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/vault/${item.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <CreateVaultItemDialog
        onCreated={(id) => {
          router.push(`/vault/${id}`)
        }}
      />
    </div>
  )
}
