'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';
import { useTicketsStore } from '@/features/tickets/store';
import type { Ticket, TicketPriority, TicketStatus } from '../model/tickets.types';
import { ticketRef } from '@/features/tickets/model/ticket-ref';
import { ResponsibleFilter } from './responsible-filter';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PencilLine, ChevronRight } from 'lucide-react';
import MessageTimeIcon from '@/components/icons/message-time-icon';
import { TicketDetailsDialog } from './ticket-details-dialog';
import { EditTicketDialog } from './edit-ticket-dialog';
import TicketOpenIcont from '@/components/icons/ticket-open-icon';
import CheckTodayIcon from '@/components/icons/check-today-icon';
import MediumTimeIcon from '@/components/icons/medium-time-icon';

type StatusFilter = TicketStatus | 'all';
type PriorityFilter = TicketPriority | 'all';
type PageItem = number | 'ellipsis';

function parseStatusFilter(value: string): StatusFilter {
  if (value === 'Aberto' || value === 'Em andamento' || value === 'Fechado') return value;
  return 'all';
}

function parsePriorityFilter(value: string): PriorityFilter {
  if (value === 'Urgente' || value === 'Alta' || value === 'Média' || value === 'Baixa')
    return value;
  return 'all';
}

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const siblings = 1;
  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);
  const items: PageItem[] = [1];
  if (left > 2) items.push('ellipsis');
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}

function priorityBadgeClass(p: string) {
  if (p === 'Urgente') return 'bg-red-500/90 text-white hover:bg-red-500/90';
  if (p === 'Alta') return 'bg-orange-400/90 text-slate-900 hover:bg-orange-400/90';
  if (p === 'Média') return 'bg-sky-200/90 text-slate-900 hover:bg-sky-200/90';
  if (p === 'Baixa') return 'bg-slate-100/90 text-slate-900 hover:bg-slate-100/90';
  return 'bg-white/10 text-white hover:bg-white/10';
}

function statusBadgeClass(s: string) {
  if (s === 'Aberto') return 'bg-cyan-400/90 text-slate-900 hover:bg-cyan-400/90';
  if (s === 'Em andamento') return 'bg-yellow-400/90 text-slate-900 hover:bg-yellow-400/90';
  if (s === 'Fechado') return 'bg-emerald-400/90 text-slate-900 hover:bg-emerald-400/90';
  return 'bg-white/10 text-white hover:bg-white/10';
}

function StatCard(props: { title: string; value: number | string; icon?: ReactNode }) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.25)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="pr-20">
        <div className="text-sm text-white/60">{props.title}</div>
        <div className="mt-3 text-4xl font-semibold tracking-tight text-white">{props.value}</div>
      </div>
      {props.icon ? (
        <div className="absolute top-6 right-6 opacity-90 md:top-auto md:bottom-6">
          {props.icon}
        </div>
      ) : null}
    </div>
  );
}

