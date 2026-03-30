'use client';

import Image from 'next/image';
import { Catch } from '@/types';
import UserAvatar from './UserAvatar';
import { Heart, MessageCircle, MapPin, Scale, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FishCardProps {
  catchData: Catch;
}

export default function FishCard({ catchData }: FishCardProps) {
  const [isLiked, setIsLiked] = useState(catchData.isLiked || false);
  const [likes, setLikes] = useState(catchData.likes);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      <div className="p-4 flex items-center gap-3">
        <UserAvatar user={catchData.user} size="md" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{catchData.user.name}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(catchData.date).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="relative h-80 bg-gray-100">
        <Image
          src={catchData.photo}
          alt={catchData.species}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
              <span className="text-sm font-medium">{likes}</span>
            </motion.button>
            <button className="flex items-center gap-1.5 text-gray-600">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{catchData.comments}</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg text-primary">{catchData.species}</h3>

          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full">
              <Scale className="w-4 h-4" />
              <span className="text-sm font-semibold">{catchData.weight} kg</span>
            </div>

            {catchData.length && (
              <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full">
                <Ruler className="w-4 h-4" />
                <span className="text-sm font-semibold">{catchData.length} cm</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <span className="text-sm font-semibold">{catchData.bait}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
          <span>{catchData.location.name}</span>
        </div>

        {catchData.notes && (
          <p className="text-sm text-foreground">{catchData.notes}</p>
        )}
      </div>
    </motion.div>
  );
}
