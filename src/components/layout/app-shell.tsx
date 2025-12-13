'use client';

import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-loomi-bg min-h-dvh">
      <AppTopbar />
      <AppSidebar />

      <main className="pt-16 lg:pl-(--app-sidebar-w)">
        <div className="px-4 py-6">
          <div className="mx-auto w-full max-w-300">{children}</div>
        </div>
      </main>
    </div>
  );
}
