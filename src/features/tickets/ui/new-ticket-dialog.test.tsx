import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CreateTicketInput, Ticket } from '../model/tickets.types';

const createMock = vi.fn<() => Promise<Ticket>>();

type StoreShape = {
  create: (input: CreateTicketInput) => Promise<Ticket>;
};

const store: StoreShape = {
  create: async (input) => {
    createMock();
    return {
      id: 'id-x',
      ticketId: input.ticketId,
      client: input.client,
      email: input.email,
      subject: input.subject,
      priority: input.priority,
      status: input.status,
      responsible: input.responsible,
    };
  },
};

vi.mock('@/features/tickets/store', () => ({
  useTicketsStore: <T,>(selector?: (s: StoreShape) => T) => {
    if (selector) return selector(store);
    return store as unknown as T;
  },
}));

import { NewTicketDialog } from './new-ticket-dialog';

describe('NewTicketDialog', () => {
  it('abre o dialog e envia create com payload esperado', async () => {
    const user = userEvent.setup();

    vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456);

    render(<NewTicketDialog />);

    await user.click(screen.getByRole('button', { name: '+ Novo Ticket' }));

    expect(screen.getByText('Novo Ticket')).toBeInTheDocument();

    const client = document.querySelector('input[name="client"]') as HTMLInputElement | null;
    const email = document.querySelector('input[name="email"]') as HTMLInputElement | null;
    const responsible = document.querySelector(
      'input[name="responsible"]',
    ) as HTMLInputElement | null;
    const subject = document.querySelector(
      'textarea[name="subject"]',
    ) as HTMLTextAreaElement | null;

    expect(client).not.toBeNull();
    expect(email).not.toBeNull();
    expect(responsible).not.toBeNull();
    expect(subject).not.toBeNull();

    await user.type(client!, 'Cliente Teste');
    await user.type(email!, 'cliente@teste.com');
    await user.type(responsible!, 'Leonardo');
    await user.type(subject!, 'Preciso de ajuda com acesso');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
    });
  });
});
