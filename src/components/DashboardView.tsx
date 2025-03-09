// DashboardView.tsx
import React from 'react';
import { Calendar, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { StatsCard } from './StatsCard';
import ApartmentComparisonWidgets from './ApartmentComparisonWidgets';
import GrossNetIncomeWidget from './GrossNetIncomeWidget';
import ExpenseBreakdownWidget from './ExpenseBreakdownWidget';

interface DashboardViewProps {
  data: any;
  kpis: any;
  selectedYear: 'all' | number;
  trendPeriod: string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  data, 
  kpis, 
  selectedYear,
  trendPeriod
}) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={DollarSign}
          title="Total Revenue"
          value={`€${Math.round(kpis.totalGross).toLocaleString()}`}
          secondaryValue={`€${Math.round(kpis.netIncome).toLocaleString()}`}
          trend={kpis.trends.revenue.toFixed(1)}
          period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
          info={`Shows revenue trends ${trendPeriod}. Total revenue includes all bookings and additional services, with net income calculated after expenses and fees.`}
        />
        <StatsCard
          icon={Calendar}
          title="Total Nights"
          value={kpis.totalNights.toLocaleString()}
          subtitle="Nights booked"
          trend={kpis.trends.nights.toFixed(1)}
          period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
          info={`Shows booking trends ${trendPeriod}. Represents total nights booked for the selected properties.`}
        />
        <StatsCard
          icon={Percent}
          title="Occupancy Rate"
          value={`${Math.round(kpis.occupancyRate)}%`}
          subtitle="Average occupancy"
          trend={kpis.trends.occupancy.toFixed(1)}
          period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
          info={`Shows occupancy trends ${trendPeriod}. Calculated as percentage of available nights that were booked.`}
        />
        <StatsCard
          icon={TrendingUp}
          title="Avg. Nightly Rate"
          value={`€${Math.round(kpis.avgNightlyRate)}`}
          subtitle="Per night average"
          trend={kpis.trends.nightly.toFixed(1)}
          period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
          info={`Shows pricing trends ${trendPeriod}. Represents average revenue earned per booked night.`}
        />
      </div>
      
      {/* Apartment comparison */}
      <ApartmentComparisonWidgets data={data} />
      
      {/* Income and expense widgets */}
      <div className="space-y-6">
        <GrossNetIncomeWidget data={data} />
        <ExpenseBreakdownWidget data={data} />
      </div>
    </div>
  );
};

export default DashboardView;