export function TicketsPage() {
  const t = useTranslations('Tickets');
  const locale = useLocale();
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
    stats,
    isLoadingStats,
    statsError,
    responsibles,
    page,
    pageSize,
    filters,
    setPage,
    setFilters,
    fetch,
    fetchStats,
  } = useTicketsStore();

  useEffect(() => {
    fetch();
    fetchStats();
  }, [
    fetch,
    fetchStats,
    page,
    pageSize,
    filters.q,
    filters.status,
    filters.priority,
    filters.responsible,
  ]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (statsError) toast.error(statsError);
  }, [statsError]);

  const totalPages = data?.totalPages ?? 1;
  const pageItems = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);
  const isPrevDisabled = !data || page <= 1;
  const isNextDisabled = !data || page >= totalPages;
  const openValue = isLoadingStats ? '—' : stats.open;
  const inProgressValue = isLoadingStats ? '—' : stats.inProgress;
  const doneValue = isLoadingStats ? '—' : stats.done;

  function statusLabel(status: TicketStatus) {
    if (status === 'Fechado') return t('status.resolvedLabel');
    if (status === 'Aberto') return t('status.open');
    if (status === 'Em andamento') return t('status.inProgress');
    return status;
  }

  function priorityLabel(priority: TicketPriority) {
    if (priority === 'Baixa') return t('priority.low');
    if (priority === 'Média') return t('priority.medium');
    if (priority === 'Alta') return t('priority.high');
    if (priority === 'Urgente') return t('priority.urgent');
    return priority;
  }

  function openDetails(ticket: Ticket) {
    setSelected(ticket);
    setEditOpen(false);
    setDetailsOpen(true);
  }

  function openEdit(ticket: Ticket) {
    setSelected(ticket);
    setDetailsOpen(false);
    setEditOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title={t('stats.open')} value={openValue} icon={<TicketOpenIcont />} />
        <StatCard
          title={t('stats.inProgress')}
          value={inProgressValue}
          icon={<MessageTimeIcon />}
        />
        <StatCard title={t('stats.resolved')} value={doneValue} icon={<CheckTodayIcon />} />
        <StatCard title={t('stats.avgTime')} value="2.5h" icon={<MediumTimeIcon />} />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.25)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="text-xl font-semibold text-white">{t('listTitle')}</div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <input
              value={filters.q}
              onChange={(e) => setFilters({ q: e.target.value })}
              placeholder={t('filters.searchPlaceholder')}
              className="h-11 w-full rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-4 text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: parseStatusFilter(e.target.value) })}
              className="h-11 rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-4 text-sm text-white outline-none"
            >
              <option value="all">{t('filters.statusAll')}</option>
              <option value="Aberto">{t('status.open')}</option>
              <option value="Em andamento">{t('status.inProgress')}</option>
              <option value="Fechado">{t('status.resolvedLabel')}</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: parsePriorityFilter(e.target.value) })}
              className="h-11 rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] px-4 text-sm text-white outline-none"
            >
              <option value="all">{t('filters.priorityAll')}</option>
              <option value="Urgente">{t('priority.urgent')}</option>
              <option value="Alta">{t('priority.high')}</option>
              <option value="Média">{t('priority.medium')}</option>
              <option value="Baixa">{t('priority.low')}</option>
            </select>

            <ResponsibleFilter
              value={filters.responsible}
              onChange={(val) => setFilters({ responsible: val })}
              responsibles={responsibles}
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs text-white/60">
              <tr>
                <th className="px-4 py-3">{t('table.id')}</th>
                <th className="px-4 py-3">{t('table.priority')}</th>
                <th className="px-4 py-3">{t('table.client')}</th>
                <th className="px-4 py-3">{t('table.subject')}</th>
                <th className="px-4 py-3">{t('table.status')}</th>
                <th className="px-4 py-3">{t('table.createdAt')}</th>
                <th className="px-4 py-3">{t('table.responsible')}</th>
                <th className="px-4 py-3">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-white/60" colSpan={8}>
                    {t('empty.loading')}
                  </td>
                </tr>
              ) : (data?.items ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-white/60" colSpan={8}>
                    {t('empty.notFound')}
                  </td>
                </tr>
              ) : (
                (data?.items ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="px-4 py-4 font-semibold text-white" title={row.id}>
                      {ticketRef(row.id)}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={priorityBadgeClass(String(row.priority))}>
                        {priorityLabel(row.priority)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{row.client}</div>
                      <div className="text-xs text-white/45">{row.email}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-white">{row.subject}</td>
                    <td className="px-4 py-4">
                      <Badge className={statusBadgeClass(String(row.status))}>
                        {statusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-white/70">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString(locale) : '—'}
                    </td>
                    <td className="px-4 py-4 text-white/80">{row.responsible}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-10">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex cursor-pointer items-center gap-3 text-white/70 transition-colors hover:text-white"
                        >
                          <span>{t('actions.edit')}</span>
                          <PencilLine className="h-5 w-5 text-[rgb(var(--loomi-primary-rgb))]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetails(row)}
                          className="inline-flex cursor-pointer items-center gap-3 text-white/70 transition-colors hover:text-white"
                        >
                          <span>{t('actions.view')}</span>
                          <ChevronRight className="h-6 w-6 text-[rgb(var(--loomi-primary-rgb))]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-sm text-white/60">{t('pagination.showing', { pageSize })}</div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={isPrevDisabled}
                  tabIndex={isPrevDisabled ? -1 : 0}
                  className={isPrevDisabled ? 'pointer-events-none opacity-50' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isPrevDisabled) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {pageItems.map((p, idx) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`e-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={isNextDisabled}
                  tabIndex={isNextDisabled ? -1 : 0}
                  className={isNextDisabled ? 'pointer-events-none opacity-50' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isNextDisabled) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <TicketDetailsDialog
        open={detailsOpen}
        onOpenChange={(o) => {
          setDetailsOpen(o);
          if (!o) setSelected(null);
        }}
        ticket={selected}
        onEdit={(row) => openEdit(row)}
      />

      <EditTicketDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setSelected(null);
        }}
        ticket={selected}
      />
    </div>
  );
}
