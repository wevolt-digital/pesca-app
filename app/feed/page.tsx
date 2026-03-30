'use client';

import { useEffect, useState } from 'react';
import FishCard from '@/components/FishCard';
import SectionHeader from '@/components/SectionHeader';
import { Catch } from '@/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CatchRow {
  id: string;
  species_name: string;
  weight: number;
  length: number | null;
  bait_description: string;
  lat: number;
  lng: number;
  location_name: string;
  photo_url: string | null;
  notes: string | null;
  caught_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    id: string;
    name: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

function rowToCatch(row: CatchRow): Catch {
  return {
    id: row.id,
    user: {
      id: row.profiles?.id ?? '',
      name: row.profiles?.name ?? 'Pescador',
      username: row.profiles?.username ?? '',
      avatar: row.profiles?.avatar_url ?? '',
      totalCatches: 0,
      totalSpots: 0,
      joinedDate: '',
    },
    species: row.species_name,
    weight: row.weight,
    length: row.length ?? undefined,
    bait: row.bait_description,
    location: { lat: row.lat, lng: row.lng, name: row.location_name },
    photo: row.photo_url ?? '',
    notes: row.notes ?? undefined,
    date: row.caught_at,
    likes: row.likes_count,
    comments: row.comments_count,
  };
}

export default function FeedPage() {
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('catches')
        .select(`
          id, species_name, weight, length, bait_description,
          lat, lng, location_name, photo_url, notes, caught_at,
          likes_count, comments_count,
          profiles ( id, name, username, avatar_url )
        `)
        .order('caught_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar feed:', error);
      } else {
        setCatches((data as CatchRow[]).map(rowToCatch));
      }
      setLoading(false);
    }

    fetchFeed();
  }, []);

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-[#091628] z-10 md:hidden">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <SectionHeader
            title="Feed"
            subtitle="Acompanhe as pescarias da comunidade"
            icon={Zap}
            dark
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : catches.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            Nenhuma captura registrada ainda.
          </p>
        ) : (
          catches.map((catchData, index) => (
            <motion.div
              key={catchData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FishCard catchData={catchData} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
