'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export default function FilterChips({ chips, selected, onChange, className }: FilterChipsProps) {
  const toggleChip = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <motion.button
          key={chip.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleChip(chip.id)}
          className={cn(
            'px-4 py-2 rounded-full font-medium text-sm transition-colors',
            selected.includes(chip.id)
              ? 'bg-primary text-white shadow-md'
              : 'bg-white border border-border text-foreground hover:border-primary'
          )}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  );
}
