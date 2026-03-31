'use client';

import { FishingSpot, Catch } from '@/types';
import UserAvatar from './UserAvatar';
import { MapPin, Star, Fish, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapDetailCardProps {
  data: FishingSpot | Catch;
  type: 'spot' | 'catch';
  onClose: () => void;
}

export default function MapDetailCard({ data, type, onClose }: MapDetailCardProps) {
  if (type === 'spot') {
    const spot = data as FishingSpot;
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 md:w-96 md:absolute md:bottom-auto md:right-4 md:top-4 md:rounded-2xl"
      >
        <div className="p-4 max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{spot.name}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>
                {spot.location.city}, {spot.location.state}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold">{spot.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Fish className="w-4 h-4" />
                <span>{spot.totalCatches} pescas</span>
              </div>
            </div>

            {spot.description && (
              <p className="text-sm text-foreground">{spot.description}</p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">ADICIONADO POR</p>
              <div className="flex items-center gap-2">
                <UserAvatar user={spot.addedBy} size="md" />
                <div>
                  <p className="text-sm font-semibold">{spot.addedBy.name}</p>
                  <p className="text-xs text-muted-foreground">{spot.addedBy.totalCatches} pescas</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4 bg-gradient-water text-white">
              Ver Detalhes
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const catchData = data as Catch;
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 md:w-96 md:absolute md:bottom-auto md:right-4 md:top-4 md:rounded-2xl"
    >
      <div className="p-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{catchData.species}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserAvatar user={catchData.user} size="md" />
            <div>
              <p className="text-sm font-semibold">{catchData.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(catchData.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="bg-accent/10 rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Peso:</span>
              <span className="font-semibold">{catchData.weight} kg</span>
            </div>
            {catchData.length && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Comprimento:</span>
                <span className="font-semibold">{catchData.length} cm</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Isca:</span>
              <span className="font-semibold">{catchData.bait}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>{catchData.location.name}</span>
          </div>

          {catchData.notes && (
            <p className="text-sm text-foreground italic">{catchData.notes}</p>
          )}

        </div>
      </div>
    </motion.div>
  );
}
