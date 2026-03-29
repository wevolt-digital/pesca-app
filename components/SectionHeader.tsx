import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn('p-2 rounded-xl', dark ? 'bg-primary/20' : 'bg-primary/10')}>
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h2 className={cn('text-xl font-bold', dark ? 'text-white' : 'text-foreground')}>{title}</h2>
          {subtitle && (
            <p className={cn('text-sm mt-0.5', dark ? 'text-white/50' : 'text-muted-foreground')}>{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
