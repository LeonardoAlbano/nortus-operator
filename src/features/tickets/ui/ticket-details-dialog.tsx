'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Ticket } from '../model/tickets.types';
import { ticketRef } from '@/features/tickets/model/ticket-ref';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onEdit?: (ticket: Ticket) => void;
};

const outlineBlueClass =
  'cursor-pointer bg-blue-50 text-slate-900 border-blue-100 hover:bg-blue-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60';

export function TicketDetailsDialog({ open, onOpenChange, ticket, onEdit }: Props) {
  const t = useTranslations('Tickets');

  function statusLabel(status: Ticket['status']) {
    if (status === 'Fechado') return t('status.resolvedLabel');
    if (status === 'Aberto') return t('status.open');
    if (status === 'Em andamento') return t('status.inProgress');
    return status;
  }

  function priorityLabel(priority: Ticket['priority']) {
    if (priority === 'Baixa') return t('priority.low');
    if (priority === 'Média') return t('priority.medium');
    if (priority === 'Alta') return t('priority.high');
    if (priority === 'Urgente') return t('priority.urgent');
    return priority;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-loomi-header border-white/10 text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('dialogs.detailsTitle')}</DialogTitle>
          <DialogDescription className="text-white/60">
            {t('dialogs.detailsDescription')}
          </DialogDescription>
        </DialogHeader>

        {!ticket ? (
          <div className="text-sm text-white/70">{t('empty.noneSelected')}</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-white/60">{t('dialogs.fields.id')}</div>
              <div className="mt-1 font-semibold text-white" title={ticket.id}>
                {ticketRef(ticket.id)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60">{t('dialogs.fields.client')}</div>
                <div className="mt-1 font-medium text-white">{ticket.client}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60">{t('dialogs.fields.email')}</div>
                <div className="mt-1 font-medium text-white">{ticket.email}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60">{t('dialogs.fields.priority')}</div>
                <div className="mt-1 font-medium text-white">{priorityLabel(ticket.priority)}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/60">{t('dialogs.fields.status')}</div>
                <div className="mt-1 font-medium text-white">{statusLabel(ticket.status)}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                <div className="text-white/60">{t('dialogs.fields.responsible')}</div>
                <div className="mt-1 font-medium text-white">{ticket.responsible}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                <div className="text-white/60">{t('dialogs.fields.subject')}</div>
                <div className="mt-1 font-medium text-white">{ticket.subject}</div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={outlineBlueClass}
          >
            {t('actions.close')}
          </Button>

          {ticket && onEdit ? (
            <Button variant="blueloomi" onClick={() => onEdit(ticket)} className="cursor-pointer">
              {t('actions.edit')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
