export type ApiMeta = {
  timestamp?: string
  path?: string
  [key: string]: unknown
}

export type ApiErrorBody = {
  code: string
  statusCode: number
  details?: unknown
}

export type ApiSuccessEnvelope<T> = {
  success: true
  message: string
  data: T
  meta?: ApiMeta
}

export type ApiErrorEnvelope = {
  success: false
  message: string
  error: ApiErrorBody
  meta?: ApiMeta
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope

export class ApiClientError extends Error {
  code: string
  statusCode: number
  details?: unknown
  meta?: ApiMeta
  retryAfterSeconds?: number

  constructor(args: {
    message: string
    code: string
    statusCode: number
    details?: unknown
    meta?: ApiMeta
    retryAfterSeconds?: number
  }) {
    super(args.message)
    this.name = "ApiClientError"
    this.code = args.code
    this.statusCode = args.statusCode
    this.details = args.details
    this.meta = args.meta
    this.retryAfterSeconds = args.retryAfterSeconds
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

