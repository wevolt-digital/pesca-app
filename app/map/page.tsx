'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';
import FloatingMapControls from '@/components/FloatingMapControls';
import MapDetailCard from '@/components/MapDetailCard';
import FilterChips, { FilterChip } from '@/components/FilterChips';
import { FishingSpot, Catch } from '@/types';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { MAP_STYLE } from '@/lib/mapStyle';

const defaultCenter: [number, number] = [-47.8919, -15.7975];

// ---------------------------------------------------------------------------
// Tipos para as linhas retornadas pelo Supabase
// ---------------------------------------------------------------------------
interface CatchRow {
  id: string;
  lat: number;
  lng: number;
  species_name: string;
  weight: number;
  location_name: string;
  bait_description: string;
  caught_at: string;
}

const STUB_USER = {
  id: 'unknown',
  name: 'Pescador',
  username: 'pescador',
  avatar: 'https://placehold.co/40x40',
  totalCatches: 0,
  totalSpots: 0,
  joinedDate: '',
};

interface SpotRow {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  type: FishingSpot['type'];
  rating: number;
  total_catches: number;
  description: string | null;
  photos: string[];
}

function dbSpotToFishingSpot(row: SpotRow): FishingSpot {
  return {
    id: row.id,
    name: row.name,
    location: { lat: row.lat, lng: row.lng, city: row.city, state: row.state },
    type: row.type,
    rating: row.rating,
    totalCatches: row.total_catches,
    description: row.description ?? undefined,
    addedBy: STUB_USER,
    photos: row.photos ?? [],
  };
}

function dbCatchToCatch(row: CatchRow): Catch {
  return {
    id: row.id,
    user: STUB_USER,
    species: row.species_name,
    weight: row.weight,
    bait: row.bait_description,
    location: { lat: row.lat, lng: row.lng, name: row.location_name },
    photo: '',
    date: row.caught_at,
    likes: 0,
    comments: 0,
  };
}

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

// ---------------------------------------------------------------------------
// Helpers: converte arrays para GeoJSON FeatureCollection
// O campo `data` serializa o objeto completo para recuperar no clique
// ---------------------------------------------------------------------------
function spotsToGeoJSON(spots: FishingSpot[]) {
  return {
    type: 'FeatureCollection' as const,
    features: spots
      .filter(s => Number.isFinite(s.location.lat) && Number.isFinite(s.location.lng))
      .map(spot => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [spot.location.lng, spot.location.lat] as [number, number],
        },
        properties: { id: spot.id, data: JSON.stringify(spot) },
      })),
  };
}

