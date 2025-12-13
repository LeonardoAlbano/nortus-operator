import Link from 'next/link';

import { SidebarNav } from '@/components/nav/sidebar-nav';
import { Button } from '@/components/ui/button';
import NortusIcon from '../icons/nortus-icon';

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-(--app-sidebar-w) lg:flex">
      <div className="bg-loomi-header flex h-full w-full flex-col items-center overflow-hidden rounded-r-[40px] px-6 py-8 shadow-(--loomi-shadow-sidebar)">
        <Button asChild variant="ghost" size="icon" className="size-12 cursor-pointer rounded-2xl">
          <Link href="/dashboard" aria-label="Go to dashboard">
            <NortusIcon />
          </Link>
        </Button>

        <div className="flex flex-1 items-center justify-center">
          <SidebarNav variant="icon" />
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(image:--loomi-gradient-primary) font-semibold text-white shadow-(--loomi-shadow-user)">
          AC
        </div>
      </div>
    </aside>
  );
}
