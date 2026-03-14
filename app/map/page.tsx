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
  { id: 'fishery', label: 'Pesqueiros' },
  { id: 'lake', label: 'Lagos' },
  { id: 'reservoir', label: 'Represas' },
  { id: 'river', label: 'Rios' },
  { id: 'ocean', label: 'Oceano' },
  
];

type SelectedMarker = {
  data: FishingSpot | Catch;
  type: 'spot' | 'catch';
};

function createMarkerElement(
  color: string,
  icon: 'spot' | 'catch' | 'user',
  size = 28
) {
  const el = document.createElement('div');

  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '9999px';
  el.style.background = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.22)';
  el.style.cursor = 'pointer';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';

  let iconSvg = '';

  if (icon === 'spot') {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="${size * 0.58}" height="${size *
      0.58}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s-6-5.2-6-11a6 6 0 1 1 12 0c0 5.8-6 11-6 11Z" fill="white"/>
        <circle cx="12" cy="10" r="2.5" fill="${color}"/>
      </svg>
    `;
  }

  if (icon === 'catch') {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="${size * 0.6}"
        height="${size * 0.6}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571" />
        <path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504" />
        <path d="M18 11v.01" />
        <path d="M11.5 10.5c-.667 1 -.667 2 0 3" />
      </svg>
    `;
  }

  if (icon === 'user') {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="${size * 0.6}"
        height="${size * 0.6}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
      </svg>
    `;
  }

  el.innerHTML = iconSvg;

  return el;
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string[]>(['all']);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(
    null
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

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

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.on('load', () => setMapLoaded(true));

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
      (error) => console.error(error),
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

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const userEl = createMarkerElement('#2563EB', 'user', 26);

    userMarkerRef.current = new maplibregl.Marker({
      element: userEl,
      anchor: 'center',
    })
      .setLngLat(userLocation)
      .addTo(mapRef.current);
  }, [userLocation, mapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const nextMarkers: maplibregl.Marker[] = [];

    filteredSpots.forEach((spot) => {
      const el = createMarkerElement('#0A3D62', 'spot', 30);

      el.addEventListener('click', () =>
        setSelectedMarker({ data: spot, type: 'spot' })
      );

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([spot.location.lng, spot.location.lat])
        .addTo(mapRef.current!);

      nextMarkers.push(marker);
    });

    filteredCatches.forEach((catchData) => {
      const el = createMarkerElement('#F4A261', 'catch', 26);

      el.addEventListener('click', () =>
        setSelectedMarker({ data: catchData, type: 'catch' })
      );

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
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
          className="mb-4 w-full rounded-2xl bg-white p-4 text-left font-semibold shadow-lg hover:shadow-xl"
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