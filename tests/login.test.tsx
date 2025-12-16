import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '@/app/(public)/login/_components/login-form';

describe('LoginForm', () => {
  it('renderiza campos e botão', () => {
    render(<LoginForm />);

    expect(screen.getAllByPlaceholderText('fields.username.placeholder')[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('fields.password.placeholder')[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /submit/i })[0]).toBeInTheDocument();
  });

  it('permite digitar email e senha', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const email = screen.getAllByPlaceholderText(
      'fields.username.placeholder',
    )[0] as HTMLInputElement;
    const password = screen.getAllByPlaceholderText(
      'fields.password.placeholder',
    )[0] as HTMLInputElement;

    await user.type(email, 'x@x.com');
    await user.type(password, 'senha');

    expect(email.value).toBe('x@x.com');
    expect(password.value).toBe('senha');
  });
});
