'use client';

import { useState } from 'react';
import Image from 'next/image';
import SpotCard from '@/components/SpotCard';
import SectionHeader from '@/components/SectionHeader';
import FilterChips, { FilterChip } from '@/components/FilterChips';
import { fishingSpots, fishSpecies } from '@/constants/mockData';
import { Compass, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const spotTypeChips: FilterChip[] = [
  { id: 'all', label: 'Todos' },
  { id: 'river', label: 'Rios' },
  { id: 'lake', label: 'Lagos' },
  { id: 'ocean', label: 'Oceano' },
  { id: 'reservoir', label: 'Represas' },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotTypes, setSelectedSpotTypes] = useState<string[]>(['all']);
  const [activeTab, setActiveTab] = useState<'spots' | 'species'>('spots');

  const filteredSpots = selectedSpotTypes.includes('all')
    ? fishingSpots
    : fishingSpots.filter((spot) => selectedSpotTypes.includes(spot.type));

  const filteredSpecies = fishSpecies.filter((species) =>
    species.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpotFilterChange = (selected: string[]) => {
    if (selected.length === 0) {
      setSelectedSpotTypes(['all']);
    } else if (selected.includes('all')) {
      setSelectedSpotTypes(['all']);
    } else {
      setSelectedSpotTypes(selected);
    }
  };

  return (
    <div className="min-h-screen bg-background md:pt-20">
      <div className="sticky top-0 bg-white border-b border-border z-10 shadow-sm md:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <SectionHeader
            title="Descobrir"
            subtitle="Explore novos locais e espécies"
            icon={Compass}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 border-b border-border"
        >
          <button
            onClick={() => setActiveTab('spots')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'spots'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Locais de Pesca
          </button>
          <button
            onClick={() => setActiveTab('species')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'species'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Espécies
          </button>
        </motion.div>

        {activeTab === 'spots' && (
          <motion.div
            key="spots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-3">FILTRAR POR TIPO</p>
              <FilterChips
                chips={spotTypeChips}
                selected={selectedSpotTypes}
                onChange={handleSpotFilterChange}
              />
            </div>

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
          </motion.div>
        )}

        {activeTab === 'species' && (
          <motion.div
            key="species"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar espécie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSpecies.map((species) => (
                <motion.div
                  key={species.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40">
                    <Image
                      src={species.image}
                      alt={species.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary">{species.name}</h3>
                    <p className="text-xs text-muted-foreground italic mb-3">{species.scientificName}</p>
                    <p className="text-sm text-foreground line-clamp-2 mb-3">{species.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Peso Médio:</span>
                        <span className="font-semibold">{species.averageWeight}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Iscas Populares:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {species.popularBaits.map((bait) => (
                            <span
                              key={bait}
                              className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-xs font-medium"
                            >
                              {bait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
