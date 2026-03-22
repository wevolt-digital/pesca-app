'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SectionHeader from '@/components/SectionHeader';
import { Camera, Fish, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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

  // DEV ONLY: sign-in automático com usuário de teste se não houver sessão ativa
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function devSignIn() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        return;
      }
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

    if (!formData.species_id || !formData.weight) {
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
        species_name: selectedSpecies?.name ?? '',
        weight: formData.weight ? parseFloat(formData.weight) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        lure_id: formData.lure_id || null,
        bait_description: selectedLure?.name ?? '',
        lat: -23.55,
        lng: -46.63,
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
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-white shadow-sm">
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
              <select
                name="species_id"
                value={formData.species_id}
                onChange={handleChange}
                disabled={loadingOptions}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">
                  {loadingOptions ? 'Carregando...' : 'Selecione uma espécie'}
                </option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
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
              <select
                name="lure_id"
                value={formData.lure_id}
                onChange={handleChange}
                disabled={loadingOptions}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="">
                  {loadingOptions ? 'Carregando...' : 'Selecione a isca'}
                </option>
                {lures.map((lure) => (
                  <option key={lure.id} value={lure.id}>
                    {lure.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-semibold">
                Local da Pesca
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="location"
                  placeholder="Ex: Rio Tietê, Barra Bonita"
                  value={formData.location}
                  onChange={handleChange}
                  className="rounded-xl pl-10"
                />
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
