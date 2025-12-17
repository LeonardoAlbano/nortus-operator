import { create } from 'zustand';

export type KpiKey = 'retention' | 'conversion' | 'churn' | 'arpu';

type SeriesPoint = { label: string; value: number };

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  type: string;
  place?: string;
};

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unauthorized';

type DashboardState = {
  selectedKpi: KpiKey;
  setSelectedKpi: (k: KpiKey) => void;

  locations: MapPoint[];
  mapCenter: [number, number];
  mapZoom: number;

  kpis: Record<KpiKey, SeriesPoint[]>;
  conversionBars: SeriesPoint[];

  status: Status;
  errorMessage: string | null;

  fetchAll: () => Promise<void>;
};

const emptyKpis: Record<KpiKey, SeriesPoint[]> = {
  retention: [],
  conversion: [],
  churn: [],
  arpu: [],
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrap(input: unknown): unknown {
  if (!isRecord(input)) return input;
  const rec = input as UnknownRecord;
  const keys = ['data', 'result', 'payload', 'response'];
  for (const k of keys) {
    if (k in rec) return rec[k];
  }
  return input;
}

function pickRecord(value: unknown, key: string): UnknownRecord | null {
  if (!isRecord(value)) return null;
  const v = (value as UnknownRecord)[key];
  return isRecord(v) ? v : null;
}

function pickArray(value: unknown, key: string): unknown[] | null {
  if (!isRecord(value)) return null;
  const v = (value as UnknownRecord)[key];
  return Array.isArray(v) ? v : null;
}

function readString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toSeries(input: unknown): SeriesPoint[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, idx) => {
      const rec = isRecord(item) ? (item as UnknownRecord) : null;
      const label =
        readString(rec?.label) ?? readString(rec?.month) ?? readString(rec?.name) ?? String(idx);
      const value = readNumber(rec?.value) ?? readNumber(rec?.amount) ?? readNumber(rec?.y) ?? 0;
      return { label, value };
    })
    .filter((p) => Number.isFinite(p.value));
}

function firstNonEmptySeries(...inputs: unknown[]): SeriesPoint[] {
  for (const input of inputs) {
    const series = toSeries(input);
    if (series.length) return series;
  }
  return [];
}

function normalizeDashboard(input: unknown): {
  kpis: Record<KpiKey, SeriesPoint[]>;
  conversionBars: SeriesPoint[];
} {
  const root = unwrap(input);
  if (!isRecord(root)) return { kpis: emptyKpis, conversionBars: [] };

  const kpisTrend = pickRecord(root, 'kpisTrend');
  const labelsUnknown =
    (kpisTrend && (pickArray(kpisTrend, 'labels') ?? (kpisTrend as UnknownRecord).labels)) ?? [];
  const labels = Array.isArray(labelsUnknown) ? labelsUnknown : [];

  const trendToSeries = (trendKey: string): SeriesPoint[] => {
    const trendObj =
      (kpisTrend && (pickRecord(kpisTrend, trendKey) ?? (kpisTrend as UnknownRecord)[trendKey])) ??
      null;

    const dataUnknown =
      (trendObj && (pickArray(trendObj, 'data') ?? (trendObj as UnknownRecord).data)) ?? [];
    const data = Array.isArray(dataUnknown) ? dataUnknown : [];

    if (!labels.length || !data.length) return [];

    const len = Math.min(labels.length, data.length);

    return Array.from({ length: len }).map((_, i) => ({
      label: readString(labels[i]) ?? String(i),
      value: readNumber(data[i]) ?? 0,
    }));
  };

  const kpis: Record<KpiKey, SeriesPoint[]> = {
    arpu: trendToSeries('arpuTrend'),
    conversion: trendToSeries('conversionTrend'),
    churn: trendToSeries('churnTrend'),
    retention: trendToSeries('retentionTrend'),
  };

  const conversionBars = firstNonEmptySeries(
    unwrap(pickArray(root, 'conversionBars')),
    unwrap(pickArray(root, 'conversion_bars')),
    unwrap(pickArray(root, 'bars')),
    unwrap(pickArray(root, 'conversion')),
    kpis.conversion,
  );

  return { kpis, conversionBars };
}

function isNotNull<T>(v: T | null): v is T {
  return v !== null;
}

function normalizeMap(input: unknown): {
  center: [number, number];
  zoom: number;
  locations: MapPoint[];
} {
  const root = unwrap(input);
  const data = unwrap(root);

  let center: [number, number] = [-51.2177, -30.0346];
  let zoom = 9;
  let locations: MapPoint[] = [];

  if (isRecord(data)) {
    const c = (data as UnknownRecord).center;
    if (Array.isArray(c) && c.length === 2) {
      const lng = readNumber(c[0]);
      const lat = readNumber(c[1]);
      if (lng !== null && lat !== null) center = [lng, lat];
    }

    const z = readNumber((data as UnknownRecord).zoom);
    if (z !== null && z > 0) zoom = z;

    const locs = pickArray(data, 'locations') ?? [];
    locations = locs
      .map((item, idx) => {
        const rec = isRecord(item) ? (item as UnknownRecord) : null;
        if (!rec) return null;

        const id = readString(rec.id) ?? String(idx);
        const place = readString(rec.name) ?? readString(rec.place) ?? undefined;
        const type = readString(rec.type) ?? 'default';

        const coords = rec.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;

        const lng = readNumber(coords[0]);
        const lat = readNumber(coords[1]);
        if (lng === null || lat === null) return null;

        return place ? { id, lat, lng, type, place } : { id, lat, lng, type };
      })
      .filter(isNotNull);
  }

  return { center, zoom, locations };
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedKpi: 'arpu',
  setSelectedKpi: (k) => set({ selectedKpi: k }),

  locations: [],
  mapCenter: [-97.7431, 30.2672],
  mapZoom: 11,

  kpis: emptyKpis,
  conversionBars: [],

  status: 'idle',
  errorMessage: null,

  fetchAll: async () => {
    set({ status: 'loading', errorMessage: null });

    try {
      const [dashboardRes, mapRes] = await Promise.all([
        fetch('/api/nortus/dashboard', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/nortus/map/locations', { cache: 'no-store', credentials: 'include' }),
      ]);

      if (dashboardRes.status === 401 || mapRes.status === 401) {
        set({ status: 'unauthorized', errorMessage: 'Sem sessão (401). Faça login novamente.' });
        return;
      }

      if (!dashboardRes.ok) throw new Error(await dashboardRes.text());
      if (!mapRes.ok) throw new Error(await mapRes.text());

      const dashboardJson: unknown = await dashboardRes.json();
      const mapJson: unknown = await mapRes.json();

      const normalized = normalizeDashboard(dashboardJson);
      const mapNormalized = normalizeMap(mapJson);

      set({
        status: 'success',
        kpis: normalized.kpis,
        conversionBars: normalized.conversionBars,
        locations: mapNormalized.locations,
        mapCenter: mapNormalized.center,
        mapZoom: mapNormalized.zoom,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unexpected error';
      set({ status: 'error', errorMessage: msg });
    }
  },
}));
