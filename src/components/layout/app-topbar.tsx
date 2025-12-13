'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HelpCircle, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from '@/components/nav/sidebar-nav';
import { LanguagemSwitcher } from '@/components/language-switcher';
import { NAV_ITEMS } from '@/components/nav/nav-items';

export function AppTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const match = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
    return match?.label ?? 'Dashboard';
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

              <div className="mt-6">
                <SidebarNav variant="full" onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" className="cursor-pointer">
            <HelpCircle className="mr-2 size-4" />
            Help
          </Button>

          <div className="cursor-pointer">
            <LanguagemSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
