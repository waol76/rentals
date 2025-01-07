'use client';

import { Euro, Bed, TrendingUp, BarChart } from 'lucide-react';
import type { Icon as IconType } from 'lucide-react';


const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value);

const SummaryCard = ({ title, value, change, icon: Icon }: {
  title: string;
  value: string;
  change?: number;
  icon: IconType; // Add this line back
}) => (
  <div className="bg-white rounded-lg shadow p-4 border">
    <div className="flex justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-gray-400">
        <Icon size={24} />
      </div>
    </div>
    {change !== undefined && (
      <div className={`mt-2 text-sm ${Number(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {Number(change) > 0 ? '↑' : '↓'} {Math.abs(Number(change))}%
      </div>
    )}
  </div>
);

const SummaryCards = ({ data, apartment }) => {
  const calcMetrics = () => {
    if (!data || !data.length) return null;
    
    const currentYear = new Date().getFullYear();
    const currentData = apartment === 'Both' 
      ? data.filter(d => d.lovelyData?.year === currentYear)
      : data.filter(d => d.year === currentYear);

    const lastYearData = apartment === 'Both'
      ? data.filter(d => d.lovelyData?.year === currentYear - 1)
      : data.filter(d => d.year === currentYear - 1);

    const ytdRevenue = currentData.reduce((sum, entry) => 
      sum + (apartment === 'Both' 
        ? ((entry.lovelyData?.gross || 0) + (entry.relaxingData?.gross || 0))
        : entry.gross), 0);

    const lastYearRevenue = lastYearData.reduce((sum, entry) =>
      sum + (apartment === 'Both'
        ? ((entry.lovelyData?.gross || 0) + (entry.relaxingData?.gross || 0))
        : entry.gross), 0);

    const avgOccupancy = currentData.reduce((sum, entry) =>
      sum + (apartment === 'Both'
        ? (((entry.lovelyData?.occupancy || 0) + (entry.relaxingData?.occupancy || 0)) / 2)
        : entry.occupancy), 0) / (currentData.length || 1);

    const revenueChange = lastYearRevenue 
      ? ((ytdRevenue - lastYearRevenue) / lastYearRevenue) * 100 
      : 0;

    const totalNights = currentData.reduce((sum, entry) =>
      sum + (apartment === 'Both'
        ? ((entry.lovelyData?.nights || 0) + (entry.relaxingData?.nights || 0))
        : entry.nights), 0);

    const totalPossibleNights = currentData.length * 30 * (apartment === 'Both' ? 2 : 1);
    const revpar = ytdRevenue / totalPossibleNights;

    return {
      ytdRevenue,
      revenueChange,
      avgOccupancy,
      revpar
    };
  };

  const metrics = calcMetrics();
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <SummaryCard
        title="YTD Revenue"
        value={formatCurrency(metrics.ytdRevenue)}
        change={metrics.revenueChange.toFixed(1)}
        icon={Euro}
      />
      <SummaryCard
        title="Average Occupancy"
        value={`${metrics.avgOccupancy.toFixed(1)}%`}
        icon={Bed}
      />
      <SummaryCard
        title="RevPAR"
        value={formatCurrency(metrics.revpar)}
        icon={TrendingUp}
      />
      <SummaryCard
        title="YoY Growth"
        value={`${metrics.revenueChange.toFixed(1)}%`}
        icon={BarChart}
      />
    </div>
  );
};

export default SummaryCards;
