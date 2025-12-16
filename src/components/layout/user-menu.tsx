'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { HelpCircle, LogOut, Upload, Languages } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlagEnIcon } from '@/components/icons/flag-en-icon';
import { FlagPtbrIcon } from '@/components/icons/flag-ptbr-icon';

const AVATAR_STORAGE_KEY = 'nortus_avatar_dataurl';

const LOCALES = [
  { value: 'pt-BR', label: 'PT-BR', Icon: FlagPtbrIcon },
  { value: 'en', label: 'EN', Icon: FlagEnIcon },
] as const;

type LocaleValue = (typeof LOCALES)[number]['value'];

type Props = {
  initials: string;
  className?: string;
  align?: 'start' | 'end' | 'center';
  showChevron?: boolean;
};

function readStoredAvatar() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function UserMenu({ initials, className, align = 'end', showChevron }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => readStoredAvatar());

  const currentLocale = useMemo(() => {
    return LOCALES.find((l) => l.value === locale) ?? LOCALES[0];
  }, [locale]);

  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/login');
    router.refresh();
  }

  function onPickAvatar() {
    fileRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : null;
      if (!value) return;

      setAvatarUrl(value);

      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, value);
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  function setLocale(nextLocale: LocaleValue) {
    startTransition(async () => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ locale: nextLocale }),
      }).catch(() => {});
      router.refresh();
    });
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'ring-offset-background inline-flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/20',
              className,
            )}
            aria-label="Open user menu"
          >
            <Avatar className="h-12 w-12 shadow-(--loomi-shadow-user)">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="User avatar" /> : null}
              <AvatarFallback className="bg-(image:--loomi-gradient-primary) font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            {showChevron ? <span className="text-white/70">▾</span> : null}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          sideOffset={10}
          className="w-64 border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.85)] text-white backdrop-blur-md"
        >
          <DropdownMenuLabel className="text-white/80">Perfil</DropdownMenuLabel>

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={onPickAvatar}
              className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white"
            >
              <Upload className="h-4 w-4 opacity-80" />
              <span>Upload avatar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/help')}
              className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white"
            >
              <HelpCircle className="h-4 w-4 opacity-80" />
              <span>Help</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white">
                <Languages className="h-4 w-4 opacity-80" />
                <span>Language</span>
                <span className="ml-auto flex items-center gap-2 text-white/70">
                  {currentLocale.value === 'pt-BR' ? (
                    <FlagPtbrIcon className="h-4 w-4" />
                  ) : (
                    <FlagEnIcon className="h-4 w-4" />
                  )}
                  {currentLocale.label}
                </span>
              </DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-44 border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.90)] text-white backdrop-blur-md">
                  {LOCALES.map((l) => {
                    const Icon = l.Icon;
                    return (
                      <DropdownMenuItem
                        key={l.value}
                        disabled={isPending}
                        onClick={() => setLocale(l.value)}
                        className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{l.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            onClick={onLogout}
            className="cursor-pointer gap-3 focus:bg-white/10 focus:text-white"
          >
            <LogOut className="h-4 w-4 opacity-80" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
