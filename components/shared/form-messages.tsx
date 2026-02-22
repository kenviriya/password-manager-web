export function FormErrorMessage({ message }: { message?: string | null }) {
  if (!message) {
    return null
  }

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  )
}

export function FieldMessage({ message }: { message?: string | null }) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

