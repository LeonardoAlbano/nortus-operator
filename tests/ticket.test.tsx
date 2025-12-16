import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TicketsPage } from '@/features/tickets/ui/tickets-page';

describe('TicketsPage', () => {
  it('renderiza página e lista tickets', async () => {
    render(<TicketsPage />);

    const clientes = await screen.findAllByText('Cliente A');
    expect(clientes.length).toBeGreaterThan(0);

    expect(screen.getByRole('button', { name: /\+ Novo Ticket/i })).toBeInTheDocument();
  });

  it('cria um ticket com sucesso (dialog)', async () => {
    const user = userEvent.setup();
    render(<TicketsPage />);

    await screen.findAllByText('Cliente A');
    const triggers = Array.from(document.querySelectorAll('button[data-slot="dialog-trigger"]'));
    const target = triggers.find((b) => (b.textContent ?? '').includes('+ Novo Ticket')) as
      | HTMLButtonElement
      | undefined;
    if (!target) throw new Error('New ticket trigger not found');
    await user.click(target);

    const dialog = screen.getByRole('dialog');
    const scope = within(dialog);

    const client = dialog.querySelector('input[name="client"]') as HTMLInputElement | null;
    const email = dialog.querySelector('input[name="email"]') as HTMLInputElement | null;
    const responsible = dialog.querySelector(
      'input[name="responsible"]',
    ) as HTMLInputElement | null;
    const subject = dialog.querySelector('textarea[name="subject"]') as HTMLTextAreaElement | null;

    expect(client).toBeTruthy();
    expect(email).toBeTruthy();
    expect(responsible).toBeTruthy();
    expect(subject).toBeTruthy();

    await user.type(client!, 'Cliente Teste');
    await user.type(email!, 'cliente@teste.com');
    await user.type(responsible!, 'Leonardo');
    await user.type(subject!, 'Assunto do ticket');

    await user.click(scope.getByRole('button', { name: /Salvar/i }));

    expect(await screen.findAllByText('Cliente Teste')).toBeTruthy();
  });
});
