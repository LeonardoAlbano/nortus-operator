import { create } from 'zustand';
import type {
  CreateTicketInput,
  Ticket,
  TicketPaginated,
  TicketPriority,
  TicketStatus,
  UpdateTicketInput,
} from '../model/tickets.types';
import { createTicket, deleteTicket, listTickets, updateTicket } from '../api/tickets.client';

type Filters = {
  q: string;
  status: 'all' | TicketStatus;
  priority: 'all' | TicketPriority;
  responsible: 'all' | string;
};

type TicketsStats = {
  open: number;
  inProgress: number;
  done: number;
};

type TicketsState = {
  data: TicketPaginated | null;
  isLoading: boolean;
  error: string | null;

  stats: TicketsStats;
  isLoadingStats: boolean;
  statsError: string | null;

  responsibles: string[];

  page: number;
  pageSize: number;
  filters: Filters;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;

  fetch: () => Promise<void>;
  fetchStats: () => Promise<void>;

  create: (input: CreateTicketInput) => Promise<Ticket>;
  update: (id: string, input: UpdateTicketInput) => Promise<Ticket>;
  remove: (id: string) => Promise<void>;
};

const defaultFilters: Filters = {
  q: '',
  status: 'all',
  priority: 'all',
  responsible: 'all',
};

function getTotalItemsSafe(data: unknown): number {
  if (typeof data !== 'object' || data === null) return 0;
  const v = (data as { totalItems?: unknown }).totalItems;
  return typeof v === 'number' ? v : 0;
}

function normalizeResponsible(v: unknown) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s : null;
}

function mergeResponsibles(prev: string[], items: Ticket[]) {
  const set = new Set(prev);
  for (const t of items) {
    const r = normalizeResponsible(t.responsible);
    if (r) set.add(r);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  stats: { open: 0, inProgress: 0, done: 0 },
  isLoadingStats: false,
  statsError: null,

  responsibles: [],

  page: 1,
  pageSize: 15,
  filters: defaultFilters,

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setFilters: (partial) => set((s) => ({ filters: { ...s.filters, ...partial }, page: 1 })),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),

  fetch: async () => {
    const { page, pageSize, filters } = get();
    set({ isLoading: true, error: null });

    try {
      const data = await listTickets({
        page,
        pageSize,
        q: filters.q,
        status: filters.status,
        priority: filters.priority,
        responsible: filters.responsible,
      });

      set((s) => ({
        data,
        isLoading: false,
        responsibles: mergeResponsibles(s.responsibles, data.items ?? []),
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load tickets';
      set({ error: msg, isLoading: false });
    }
  },

  fetchStats: async () => {
    const { pageSize, filters } = get();
    set({ isLoadingStats: true, statsError: null });

    try {
      const base = {
        page: 1,
        pageSize: Math.min(pageSize, 15),
        q: filters.q,
        priority: filters.priority,
        responsible: filters.responsible,
      } as const;

      const [openRes, inProgressRes, doneRes] = await Promise.all([
        listTickets({ ...base, status: 'Aberto' }),
        listTickets({ ...base, status: 'Em andamento' }),
        listTickets({ ...base, status: 'Fechado' }),
      ]);

      const open = getTotalItemsSafe(openRes) || (openRes.items?.length ?? 0);
      const inProgress = getTotalItemsSafe(inProgressRes) || (inProgressRes.items?.length ?? 0);
      const done = getTotalItemsSafe(doneRes) || (doneRes.items?.length ?? 0);

      set({ stats: { open, inProgress, done }, isLoadingStats: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load stats';
      set({ statsError: msg, isLoadingStats: false });
    }
  },

  create: async (input) => {
    const ticket = await createTicket(input);
    await Promise.all([get().fetch(), get().fetchStats()]);
    return ticket;
  },

  update: async (id, input) => {
    const ticket = await updateTicket(id, input);
    await Promise.all([get().fetch(), get().fetchStats()]);
    return ticket;
  },

  remove: async (id) => {
    await deleteTicket(id);
    await Promise.all([get().fetch(), get().fetchStats()]);
  },
}));
