import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useChatStore } from '@/features/chat/store/chat.store';

vi.mock('@/features/chat/api/chat.client', () => ({
  getChat: vi.fn(),
}));

import { getChat } from '@/features/chat/api/chat.client';

function resetStore() {
  useChatStore.setState({
    messages: [],
    suggestion: null,
    isLoading: false,
    phase: 'idle',
    step: 0,
  });
}

describe('chat.store', () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.1234);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('load: filtra mensagens vazias e aplica seed quando API retorna apenas textos vazios', async () => {
    (getChat as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      messages: [
        { id: '1', side: 'assistant', title: 'Assistente', text: '   ', time: '10:00' },
        { id: '2', side: 'assistant', title: 'Assistente', text: '', time: '10:00' },
      ],
    });

    await useChatStore.getState().load();

    const state = useChatStore.getState();

    expect(state.messages.length).toBe(2);
    expect(state.messages[0].side).toBe('client');
    expect(state.messages[1].side).toBe('assistant');
    expect(state.messages.every((m) => m.text.trim().length > 0)).toBe(true);

    expect(state.suggestion?.actions.length).toBe(3);
    expect(state.phase).toBe('awaiting_choice');
  });

  it('send: adiciona mensagem do cliente e resposta do assistente', () => {
    useChatStore.setState({ phase: 'awaiting_choice', step: 0 });

    useChatStore.getState().send('perguntas antes', 'Leonardo');

    const state = useChatStore.getState();
    expect(state.messages.length).toBe(2);
    expect(state.messages[0].side).toBe('client');
    expect(state.messages[0].title).toBe('Leonardo');
    expect(state.messages[1].side).toBe('assistant');
    expect(state.phase).toBe('collecting');
  });

  it('applyAction: adiciona mensagem do cliente + mensagem system', () => {
    const before = useChatStore.getState().messages.length;

    useChatStore.getState().applyAction('make_call', 'Leonardo');

    const state = useChatStore.getState();
    expect(state.messages.length).toBe(before + 2);

    const [clientMsg, systemMsg] = state.messages.slice(-2);

    expect(clientMsg.side).toBe('client');
    expect(clientMsg.title).toBe('Leonardo');
    expect(clientMsg.text).toBe('Fazer ligação');

    expect(systemMsg.side).toBe('system');
    expect(systemMsg.text).toContain('Ação executada');
  });
});
