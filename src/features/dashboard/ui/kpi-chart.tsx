'use client';

import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type SeriesPoint = { label: string; value: number };

export function KpiChart({ status, series }: { status: string; series: SeriesPoint[] }) {
  if (status === 'loading')
    return <div className="h-56 w-full animate-pulse rounded-xl bg-white/5" />;

  if (!series?.length) return <div className="h-56 w-full rounded-xl bg-white/3" />;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      foreColor: 'rgba(255,255,255,0.55)',
    },
    grid: { borderColor: 'rgba(255,255,255,0.08)', strokeDashArray: 6 },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: series.map((p) => p.label) },
    yaxis: { labels: { formatter: (v) => String(Math.round(v)) } },
    tooltip: { theme: 'dark' },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0.5, opacityFrom: 0.55, opacityTo: 0.05 },
    },
  };

  const data = [{ name: 'value', data: series.map((p) => p.value) }];

  return <ApexChart options={options} series={data} type="area" height={240} />;
}
