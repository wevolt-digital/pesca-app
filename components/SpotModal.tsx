'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Fish, Navigation } from 'lucide-react';
import { FishingSpot, Catch } from '@/types';

const typeLabels: Record<FishingSpot['type'], string> = {
  river: 'Rio',
  lake: 'Lago',
  ocean: 'Oceano',
  reservoir: 'Represa',
  fishery: 'Pesqueiro',
};

const typeColors: Record<FishingSpot['type'], string> = {
  river: 'bg-blue-500',
  lake: 'bg-cyan-500',
  ocean: 'bg-indigo-500',
  reservoir: 'bg-teal-500',
  fishery: 'bg-emerald-600',
};

interface SpotModalProps {
  spot: FishingSpot;
  catches: Catch[];
  onClose: () => void;
}

export default function SpotModal({ spot, catches, onClose }: SpotModalProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const spotCatches = catches.filter((c) => c.location.name === spot.name);

  return (
    <AnimatePresence>
      {/* Backdrop + container de centralização */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6"
      >
        {/* Sheet / Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white md:static md:w-full md:max-w-lg md:rounded-3xl md:max-h-[85vh]"
        >
        {/* Foto header */}
        <div className="relative h-52 flex-shrink-0">
          <Image
            src={spot.photos[0]}
            alt={spot.name}
            fill
            className="object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent rounded-t-3xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X size={16} />
          </button>

          <span
            className={`absolute top-4 left-4 ${typeColors[spot.type]} text-white text-xs font-semibold px-3 py-1 rounded-full`}
          >
            {typeLabels[spot.type]}
          </span>

          <div className="absolute bottom-4 left-4 right-12">
            <h2 className="text-white text-xl font-bold leading-tight">{spot.name}</h2>
            <div className="flex items-center gap-1 text-white/75 text-sm mt-0.5">
              <MapPin size={13} />
              <span>{spot.location.city}, {spot.location.state}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-5">

          {/* Resumo: avaliação + capturas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-lg">{spot.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">avaliação geral</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Fish size={15} />
              <span>{spot.totalCatches} capturas</span>
            </div>
          </div>

          {/* Coordenadas */}
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-3">
            <Navigation size={15} className="text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground font-mono">
              {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
            </span>
          </div>

          {/* Descrição */}
          {spot.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{spot.description}</p>
          )}

          {/* Avaliação do usuário */}
          <div>
            <p className="text-sm font-semibold mb-2">Sua avaliação</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={30}
                    className={`transition-colors ${
                      star <= (hoverRating || userRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border'
                    }`}
                  />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <p className="text-xs text-primary mt-1.5">
                Você avaliou com {userRating} estrela{userRating > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Capturas registradas no local */}
          <div>
            <p className="text-sm font-semibold mb-3">Capturas neste local</p>
            {spotCatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma captura registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {spotCatches.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 bg-muted/30 rounded-xl p-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={c.photo}
                        alt={c.species}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.species}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.weight} kg · {c.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Espaço extra para safe area no mobile */}
          <div className="h-2" />
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
