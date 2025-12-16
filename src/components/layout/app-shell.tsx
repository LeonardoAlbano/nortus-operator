import type { ReactNode } from 'react';

import { AppSidebarClient } from '@/components/layout/app-sidebar.client';
import { AppTopbarClient } from '@/components/layout/app-topbar.client';
import { getSessionUser } from '@/lib/nortus-session';

function toInitials(input?: string) {
  const v = (input ?? '').trim();
  if (!v) return 'NA';

  const parts = v.includes('@') ? v.split('@')[0].split(/[._-]+/g) : v.split(/\s+/g);
  const a = (parts[0]?.[0] ?? '').toUpperCase();
  const b = (parts[1]?.[0] ?? parts[0]?.[1] ?? '').toUpperCase();
  return `${a}${b || 'A'}`.slice(0, 2);
}

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const initials = toInitials(user?.name ?? user?.email);

  return (
    <div className="bg-loomi-bg min-h-dvh">
      <AppTopbarClient userInitials={initials} />
      <AppSidebarClient userInitials={initials} />

      <main className="pt-16 lg:pl-(--app-sidebar-w)">
        <div className="px-4 py-6">
          <div className="mx-auto w-full max-w-300">{children}</div>
        </div>
      </main>
    </div>
  );
}
