'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import FloatingMapControls from '@/components/FloatingMapControls';
import MapDetailCard from '@/components/MapDetailCard';
import FilterChips, { FilterChip } from '@/components/FilterChips';
import { fishingSpots, catches } from '@/constants/mockData';
import { FishingSpot, Catch } from '@/types';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { MAP_STYLE } from '@/lib/mapStyle';

const defaultCenter: [number, number] = [-47.8919, -15.7975];

const filterChips: FilterChip[] = [
  { id: 'all', label: 'Todos' },
  { id: 'river', label: 'Rios' },
  { id: 'lake', label: 'Lagos' },
  { id: 'ocean', label: 'Oceano' },
  { id: 'reservoir', label: 'Represas' },
];

type SelectedMarker = {
  data: FishingSpot | Catch;
  type: 'spot' | 'catch';
};

const spotIconSvg =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"%3E%3Cpath d="M12 21s-6-5.2-6-11a6 6 0 1 1 12 0c0 5.8-6 11-6 11Z" fill="white"/%3E%3Ccircle cx="12" cy="10" r="2.5" fill="%230A3D62"/%3E%3C/svg%3E';

const catchIconSvg =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"%3E%3Cpath d="M3 12c2.5-3 6-4.5 9-4 1.5-2 4-3 7-3-1 2-1.5 3.5-1 5 1.5.5 2.5 1.5 3 3-2 .5-3.5 0-5-1-1 1-2.2 1.8-3.5 2.2L14 17l-2.5-1.2C8.5 16.5 5.5 15 3 12Z"/%3E%3C/svg%3E';

function createMarkerElement(color: string, iconSvg: string, size = 28) {
  const el = document.createElement('div');
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '9999px';
  el.style.background = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.28)';
  el.style.cursor = 'pointer';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

  const icon = document.createElement('div');
  icon.style.width = `${size * 0.58}px`;
  icon.style.height = `${size * 0.58}px`;
  icon.style.backgroundImage = `url("${iconSvg}")`;
  icon.style.backgroundRepeat = 'no-repeat';
  icon.style.backgroundPosition = 'center';
  icon.style.backgroundSize = 'contain';
  icon.style.pointerEvents = 'none';

  el.appendChild(icon);

  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.08)';
    el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.32)';
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.28)';
  });

  return el;
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string[]>(['all']);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const filteredSpots = useMemo(() => {
    if (selectedFilter.includes('all')) return fishingSpots;
    return fishingSpots.filter((spot) => selectedFilter.includes(spot.type));
  }, [selectedFilter]);

  const filteredCatches = useMemo(() => catches, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: defaultCenter,
      zoom: 5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setUserLocation(coords);
      },
      (error) => {
        console.error('Erro ao obter localização do usuário:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userLocation) return;

    mapRef.current.flyTo({
      center: userLocation,
      zoom: 11,
      essential: true,
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userEl = createMarkerElement('#2563EB', spotIconSvg, 26);

    userMarkerRef.current = new maplibregl.Marker({ element: userEl })
      .setLngLat(userLocation)
      .addTo(mapRef.current);
  }, [userLocation, mapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const nextMarkers: maplibregl.Marker[] = [];

    filteredSpots.forEach((spot) => {
      const el = createMarkerElement('#0A3D62', spotIconSvg, 30);

      el.addEventListener('click', () => {
        setSelectedMarker({
          data: spot,
          type: 'spot',
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([spot.location.lng, spot.location.lat])
        .addTo(mapRef.current!);

      nextMarkers.push(marker);
    });

    filteredCatches.forEach((catchData) => {
      const el = createMarkerElement('#F4A261', catchIconSvg, 26);

      el.addEventListener('click', () => {
        setSelectedMarker({
          data: catchData,
          type: 'catch',
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([catchData.location.lng, catchData.location.lat])
        .addTo(mapRef.current!);

      nextMarkers.push(marker);
    });

    markersRef.current = nextMarkers;
  }, [filteredSpots, filteredCatches, mapLoaded]);

  const handleRecenter = () => {
    if (!mapRef.current) return;

    mapRef.current.flyTo({
      center: userLocation ?? defaultCenter,
      zoom: userLocation ? 11 : 5,
      essential: true,
    });
  };

  const handleFilterChange = (selected: string[]) => {
    if (selected.length === 0 || selected.includes('all')) {
      setSelectedFilter(['all']);
      return;
    }

    setSelectedFilter(selected);
  };

  return (
    <div className="relative h-screen w-full bg-gray-100">
      <div ref={mapContainerRef} className="absolute inset-0" />

      <div className="absolute top-4 left-4 right-4 z-20 md:max-w-xs">
        <motion.button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="mb-4 w-full rounded-2xl bg-white p-4 text-left font-semibold text-foreground shadow-lg transition-shadow hover:shadow-xl"
        >
          <MapPin className="mr-2 inline h-5 w-5 text-primary" />
          Locais de pesca
        </motion.button>

        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl bg-white p-4 shadow-lg"
          >
            <p className="mb-3 text-xs font-semibold text-muted-foreground">
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