import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTicketsStore } from './tickets.store';
import type { CreateTicketInput, Ticket, TicketPaginated } from '../model/tickets.types';
import { createTicket, deleteTicket, listTickets, updateTicket } from '../api/tickets.client';

vi.mock('../api/tickets.client', () => ({
  listTickets: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
}));

function resetTicketsStore() {
  useTicketsStore.setState({
    data: null,
    isLoading: false,
    error: null,
    stats: { open: 0, inProgress: 0, done: 0 },
    isLoadingStats: false,
    statsError: null,
    responsibles: [],
    page: 1,
    pageSize: 15,
    filters: { q: '', status: 'all', priority: 'all', responsible: 'all' },
  });
}

describe('tickets.store', () => {
  beforeEach(() => {
    resetTicketsStore();
  });

  it('fetch: carrega tickets e agrega responsibles', async () => {
    const items: Ticket[] = [
      {
        id: 'id-1',
        ticketId: 'TK300',
        client: 'Cliente A',
        email: 'clientea@teste.com',
        subject: 'Problema de acesso',
        priority: 'Alta',
        status: 'Aberto',
        responsible: 'Leonardo',
        createdAt: '2025-01-01T10:00:00.000Z',
      },
      {
        id: 'id-2',
        ticketId: 'TK301',
        client: 'Cliente B',
        email: 'clienteb@teste.com',
        subject: 'Erro no pagamento',
        priority: 'Média',
        status: 'Em andamento',
        responsible: 'Ana',
        createdAt: '2025-01-02T10:00:00.000Z',
      },
    ];

    const paginated: TicketPaginated = {
      items,
      page: 1,
      pageSize: 15,
      totalItems: 2,
      totalPages: 1,
    };

    vi.mocked(listTickets).mockResolvedValueOnce(paginated);

    await useTicketsStore.getState().fetch();

    const state = useTicketsStore.getState();
    expect(state.data?.items).toHaveLength(2);
    expect(state.responsibles).toEqual(['Ana', 'Leonardo']);
    expect(state.error).toBeNull();
  });

  it('fetchStats: calcula stats usando totalItems quando disponível', async () => {
    vi.mocked(listTickets)
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 5,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 2,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 1,
        totalPages: 1,
      });

    await useTicketsStore.getState().fetchStats();

    const state = useTicketsStore.getState();
    expect(state.stats).toEqual({ open: 5, inProgress: 2, done: 1 });
    expect(state.statsError).toBeNull();
  });

  it('create: chama API e depois sincroniza fetch + fetchStats', async () => {
    const created: Ticket = {
      id: 'id-3',
      ticketId: 'TICKET-123',
      client: 'Cliente C',
      email: 'clientec@teste.com',
      subject: 'Novo ticket',
      priority: 'Baixa',
      status: 'Aberto',
      responsible: 'Ana',
      createdAt: '2025-01-03T10:00:00.000Z',
    };

    const input: CreateTicketInput = {
      ticketId: 'TICKET-123',
      client: 'Cliente C',
      email: 'clientec@teste.com',
      subject: 'Novo ticket',
      priority: 'Baixa',
      status: 'Aberto',
      responsible: 'Ana',
    };

    vi.mocked(createTicket).mockResolvedValueOnce(created);

    vi.mocked(listTickets)
      .mockResolvedValueOnce({
        items: [created],
        page: 1,
        pageSize: 15,
        totalItems: 1,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 1,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      });

    const result = await useTicketsStore.getState().create(input);

    expect(result.id).toBe('id-3');
    expect(createTicket).toHaveBeenCalledTimes(1);
    expect(createTicket).toHaveBeenCalledWith(input);
    expect(listTickets).toHaveBeenCalledTimes(4);
  });

  it('update/remove: delega API e sincroniza', async () => {
    vi.mocked(updateTicket).mockResolvedValueOnce({
      id: 'id-1',
      ticketId: 'TK300',
      client: 'Cliente A',
      email: 'clientea@teste.com',
      subject: 'Atualizado',
      priority: 'Alta',
      status: 'Em andamento',
      responsible: 'Leonardo',
    });

    vi.mocked(listTickets)
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      });

    await useTicketsStore.getState().update('id-1', { subject: 'Atualizado' });

    expect(updateTicket).toHaveBeenCalledTimes(1);

    vi.mocked(deleteTicket).mockResolvedValueOnce(undefined);

    vi.mocked(listTickets)
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 15,
        totalItems: 0,
        totalPages: 1,
      });

    await useTicketsStore.getState().remove('id-1');

    expect(deleteTicket).toHaveBeenCalledTimes(1);
  });
});
