'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type PlanKey = 'basic' | 'mid' | 'premium';

type Coverage = {
  key: string;
  labelKey: string;
  price: number;
};

type Plan = {
  key: PlanKey;
  labelKey: string;
  price: number;
  recommended?: boolean;
};

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function SimulatorScreen() {
  const t = useTranslations('Simulator');
  const locale = useLocale();

  const plans = useMemo<Plan[]>(
    () => [
      { key: 'basic', labelKey: 'plans.basic', price: 89.9 },
      { key: 'mid', labelKey: 'plans.mid', price: 145.9 },
      { key: 'premium', labelKey: 'plans.premium', price: 225.9, recommended: true },
    ],
    [],
  );

  const coverages = useMemo<Coverage[]>(
    () => [
      { key: 'theft', labelKey: 'coverages.theft', price: 12.9 },
      { key: 'collision', labelKey: 'coverages.collision', price: 22.9 },
      { key: 'fire', labelKey: 'coverages.fire', price: 8.9 },
      { key: 'natural', labelKey: 'coverages.natural', price: 10.9 },
    ],
    [],
  );

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('mid');
  const [vehicleValue, setVehicleValue] = useState(50000);
  const [age, setAge] = useState(28);

  const [selectedCoverages, setSelectedCoverages] = useState<Record<string, boolean>>({
    theft: true,
    collision: true,
    fire: true,
    natural: false,
  });

  const selectedPlanPrice = useMemo(() => {
    const plan = plans.find((p) => p.key === selectedPlan);
    return plan?.price ?? 0;
  }, [plans, selectedPlan]);

  const coveragePrice = useMemo(() => {
    return coverages.reduce((sum, c) => {
      if (!selectedCoverages[c.key]) return sum;
      return sum + c.price;
    }, 0);
  }, [coverages, selectedCoverages]);

  const riskMultiplier = useMemo(() => {
    const v = clamp(vehicleValue, 10000, 500000);
    const vFactor = 1 + (v - 10000) / (500000 - 10000) / 4;

    const a = clamp(age, 18, 90);
    const ageFactor = a < 25 ? 1.25 : a > 70 ? 1.15 : 1;

    return vFactor * ageFactor;
  }, [vehicleValue, age]);

  const monthly = useMemo(() => {
    const base = selectedPlanPrice + coveragePrice;
    return Math.round(base * riskMultiplier * 100) / 100;
  }, [selectedPlanPrice, coveragePrice, riskMultiplier]);

  const estimateLabel = formatBRL(monthly);

  const surface = 'bg-[rgb(var(--loomi-surface-rgb)/0.25)]';
  const shadow = 'shadow-[0_5px_100px_rgba(0,0,0,0.35)]';

  const planClasses = (active: boolean) =>
    cn(
      'min-w-0 rounded-2xl border p-4 text-left transition hover:border-white/20 hover:bg-[rgb(var(--loomi-surface-rgb)/0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20',
      active
        ? 'border-[#1D6DFF]/70 bg-[#1D6DFF]/10'
        : 'border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)]',
    );

  return (
    <div className="space-y-6 text-white">
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className={cn('min-w-0 rounded-3xl border p-6', 'border-white/10', surface, shadow)}>
          <div className="text-lg font-semibold">{t('plansTitle')}</div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((p) => {
              const active = p.key === selectedPlan;

              return (
                <button
                  key={p.key}
                  type="button"
                  className={planClasses(active)}
                  onClick={() => setSelectedPlan(p.key)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/70">{t(p.labelKey)}</div>
                    {p.recommended ? (
                      <span
                        className="shrink-0 rounded-full border px-3 py-1 text-xs"
                        style={{
                          borderColor: 'rgba(29, 109, 255, 0.25)',
                          backgroundColor: 'rgb(67, 210, 203)',
                          color: 'rgba(214, 229, 255, 0.95)',
                        }}
                      >
                        {t('recommended')}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums">
                    {formatBRL(p.price)}
                  </div>
                  <div className="mt-1 text-xs text-white/40">{t('perMonth')}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="text-sm font-medium text-white/85">
                  {t('vehicleValue.label')}:{' '}
                  <span className="tabular-nums">{formatBRL(vehicleValue)}</span>
                </div>
                <div className="text-xs text-white/40">{t('vehicleValue.range')}</div>
              </div>

              <input
                type="range"
                min={10000}
                max={500000}
                step={1000}
                className="w-full cursor-pointer accent-[#1D6DFF]"
                value={vehicleValue}
                onChange={(e) => setVehicleValue(Number(e.target.value))}
              />

              <div className="flex justify-between text-xs text-white/40">
                <span>{t('vehicleValue.min')}</span>
                <span>{t('vehicleValue.max')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="text-sm font-medium text-white/85">
                  {t('age.label')}: <span className="tabular-nums">{age}</span>
                </div>
                <div className="text-xs text-white/40">{t('age.hint')}</div>
              </div>

              <input
                type="range"
                min={18}
                max={90}
                step={1}
                className="w-full cursor-pointer accent-[#1D6DFF]"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />

              <div className="flex justify-between text-xs text-white/40">
                <span>18</span>
                <span>90</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-white/85">{t('coveragesTitle')}</div>

              <div className="space-y-3">
                {coverages.map((c) => {
                  const checked = Boolean(selectedCoverages[c.key]);

                  return (
                    <label
                      key={c.key}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)] px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="cursor-pointer accent-[#1D6DFF]"
                          checked={checked}
                          aria-label={t(c.labelKey)}
                          onChange={(e) =>
                            setSelectedCoverages((prev) => ({
                              ...prev,
                              [c.key]: e.target.checked,
                            }))
                          }
                        />
                        <div className="text-sm text-white/85">{t(c.labelKey)}</div>
                      </div>

                      <div className="text-sm text-white/70 tabular-nums">
                        + {formatBRL(c.price)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={cn('rounded-3xl border p-6', 'border-white/10', surface, shadow)}>
          <div className="text-lg font-semibold">{t('summaryTitle')}</div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)] p-4">
              <div className="text-sm text-white/60">{t('estimateTitle')}</div>
              <div className="mt-1 text-2xl font-semibold">
                <span data-testid="estimate" className="tabular-nums">
                  {estimateLabel}
                </span>
              </div>
              <div className="mt-2 text-xs text-white/40">{t('estimateHint')}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)] p-4">
              <div className="text-sm text-white/60">{t('selectedPlanTitle')}</div>
              <div className="mt-1 text-sm font-medium text-white/85">
                {t(`plans.${selectedPlan}`)}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)] p-4">
              <div className="text-sm text-white/60">{t('inputsTitle')}</div>
              <div className="mt-2 space-y-1 text-sm text-white/80">
                <div>
                  {t('vehicleValue.label')}:{' '}
                  <span className="tabular-nums">{formatBRL(vehicleValue)}</span>
                </div>
                <div>
                  {t('age.label')}: <span className="tabular-nums">{age}</span>
                </div>
                <div className="text-xs text-white/40">{new Date().toLocaleDateString(locale)}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgb(var(--loomi-surface-rgb)/0.20)] p-4">
              <div className="text-sm text-white/60">{t('pricingBreakdownTitle')}</div>
              <div className="mt-2 space-y-1 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <span>{t('basePlan')}</span>
                  <span className="tabular-nums">{formatBRL(selectedPlanPrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{t('coverages')}</span>
                  <span className="tabular-nums">{formatBRL(coveragePrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>{t('riskMultiplier')}</span>
                  <span className="tabular-nums">{riskMultiplier.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-white/40">{t('disclaimer')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
