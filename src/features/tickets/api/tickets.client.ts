import type {
  CreateTicketInput,
  ListTicketsParams,
  Ticket,
  TicketPaginated,
  UpdateTicketInput,
} from '../model/tickets.types';

function pickMessageFromUnknownJson(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null;

  const obj = json as Record<string, unknown>;
  const msg = obj.message;
  const err = obj.error;

  if (typeof msg === 'string' && msg.trim()) return msg;
  if (typeof err === 'string' && err.trim()) return err;

  return null;
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await res.text().catch(() => '');

  if (!res.ok) {
    if (text) {
      try {
        const json = JSON.parse(text) as unknown;
        const msg = pickMessageFromUnknownJson(json);
        if (msg) throw new Error(msg);
      } catch {
        throw new Error(text);
      }
    }
    throw new Error(`Request failed (${res.status})`);
  }

  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Invalid JSON response');
  }
}

export async function listTickets(params: ListTicketsParams): Promise<TicketPaginated> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('pageSize', String(params.pageSize));

  if (params.q) qs.set('q', params.q);
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.priority && params.priority !== 'all') qs.set('priority', params.priority);
  if (params.responsible && params.responsible !== 'all') qs.set('responsible', params.responsible);

  return fetchJson<TicketPaginated>(`/api/nortus/tickets?${qs.toString()}`, { method: 'GET' });
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return fetchJson<Ticket>('/api/nortus/tickets', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  return fetchJson<Ticket>(`/api/nortus/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteTicket(id: string): Promise<void> {
  await fetchJson<unknown>(`/api/nortus/tickets/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
