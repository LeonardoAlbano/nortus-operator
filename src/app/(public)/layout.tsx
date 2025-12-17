import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="bg-loomi-bg min-h-dvh text-white">{children}</div>;
}
