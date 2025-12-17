'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/features/chat/store/chat.store';

type Me = { email?: string; name?: string } | null;

export function ChatScreen({ me }: { me: Me }) {
  const [value, setValue] = useState('');
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const meLabel = me?.name ?? me?.email ?? 'Você';

  const { messages, suggestion, isLoading, load, send, applyAction } = useChatStore();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const surface = 'bg-[rgb(var(--loomi-surface-rgb)/0.25)]';
  const shadow = 'shadow-[0_5px_100px_rgba(0,0,0,0.35)]';

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    send(text, meLabel);
  };

  const dayLabel = useMemo(() => 'HOJE', []);

  return (
    <div className="flex h-[calc(100dvh-112px)] flex-col gap-6 text-white">
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border',
          'border-white/5',
          surface,
          shadow,
        )}
      >
        <div className="px-4 pt-5 pb-3 sm:px-6">
          <div className="text-center text-xs text-white/60">{dayLabel}</div>
        </div>

        <div ref={viewportRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-sm text-white/60">Carregando conversa…</div>
            ) : (
              messages.map((m) => {
                if (m.side === 'system') {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <div className="rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.30)] px-3 py-1 text-[11px] text-white/60">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                const isClient = m.side === 'client';
                const rowAlign = isClient ? 'flex justify-start' : 'flex justify-end';

                const bubbleStyle = isClient
                  ? 'border-white/10 bg-[#1D6DFF]/90 text-white shadow-[0_2px_25px_rgba(29,109,255,0.25)]'
                  : 'border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.55)] text-white/85';

                return (
                  <div key={m.id} className={rowAlign}>
                    <div
                      className={cn(
                        'w-full max-w-170 rounded-2xl border px-4 py-3 text-sm sm:w-auto',
                        bubbleStyle,
                      )}
                    >
                      <div className="mb-1 text-xs text-white/70">
                        {isClient ? meLabel : (m.title ?? 'Assistente')}
                      </div>
                      <div className="leading-relaxed">{m.text}</div>
                      <div className="mt-2 flex justify-end text-[11px] text-white/60">
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {suggestion ? (
              <div className="flex justify-end">
                <div className="w-full max-w-170 rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.45)] p-4">
                  <div className="text-xs font-medium text-white/70">{suggestion.title}</div>
                  <p className="mt-2 text-sm text-white/70">{suggestion.text}</p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    {suggestion.actions.map((a) => (
                      <Button
                        key={a.key}
                        variant="blueloomi"
                        className="h-10 w-full cursor-pointer rounded-full px-6 sm:w-auto"
                        onClick={() => applyAction(a.key, meLabel)}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-3 rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-4 py-2">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escreva aqui..."
              className="h-10 w-full cursor-pointer bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <Button
              variant="blueloomi"
              size="icon"
              className="cursor-pointer rounded-full"
              onClick={handleSend}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
