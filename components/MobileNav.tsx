'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Zap, Plus, Compass, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/feed', icon: Zap, label: 'Feed' },
  { href: '/register', icon: Plus, label: 'Registrar', special: true },
  { href: '/discover', icon: Compass, label: 'Descobrir' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 shadow-lg backdrop-blur md:hidden">
        <div className="grid grid-cols-5 items-end mobile-nav-safe px-2 pt-2 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.special) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-end"
                >
                  <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all hover:scale-105 active:scale-95">
                    <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-semibold leading-none text-primary">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-2"
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'mt-1 text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="fixed left-1/2 top-4 z-40 hidden -translate-x-1/2 rounded-full border border-border bg-white/90 px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.10)] backdrop-blur md:block">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.special) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mx-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:opacity-95"
                >
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}