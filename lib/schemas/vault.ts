import { z } from "zod"

export const customFieldSchema = z.object({
  key: z.string().min(1, "Field key is required").max(100, "Field key is too long"),
  value: z.string().max(5000, "Field value is too long"),
})

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => {
    if (!value) {
      return true
    }

    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }, "Enter a valid URL")

export const vaultPayloadSchema = z.object({
  username: z.string().max(320, "Username is too long").optional().or(z.literal("")),
  password: z.string().max(5000, "Password is too long").optional().or(z.literal("")),
  notes: z.string().max(20000, "Notes are too long").optional().or(z.literal("")),
  otpSecret: z.string().max(2000, "OTP secret is too long").nullable().optional().or(z.literal("")),
  customFields: z.array(customFieldSchema).max(50, "Maximum 50 custom fields").default([]),
})

export const vaultItemFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  websiteUrl: optionalUrl,
  favorite: z.boolean().default(false),
  payload: vaultPayloadSchema,
})

export type VaultItemFormValues = z.infer<typeof vaultItemFormSchema>

