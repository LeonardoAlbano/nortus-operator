import Image from 'next/image';
import { Headphones } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { LanguagemSwitcher } from '@/components/language-switcher';
import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  const t = useTranslations('Login');

  return (
    <main className="bg-loomi-bg relative min-h-dvh overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(950px_circle_at_20%_15%,rgb(var(--loomi-primary-rgb)/0.16),transparent_55%),radial-gradient(900px_circle_at_85%_60%,rgb(var(--loomi-accent-rgb)/0.10),transparent_60%)]" />

      <div className="mx-auto w-full max-w-360 px-6 py-8 md:px-12 md:py-10">
        <section className="grid gap-12 lg:grid-cols-[520px_1fr] lg:items-start">
          <div>
            <div className="text-4xl font-semibold tracking-tight">Nortus</div>

            <div className="mt-16 max-w-130 lg:mt-20">
              <h1 className="text-5xl font-semibold tracking-tight">{t('title')}</h1>
              <p className="mt-3 text-white/60">{t('subtitle')}</p>

              <div className="mt-10">
                <LoginForm />
              </div>
            </div>
          </div>

          <div>
            <div className="bg-loomi-header relative mx-auto w-full max-w-233.5 overflow-hidden rounded-[60px] shadow-[0_5px_100px_rgba(0,0,0,0.55)] lg:mx-0">
              <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_55%_25%,rgb(var(--loomi-primary-rgb)/0.18),transparent_55%)]" />

              <div className="bg-loomi-bg absolute top-0 right-0 z-10 flex items-start gap-4 rounded-bl-4xl p-3.5">
                <Button
                  variant="loomibtn"
                  className="cursor-poi h-22 w-40 rounded-full border border-white/5 bg-[rgb(var(--loomi-surface-rgb)/0.65)] px-6 text-lg"
                  type="button"
                >
                  <Headphones className="h-6 w-6" />
                  {t('help')}
                </Button>

                <LanguagemSwitcher
                  className="h-17 w-36 cursor-pointer rounded-full border border-white/5 bg-[rgb(var(--loomi-surface-rgb)/0.65)] px-6 text-lg text-white"
                  showFlag
                />
              </div>

              <Image
                src="/illustrations/login-hero.png"
                alt=""
                width={934}
                height={952}
                priority
                className="h-auto w-full object-cover"
                sizes="(min-width: 1024px) 934px, (min-width: 768px) 60vw, 100vw"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
