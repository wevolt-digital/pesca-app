'use client';

import { motion } from 'framer-motion';
import { Compass, Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingMapControlsProps {
  onRecenter?: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
  className?: string;
}

export default function FloatingMapControls({
  onRecenter,
  onAdd,
  onFilter,
  className,
}: FloatingMapControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('fixed flex flex-col gap-3 z-30 right-4 bottom-36 md:right-6 md:bottom-20', className)}
    >
      {onRecenter && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRecenter}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Recentrar"
        >
          <Compass className="w-5 h-5 text-primary" />
        </motion.button>
      )}

      {onFilter && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onFilter}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Filtros"
        >
          <Filter className="w-5 h-5 text-primary" />
        </motion.button>
      )}

      {onAdd && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className="p-3 bg-gradient-water rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Adicionar spot"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
}
