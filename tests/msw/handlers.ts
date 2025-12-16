import { http, HttpResponse } from 'msw';

type Ticket = {
  id: string;
  ticketId: string;
  client: string;
  email: string;
  subject: string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  status: 'Aberto' | 'Em andamento' | 'Fechado';
  responsible: string;
  createdAt: string;
};

type Paginated = {
  items: Ticket[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const okUser = { name: 'Leo', email: 'leo@exemplo.com' };

let tickets: Ticket[] = [
  {
    id: 'id-1',
    ticketId: 'TICKET-001',
    client: 'Cliente A',
    email: 'clientea@teste.com',
    subject: 'Problema de acesso',
    priority: 'Alta',
    status: 'Aberto',
    responsible: 'Leonardo',
    createdAt: new Date('2025-01-01T10:00:00.000Z').toISOString(),
  },
  {
    id: 'id-2',
    ticketId: 'TICKET-002',
    client: 'Cliente B',
    email: 'clienteb@teste.com',
    subject: 'Erro no pagamento',
    priority: 'Média',
    status: 'Em andamento',
    responsible: 'Ana',
    createdAt: new Date('2025-01-02T10:00:00.000Z').toISOString(),
  },
];

function applyFilters(list: Ticket[], url: URL) {
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const responsible = url.searchParams.get('responsible');

  return list.filter((t) => {
    if (q) {
      const hay =
        `${t.client} ${t.email} ${t.subject} ${t.ticketId} ${t.responsible}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (status && status !== 'all' && t.status !== status) return false;
    if (priority && priority !== 'all' && t.priority !== priority) return false;
    if (responsible && responsible !== 'all' && t.responsible !== responsible) return false;
    return true;
  });
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = body?.email ?? '';
    const password = body?.password ?? '';

    if (email === 'leo@exemplo.com' && password === '123456') {
      return HttpResponse.json({ user: okUser }, { status: 200 });
    }

    return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
  }),

  http.get('/api/nortus/tickets', ({ request }) => {
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const pageSize = Math.max(1, Number(url.searchParams.get('pageSize') ?? 15));

    const filtered = applyFilters(tickets, url);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    const payload: Paginated = { items, page, pageSize, totalItems, totalPages };
    return HttpResponse.json(payload, { status: 200 });
  }),

  http.post('/api/nortus/tickets', async ({ request }) => {
    const body = (await request.json()) as Partial<Ticket>;

    const next: Ticket = {
      id: `id-${Date.now()}`,
      ticketId: String(body.ticketId ?? `TICKET-${Date.now()}`),
      client: String(body.client ?? ''),
      email: String(body.email ?? ''),
      subject: String(body.subject ?? ''),
      priority: (body.priority as Ticket['priority']) ?? 'Média',
      status: (body.status as Ticket['status']) ?? 'Aberto',
      responsible: String(body.responsible ?? ''),
      createdAt: new Date().toISOString(),
    };

    tickets = [next, ...tickets];

    return HttpResponse.json(next, { status: 201 });
  }),

  http.patch('/api/nortus/tickets/:id', async ({ params, request }) => {
    const id = String(params.id);
    const patch = (await request.json()) as Partial<Ticket>;

    const idx = tickets.findIndex((t) => t.id === id);
    if (idx < 0) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    tickets[idx] = { ...tickets[idx], ...patch };
    return HttpResponse.json(tickets[idx], { status: 200 });
  }),

  http.delete('/api/nortus/tickets/:id', ({ params }) => {
    const id = String(params.id);
    tickets = tickets.filter((t) => t.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
