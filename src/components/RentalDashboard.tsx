'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Info, 
  TrendingDown 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

import GrossNetIncomeWidget from '@/components/GrossNetIncomeWidget';
import ExpenseBreakdownWidget from '@/components/ExpenseBreakdownWidget';
import IncomeExpenseTable from '@/components/IncomeExpenseTable';
import ApartmentComparisonWidgets from '@/components/ApartmentComparisonWidgets';

type MonthName = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 
                 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

interface RentalData {
  month: MonthName;
  year: number;  // Changed from string to number
  gross: number | string;
  net: number | string;
  nights: number | string;
}

interface ValueObject {
  value: number;
}

interface DateRow {
  month: MonthName;
  year: number;  // Changed from string to number
}

interface RentalData extends DateRow {
  gross: number | string;
  net: number | string;
  nights: number | string;
}

interface DataStructure {
  [key: string]: RentalData[];
}

interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  secondaryValue?: string;
  trend?: string;
  period?: string;
  info?: string;
}


// Helper function to convert month name to number (moved outside components for reuse)
const monthNameToNumber = (monthName: MonthName): number => {
  const months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  } as const;
  return months[monthName];
};

// Helper function to get date from row
const getDateFromRow = (row: RentalData): Date => {
  const monthNum = monthNameToNumber(row.month);
  const date = new Date(Number(row.year), monthNum - 1, 1);
  return date;
};

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, subtitle, secondaryValue, trend, period = 'This period', info }) => {
  const trendValue = trend ? parseFloat(trend) : 0;
  
  return (
    <Card className="bg-white">
      <CardContent className="p-4 h-full">
        <div className="flex gap-3 items-center min-h-[120px]">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-gray-600">{title}</p>
              {info && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-semibold">{value}</h3>
              {trend && (
                <div className={`flex items-center text-sm ${
                  trendValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue >= 0 ? 
                    <TrendingUp className="w-4 h-4" /> : 
                    <TrendingDown className="w-4 h-4" />
                  }
                  <span>{Math.abs(trendValue)}%</span>
                </div>
              )}
            </div>
            
            {secondaryValue ? (
              <>
                <p className="text-sm text-gray-400">Gross income</p>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-base text-green-600">{secondaryValue}</p>
                  <p className="text-sm text-gray-400">Net income</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
            
            <p className="text-xs text-gray-400 mt-auto">{period}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RentalDashboard = () => {
  const [data, setData] = useState<DataStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('both');
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheets');
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
        const { data } = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from Google Sheets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-6 text-center">No data available</div>;
const availableYears = [...new Set(
  Object.values(data as DataStructure)
    .flat()
    .map(row => Number(row.year))  // Convert to number explicitly
    .filter(Boolean)
)].sort();

  const filteredByApartment: DataStructure = viewMode === 'both'
  ? data
  : {
      [`Nuno Gomez Piano ${viewMode === 'Lovely' ? 'uno - Lovely' : 'terra - Relaxing'}`]: 
        data?.[`Nuno Gomez Piano ${viewMode === 'Lovely' ? 'uno - Lovely' : 'terra - Relaxing'}`] || []
    };

const filteredData: DataStructure = selectedYear === 'all' 
  ? filteredByApartment
  : {
      ...filteredByApartment,
      ...Object.fromEntries(
        Object.entries(filteredByApartment).map(([key, rows]) => [
          key,
          rows.filter((row: RentalData) => Number(row.year) === Number(selectedYear))
        ])
      )
    };

  const processedData: RentalData[] = Object.values(filteredData).flat().filter((row): row is RentalData => row && typeof row === 'object');

  const calculateOccupancy = (data: RentalData[]) => {
    if (!data.length) return 0;

    // Get unique year-month combinations
    const uniqueMonths = [...new Set(data.map(row => {
      const monthNum = monthNameToNumber(row.month);
      const year = Number(row.year);
      
      if (!monthNum || isNaN(year)) {
        return null;
      }
      return `${year}-${String(monthNum).padStart(2, '0')}`;
    }))].filter(Boolean);

    // Calculate total available days
    const totalAvailableDays = uniqueMonths.reduce((total, monthKey) => {
  if (!monthKey) return total;  // Skip if monthKey is null
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const multiplier = viewMode === 'both' ? 2 : 1;
  return total + (daysInMonth * multiplier);
}, 0);

    // Calculate total nights booked
    const totalNightsBooked = data.reduce((sum, row) => sum + (Number(row.nights) || 0), 0);

    return totalAvailableDays > 0 ? (totalNightsBooked / totalAvailableDays) * 100 : 0;
  };

  const calculateTrends = (currentData: RentalData[], previousData: RentalData[]) => {
    const calculatePeriodMetrics = (data: RentalData[]) => {
      if (!data.length) return null;
      
      return {
        revenue: data.reduce((sum, row) => sum + (Number(row.gross) || 0), 0),
        nights: data.reduce((sum, row) => sum + (Number(row.nights) || 0), 0),
        netIncome: data.reduce((sum, row) => sum + (Number(row.net) || 0), 0),
        occupancy: calculateOccupancy(data)
      };
    };

    const calculatePercentChange = (current: ValueObject, previous: ValueObject) => {
      if (!current || !previous || previous.value === 0) return 0;
      return ((current.value - previous.value) / previous.value) * 100;
    };

    const current = calculatePeriodMetrics(currentData);
    const previous = calculatePeriodMetrics(previousData);

    if (!current || !previous) return {
      revenue: 0,
      nights: 0,
      occupancy: 0,
      nightly: 0,
      netIncome: 0
    };

    return {
      revenue: calculatePercentChange(
        { value: current.revenue },
        { value: previous.revenue }
      ),
      nights: calculatePercentChange(
        { value: current.nights },
        { value: previous.nights }
      ),
      occupancy: calculatePercentChange(
        { value: current.occupancy },
        { value: previous.occupancy }
      ),
      nightly: current.nights && previous.nights ? 
        calculatePercentChange(
          { value: current.revenue / current.nights },
          { value: previous.revenue / previous.nights }
        ) : 0,
      netIncome: calculatePercentChange(
        { value: current.netIncome },
        { value: previous.netIncome }
      )
    };
  };

  const calculateKPIs = (): {
  totalGross: number;
  occupancyRate: number;
  avgNightlyRate: number;
  totalNights: number;
  netIncome: number;
  trends: {
    revenue: number;
    nights: number;
    occupancy: number;
    nightly: number;
    netIncome: number;
  };
  trendPeriod: string;
} => {
    const totalGross = processedData.reduce((sum, row) => sum + (Number(row.gross) || 0), 0);
    const totalNights = processedData.reduce((sum, row) => sum + (Number(row.nights) || 0), 0);
    const occupancyRate = calculateOccupancy(processedData);
    const avgNightlyRate = totalNights > 0 ? totalGross / totalNights : 0;
    const netIncome = processedData.reduce((sum, row) => sum + (Number(row.net) || 0), 0);

    let trends = { revenue: 0, nights: 0, occupancy: 0, nightly: 0, netIncome: 0 };
    let trendPeriod = '';

    if (selectedYear !== 'all') {
      // Get previous year data maintaining the same apartment filter
      const previousYearData = Object.values(filteredByApartment)
        .flat()
        .filter(row => row?.year === Number(selectedYear) - 1);
      
      trends = calculateTrends(processedData, previousYearData);
      trendPeriod = `vs ${Number(selectedYear) - 1}`;
    } else {
      // For all-time view, compare last 6 months vs previous 6 months
      // First sort the data by date while maintaining apartment filter
const allData = Object.values(filteredByApartment).flat().sort((a, b) => {
  const dateA = getDateFromRow(a);
  const dateB = getDateFromRow(b);
  return Number(dateB) - Number(dateA); // Explicitly convert to numbers
});

      const last6Months = allData.slice(0, 6);
      const previous6Months = allData.slice(6, 12);

      trends = calculateTrends(last6Months, previous6Months);
      trendPeriod = 'Last 6 months vs previous 6 months';
    }
    
    return { 
      totalGross, 
      occupancyRate, 
      avgNightlyRate, 
      totalNights, 
      netIncome, 
      trends,
      trendPeriod 
    };
  };

  const kpis = calculateKPIs();

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Rental Analytics Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('both')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'both' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Both Apartments
            </button>
            <button
              onClick={() => setViewMode('Lovely')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'Lovely' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Lovely
            </button>
            <button
              onClick={() => setViewMode('Relaxing')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'Relaxing' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Relaxing
            </button>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-4 py-2 rounded-lg border bg-white"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <StatsCard
    icon={DollarSign}
    title="Total Revenue"
    value={`€${Math.round(kpis.totalGross).toLocaleString()}`}
    secondaryValue={`€${Math.round(kpis.netIncome).toLocaleString()}`}
    trend={kpis.trends.revenue.toFixed(1)}
    period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
    info={`Shows revenue trends ${kpis.trendPeriod}. Total revenue includes all bookings and additional services, with net income calculated after expenses and fees.`}
  />
  <StatsCard
    icon={Calendar}
    title="Total Nights"
    value={kpis.totalNights.toLocaleString()}
    subtitle="Nights booked"
    trend={kpis.trends.nights.toFixed(1)}
    period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
    info={`Shows booking trends ${kpis.trendPeriod}. Represents total nights booked for the selected properties.`}
  />
  <StatsCard
    icon={Percent}
    title="Occupancy Rate"
    value={`${Math.round(kpis.occupancyRate)}%`}
    subtitle="Average occupancy"
    trend={kpis.trends.occupancy.toFixed(1)}
    period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
    info={`Shows occupancy trends ${kpis.trendPeriod}. Calculated as percentage of available nights that were booked.`}
  />
  <StatsCard
    icon={TrendingUp}
    title="Avg. Nightly Rate"
    value={`€${Math.round(kpis.avgNightlyRate)}`}
    subtitle="Per night average"
    trend={kpis.trends.nightly.toFixed(1)}
    period={selectedYear === 'all' ? 'All time' : String(selectedYear)}
    info={`Shows pricing trends ${kpis.trendPeriod}. Represents average revenue earned per booked night.`}
  />
</div>
      <ApartmentComparisonWidgets data={filteredData} />
      <div className="space-y-6">
        <GrossNetIncomeWidget data={filteredData} />
        <ExpenseBreakdownWidget data={filteredData} />
        <IncomeExpenseTable />
      </div>
    </div>
  );
};

export default RentalDashboard;