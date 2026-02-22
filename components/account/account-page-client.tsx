'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {updatePassword, logout} from '@/lib/api/auth';
import {getApiErrorMessage, isUnauthorizedError} from '@/lib/errors';
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from '@/lib/schemas/auth';
import {useAppDispatch, useAppSelector} from '@/hooks/redux';
import {authSetLoggedOut, authSetUser} from '@/lib/redux/slices/auth-slice';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {PasswordInput} from '@/components/shared/password-input';
import {
  FieldMessage,
  FormErrorMessage,
} from '@/components/shared/form-messages';

type FieldErrors = Partial<Record<keyof UpdatePasswordFormValues, string>>;

function formatDate(value: string | null) {
  if (!value) return 'Never';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AccountPageClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [values, setValues] = useState<UpdatePasswordFormValues>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const parsed = updatePasswordSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in nextErrors)) {
          nextErrors[key as keyof UpdatePasswordFormValues] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const response = await updatePassword({
        currentPassword: parsed.data.currentPassword || undefined,
        newPassword: parsed.data.newPassword,
      });
      if (response && response.user) {
        dispatch(authSetUser(response.user));
      }
      setValues({currentPassword: '', newPassword: '', confirmPassword: ''});
      toast.success('Password updated');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        dispatch(authSetLoggedOut());
        return;
      }
      setFormError(getApiErrorMessage(error, 'Unable to update password'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(getApiErrorMessage(error, 'Unable to log out cleanly'));
      }
    } finally {
      dispatch(authSetLoggedOut());
      setLoggingOut(false);
      router.replace('/login');
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Session-backed account details from <code>/auth/me</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Authenticated user returned by the backend SafeUser shape.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Display name</p>
            <p className="mt-1 font-medium">{user.displayName || 'Not set'}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="mt-1 break-all font-medium">{user.email}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="mt-1">{formatDate(user.createdAt)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Last login</p>
            <p className="mt-1">{formatDate(user.lastLoginAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update password</CardTitle>
          <CardDescription>
            For Google-only accounts, current password may be optional on the
            backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handlePasswordSubmit}
            noValidate
          >
            <FormErrorMessage message={formError} />
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current password (optional for OAuth-only accounts)
              </label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                value={values.currentPassword ?? ''}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                aria-invalid={fieldErrors.currentPassword ? true : undefined}
                className="mt-2"
              />
              <FieldMessage message={fieldErrors.currentPassword} />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New password
              </label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                value={values.newPassword}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                aria-invalid={fieldErrors.newPassword ? true : undefined}
                className="mt-2"
              />
              <FieldMessage message={fieldErrors.newPassword} />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                aria-invalid={fieldErrors.confirmPassword ? true : undefined}
                className="mt-2"
              />
              <FieldMessage message={fieldErrors.confirmPassword} />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Logout clears the <code>sid</code> cookie on the backend and
            invalidates the Redis session.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            This frontend does not store auth tokens in local storage.
          </p>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
