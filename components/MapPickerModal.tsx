'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE } from '@/lib/mapStyle';
import { Loader2, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shortLocationName } from '@/lib/utils';

interface MapPickerModalProps {
  initialCoords?: { lat: number; lng: number } | null;
  onConfirm: (coords: { lat: number; lng: number }, locationName: string) => void;
  onClose: () => void;
}

const DEFAULT_CENTER: [number, number] = [-47.8919, -15.7975];
const DEFAULT_ZOOM = 5;

export default function MapPickerModal({ initialCoords, onConfirm, onClose }: MapPickerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] = initialCoords
      ? [initialCoords.lng, initialCoords.lat]
      : DEFAULT_CENTER;
    const zoom = initialCoords ? 13 : DEFAULT_ZOOM;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleConfirm = async () => {
    if (!mapRef.current || confirming) return;
    setConfirming(true);

    const center = mapRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: 'json',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });
      const data = await res.json();
      const fullName: string = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onConfirm({ lat, lng }, shortLocationName(fullName));
    } catch {
      onConfirm({ lat, lng }, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold">Marcar local no mapa</p>
          <p className="text-xs text-muted-foreground">Arraste o mapa para posicionar a mira</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full" />

        {/* Crosshair */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Sombra/halo */}
            <div className="absolute h-8 w-8 rounded-full bg-primary/20" />
            {/* Linhas da mira */}
            <div className="absolute h-px w-8 bg-primary" />
            <div className="absolute h-8 w-px bg-primary" />
            {/* Ponto central */}
            <div className="absolute h-2 w-2 rounded-full bg-primary" />
          </div>
          {/* Pin que aponta para o centro */}
          <MapPin className="absolute -translate-y-7 h-8 w-8 text-primary drop-shadow-md" />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={confirming}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
        >
          {confirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando endereço...
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Confirmar localização
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
