import { isApiClientError } from "@/lib/types/api"

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (isApiClientError(error)) {
    if (error.code === "TOO_MANY_REQUESTS" || error.statusCode === 429) {
      const retry = error.retryAfterSeconds
      return retry
        ? `Too many requests. Please try again in ${retry} seconds.`
        : "Too many requests. Please try again shortly."
    }

    return error.message || fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function isUnauthorizedError(error: unknown) {
  return isApiClientError(error) && (error.statusCode === 401 || error.code === "UNAUTHORIZED")
}