function catchesToGeoJSON(catchList: Catch[]) {
  return {
    type: 'FeatureCollection' as const,
    features: catchList
      .filter(c => Number.isFinite(c.location.lat) && Number.isFinite(c.location.lng))
      .map(c => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [c.location.lng, c.location.lat] as [number, number],
        },
        properties: { id: c.id, data: JSON.stringify(c) },
      })),
  };
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string[]>(['all']);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const filteredSpots = useMemo(() => {
    if (selectedFilter.includes('all')) return spots;
    return spots.filter(spot => selectedFilter.includes(spot.type));
  }, [selectedFilter, spots]);

  // ---------------------------------------------------------------------------
  // Busca locais de pesca reais do Supabase
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function fetchSpots() {
      const { data, error } = await supabase
        .from('fishing_spots')
        .select('id, name, lat, lng, city, state, type, rating, total_catches, description, photos');
      if (error) {
        console.error('Erro ao buscar locais de pesca:', error);
        return;
      }
      setSpots((data ?? []).map(dbSpotToFishingSpot));
    }

    fetchSpots();
  }, []);

  // ---------------------------------------------------------------------------
  // Busca capturas reais do Supabase
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function fetchCatches() {
      const { data, error } = await supabase
        .from('catches')
        .select('id, lat, lng, species_name, weight, location_name, bait_description, caught_at');
      if (error) {
        console.error('Erro ao buscar capturas:', error);
        return;
      }
      setCatches((data ?? []).map(dbCatchToCatch));
    }

    fetchCatches();
  }, []);

  const filteredCatches = useMemo(() => catches, [catches]);

  // ---------------------------------------------------------------------------
  // Inicialização do mapa + sources + layers + handlers de clique
  // Executa uma única vez após mount
  // ---------------------------------------------------------------------------
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

    map.on('load', () => {
      // -----------------------------------------------------------------------
      // Sources GeoJSON com clustering nativo do MapLibre
      //
      // clusterMaxZoom: 13  → acima desse zoom, pontos individuais aparecem
      // clusterRadius: 80   → raio em px para agrupar pontos no mesmo cluster
      // -----------------------------------------------------------------------
      map.addSource('spots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 80,
      });

      map.addSource('catches', {
        type: 'geojson',
        data: catchesToGeoJSON(catches),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 80,
      });

      // -----------------------------------------------------------------------
      // Layers: Locais de Pesca (azul escuro #0A3D62)
      // -----------------------------------------------------------------------

      // Círculo do cluster — tamanho cresce com a quantidade de pontos agrupados
      map.addLayer({
        id: 'spots-clusters',
        type: 'circle',
        source: 'spots',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0A3D62',
          // step: < 5 pts → 22px | 5–19 pts → 30px | 20+ pts → 40px
          'circle-radius': ['step', ['get', 'point_count'], 22, 5, 30, 20, 40],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.92,
        },
      });

      // Número dentro do cluster
      map.addLayer({
        id: 'spots-cluster-count',
        type: 'symbol',
        source: 'spots',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Bold', 'Noto Sans Regular'],
          'text-size': 13,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Ponto individual de local de pesca
      map.addLayer({
        id: 'spots-unclustered',
        type: 'circle',
        source: 'spots',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#0A3D62',
          'circle-radius': 10,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // -----------------------------------------------------------------------
      // Layers: Capturas (laranja #F4A261 / cluster mais escuro #E07B3A)
      // -----------------------------------------------------------------------

      // Círculo do cluster
      map.addLayer({
        id: 'catches-clusters',
        type: 'circle',
        source: 'catches',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#E07B3A',
          'circle-radius': ['step', ['get', 'point_count'], 22, 5, 30, 20, 40],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.92,
        },
      });

      // Número dentro do cluster
      map.addLayer({
        id: 'catches-cluster-count',
        type: 'symbol',
        source: 'catches',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Bold', 'Noto Sans Regular'],
          'text-size': 13,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Ponto individual de captura
      map.addLayer({
        id: 'catches-unclustered',
        type: 'circle',
        source: 'catches',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#F4A261',
          'circle-radius': 9,
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // -----------------------------------------------------------------------
      // Click: cluster → zoom in para expandir
      // -----------------------------------------------------------------------
      map.on('click', 'spots-clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['spots-clusters'] });
        if (!features[0]) return;
        const clusterId = features[0].properties.cluster_id as number;
        const source = map.getSource('spots') as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const [lng, lat] = (features[0].geometry as { coordinates: number[] }).coordinates;
        map.easeTo({ center: [lng, lat], zoom });
      });

      map.on('click', 'catches-clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['catches-clusters'] });
        if (!features[0]) return;
        const clusterId = features[0].properties.cluster_id as number;
        const source = map.getSource('catches') as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const [lng, lat] = (features[0].geometry as { coordinates: number[] }).coordinates;
        map.easeTo({ center: [lng, lat], zoom });
      });

      // -----------------------------------------------------------------------
      // Click: ponto individual → abre o card de detalhe
      // -----------------------------------------------------------------------
      map.on('click', 'spots-unclustered', (e) => {
        if (!e.features?.[0]?.properties?.data) return;
        const spot = JSON.parse(e.features[0].properties.data) as FishingSpot;
        setSelectedMarker({ data: spot, type: 'spot' });
      });

      map.on('click', 'catches-unclustered', (e) => {
        if (!e.features?.[0]?.properties?.data) return;
        const catchData = JSON.parse(e.features[0].properties.data) as Catch;
        setSelectedMarker({ data: catchData, type: 'catch' });
      });

      // -----------------------------------------------------------------------
      // Cursor pointer sobre pontos clicáveis (desktop)
      // -----------------------------------------------------------------------
      const onEnter = () => { map.getCanvas().style.cursor = 'pointer'; };
      const onLeave = () => { map.getCanvas().style.cursor = ''; };
      ['spots-clusters', 'catches-clusters', 'spots-unclustered', 'catches-unclustered']
        .forEach(id => {
          map.on('mouseenter', id, onEnter);
          map.on('mouseleave', id, onLeave);
        });

      setMapLoaded(true);
    });

    map.on('error', (e) => console.error('[MapLibre]', e.error));

    mapRef.current = map;

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Sincroniza as sources GeoJSON quando o filtro muda
  // Não recria layers — apenas atualiza os dados da source
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    (mapRef.current.getSource('spots') as GeoJSONSource | undefined)
      ?.setData(spotsToGeoJSON(filteredSpots));
    (mapRef.current.getSource('catches') as GeoJSONSource | undefined)
      ?.setData(catchesToGeoJSON(filteredCatches));
  }, [filteredSpots, filteredCatches, mapLoaded]);

  // ---------------------------------------------------------------------------
  // Geolocalização do usuário
  // ---------------------------------------------------------------------------
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Voa para a localização do usuário e adiciona marker DOM azul
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userLocation) return;

    mapRef.current.flyTo({ center: userLocation, zoom: 11, essential: true });

    if (userMarkerRef.current) userMarkerRef.current.remove();

    const el = document.createElement('div');
    el.style.cssText = [
      'width:26px', 'height:26px', 'border-radius:9999px',
      'background:#2563EB', 'border:2px solid white',
      'box-shadow:0 4px 10px rgba(0,0,0,0.22)',
      'display:flex', 'align-items:center', 'justify-content:center',
    ].join(';');
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
      viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>`;

    userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(userLocation)
      .addTo(mapRef.current);
  }, [userLocation, mapLoaded]);

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
      <div ref={mapContainerRef} className="w-full h-full" />

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
