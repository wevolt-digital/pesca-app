'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SectionHeader from '@/components/SectionHeader';
import { Camera, Fish, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const fishSpecies = [
  'Tucunaré',
  'Pintado',
  'Dourado',
  'Pirarucu',
  'Robalo',
  'Traíra',
  'Pacu',
  'Lambari',
];

const baits = [
  'Isca artificial',
  'Peixe vivo',
  'Minhoca',
  'Camarão',
  'Frutas',
  'Massa',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    species: '',
    weight: '0',
    length: '0',
    bait: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
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
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione uma espécie</option>
                {fishSpecies.map((species) => (
                  <option key={species} value={species}>
                    {species}
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
                name="bait"
                value={formData.bait}
                onChange={handleChange}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione a isca</option>
                {baits.map((bait) => (
                  <option key={bait} value={bait}>
                    {bait}
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