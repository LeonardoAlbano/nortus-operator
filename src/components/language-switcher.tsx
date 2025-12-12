'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LanguagemSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(nextLocale: string) {
    startTransition(async () => {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ locale: nextLocale }),
      });

      router.refresh();
    });
  }

  return (
    <select value={locale} onChange={(e) => onChange(e.target.value)} disabled={isPending}>
      <option value="pt-BR">PT-BR</option>
      <option value="en">EN</option>
    </select>
  );
}
