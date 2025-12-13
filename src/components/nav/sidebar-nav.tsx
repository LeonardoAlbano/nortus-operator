import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NAV_ITEMS } from './nav-items';

type Props = {
  className?: string;
  variant?: 'icon' | 'full';
  onNavigate?: () => void;
};

export function SidebarNav({ className, variant = 'icon', onNavigate }: Props) {
  const pathname = usePathname();
  const isFull = variant === 'full';

  return (
    <nav className={cn('flex flex-col', isFull ? 'gap-2' : 'gap-10', className)}>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Button
            key={href}
            asChild
            variant={isActive ? 'blueloomi' : 'loomibtn'}
            size={isFull ? 'default' : 'icon'}
            className={cn(
              isFull ? 'w-full justify-start gap-3' : 'h-15 w-16 rounded-xl',
              !isActive &&
                'hover:bg-[rgb(var(--loomi-primary-rgb)/0.60)] hover:shadow-(--loomi-shadow-primary-soft)',
            )}
          >
            <Link href={href} aria-label={label} onClick={onNavigate}>
              <Icon className="h-6 w-6" />
              {isFull ? <span className="text-sm">{label}</span> : null}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
