'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store';

const REMEMBER_KEY = 'nortus.rememberedEmail';

type LoginSuccess = { user: { name: string; email: string } };

export function LoginForm() {
  const t = useTranslations('Login');
  const setUser = useAuthStore((s) => s.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const schema = useMemo(() => {
    return z.object({
      email: z.string().trim().min(1, t('errors.usernameRequired')),
      password: z.string().min(1, t('errors.passwordRequired')),
      remember: z.boolean().optional(),
    });
  }, [t]);

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onSubmit',
  });

  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBER_KEY) ?? '';
    if (remembered) {
      form.setValue('email', remembered, { shouldDirty: false });
      form.setValue('remember', true, { shouldDirty: false });
    }
  }, [form]);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: values.email, password: values.password }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message ?? t('errors.invalidCredentials'));
        }

        const data = (await res.json()) as LoginSuccess;

        if (values.remember) window.localStorage.setItem(REMEMBER_KEY, values.email);
        else window.localStorage.removeItem(REMEMBER_KEY);

        setUser(data.user);
        toast.success(t('success'));

        window.location.href = '/dashboard';
      } catch (e) {
        const message = e instanceof Error ? e.message : t('errors.generic');
        toast.error(message);
      }
    });
  }

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm text-white/80">{t('fields.username.label')}</label>
        <Input
          {...form.register('email')}
          className="h-12 rounded-xl border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white placeholder:text-white/40"
          placeholder={t('fields.username.placeholder')}
          autoComplete="email"
        />
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-white/45">{t('fields.username.hint')}</p>
          {emailError ? <p className="text-xs text-red-300">{emailError}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/80">{t('fields.password.label')}</label>

        <div className="relative">
          <Input
            {...form.register('password')}
            type={showPassword ? 'text' : 'password'}
            className="h-12 rounded-xl border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] pr-11 text-white placeholder:text-white/40"
            placeholder={t('fields.password.placeholder')}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-2 text-white/65 hover:text-white"
            aria-label={showPassword ? t('fields.password.hide') : t('fields.password.show')}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        {passwordError ? <p className="text-xs text-red-300">{passwordError}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm text-white/75">
          <input
            type="checkbox"
            className="size-4 rounded border border-white/20 bg-transparent accent-[rgb(var(--loomi-primary-rgb))]"
            {...form.register('remember')}
          />
          {t('remember')}
        </label>

        <Link href="/forget-password" className="text-loomi-primary text-sm hover:underline">
          {t('forget')}
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        variant="blueloomi"
        className="h-12 w-full rounded-xl text-base"
      >
        {isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
