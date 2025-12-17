'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { FlagEnIcon } from '@/components/icons/flag-en-icon';
import { FlagPtbrIcon } from '@/components/icons/flag-ptbr-icon';

const LOCALES = [
  { value: 'pt-BR', label: 'PT-br', Icon: FlagPtbrIcon },
  { value: 'en', label: 'EN', Icon: FlagEnIcon },
] as const;

type LocaleValue = (typeof LOCALES)[number]['value'];

type Props = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  showFlag?: boolean;
};

export function LanguagemSwitcher({
  className,
  variant = 'loomibtn',
  size = 'default',
  showFlag = true,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];
  const CurrentIcon = current.Icon;

  function setLocale(nextLocale: LocaleValue) {
    startTransition(async () => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ locale: nextLocale }),
      });

      router.refresh();
      setOpen(false);
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isPending}
          className={cn(
            'flex items-center justify-center gap-2 rounded-full border border-white/5 bg-[rgb(var(--loomi-surface-rgb)/0.65)] px-6 text-white backdrop-blur-md hover:bg-[rgb(var(--loomi-surface-rgb)/0.75)]',
            className,
          )}
        >
          <ChevronDown
            className={cn(
              'h-6 w-6 opacity-80 transition-transform duration-200',
              open ? 'rotate-180' : 'rotate-0',
            )}
          />

          {showFlag ? <CurrentIcon className="h-6 w-6" /> : null}

          <span className="leading-none">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-44 border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.75)] text-white backdrop-blur-md"
      >
        {LOCALES.map((l) => {
          const Icon = l.Icon;

          return (
            <DropdownMenuItem
              key={l.value}
              onClick={() => setLocale(l.value)}
              className="gap-3 focus:bg-white/10 focus:text-white"
            >
              <Icon className="h-5 w-5" />
              <span>{l.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
