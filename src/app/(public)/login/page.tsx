import { LanguagemSwitcher } from '@/components/language-switcher';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');

  return (
    <main>
      <header style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <LanguagemSwitcher />
      </header>

      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </main>
  );
}
