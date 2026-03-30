'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Trophy, Fish, Zap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import StatsCard from '@/components/StatsCard';
import SectionHeader from '@/components/SectionHeader';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface CatchRow {
  id: string;
  species_name: string;
  weight: number;
  location_name: string;
  bait_description: string;
  caught_at: string;
  photo_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [catches, setCatches] = useState<CatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/'); return; }

      const [{ data: prof }, { data: catchRows }] = await Promise.all([
        supabase.from('profiles').select('id, name, username, avatar_url, bio').eq('id', user.id).single(),
        supabase.from('catches').select('id, species_name, weight, location_name, bait_description, caught_at, photo_url').eq('user_id', user.id).order('caught_at', { ascending: false }),
      ]);

      setProfile(prof ?? { id: user.id, name: user.email ?? '', username: '', avatar_url: null, bio: null });
      setCatches(catchRows ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando perfil...</p>
      </div>
    );
  }

  const totalWeight = catches.reduce((s, c) => s + (c.weight ?? 0), 0);
  const uniqueSpecies = new Set(catches.map(c => c.species_name)).size;
  const biggestCatch = catches.reduce<CatchRow | null>((best, c) => (!best || c.weight > best.weight ? c : best), null);

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-[#091628] z-10 md:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SectionHeader title="Perfil" subtitle={profile?.name ?? ''} icon={User} dark />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Card de identidade */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={28} className="text-primary" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile?.name}</h2>
                {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                {profile?.bio && <p className="text-sm text-foreground mt-2">{profile.bio}</p>}
              </div>
            </div>
            <Button className="bg-primary text-white rounded-xl" onClick={() => router.push('/profile/edit')}>
              Editar Perfil
            </Button>
          </div>
        </motion.div>

        {/* Cards de stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <StatsCard title="Pescas" value={catches.length} icon={Fish} gradient="teal" />
          <StatsCard title="Espécies" value={uniqueSpecies} icon={Zap} gradient="teal" />
          <StatsCard title="Peso Total" value={`${totalWeight.toFixed(1)} kg`} icon={Trophy} gradient="teal" />
          <StatsCard title="Locais" value={new Set(catches.map(c => c.location_name)).size} icon={MapPin} gradient="teal" />
        </motion.div>

        {/* Maior captura */}
        {biggestCatch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 space-y-2"
          >
            <h3 className="font-bold text-lg text-foreground">Maior Captura</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{biggestCatch.species_name}</span>
              <span className="font-bold text-lg text-primary">{biggestCatch.weight} kg</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(biggestCatch.caught_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </motion.div>
        )}

        {/* Lista de pescas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader title="Minhas Pescas" subtitle={`${catches.length} registros`} />
        </motion.div>

        {catches.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Nenhuma pesca registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {catches.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {c.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photo_url} alt={c.species_name} className="w-full aspect-[4/3] object-cover" />
                )}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{c.species_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.location_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.caught_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-lg">{c.weight} kg</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
