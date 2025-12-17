'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

type Message = {
  id: string;
  side: 'client' | 'assistant';
  title?: string;
  text: string;
  time: string;
};

export function ChatScreen() {
  const [value, setValue] = useState('');
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const messages = useMemo<Message[]>(
    () => [
      {
        id: '1',
        side: 'client',
        title: 'Ricardo Leite - Seguro Automóvel',
        text: 'Oi! Tudo certo? Gostaria de saber sobre o seguro automóvel',
        time: '12:23',
      },
      {
        id: '2',
        side: 'assistant',
        title: 'Assistente',
        text: 'Oi, Ricardo! Tudo ótimo e com você? Claro que sim, posso te ajudar com o que precisar. Vi aqui que você tá com a gente há 6 meses com o seguro de automóvel, é isso mesmo?',
        time: '12:23',
      },
      {
        id: '3',
        side: 'client',
        title: 'Ricardo Leite - Seguro Automóvel',
        text: 'Isso! Mas agora fiquei pensando... tem alguma coisa além disso? Tipo, pros meus equipamentos',
        time: '12:23',
      },
    ],
    [],
  );

  const handleSend = () => {
    if (!value.trim()) return;
    setValue('');
    queueMicrotask(() => {
      const el = viewportRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <div className="flex min-h-[calc(100dvh-112px)] flex-col space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold">Chat & Assistente Virtual</h2>
      </div>

      <div className="bg-loomi-header flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 shadow-[0_5px_100px_rgba(0,0,0,0.35)]">
        <div className="px-4 pt-5 pb-3 sm:px-6">
          <div className="text-center text-xs text-white/60">HOJE, 16:40</div>
        </div>

        <div ref={viewportRef} className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 sm:px-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.side === 'client' ? 'flex justify-start' : 'flex justify-end'}
            >
              <div
                className={[
                  'w-full max-w-[680px] rounded-2xl border px-4 py-3 text-sm sm:w-auto',
                  m.side === 'client'
                    ? 'border-white/10 bg-[#1D6DFF]/90 text-white shadow-[0_2px_25px_rgba(29,109,255,0.25)]'
                    : 'border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.55)] text-white/85',
                ].join(' ')}
              >
                {m.title ? <div className="mb-1 text-xs text-white/70">{m.title}</div> : null}
                <div className="leading-relaxed">{m.text}</div>
                <div className="mt-2 flex justify-end text-[11px] text-white/60">{m.time}</div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <div className="w-full max-w-[680px] rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.45)] p-4">
              <div className="text-xs font-medium text-white/70">Sugestão da IA</div>
              <p className="mt-2 text-sm text-white/70">
                Baseado no perfil do cliente, recomendo a oferta Premium com desconto de 15%.
                Cliente tem histórico positivo.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button variant="blueloomi" className="h-10 w-full rounded-full px-6 sm:w-auto">
                  Enviar proposta
                </Button>
                <Button variant="blueloomi" className="h-10 w-full rounded-full px-6 sm:w-auto">
                  Fazer ligação
                </Button>
                <Button variant="blueloomi" className="h-10 w-full rounded-full px-6 sm:w-auto">
                  Ver histórico
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-4 py-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escreva aqui..."
              className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <Button variant="blueloomi" size="icon" className="rounded-full">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
