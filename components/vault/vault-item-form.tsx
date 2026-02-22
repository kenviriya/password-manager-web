'use client';

import {useState} from 'react';
import type {VaultItemFormValues} from '@/lib/schemas/vault';
import {vaultItemFormSchema} from '@/lib/schemas/vault';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {PasswordInput} from '@/components/shared/password-input';
import {
  FieldMessage,
  FormErrorMessage,
} from '@/components/shared/form-messages';
import {CopyButton} from '@/components/shared/copy-button';
import {Plus, Trash2} from 'lucide-react';

type FieldErrors = Record<string, string>;

function pathKey(path: ReadonlyArray<PropertyKey>) {
  return path
    .filter(
      (segment): segment is string | number => typeof segment !== 'symbol',
    )
    .join('.');
}

export function normalizeVaultFormValues(
  values?: Partial<VaultItemFormValues>,
): VaultItemFormValues {
  return {
    title: values?.title ?? '',
    websiteUrl: values?.websiteUrl ?? '',
    favorite: values?.favorite ?? false,
    payload: {
      username: values?.payload?.username ?? '',
      password: values?.payload?.password ?? '',
      notes: values?.payload?.notes ?? '',
      otpSecret:
        values?.payload?.otpSecret === null
          ? null
          : ((values?.payload?.otpSecret as string | undefined) ?? ''),
      customFields:
        values?.payload?.customFields?.map((field) => ({
          key: field.key ?? '',
          value: field.value ?? '',
        })) ?? [],
    },
  };
}

function toSubmitPayload(values: VaultItemFormValues): VaultItemFormValues {
  return {
    ...values,
    websiteUrl: values.websiteUrl?.trim() ? values.websiteUrl.trim() : '',
    payload: {
      ...values.payload,
      username: values.payload.username?.trim() ? values.payload.username : '',
      password: values.payload.password ?? '',
      notes: values.payload.notes ?? '',
      otpSecret:
        values.payload.otpSecret === '' ||
        values.payload.otpSecret === undefined
          ? null
          : values.payload.otpSecret,
      customFields: values.payload.customFields.filter(
        (field) => field.key.trim() || field.value.trim(),
      ),
    },
  };
}

