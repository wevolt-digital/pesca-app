'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SectionHeader from '@/components/SectionHeader';
import { Camera, Fish, Loader2, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
}

interface SpeciesOption {
  id: string;
  name: string;
}

interface LureOption {
  id: string;
  name: string;
  type: string;
}

export default function RegisterPage() {
  const [species, setSpecies] = useState<SpeciesOption[]>([]);
  const [lures, setLures] = useState<LureOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Autocomplete de espécie
  const [speciesQuery, setSpeciesQuery] = useState('');
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const speciesRef = useRef<HTMLDivElement>(null);

  const filteredSpecies = speciesQuery.trim().length > 0
    ? species.filter((s) =>
        s.name.toLowerCase().includes(speciesQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Autocomplete de isca
  const [lureQuery, setLureQuery] = useState('');
  const [lureOpen, setLureOpen] = useState(false);
  const lureRef = useRef<HTMLDivElement>(null);

  // Geocodificação de local
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const locationRef = useRef<HTMLDivElement>(null);
  const nominatimDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredLures = lureQuery.trim().length > 0
    ? lures.filter((l) =>
        l.name.toLowerCase().includes(lureQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (speciesRef.current && !speciesRef.current.contains(e.target as Node)) {
        setSpeciesOpen(false);
      }
      if (lureRef.current && !lureRef.current.contains(e.target as Node)) {
        setLureOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca geocodificação com debounce
  const searchLocation = useCallback((query: string) => {
    if (nominatimDebounceRef.current) clearTimeout(nominatimDebounceRef.current);

    if (query.trim().length < 3) {
      setLocationSuggestions([]);
      setLocationOpen(false);
      return;
    }

    nominatimDebounceRef.current = setTimeout(async () => {
      setLocationLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '6',
          countrycodes: 'br',
          addressdetails: '0',
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
        });
        const data: NominatimResult[] = await res.json();
        setLocationSuggestions(data);
        setLocationOpen(data.length > 0);
      } catch {
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, 500);
  }, []);

  // GPS: pega localização atual e faz geocodificação reversa
  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const params = new URLSearchParams({
            lat: String(latitude),
            lon: String(longitude),
            format: 'json',
          });
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
            headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
          });
          const data = await res.json();
          const name: string = data.display_name ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setLocationQuery(name);
          setCoordinates({ lat: latitude, lng: longitude });
          setFormData((prev) => ({ ...prev, location: name }));
        } catch {
          const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setLocationQuery(fallback);
          setCoordinates({ lat: latitude, lng: longitude });
          setFormData((prev) => ({ ...prev, location: fallback }));
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { timeout: 10000 }
    );
  };

  // DEV ONLY: sign-in automático com usuário de teste se não houver sessão ativa
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function devSignIn() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        return;
      }

      if (process.env.NODE_ENV !== 'development') return;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env.NEXT_PUBLIC_DEV_TEST_EMAIL!,
        password: process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD!,
      });
      if (error) {
        console.error('Dev sign-in falhou:', error.message);
      } else {
        setUserId(data.user.id);
      }
    }

    devSignIn();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function fetchOptions() {
      const [speciesResult, luresResult] = await Promise.all([
        supabase.from('fish_species').select('id, name').order('name'),
        supabase.from('lures').select('id, name, type').order('name'),
      ]);

      if (!speciesResult.error && speciesResult.data) {
        setSpecies(speciesResult.data);
      }
      if (!luresResult.error && luresResult.data) {
        setLures(luresResult.data);
      }

      setLoadingOptions(false);
    }

    fetchOptions();
  }, []);

  const [formData, setFormData] = useState({
    species_id: '',
    weight: '0',
    length: '0',
    lure_id: '',
    location: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'weight' || name === 'length') {
      const numericValue = Number(value);
      if (numericValue < 0) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.error('Usuário não autenticado');
      return;
    }

    if ((!formData.species_id && !speciesQuery.trim()) || !formData.weight) {
      console.error('Preencha espécie e peso');
      return;
    }

    const selectedSpecies = species.find((s) => s.id === formData.species_id);
    const selectedLure = lures.find((l) => l.id === formData.lure_id);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('catches')
      .insert({
        user_id: userId,
        species_id: formData.species_id || null,
        species_name: selectedSpecies?.name ?? speciesQuery.trim(),
        weight: parseFloat(formData.weight),
        length: formData.length ? parseFloat(formData.length) : null,
        lure_id: formData.lure_id || null,
        bait_description: selectedLure?.name ?? lureQuery.trim(),
        lat: coordinates.lat ?? undefined,
        lng: coordinates.lng ?? undefined,
        location_name: formData.location,
        notes: formData.notes || null,
        photo_url: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar captura:', error);
    } else {
      console.log('Captura registrada com sucesso:', data);
      setFormData({
        species_id: '',
        weight: '0',
        length: '',
        lure_id: '',
        location: '',
        notes: '',
      });
      setSpeciesQuery('');
      setLureQuery('');
      setLocationQuery('');
      setCoordinates({ lat: null, lng: null });
    }
  };

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 z-10 border-b border-border bg-white shadow-sm md:hidden">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <SectionHeader
            title="Registrar Pesca"
            subtitle="Compartilhe sua melhor captura"
            icon={Fish}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-2xl bg-white p-6 shadow-md"
          >
            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Espécie de Peixe
              </Label>
              <div ref={speciesRef} className="relative">
                <input
                  type="text"
                  value={speciesQuery}
                  onChange={(e) => {
                    setSpeciesQuery(e.target.value);
                    setFormData((prev) => ({ ...prev, species_id: '' }));
                    setSpeciesOpen(true);
                  }}
                  onFocus={() => { if (speciesQuery.trim()) setSpeciesOpen(true); }}
                  placeholder={loadingOptions ? 'Carregando...' : 'Digite o nome da espécie...'}
                  disabled={loadingOptions}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                {speciesOpen && filteredSpecies.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                    {filteredSpecies.map((s) => (
                      <li
                        key={s.id}
                        onMouseDown={() => {
                          setSpeciesQuery(s.name);
                          setFormData((prev) => ({ ...prev, species_id: s.id }));
                          setSpeciesOpen(false);
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-semibold">
                  Peso (kg)
                </Label>
                <Input
                  type="number"
                  name="weight"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  inputMode="decimal"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold">
                  Comprimento (cm)
                </Label>
                <Input
                  type="number"
                  name="length"
                  placeholder="0"
                  value={formData.length}
                  onChange={handleChange}
                  min="0"
                  inputMode="numeric"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Isca Utilizada
              </Label>
              <div ref={lureRef} className="relative">
                <input
                  type="text"
                  value={lureQuery}
                  onChange={(e) => {
                    setLureQuery(e.target.value);
                    setFormData((prev) => ({ ...prev, lure_id: '' }));
                    setLureOpen(true);
                  }}
                  onFocus={() => { if (lureQuery.trim()) setLureOpen(true); }}
                  placeholder={loadingOptions ? 'Carregando...' : 'Digite o nome da isca...'}
                  disabled={loadingOptions}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                {lureOpen && filteredLures.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                    {filteredLures.map((l) => (
                      <li
                        key={l.id}
                        onMouseDown={() => {
                          setLureQuery(l.name);
                          setFormData((prev) => ({ ...prev, lure_id: l.id }));
                          setLureOpen(false);
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {l.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Local da Pesca
              </Label>
              <div ref={locationRef} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                    {locationLoading && (
                      <Loader2 className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocationQuery(val);
                        setFormData((prev) => ({ ...prev, location: val }));
                        setCoordinates({ lat: null, lng: null });
                        searchLocation(val);
                      }}
                      onFocus={() => { if (locationSuggestions.length > 0) setLocationOpen(true); }}
                      placeholder="Ex: Rio Araguaia, Barra do Garças"
                      className="w-full rounded-xl border border-border px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    disabled={gpsLoading}
                    title="Usar minha localização atual"
                    className="flex items-center justify-center rounded-xl border border-border bg-white px-3 transition-colors hover:bg-primary/10 hover:border-primary disabled:opacity-50"
                  >
                    {gpsLoading
                      ? <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      : <Navigation className="h-5 w-5 text-primary" />
                    }
                  </button>
                </div>

                {coordinates.lat !== null && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                    <MapPin className="h-3 w-3" />
                    {coordinates.lat.toFixed(5)}, {coordinates.lng!.toFixed(5)}
                  </p>
                )}

                {locationOpen && locationSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                    {locationSuggestions.map((item) => (
                      <li
                        key={item.place_id}
                        onMouseDown={() => {
                          setLocationQuery(item.display_name);
                          setCoordinates({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });
                          setFormData((prev) => ({ ...prev, location: item.display_name }));
                          setLocationOpen(false);
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors border-b border-border/50 last:border-0"
                      >
                        <span className="block truncate">{item.display_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Foto (opcional)
              </Label>
              <div className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-accent/5">
                <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload de uma foto
                </p>
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Notas (opcional)
              </Label>
              <Textarea
                name="notes"
                placeholder="Descreva sua pescaria... Como foi a experiência?"
                value={formData.notes}
                onChange={handleChange}
                className="resize-none rounded-xl"
                rows={4}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
            >
              Registrar Pesca
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
