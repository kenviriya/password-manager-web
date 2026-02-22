import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { API_BASE_URL } from "@/lib/env"
import {
  ApiClientError,
  type ApiEnvelope,
  type ApiErrorEnvelope,
  type ApiSuccessEnvelope,
} from "@/lib/types/api"

type ApiRequestInit = Omit<AxiosRequestConfig, "url" | "baseURL" | "data"> & {
  body?: AxiosRequestConfig["data"]
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  validateStatus: () => true,
  headers: {
    Accept: "application/json",
  },
})

function parseRetryAfterSeconds(response: AxiosResponse) {
  const raw = response.headers["retry-after"]
  if (!raw) {
    return undefined
  }

  const seconds = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(seconds) ? seconds : undefined
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(
    value &&
      typeof value === "object" &&
      "success" in value &&
      "message" in value,
  )
}

function normalizeStatusCode(response: AxiosResponse, payload?: ApiErrorEnvelope) {
  return payload?.error.statusCode ?? (response.status || 500)
}

export async function apiRequestEnvelope<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<ApiSuccessEnvelope<T>> {
  const { body, headers: requestHeaders, ...rest } = init
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(requestHeaders as Record<string, string> | undefined),
  }
  const data = body

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }

  let response: AxiosResponse

  try {
    response = await apiClient.request({
      url: path,
      ...rest,
      headers,
      data,
    })
  } catch (error) {
    const axiosError = error as AxiosError

    throw new ApiClientError({
      message:
        axiosError instanceof Error ? axiosError.message : "Network request failed",
      code: "NETWORK_ERROR",
      statusCode: 0,
    })
  }

  const payload = response.data as unknown
  const retryAfterSeconds = parseRetryAfterSeconds(response)

  if (response.status < 200 || response.status >= 300) {
    const apiErrorPayload =
      isApiEnvelope<unknown>(payload) && payload.success === false ? payload : undefined

    throw new ApiClientError({
      message: apiErrorPayload?.message ?? (response.statusText || "Request failed"),
      code:
        apiErrorPayload?.error.code ??
        (response.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR"),
      statusCode: normalizeStatusCode(response, apiErrorPayload),
      details: apiErrorPayload?.error.details,
      meta: apiErrorPayload?.meta,
      retryAfterSeconds,
    })
  }

  if (!isApiEnvelope<T>(payload) || payload.success !== true) {
    throw new ApiClientError({
      message: "Unexpected API response",
      code: "BAD_RESPONSE_FORMAT",
      statusCode: response.status,
      retryAfterSeconds,
    })
  }

  return payload
}

export async function apiRequest<T>(
  path: string,
  init: ApiRequestInit = {},
): Promise<T> {
  const envelope = await apiRequestEnvelope<T>(path, init)
  return envelope.data
}