export function VaultItemForm({
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
  formError,
}: {
  initialValues?: Partial<VaultItemFormValues>;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: VaultItemFormValues) => Promise<void>;
  onCancel?: () => void;
  formError?: string | null;
}) {
  const [values, setValues] = useState<VaultItemFormValues>(() =>
    normalizeVaultFormValues(initialValues),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const normalized = toSubmitPayload(values);
    const parsed = vaultItemFormSchema.safeParse(normalized);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = pathKey(issue.path);
        if (!(key in nextErrors)) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <FormErrorMessage message={formError} />

      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <div className="flex h-6 items-center">
            <label htmlFor="vault-title" className="text-sm font-medium">
              Title
            </label>
          </div>
          <Input
            id="vault-title"
            value={values.title}
            onChange={(event) =>
              setValues((prev) => ({...prev, title: event.target.value}))
            }
            aria-invalid={fieldErrors.title ? true : undefined}
          />
          <FieldMessage message={fieldErrors.title} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex h-6 items-center">
            <label htmlFor="vault-url" className="text-sm font-medium">
              Website URL
            </label>
          </div>
          <Input
            id="vault-url"
            placeholder="https://example.com/login"
            inputMode="url"
            value={values.websiteUrl ?? ''}
            onChange={(event) =>
              setValues((prev) => ({...prev, websiteUrl: event.target.value}))
            }
            aria-invalid={fieldErrors.websiteUrl ? true : undefined}
          />
          <FieldMessage message={fieldErrors.websiteUrl} />
        </div>

        <div className="space-y-2">
          <div className="flex h-6 items-center">
            <label htmlFor="vault-username" className="text-sm font-medium">
              Username / Email
            </label>
          </div>
          <Input
            id="vault-username"
            value={values.payload.username ?? ''}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                payload: {...prev.payload, username: event.target.value},
              }))
            }
          />
          <FieldMessage message={fieldErrors['payload.username']} />
        </div>

        <div className="space-y-2">
          <div className="flex h-6 items-center justify-between gap-2">
            <label htmlFor="vault-password" className="text-sm font-medium">
              Password
            </label>
            {values.payload.password ? (
              <CopyButton
                value={values.payload.password}
                label="Password copied"
              />
            ) : null}
          </div>
          <PasswordInput
            id="vault-password"
            value={values.payload.password ?? ''}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                payload: {...prev.payload, password: event.target.value},
              }))
            }
          />
          <FieldMessage message={fieldErrors['payload.password']} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex h-6 items-center justify-between gap-2">
            <label htmlFor="vault-otp" className="text-sm font-medium">
              OTP Secret (optional)
            </label>
            {values.payload.otpSecret ? (
              <CopyButton
                value={values.payload.otpSecret}
                label="OTP secret copied"
              />
            ) : null}
          </div>
          <Input
            id="vault-otp"
            value={values.payload.otpSecret ?? ''}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                payload: {...prev.payload, otpSecret: event.target.value},
              }))
            }
          />
          <FieldMessage message={fieldErrors['payload.otpSecret']} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex h-6 items-center">
            <label htmlFor="vault-notes" className="text-sm font-medium">
              Notes
            </label>
          </div>
          <Textarea
            id="vault-notes"
            rows={4}
            value={values.payload.notes ?? ''}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                payload: {...prev.payload, notes: event.target.value},
              }))
            }
          />
          <FieldMessage message={fieldErrors['payload.notes']} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Custom fields</h3>
            <p className="text-xs text-muted-foreground">
              Up to 50 key/value pairs.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setValues((prev) => ({
                ...prev,
                payload: {
                  ...prev.payload,
                  customFields: [
                    ...prev.payload.customFields,
                    {key: '', value: ''},
                  ],
                },
              }))
            }
            disabled={values.payload.customFields.length >= 50}
          >
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Add field
          </Button>
        </div>
        <FieldMessage message={fieldErrors['payload.customFields']} />
        <div className="space-y-4">
          {values.payload.customFields.map((field, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <label
                  htmlFor={`field-key-${index}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Key
                </label>
                <Input
                  id={`field-key-${index}`}
                  value={field.key}
                  onChange={(event) =>
                    setValues((prev) => {
                      const next = [...prev.payload.customFields];
                      next[index] = {...next[index], key: event.target.value};
                      return {
                        ...prev,
                        payload: {...prev.payload, customFields: next},
                      };
                    })
                  }
                  aria-invalid={
                    fieldErrors[`payload.customFields.${index}.key`]
                      ? true
                      : undefined
                  }
                />
                <FieldMessage
                  message={fieldErrors[`payload.customFields.${index}.key`]}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`field-value-${index}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Value
                </label>
                <Input
                  id={`field-value-${index}`}
                  value={field.value}
                  onChange={(event) =>
                    setValues((prev) => {
                      const next = [...prev.payload.customFields];
                      next[index] = {...next[index], value: event.target.value};
                      return {
                        ...prev,
                        payload: {...prev.payload, customFields: next},
                      };
                    })
                  }
                  aria-invalid={
                    fieldErrors[`payload.customFields.${index}.value`]
                      ? true
                      : undefined
                  }
                />
                <FieldMessage
                  message={fieldErrors[`payload.customFields.${index}.value`]}
                />
              </div>
              <div className="flex items-start pt-6.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      payload: {
                        ...prev.payload,
                        customFields: prev.payload.customFields.filter(
                          (_, i) => i !== index,
                        ),
                      },
                    }))
                  }
                  aria-label={`Remove custom field ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-medium">Favorite</p>
          <p className="text-xs text-muted-foreground">
            Pin this item in your list.
          </p>
        </div>
        <input
          type="checkbox"
          checked={values.favorite}
          onChange={(event) =>
            setValues((prev) => ({...prev, favorite: event.target.checked}))
          }
          className="size-4 rounded border-input"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting} className="sm:min-w-24">
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
