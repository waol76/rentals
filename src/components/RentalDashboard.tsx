'use client';

import React, { useEffect, useState } from 'react';
import { MonthName, monthNameToNumber } from '@/utils/dateUtils';
import DashboardView from '@/components/DashboardView';
import AnalyticsView from '@/components/AnalyticsView';

interface RentalData {
  month: MonthName;
  year: number;
  gross: number | string;
  net: number | string;
  nights: number | string;
}

interface ValueObject {
  value: number;
}

interface DateRow {
  month: MonthName;
  year: number;
}

interface RentalData extends DateRow {
  gross: number | string;
  net: number | string;
  nights: number | string;
}

interface DataStructure {
  [key: string]: RentalData[];
}

// Helper function to get date from row
const getDateFromRow = (row: RentalData): Date => {
  const monthNum = monthNameToNumber(row.month);
  const date = new Date(Number(row.year), monthNum - 1, 1);
  return date;
};

const RentalDashboard = () => {
  const [data, setData] = useState<DataStructure | null>(null);
  const [platformData, setPlatformData] = useState<Record<string, Record<string, any>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('both');
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheets');
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
        const result = await response.json();
        setData(result.data);
        setPlatformData(result.platformData || null);
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
      .map(row => Number(row.year))
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

  const calculateKPIs = () => {
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
        .filter(row => String(row?.year) === String(Number(selectedYear) - 1));
      
      trends = calculateTrends(processedData, previousYearData);
      trendPeriod = `vs ${Number(selectedYear) - 1}`;
    } else {
      // For all-time view, compare last 6 months vs previous 6 months
      // First sort the data by date while maintaining apartment filter
      const allData = Object.values(filteredByApartment).flat().sort((a, b) => {
        const dateA = getDateFromRow(a);
        const dateB = getDateFromRow(b);
        return Number(dateB) - Number(dateA);
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

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'dashboard' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'analytics' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Advanced Analytics
        </button>
      </div>

      {/* Content based on selected tab */}
      {activeTab === 'dashboard' ? (
        <DashboardView
          data={filteredData}
          kpis={kpis}
          selectedYear={selectedYear}
          trendPeriod={kpis.trendPeriod}
          platformData={platformData}
        />
      ) : (
        <AnalyticsView data={filteredData} />
      )}
    </div>
  );
};

export default RentalDashboard;