'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: 'water' | 'sunset' | 'teal';
  className?: string;
}

const gradients = {
  water: 'from-[hsl(var(--water-blue))] to-[hsl(var(--river-teal))]',
  sunset: 'from-[hsl(var(--fishing-orange))] to-[hsl(var(--sunset-coral))]',
  teal: 'from-[hsl(var(--river-teal))] to-[hsl(var(--fresh-aqua))]',
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'water',
  className,
}: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'bg-white rounded-2xl p-4 shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-primary mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-gradient-to-br', gradients[gradient])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
