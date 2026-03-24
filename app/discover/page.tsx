'use client';

import { useState } from 'react';
import SpotCard from '@/components/SpotCard';
import SectionHeader from '@/components/SectionHeader';
import FilterChips, { FilterChip } from '@/components/FilterChips';
import { fishingSpots } from '@/constants/mockData';
import { Compass, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const spotTypeChips: FilterChip[] = [
  { id: 'all', label: 'Todos' },
  { id: 'fishery', label: 'Pesqueiros' },
  { id: 'lake', label: 'Lagos' },
  { id: 'reservoir', label: 'Represas' },
  { id: 'river', label: 'Rios' },
  { id: 'ocean', label: 'Oceano' },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotTypes, setSelectedSpotTypes] = useState<string[]>(['all']);

  const filteredSpots = fishingSpots
    .filter((spot) =>
      selectedSpotTypes.includes('all') || selectedSpotTypes.includes(spot.type)
    )
    .filter((spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSpotFilterChange = (selected: string[]) => {
    if (selected.length === 0) {
      setSelectedSpotTypes(['all']);
      return;
    }
    // Usuário clicou em 'all' → limpa o resto
    if (selected.includes('all') && !selectedSpotTypes.includes('all')) {
      setSelectedSpotTypes(['all']);
      return;
    }
    // Usuário clicou em um filtro específico → remove 'all'
    setSelectedSpotTypes(selected.filter((s) => s !== 'all'));
  };

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-white border-b border-border z-10 shadow-sm md:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SectionHeader
            title="Descobrir"
            subtitle="Explore novos locais de pesca"
            icon={Compass}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar local de pesca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-xs font-semibold text-muted-foreground mb-3">FILTRAR POR TIPO</p>
          <FilterChips
            chips={spotTypeChips}
            selected={selectedSpotTypes}
            onChange={handleSpotFilterChange}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpots.map((spot) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SpotCard spot={spot} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
