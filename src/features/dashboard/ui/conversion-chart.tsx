'use client';

import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

type BarPoint = { label: string; value: number };

export function ConversionChart({ status, bars }: { status: string; bars: BarPoint[] }) {
  if (status === 'loading')
    return <div className="h-56 w-full animate-pulse rounded-xl bg-white/5" />;

  if (!bars?.length) return <div className="h-56 w-full rounded-xl bg-white/3" />;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      foreColor: 'rgba(255,255,255,0.55)',
    },
    grid: { borderColor: 'rgba(255,255,255,0.08)', strokeDashArray: 6 },
    plotOptions: { bar: { borderRadius: 10, columnWidth: '45%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: bars.map((p) => p.label) },
    tooltip: { theme: 'dark' },
  };

  const series = [{ name: 'conversion', data: bars.map((p) => p.value) }];

  return <ApexChart options={options} series={series} type="bar" height={240} />;
}
