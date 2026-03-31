'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Loader2, Star, StarOff, Trash2, MapPin, Fish, Scale } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/SectionHeader';
import { Shield } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminCatch {
  id: string;
  species_name: string;
  weight: number;
  location_name: string;
  photo_url: string | null;
  caught_at: string;
  is_promoted: boolean;
  profiles: { name: string; username: string | null } | null;
}

interface AdminSpot {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  total_catches: number;
  rating: number;
  added_by: string | null;
  profiles: { name: string; username: string | null } | null;
}

type Tab = 'postagens' | 'locais';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('postagens');
  const [catches, setCatches] = useState<AdminCatch[]>([]);
  const [spots, setSpots] = useState<AdminSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'promoted'>('all');

  const supabase = getSupabaseBrowserClient();

  const fetchCatches = useCallback(async () => {
    const { data, error } = await supabase
      .from('catches')
      .select(`
        id, species_name, weight, location_name, photo_url, caught_at, is_promoted,
        profiles!catches_user_id_fkey ( name, username )
      `)
      .order('is_promoted', { ascending: false })
      .order('caught_at', { ascending: false });

    if (!error) setCatches((data ?? []) as unknown as AdminCatch[]);
  }, [supabase]);

  const fetchSpots = useCallback(async () => {
    const { data, error } = await supabase
      .from('fishing_spots')
      .select(`
        id, name, city, state, type, total_catches, rating, added_by,
        profiles!fishing_spots_added_by_fkey ( name, username )
      `)
      .order('created_at', { ascending: false });

    if (!error) setSpots((data ?? []) as unknown as AdminSpot[]);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchCatches(), fetchSpots()]);
      setLoading(false);
    }
    load();
  }, [fetchCatches, fetchSpots]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async function togglePromote(catchId: string, currentlyPromoted: boolean) {
    setActionLoading(catchId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(`/api/catches/${catchId}/promote`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ promote: !currentlyPromoted }),
    });

    await fetchCatches();
    setActionLoading(null);
  }

  async function deleteSpot(spotId: string) {
    setActionLoading(spotId);
    await supabase.from('fishing_spots').delete().eq('id', spotId);
    setSpots((prev) => prev.filter((s) => s.id !== spotId));
    setActionLoading(null);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const visibleCatches = filter === 'promoted'
    ? catches.filter((c) => c.is_promoted)
    : catches;

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-[#091628] z-10 md:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SectionHeader
            title="Admin"
            subtitle="Gerencie postagens e locais"
            icon={Shield}
            dark
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['postagens', 'locais'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tab === 'postagens' ? (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {(['all', 'promoted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    filter === f
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {f === 'all' ? 'Todas' : 'Destaques'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleCatches.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Nenhuma postagem encontrada.
                </p>
              )}
              {visibleCatches.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border ${
                    c.is_promoted ? 'border-amber-300' : 'border-transparent'
                  }`}
                >
                  {/* Foto */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                    {c.photo_url ? (
                      <Image src={c.photo_url} alt={c.species_name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Fish className="w-6 h-6 text-primary/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{c.species_name}</span>
                      {c.is_promoted && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Destaque
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{c.profiles?.username ?? '—'} · {c.weight} kg
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3" />
                      {c.location_name}
                    </p>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant={c.is_promoted ? 'outline' : 'default'}
                    className="flex-shrink-0 gap-1.5"
                    disabled={actionLoading === c.id}
                    onClick={() => togglePromote(c.id, c.is_promoted)}
                  >
                    {actionLoading === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : c.is_promoted ? (
                      <>
                        <StarOff className="w-4 h-4" />
                        Remover
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Destacar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {spots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Nenhum local cadastrado.
              </p>
            )}
            {spots.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border border-transparent"
              >
                {/* Ícone */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.city}/{s.state} · {s.type}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {s.total_catches} capturas · ⭐ {s.rating.toFixed(1)}
                    {s.profiles && (
                      <span className="ml-1">· @{s.profiles.username ?? s.profiles.name}</span>
                    )}
                  </p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-shrink-0 gap-1.5"
                  disabled={actionLoading === s.id}
                  onClick={() => deleteSpot(s.id)}
                >
                  {actionLoading === s.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
