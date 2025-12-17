'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardStore, type KpiKey } from '@/features/dashboard/store';
import { KpiChart } from '@/features/dashboard/ui/kpi-chart';
import { ConversionChart } from '@/features/dashboard/ui/conversion-chart';
import { CustomersMap } from '@/features/dashboard/ui/customers-map';

export function DashboardScreen() {
  const t = useTranslations('Dashboard');

  const {
    status,
    errorMessage,
    selectedKpi,
    setSelectedKpi,
    fetchAll,
    kpis,
    conversionBars,
    locations,
    mapCenter,
    mapZoom,
  } = useDashboardStore();

  const kpiTabs = useMemo<Array<{ key: KpiKey; label: string }>>(
    () => [
      { key: 'retention', label: t('kpi.tabs.retention') },
      { key: 'conversion', label: t('kpi.tabs.conversion') },
      { key: 'churn', label: t('kpi.tabs.churn') },
      { key: 'arpu', label: t('kpi.tabs.arpu') },
    ],
    [t],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const cardBase =
    'border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.25)] text-white shadow-[0_5px_100px_rgba(0,0,0,0.35)]';

  return (
    <div className="space-y-6 text-white">
      {(status === 'error' || status === 'unauthorized') && (
        <Card className="glass-card border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.35)] text-white">
          <CardContent className="py-5">
            <div className="text-sm text-white/80">{errorMessage}</div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card className={cn('glass-card', cardBase)}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{t('kpi.title')}</h2>

              <div className="flex items-center gap-2 rounded-full p-1">
                {kpiTabs.map((tab) => {
                  const isActive = selectedKpi === tab.key;

                  return (
                    <Button
                      key={tab.key}
                      size="sm"
                      variant={isActive ? 'loomiPillActive' : 'loomiPillIdle'}
                      className={cn(
                        'h-9 cursor-pointer rounded-full px-4 text-sm transition-all duration-200',
                        !isActive &&
                          'hover:bg-[rgb(var(--loomi-accent-rgb)/0.14)] hover:shadow-(--loomi-shadow-accent-soft)',
                      )}
                      onClick={() => setSelectedKpi(tab.key)}
                      type="button"
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <KpiChart status={status} series={kpis[selectedKpi]} />
            </div>
          </CardContent>
        </Card>

        <Card className={cardBase}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('conversion.title')}</h2>
              <span className="text-white/40">{t('common.chevron')}</span>
            </div>

            <div className="mt-5">
              <ConversionChart status={status} bars={conversionBars} />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className={cardBase}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{t('map.title')}</h2>

            <div className="flex items-center gap-3">
              <Button
                variant="loomibtn"
                className="rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.65)]"
                type="button"
              >
                {t('map.allPlaces')}
              </Button>

              <Button
                variant="loomibtn"
                className="rounded-full border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.65)]"
                type="button"
              >
                {t('map.allTypes')}
              </Button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
            <CustomersMap status={status} points={locations} center={mapCenter} zoom={mapZoom} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
