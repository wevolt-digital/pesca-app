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
    weight: '',
    length: '',
    bait: '',
    location: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-white border-b border-border z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <SectionHeader
            title="Registrar Pesca"
            subtitle="Compartilhe sua melhor captura"
            icon={Fish}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-md space-y-4"
          >
            <div>
              <Label className="block text-sm font-semibold mb-2">Espécie de Peixe</Label>
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
                <Label className="block text-sm font-semibold mb-2">Peso (kg)</Label>
                <Input
                  type="number"
                  name="weight"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.1"
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label className="block text-sm font-semibold mb-2">Comprimento (cm)</Label>
                <Input
                  type="number"
                  name="length"
                  placeholder="0"
                  value={formData.length}
                  onChange={handleChange}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="block text-sm font-semibold mb-2">Isca Utilizada</Label>
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
              <Label className="block text-sm font-semibold mb-2">Local da Pesca</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
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
              <Label className="block text-sm font-semibold mb-2">Foto (opcional)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-accent/5 transition-colors">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para fazer upload de uma foto</p>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-semibold mb-2">Notas (opcional)</Label>
              <Textarea
                name="notes"
                placeholder="Descreva sua pescaria... Como foi a experiência?"
                value={formData.notes}
                onChange={handleChange}
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3"
          >
            <Button
              type="submit"
              className="flex-1 bg-gradient-water text-white py-3 rounded-xl font-semibold"
            >
              Registrar Pesca
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
