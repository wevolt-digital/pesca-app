'use client';

import { useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import FloatingMapControls from '@/components/FloatingMapControls';
import MapDetailCard from '@/components/MapDetailCard';
import FilterChips, { FilterChip } from '@/components/FilterChips';
import { fishingSpots, catches } from '@/constants/mockData';
import { FishingSpot, Catch } from '@/types';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: -15.7975,
  lng: -47.8919,
};

const filterChips: FilterChip[] = [
  { id: 'all', label: 'Todos' },
  { id: 'river', label: 'Rios' },
  { id: 'lake', label: 'Lagos' },
  { id: 'ocean', label: 'Oceano' },
  { id: 'reservoir', label: 'Represas' },
];

const spotSvgIcon =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230A3D62"%3E%3Ccircle cx="12" cy="12" r="10" fill="%230A3D62" stroke="white" stroke-width="2"/%3E%3C/svg%3E';

const catchSvgIcon =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23F4A261"%3E%3Ccircle cx="12" cy="12" r="8" fill="%23F4A261" stroke="white" stroke-width="2"/%3E%3C/svg%3E';

export default function MapPage() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string[]>(['all']);
  const [selectedMarker, setSelectedMarker] = useState<{
    data: FishingSpot | Catch;
    type: 'spot' | 'catch';
  } | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const filteredSpots = useMemo(() => {
    if (selectedFilter.includes('all')) return fishingSpots;
    return fishingSpots.filter((spot) => selectedFilter.includes(spot.type));
  }, [selectedFilter]);

  const filteredCatches = useMemo(() => {
    if (selectedFilter.includes('all')) return catches;
    return catches.filter((catchData) => selectedFilter.includes(catchData.type));
  }, [selectedFilter]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(5);
    }
  };

  const handleFilterChange = (selected: string[]) => {
    if (selected.length === 0 || selected.includes('all')) {
      setSelectedFilter(['all']);
      return;
    }

    setSelectedFilter(selected);
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={5}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{
            mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          }}
        >
          {filteredSpots.map((spot) => (
            <Marker
              key={`spot-${spot.id}`}
              position={{
                lat: spot.location.lat,
                lng: spot.location.lng,
              }}
              onClick={() =>
                setSelectedMarker({
                  data: spot,
                  type: 'spot',
                })
              }
              icon={spotSvgIcon}
            />
          ))}

          {filteredCatches.map((catchData) => (
            <Marker
              key={`catch-${catchData.id}`}
              position={{
                lat: catchData.location.lat,
                lng: catchData.location.lng,
              }}
              onClick={() =>
                setSelectedMarker({
                  data: catchData,
                  type: 'catch',
                })
              }
              icon={catchSvgIcon}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <div className="absolute top-4 left-4 right-4 z-20 md:max-w-xs">
        <motion.button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="w-full bg-white rounded-2xl shadow-lg p-4 mb-4 text-left font-semibold text-foreground hover:shadow-xl transition-shadow"
        >
          <MapPin className="w-5 h-5 inline mr-2 text-primary" />
          Locais de pesca
        </motion.button>

        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 glass-effect"
          >
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              FILTRAR POR TIPO
            </p>
            <FilterChips
              chips={filterChips}
              selected={selectedFilter}
              onChange={handleFilterChange}
            />
          </motion.div>
        )}
      </div>

      <FloatingMapControls
        onRecenter={handleRecenter}
        onFilter={() => setShowFilterPanel(!showFilterPanel)}
        onAdd={() => {}}
      />

      {selectedMarker && (
        <MapDetailCard
          data={selectedMarker.data}
          type={selectedMarker.type}
          onClose={() => setSelectedMarker(null)}
        />
      )}
    </div>
  );
}