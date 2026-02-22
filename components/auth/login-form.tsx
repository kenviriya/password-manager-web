'use client';

import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {toast} from 'sonner';
import {loginSchema, type LoginFormValues} from '@/lib/schemas/auth';
import {login} from '@/lib/api/auth';
import {getApiErrorMessage} from '@/lib/errors';
import {useAppDispatch} from '@/hooks/redux';
import {authSetUser} from '@/lib/redux/slices/auth-slice';
import {APP_ROUTES} from '@/lib/routes';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {PasswordInput} from '@/components/shared/password-input';
import {
  FieldMessage,
  FormErrorMessage,
} from '@/components/shared/form-messages';
import {GoogleLoginButton} from '@/components/auth/google-login-button';
import {AuthShell} from '@/components/auth/auth-shell';

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return APP_ROUTES.vault;
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oauthErrorCode = searchParams.get('code');
  const oauthErrorMessage = searchParams.get('message');
  const oauthSuccess = searchParams.get('success');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in nextErrors)) {
          nextErrors[key as keyof LoginFormValues] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      dispatch(authSetUser(response.user));
      toast.success('Logged in');
      router.replace(safeNextPath(searchParams.get('next')));
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to log in'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      description="Access your encrypted vault using your session cookie login."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href={APP_ROUTES.register}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      {oauthSuccess === '0' ? (
        <FormErrorMessage
          message={
            oauthErrorMessage || oauthErrorCode
              ? `Google login failed: ${oauthErrorMessage ?? oauthErrorCode}`
              : 'Google login failed.'
          }
        />
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormErrorMessage message={formError} />
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) =>
              setValues((prev) => ({...prev, email: event.target.value}))
            }
            aria-invalid={fieldErrors.email ? true : undefined}
            className="mt-2"
          />
          <FieldMessage message={fieldErrors.email} />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) =>
              setValues((prev) => ({...prev, password: event.target.value}))
            }
            aria-invalid={fieldErrors.password ? true : undefined}
            className="mt-2"
          />
          <FieldMessage message={fieldErrors.password} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="space-y-3">
        <div className="relative py-1 text-center text-xs text-muted-foreground">
          <span className="bg-card px-2">or</span>
          <div
            className="absolute inset-x-0 top-1/2 -z-10 border-t"
            aria-hidden="true"
          />
        </div>
        <GoogleLoginButton />
        <p className="text-xs text-muted-foreground">
          Google OAuth works best when backend callback redirect URLs are
          configured.
        </p>
      </div>
    </AuthShell>
  );
}
