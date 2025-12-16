import { vi, afterAll, afterEach, beforeAll } from 'vitest';

vi.mock('next/navigation', async () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    notFound: vi.fn(),
    redirect: vi.fn(),
  };
});

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import '@testing-library/jest-dom/vitest';

import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
