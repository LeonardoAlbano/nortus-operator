'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTicketsStore } from '@/features/tickets/store';
import type { TicketPriority } from '../model/tickets.types';
import { cn } from '@/lib/utils';

const schema = z.object({
  client: z.string().min(1, 'Nome do cliente é obrigatório'),
  email: z.string().email('Email inválido'),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']),
  responsible: z.string().min(1, 'Responsável é obrigatório'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
});

type FormValues = z.infer<typeof schema>;

const priorityLabel: Record<TicketPriority, string> = {
  Baixa: 'Baixa',
  Média: 'Média',
  Alta: 'Alta',
  Urgente: 'Urgente',
};

const priorities: TicketPriority[] = ['Urgente', 'Alta', 'Média', 'Baixa'];

type Props = {
  triggerLabel?: string;
  triggerClassName?: string;
};

export function NewTicketDialog({ triggerLabel, triggerClassName }: Props) {
  const create = useTicketsStore((s) => s.create);

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client: '',
      email: '',
      priority: 'Média',
      responsible: '',
      subject: '',
    },
  });

  const priority = useWatch({ control: form.control, name: 'priority' });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        await create({
          ...values,
          ticketId,
          status: 'Aberto',
        });

        toast.success('Ticket criado com sucesso!');
        setOpen(false);
        form.reset();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Falha ao criar ticket';
        toast.error(msg);
      }
    });
  }

  function handlePriorityChange(value: string) {
    const valid: TicketPriority[] = ['Baixa', 'Média', 'Alta', 'Urgente'];
    const next: TicketPriority = valid.includes(value as TicketPriority)
      ? (value as TicketPriority)
      : 'Média';
    form.setValue('priority', next, { shouldDirty: true });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="blueloomi" className={cn('h-10 rounded-full px-4', triggerClassName)}>
          {triggerLabel ?? '+ Novo Ticket'}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-loomi-header border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Novo Ticket</DialogTitle>
          <DialogDescription>Preencha os dados para criar um novo ticket.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/80">Nome do cliente</label>
            <Input
              {...form.register('client')}
              className="h-11 rounded-xl border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white"
            />
            {form.formState.errors.client && (
              <p className="text-xs text-red-300">{form.formState.errors.client.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Email</label>
            <Input
              {...form.register('email')}
              className="h-11 rounded-xl border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-300">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-3 text-sm text-white outline-none"
            >
              {priorities.map((p) => (
                <option key={p} value={p} className="bg-[rgb(var(--loomi-surface-rgb))]">
                  {priorityLabel[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Responsável</label>
            <Input
              {...form.register('responsible')}
              className="h-11 rounded-xl border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white"
            />
            {form.formState.errors.responsible && (
              <p className="text-xs text-red-300">{form.formState.errors.responsible.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Assunto</label>
            <textarea
              className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-3 py-2 text-sm text-white outline-none"
              {...form.register('subject')}
            />
            {form.formState.errors.subject && (
              <p className="text-xs text-red-300">{form.formState.errors.subject.message}</p>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-white/15 bg-transparent text-white"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              variant="blueloomi"
              className="h-11 rounded-xl px-6"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
