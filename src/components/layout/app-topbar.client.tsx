'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from '@/components/nav/sidebar-nav';
import { NAV_ITEMS } from '@/components/nav/nav-items';
import { UserMenu } from '@/components/layout/user-menu';
import { NewTicketDialog } from '@/features/tickets/ui/new-ticket-dialog';

export function AppTopbarClient({ userInitials }: { userInitials: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const match = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
    return match?.label ?? 'Dashboard';
  }, [pathname]);

  const isTickets = useMemo(() => {
    const path = pathname.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/)/i, '');
    return path === '/tickets' || path.startsWith('/tickets/');
  }, [pathname]);

  return (
    <header className="bg-loomi-header fixed inset-x-0 top-0 z-10 h-16 border-b border-white/5">
      <div className="flex h-full items-center gap-3 px-4 lg:pl-[calc(var(--app-sidebar-w)+16px)]">
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="cursor-pointer">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="bg-loomi-header w-72 text-white">
              <SheetHeader>
                <SheetTitle className="text-white">Nortus</SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex h-full flex-col">
                <SidebarNav variant="full" onNavigate={() => setOpen(false)} />
                <div className="mt-auto pt-6">
                  <UserMenu initials={userInitials} align="end" showChevron />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="flex-1 truncate text-lg font-semibold text-white">{pageTitle}</h1>

        {isTickets ? <NewTicketDialog triggerClassName="h-10 rounded-full px-4" /> : null}
      </div>
    </header>
  );
}
