import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Ticket } from '../model/tickets.types';
import { ticketRef } from '../model/ticket-ref';

const fetchMock = vi.fn();
const fetchStatsMock = vi.fn();
const setPageMock = vi.fn();
const setFiltersMock = vi.fn();

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

vi.mock('@/features/tickets/store', () => ({
  useTicketsStore: () => ({
    data: { items, page: 1, pageSize: 15, totalItems: 2, totalPages: 1 },
    isLoading: false,
    error: null,
    stats: { open: 1, inProgress: 1, done: 0 },
    isLoadingStats: false,
    statsError: null,
    responsibles: ['Leonardo', 'Ana'],
    page: 1,
    pageSize: 15,
    filters: { q: '', status: 'all', priority: 'all', responsible: 'all' },
    setPage: setPageMock,
    setPageSize: vi.fn(),
    setFilters: setFiltersMock,
    resetFilters: vi.fn(),
    fetch: fetchMock,
    fetchStats: fetchStatsMock,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock('./ticket-details-dialog', () => ({
  TicketDetailsDialog: () => null,
}));

vi.mock('./edit-ticket-dialog', () => ({
  EditTicketDialog: () => null,
}));

import { TicketsPage } from './tickets-page';

describe('TicketsPage', () => {
  it('renderiza tabela e dispara fetch/fetchStats no mount', () => {
    render(<TicketsPage />);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchStatsMock).toHaveBeenCalledTimes(1);

    expect(screen.getByPlaceholderText('filters.searchPlaceholder')).toBeInTheDocument();

    expect(screen.getByText(ticketRef('id-1'))).toBeInTheDocument();
    expect(screen.getByText(ticketRef('id-2'))).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: 'actions.edit' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'actions.view' }).length).toBeGreaterThan(0);
  });
});
