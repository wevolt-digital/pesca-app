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

const SOURCE_ID = 'map-points';
const CLUSTER_LAYER_ID = 'clusters';
const CLUSTER_COUNT_LAYER_ID = 'cluster-count';
const UNCLUSTERED_LAYER_ID = 'unclustered-points';

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

function createSpotIconSvg(size = 44, color = '#0A3D62') {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M22 30s-5-4.4-5-9.3a5 5 0 1 1 10 0c0 4.9-5 9.3-5 9.3Z" fill="white"/>
      <circle cx="22" cy="20.5" r="2" fill="${color}"/>
    </svg>
  `;
}

function createCatchIconSvg(size = 40, color = '#F4A261') {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill="${color}" stroke="white" stroke-width="2"/>
      <svg x="10" y="10" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571" />
        <path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504" />
        <path d="M18 11v.01" />
        <path d="M11.5 10.5c-.667 1 -.667 2 0 3" />
      </svg>
    </svg>
  `;
}

function createUserMarkerElement(color = '#2563EB', size = 28) {
  const el = document.createElement('div');
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '9999px';
  el.style.background = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.22)';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';

  el.innerHTML = `
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

  return el;
}

async function addSvgImage(
  map: maplibregl.Map,
  name: string,
  svgMarkup: string
) {
  if (map.hasImage(name)) return;

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const imageBitmap = await createImageBitmap(blob);
  map.addImage(name, imageBitmap, { pixelRatio: 2 });
}

function buildGeoJsonData(spots: FishingSpot[], catchesData: Catch[]) {
  const spotFeatures = spots.map((spot) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [spot.location.lng, spot.location.lat],
    },
    properties: {
      itemId: String(spot.id),
      pointType: 'spot',
    },
  }));

  const catchFeatures = catchesData.map((catchData) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [catchData.location.lng, catchData.location.lat],
    },
    properties: {
      itemId: String(catchData.id),
      pointType: 'catch',
    },
  }));

  return {
    type: 'FeatureCollection',
    features: [...spotFeatures, ...catchFeatures],
  } as any;
}

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.on('load', async () => {
      await addSvgImage(map, 'spot-icon', createSpotIconSvg());
      await addSvgImage(map, 'catch-icon', createCatchIconSvg());

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: buildGeoJsonData(filteredSpots, filteredCatches),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: CLUSTER_LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0A3D62',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            22,
            30,
            28,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      map.addLayer({
        id: UNCLUSTERED_LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'match',
            ['get', 'pointType'],
            'spot',
            'spot-icon',
            'catch',
            'catch-icon',
            'spot-icon',
          ],
          'icon-size': 1,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });

      map.on('click', CLUSTER_LAYER_ID, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [CLUSTER_LAYER_ID],
        });

        const clusterId = features?.[0]?.properties?.cluster_id;
        if (clusterId == null) return;

        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource & {
          getClusterExpansionZoom?: (
            clusterId: number,
            callback: (error: Error | null, zoom: number) => void
          ) => void;
        };

        source.getClusterExpansionZoom?.(clusterId, (error, zoom) => {
          if (error) return;

          const coordinates = (features[0].geometry as any).coordinates;
          map.easeTo({
            center: coordinates,
            zoom,
            duration: 500,
          });
        });
      });

      map.on('click', UNCLUSTERED_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const itemId = String(feature.properties?.itemId ?? '');
        const pointType = String(feature.properties?.pointType ?? '');

        if (pointType === 'spot') {
          const spot = filteredSpots.find((item) => String(item.id) === itemId);
          if (spot) {
            setSelectedMarker({
              data: spot,
              type: 'spot',
            });
          }
        }

        if (pointType === 'catch') {
          const catchItem = filteredCatches.find(
            (item) => String(item.id) === itemId
          );
          if (catchItem) {
            setSelectedMarker({
              data: catchItem,
              type: 'catch',
            });
          }
        }
      });

      map.on('mouseenter', CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('mouseenter', UNCLUSTERED_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', UNCLUSTERED_LAYER_ID, () => {
        map.getCanvas().style.cursor = '';
      });

      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
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
    if (!mapRef.current || !mapLoaded) return;

    const source = mapRef.current.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(buildGeoJsonData(filteredSpots, filteredCatches));
  }, [filteredSpots, filteredCatches, mapLoaded]);

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

    const userEl = createUserMarkerElement('#2563EB', 26);

    userMarkerRef.current = new maplibregl.Marker({
      element: userEl,
      anchor: 'center',
    })
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