import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'pt-BR'] as const;
type Locale = (typeof locales)[number];

const defaultLocale: Locale = 'pt-BR';

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const raw = store.get('locale')?.value;
  const locale: Locale = raw && isLocale(raw) ? raw : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
