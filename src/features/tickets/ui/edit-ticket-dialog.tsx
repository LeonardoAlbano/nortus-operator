'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useTicketsStore } from '@/features/tickets/store';
import type { Ticket, TicketPriority, TicketStatus } from '../model/tickets.types';
import { ticketRef } from '@/features/tickets/model/ticket-ref';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle as AlertTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const priorities: Array<{ value: TicketPriority; label: string }> = [
  { value: 'Baixa', label: 'Baixa' },
  { value: 'Média', label: 'Média' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Urgente', label: 'Urgente' },
];

const statuses: Array<{ value: TicketStatus; label: string }> = [
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Fechado', label: 'Resolvido' },
];

const schema = z.object({
  client: z.string().min(1, 'Informe o cliente'),
  email: z.string().email('Email inválido'),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']),
  status: z.enum(['Aberto', 'Em andamento', 'Fechado']),
  responsible: z.string().min(1, 'Informe o responsável'),
  subject: z.string().min(1, 'Informe o assunto'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
};

export function EditTicketDialog({ open, onOpenChange, ticket }: Props) {
  const { update, remove } = useTicketsStore();
  const lastTicketIdRef = useRef<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client: '',
      email: '',
      priority: 'Média',
      status: 'Aberto',
      responsible: '',
      subject: '',
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
      setIsDeleting(false);
      lastTicketIdRef.current = null;
      form.reset({
        client: '',
        email: '',
        priority: 'Média',
        status: 'Aberto',
        responsible: '',
        subject: '',
      });
      return;
    }

    if (!ticket) return;
    if (ticket.id === lastTicketIdRef.current) return;

    lastTicketIdRef.current = ticket.id;

    form.reset({
      client: ticket.client ?? '',
      email: ticket.email ?? '',
      priority: ticket.priority ?? 'Média',
      status: ticket.status ?? 'Aberto',
      responsible: ticket.responsible ?? '',
      subject: ticket.subject ?? '',
    });
  }, [open, ticket, form]);

  async function onSubmit(values: FormValues) {
    if (!ticket) return;

    try {
      await update(ticket.id, values);
      toast.success('Ticket atualizado com sucesso.');
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao atualizar ticket';
      toast.error(msg);
    }
  }

  async function onConfirmDelete() {
    if (!ticket) return;

    setIsDeleting(true);
    try {
      await remove(ticket.id);
      toast.success('Ticket excluído com sucesso.');
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao excluir ticket';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  const disableActions = form.formState.isSubmitting || isDeleting;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          onOpenChange(o);
          if (!o) setConfirmOpen(false);
        }}
      >
        <DialogContent className="bg-loomi-header border-white/10 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Ticket</DialogTitle>
            <DialogDescription className="text-white/60">
              Atualize os dados do ticket selecionado.
            </DialogDescription>
          </DialogHeader>

          {!ticket ? (
            <div className="text-sm text-white/70">Nenhum ticket selecionado.</div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input {...form.register('client')} />
                  {form.formState.errors.client?.message ? (
                    <p className="text-xs text-red-300">{form.formState.errors.client.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...form.register('email')} />
                  {form.formState.errors.email?.message ? (
                    <p className="text-xs text-red-300">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <select
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                    value={form.watch('priority')}
                    onChange={(e) => form.setValue('priority', e.target.value as TicketPriority)}
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value} className="text-black">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.priority?.message ? (
                    <p className="text-xs text-red-300">{form.formState.errors.priority.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                    value={form.watch('status')}
                    onChange={(e) => form.setValue('status', e.target.value as TicketStatus)}
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value} className="text-black">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.status?.message ? (
                    <p className="text-xs text-red-300">{form.formState.errors.status.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Responsável</Label>
                  <Input {...form.register('responsible')} />
                  {form.formState.errors.responsible?.message ? (
                    <p className="text-xs text-red-300">
                      {form.formState.errors.responsible.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Assunto</Label>
                  <textarea
                    className="min-h-[96px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                    {...form.register('subject')}
                  />
                  {form.formState.errors.subject?.message ? (
                    <p className="text-xs text-red-300">{form.formState.errors.subject.message}</p>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={disableActions}
                  className={[
                    'cursor-pointer',
                    'border-blue-100 bg-blue-50 text-slate-900 hover:bg-blue-100 hover:text-slate-900',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  ].join(' ')}
                >
                  Cancelar
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmOpen(true)}
                    disabled={disableActions}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    Excluir
                  </Button>

                  <Button
                    type="submit"
                    variant="blueloomi"
                    disabled={disableActions}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    Salvar
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-loomi-header border-white/10 text-white sm:max-w-lg">
          <AlertHeader>
            <AlertTitle>Excluir Ticket</AlertTitle>
            <AlertDescription className="text-white/60">
              Esta ação é permanente. Confirme para excluir o ticket.
            </AlertDescription>
          </AlertHeader>

          <div className="space-y-2">
            <Label>ID</Label>
            <Input
              readOnly
              value={ticket ? ticketRef(ticket.id) : ''}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
          </div>

          <AlertFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                disabled={isDeleting}
                className={[
                  'cursor-pointer',
                  'border-blue-100 bg-blue-50 text-slate-900 hover:bg-blue-100 hover:text-slate-900',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                ].join(' ')}
              >
                Voltar
              </Button>
            </AlertDialogCancel>

            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="cursor-pointer disabled:cursor-not-allowed"
              >
                Confirmar exclusão
              </Button>
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
