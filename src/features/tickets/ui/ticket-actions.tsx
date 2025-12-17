'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import type { Ticket } from '../model/tickets.types';
import { Button } from '@/components/ui/button';
import { TicketDetailsDialog } from './ticket-details-dialog';
import { EditTicketDialog } from './edit-ticket-dialog';

type Props = {
  ticket: Ticket;
};

export function TicketActions({ ticket }: Props) {
  const t = useTranslations('Tickets');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-white/70 hover:text-white"
          onClick={() => setEditOpen(true)}
        >
          {t('actions.edit')}
        </Button>

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-white/70 hover:text-white"
          onClick={() => setDetailsOpen(true)}
        >
          {t('actions.view')}
        </Button>
      </div>

      <TicketDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        ticket={ticket}
        onEdit={() => {
          setDetailsOpen(false);
          setEditOpen(true);
        }}
      />

      <EditTicketDialog open={editOpen} onOpenChange={setEditOpen} ticket={ticket} />
    </>
  );
}
