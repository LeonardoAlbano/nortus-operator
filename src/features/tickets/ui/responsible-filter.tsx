'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChange: (value: string) => void;
  responsibles: string[];
};

function normalizeText(v: string) {
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function ResponsibleFilter({ value, onChange, responsibles }: Props) {
  const t = useTranslations('Tickets');
  const [open, setOpen] = React.useState(false);

  const items = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of responsibles) {
      const v = r?.trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [responsibles]);

  const selectedLabel = value === 'all' ? t('filters.responsibleAll') : value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-[240px] cursor-pointer justify-between rounded-full border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white hover:bg-white/10"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="bg-loomi-header w-[240px] border-white/10 p-0 text-white">
        <Command
          className="bg-loomi-header text-white"
          filter={(itemValue, search) => {
            const v = normalizeText(itemValue);
            const s = normalizeText(search);
            if (!s) return 1;
            return v.includes(s) ? 1 : 0;
          }}
        >
          <CommandInput
            placeholder={t('filters.responsibleSearchPlaceholder')}
            className="text-white placeholder:text-white/45"
          />

          <CommandList className="max-h-64">
            <CommandEmpty>{t('filters.responsibleEmpty')}</CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange('all');
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn('mr-2 h-4 w-4', value === 'all' ? 'opacity-100' : 'opacity-0')}
                />
                {t('filters.responsibleAll')}
              </CommandItem>

              {items.map((r) => (
                <CommandItem
                  key={r}
                  value={r}
                  onSelect={() => {
                    onChange(r);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === r ? 'opacity-100' : 'opacity-0')}
                  />
                  {r}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
