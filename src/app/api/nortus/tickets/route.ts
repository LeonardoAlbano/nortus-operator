import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NORTUS_API_URL, NORTUS_COOKIE } from '@/lib/env';

type UnknownRecord = Record<string, unknown>;

function safeJson(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown) {
  return typeof v === 'string' ? v : null;
}

function asNumber(v: unknown) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickArray(obj: unknown, keys: string[]) {
  if (!isRecord(obj)) return null;
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }
  return null;
}

function pickValue(obj: unknown, keys: string[]) {
  if (!isRecord(obj)) return null;
  for (const k of keys) {
    if (obj[k] !== undefined) return obj[k];
  }
  return null;
}

function normalizeTicket(input: unknown) {
  if (!isRecord(input)) return null;

  const createdAt =
    asString(input.createdAt) ?? asString(input.created_at) ?? asString(input.created) ?? '';

  const updatedAt =
    asString(input.updatedAt) ?? asString(input.updated_at) ?? asString(input.updated) ?? '';

  return {
    id: asString(input.id) ?? '',
    ticketId: asString(input.ticketId) ?? asString(input.ticket_id) ?? '',
    client: asString(input.client) ?? '',
    email: asString(input.email) ?? '',
    subject: asString(input.subject) ?? '',
    priority: (asString(input.priority) ?? 'Média') as string,
    status: (asString(input.status) ?? 'Aberto') as string,
    responsible: asString(input.responsible) ?? '',
    createdAt,
    updatedAt,
  };
}

function normalizeItemsOnly(input: unknown) {
  const itemsRaw =
    (Array.isArray(input) ? input : null) ??
    pickArray(input, ['items', 'data', 'results', 'tickets']) ??
    [];

  return itemsRaw.map(normalizeTicket).filter((x): x is NonNullable<typeof x> => !!x && !!x.id);
}

function hasPaginationMeta(input: unknown) {
  if (!isRecord(input)) return false;
  const keys = [
    'total_pages',
    'totalPages',
    'total_items',
    'totalItems',
    'page',
    'pageSize',
    'page_size',
  ];
  return keys.some((k) => input[k] !== undefined);
}

function includesInsensitive(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const sp = req.nextUrl.searchParams;

  const requestedPage = Math.max(1, Number(sp.get('page') ?? '1'));
  const requestedPageSize = Math.max(1, Number(sp.get('pageSize') ?? '15'));

  const q = (sp.get('q') ?? '').trim();
  const status = (sp.get('status') ?? 'all').trim();
  const priority = (sp.get('priority') ?? 'all').trim();
  const responsible = (sp.get('responsible') ?? 'all').trim();

  const qs = req.nextUrl.searchParams.toString();
  const upstreamUrl = `${NORTUS_API_URL}/tickets${qs ? `?${qs}` : ''}`;

  const upstream = await fetch(upstreamUrl, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const text = await upstream.text().catch(() => '');
  const payload = safeJson(text);

  if (!upstream.ok) {
    return NextResponse.json(payload ?? { message: text || 'Request failed' }, {
      status: upstream.status,
    });
  }

  const itemsAll = normalizeItemsOnly(payload);

  const shouldLocal = !hasPaginationMeta(payload) || itemsAll.length > requestedPageSize;

  if (!shouldLocal) {
    const page =
      asNumber(pickValue(payload, ['page', 'currentPage', 'current_page'])) ?? requestedPage;
    const pageSize =
      asNumber(pickValue(payload, ['pageSize', 'page_size', 'perPage', 'limit'])) ??
      requestedPageSize;
    const totalItems =
      asNumber(pickValue(payload, ['totalItems', 'total_items', 'total', 'count'])) ??
      itemsAll.length;
    const totalPages =
      asNumber(pickValue(payload, ['totalPages', 'total_pages', 'pages'])) ??
      Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

    return NextResponse.json(
      { items: itemsAll, page, pageSize, totalItems, totalPages },
      { status: 200 },
    );
  }

  let filtered = itemsAll;

  if (q) {
    filtered = filtered.filter((t) => {
      const hay = `${t.id} ${t.ticketId} ${t.client} ${t.email} ${t.subject}`.trim();
      return includesInsensitive(hay, q);
    });
  }

  if (status !== 'all') filtered = filtered.filter((t) => t.status === status);
  if (priority !== 'all') filtered = filtered.filter((t) => t.priority === priority);
  if (responsible !== 'all') filtered = filtered.filter((t) => t.responsible === responsible);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / requestedPageSize));
  const page = Math.min(requestedPage, totalPages);

  const start = (page - 1) * requestedPageSize;
  const end = start + requestedPageSize;
  const items = filtered.slice(start, end);

  return NextResponse.json(
    { items, page, pageSize: requestedPageSize, totalItems, totalPages },
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(NORTUS_COOKIE)?.value;

  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });

  const body = await req.text();

  const upstream = await fetch(`${NORTUS_API_URL}/tickets`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body,
    cache: 'no-store',
  });

  const text = await upstream.text().catch(() => '');
  const payload = safeJson(text);

  if (!upstream.ok) {
    return NextResponse.json(payload ?? { message: text || 'Request failed' }, {
      status: upstream.status,
    });
  }

  const normalized = normalizeTicket(payload) ?? payload;
  return NextResponse.json(normalized, { status: 200 });
}
