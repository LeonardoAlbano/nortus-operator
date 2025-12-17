'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import type { Ticket } from '../model/tickets.types';
import { useTicketsStore } from '@/features/tickets/store';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
  onDeleted: () => void;
};

export function DeleteTicketDialog({ open, onOpenChange, ticket, onDeleted }: Props) {
  const t = useTranslations('Tickets');
  const remove = useTicketsStore((s) => s.remove);
  const [isPending, startTransition] = useTransition();

  const ticketId = ticket?.id;

  function confirm() {
    if (!ticketId) return;

    startTransition(async () => {
      try {
        await remove(ticketId);
        toast.success(t('toast.deleteSuccess'));
        onOpenChange(false);
        onDeleted();
      } catch (e) {
        const msg = e instanceof Error ? e.message : t('toast.deleteError');
        toast.error(msg);
      }
    });
  }

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-loomi-header border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('dialogs.deleteTitle')}</DialogTitle>
          <DialogDescription className="text-white/60">
            {t('dialogs.deleteDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <div className="text-white/60">{t('dialogs.fields.id')}</div>
          <div className="mt-1 font-medium text-white">{ticket.id}</div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-transparent text-white"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('actions.cancel')}
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl px-6"
            onClick={confirm}
            disabled={isPending}
          >
            {isPending ? t('actions.deleting') : t('actions.confirmDelete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
