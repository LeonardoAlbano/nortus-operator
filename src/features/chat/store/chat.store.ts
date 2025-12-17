import { create } from 'zustand';
import { getChat } from '@/features/chat/api/chat.client';

export type MessageSide = 'client' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  side: MessageSide;
  title?: string;
  text: string;
  time: string;
};

export type ActionKey = 'send_proposal' | 'make_call' | 'view_history';

export type SuggestionAction = {
  key: ActionKey;
  label: string;
};

export type Suggestion = {
  id: string;
  title: string;
  text: string;
  actions: SuggestionAction[];
};

type Phase = 'idle' | 'awaiting_choice' | 'collecting' | 'ready';

type ChatState = {
  messages: ChatMessage[];
  suggestion: Suggestion | null;
  isLoading: boolean;

  phase: Phase;
  step: number;

  load: () => Promise<void>;
  send: (text: string, clientTitle?: string) => void;
  applyAction: (key: ActionKey, clientTitle?: string) => void;
};

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function includesAny(input: string, terms: string[]) {
  const n = normalize(input);
  return terms.some((t) => n.includes(normalize(t)));
}

function toUiMessage(m: Record<string, unknown>): ChatMessage {
  const rawSide = typeof m.side === 'string' ? m.side : '';
  const side: MessageSide =
    rawSide === 'assistant' || rawSide === 'client' || rawSide === 'system' ? rawSide : 'assistant';

  return {
    id: typeof m.id === 'string' ? m.id : id(),
    side,
    title: typeof m.title === 'string' ? m.title : undefined,
    text: typeof m.text === 'string' ? m.text : '',
    time: typeof m.time === 'string' ? m.time : nowTime(),
  };
}

function getSeedMessages(): ChatMessage[] {
  const t = nowTime();
  return [
    {
      id: id(),
      side: 'client',
      title: 'Ricardo Leite - Seguro Automóvel',
      text: 'Oi! Tudo certo? Gostaria de saber sobre o seguro automóvel.',
      time: t,
    },
    {
      id: id(),
      side: 'assistant',
      title: 'Assistente',
      text: 'Oi! Quer uma proposta agora ou prefere responder algumas perguntas rápidas antes?',
      time: t,
    },
  ];
}

function defaultSuggestion(): Suggestion {
  return {
    id: id(),
    title: 'Sugestão da IA',
    text: 'Escolha o próximo passo para avançar rapidamente.',
    actions: [
      { key: 'send_proposal', label: 'Enviar proposta' },
      { key: 'make_call', label: 'Fazer ligação' },
      { key: 'view_history', label: 'Ver histórico' },
    ],
  };
}

function actionLabel(key: ActionKey) {
  if (key === 'send_proposal') return 'Enviar proposta';
  if (key === 'make_call') return 'Fazer ligação';
  return 'Ver histórico';
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  suggestion: null,
  isLoading: false,

  phase: 'idle',
  step: 0,

  load: async () => {
    if (get().messages.length) return;

    set({ isLoading: true });

    try {
      const data = await getChat();

      const raw = Array.isArray(data)
        ? data
        : Array.isArray((data as { messages?: unknown }).messages)
          ? ((data as { messages: unknown[] }).messages as unknown[])
          : [];

      const mapped = raw
        .map((x) => (typeof x === 'object' && x ? (x as Record<string, unknown>) : null))
        .filter((x): x is Record<string, unknown> => Boolean(x))
        .map((m) => toUiMessage(m))
        .filter((m) => m.text.trim().length > 0);

      set({
        messages: mapped.length ? mapped : getSeedMessages(),
        isLoading: false,
        phase: 'awaiting_choice',
        suggestion: defaultSuggestion(),
      });
    } catch {
      set({
        messages: getSeedMessages(),
        isLoading: false,
        phase: 'awaiting_choice',
        suggestion: defaultSuggestion(),
      });
    }
  },

  send: (text: string, clientTitle?: string) => {
    const state = get();

    const clientMsg: ChatMessage = {
      id: id(),
      side: 'client',
      title: clientTitle ?? 'Você',
      text,
      time: nowTime(),
    };

    const nextMessages = [...state.messages, clientMsg];

    const phase = state.phase;
    const step = state.step;

    let assistantText = '';
    let nextPhase: Phase = phase;
    let nextStep = step;
    let nextSuggestion: Suggestion | null = state.suggestion;

    if (phase === 'idle' || phase === 'awaiting_choice') {
      if (includesAny(text, ['pergunta', 'antes', 'duvida', 'dúvida'])) {
        assistantText = 'Perfeito. Primeiro: qual é o modelo e o ano do veículo?';
        nextPhase = 'collecting';
        nextStep = 1;
        nextSuggestion = null;
      } else if (includesAny(text, ['proposta', 'agora', 'sim', 'manda'])) {
        assistantText =
          'Entendi. Para montar a proposta rápida: qual o valor aproximado do veículo e sua idade?';
        nextPhase = 'collecting';
        nextStep = 10;
        nextSuggestion = null;
      } else {
        assistantText =
          'Entendi. Quer uma proposta agora, ou prefere que eu faça algumas perguntas rápidas antes?';
        nextPhase = 'awaiting_choice';
        nextStep = 0;
        nextSuggestion = defaultSuggestion();
      }
    } else if (phase === 'collecting') {
      if (step === 1) {
        assistantText = 'Boa. Agora: qual é o CEP de circulação principal?';
        nextStep = 2;
      } else if (step === 2) {
        assistantText = 'Última pergunta: você prefere franquia menor ou mensalidade menor?';
        nextStep = 3;
      } else {
        assistantText =
          'Perfeito, com isso eu já consigo sugerir um próximo passo. Quer que eu gere uma proposta Premium com desconto e opcionais recomendados?';
        nextPhase = 'ready';
        nextStep = 0;
        nextSuggestion = defaultSuggestion();
      }
    } else {
      assistantText =
        'Certo. Posso seguir com a proposta, ou se preferir eu faço uma ligação e alinhamos os detalhes em 2 minutos.';
      nextSuggestion = defaultSuggestion();
    }

    const assistantMsg: ChatMessage = {
      id: id(),
      side: 'assistant',
      title: 'Assistente',
      text: assistantText,
      time: nowTime(),
    };

    set({
      messages: [...nextMessages, assistantMsg],
      phase: nextPhase,
      step: nextStep,
      suggestion: nextSuggestion,
    });
  },

  applyAction: (key: ActionKey, clientTitle?: string) => {
    const label = actionLabel(key);

    const clickedMsg: ChatMessage = {
      id: id(),
      side: 'client',
      title: clientTitle ?? 'Você',
      text: label,
      time: nowTime(),
    };

    const systemMsg: ChatMessage = {
      id: id(),
      side: 'system',
      title: 'Sistema',
      text: `Ação executada: ${label}.`,
      time: nowTime(),
    };

    set((s) => ({
      messages: [...s.messages, clickedMsg, systemMsg],
    }));
  },
}));
