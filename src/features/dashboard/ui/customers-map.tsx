'use client';

import 'ol/ol.css';
import { useEffect, useMemo, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';

type MapPoint = { id: string; lat: number; lng: number; type: string };

function styleForType(type: string) {
  const stroke = new Stroke({ color: 'rgba(255,255,255,0.35)', width: 2 });

  const color =
    type === 'restaurant'
      ? 'rgba(239, 68, 68, 0.9)'
      : type === 'store'
        ? 'rgba(34, 197, 94, 0.9)'
        : type === 'home'
          ? 'rgba(56, 189, 248, 0.9)'
          : 'rgba(59, 130, 246, 0.9)';

  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color }),
      stroke,
    }),
  });
}

export function CustomersMap({
  status,
  points,
  center,
  zoom,
}: {
  status: string;
  points: MapPoint[];
  center: [number, number];
  zoom: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorRef = useRef<VectorSource | null>(null);

  const initialCenter = useMemo(() => fromLonLat(center), [center]);

  useEffect(() => {
    if (!ref.current) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const map = new Map({
      target: ref.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          }),
        }),
        vectorLayer,
      ],
      view: new View({ center: initialCenter, zoom }),
      controls: [],
    });

    mapRef.current = map;
    vectorRef.current = vectorSource;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      vectorRef.current = null;
    };
  }, [initialCenter, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const view = map.getView();
    view.setCenter(fromLonLat(center));
    view.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    const vectorSource = vectorRef.current;
    if (!vectorSource) return;

    vectorSource.clear();

    const features = (points ?? []).map((p) => {
      const f = new Feature({
        geometry: new Point(fromLonLat([p.lng, p.lat])),
      });
      f.setId(p.id);
      f.setStyle(styleForType(p.type));
      return f;
    });

    vectorSource.addFeatures(features);
  }, [points]);

  if (status === 'loading') return <div className="h-90 w-full animate-pulse bg-white/5" />;
  return <div ref={ref} className="h-90 w-full" />;
}
