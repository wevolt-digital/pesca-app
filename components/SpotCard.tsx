'use client';

import Image from 'next/image';
import { FishingSpot } from '@/types';
import { MapPin, Star, Fish } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpotCardProps {
  spot: FishingSpot;
  onClick?: () => void;
}

const typeColors = {
  river: 'bg-blue-500',
  lake: 'bg-cyan-500',
  ocean: 'bg-indigo-500',
  reservoir: 'bg-teal-500',
};

const typeLabels = {
  river: 'Rio',
  lake: 'Lago',
  ocean: 'Oceano',
  reservoir: 'Represa',
};

export default function SpotCard({ spot, onClick }: SpotCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
    >
      <div className="relative h-40">
        <Image
          src={spot.photos[0]}
          alt={spot.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`${typeColors[spot.type]} text-white text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {typeLabels[spot.type]}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base text-primary line-clamp-1">{spot.name}</h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-secondary" />
          <span className="line-clamp-1">
            {spot.location.city}, {spot.location.state}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-semibold">{spot.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Fish className="w-4 h-4" />
            <span>{spot.totalCatches} pescas</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
