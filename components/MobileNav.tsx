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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-40 md:hidden">
      <div className="flex items-center justify-around mobile-nav-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-3 px-4 transition-colors relative',
                item.special && 'py-4'
              )}
            >
              {item.special ? (
                <div className="absolute -top-8 bg-gradient-water p-3 rounded-full shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs mt-1 font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
