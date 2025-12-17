import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { setUserMock, fetchMock } = vi.hoisted(() => ({
  setUserMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/features/auth/store', () => {
  type AuthState = { setUser: typeof setUserMock };
  type Selector<T> = (state: AuthState) => T;

  const useAuthStore = <T,>(selector?: Selector<T>): T | AuthState => {
    const state: AuthState = { setUser: setUserMock };
    return typeof selector === 'function' ? selector(state) : state;
  };

  Object.assign(useAuthStore, {
    getState: () => ({ setUser: setUserMock }),
    setState: vi.fn(),
    subscribe: vi.fn(),
  });

  return { useAuthStore };
});

async function renderLoginForm() {
  const mod = await import('./login-form');
  render(<mod.LoginForm />);
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('fetch', fetchMock);

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { name: 'Leo', email: 'leo@teste.com' } }),
    });
  });

  it('renderiza campos e botão', async () => {
    await renderLoginForm();

    expect(screen.getByPlaceholderText('fields.username.placeholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('fields.password.placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('bloqueia submit com email inválido e mostra erro', async () => {
    const user = userEvent.setup();
    await renderLoginForm();

    await user.type(screen.getByPlaceholderText('fields.username.placeholder'), 'leo');
    await user.type(screen.getByPlaceholderText('fields.password.placeholder'), '123456');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(fetchMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('errors.emailInvalid')).toBeInTheDocument();
    });
  });

  it('permite digitar e autenticar', async () => {
    const user = userEvent.setup();
    await renderLoginForm();

    await user.type(screen.getByPlaceholderText('fields.username.placeholder'), 'leo@teste.com');
    await user.type(screen.getByPlaceholderText('fields.password.placeholder'), '123456');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'leo@teste.com', password: '123456' }),
      }),
    );

    await waitFor(() => {
      expect(setUserMock).toHaveBeenCalledWith({ name: 'Leo', email: 'leo@teste.com' });
      expect(window.location.href).toBe('/dashboard');
    });
  });
});
