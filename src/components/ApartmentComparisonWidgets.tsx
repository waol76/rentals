import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface ApartmentData {
  'Nuno Gomez Piano uno - Lovely': ApartmentInfo;
  'Nuno Gomez Piano terra - Relaxing': ApartmentInfo;
  [key: string]: ApartmentInfo;
}

interface ApartmentInfo {
  name: string;
  monthlyPerformance: MonthlyPerformance[];
  avgNightlyRate?: number;
  occupancyRate?: number;
  profitMargin?: number;
  revenuePerDay?: number;
}

interface MonthlyStats {
  nights: number;
  revenue: number;
  count: number;
}

interface RowData {
  gross: number | string;
  nights: number | string;
  net: number | string;
  month: string;
}

interface MonthlyPerformance {
  month: string;
  avgNights: number;
  avgRevenue: number;
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

const ApartmentComparisonWidgets = ({ data = {} }: { data: Record<string, RowData[]> }) => {
  const LOVELY_COLOR = "#818cf8";
  const RELAXING_COLOR = "#f472b6";
  
  const [chartType, setChartType] = useState('radar');

  const processData = useCallback(() => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return {
  'Nuno Gomez Piano uno - Lovely': { name: 'Lovely', monthlyPerformance: [] },
  'Nuno Gomez Piano terra - Relaxing': { name: 'Relaxing', monthlyPerformance: [] }
};
    }

    const apartments: ApartmentData = {
      'Nuno Gomez Piano uno - Lovely': { name: 'Lovely', monthlyPerformance: [] },
      'Nuno Gomez Piano terra - Relaxing': { name: 'Relaxing', monthlyPerformance: [] }
    };

    Object.entries(data).forEach(([key, rows = []]) => {
      if (!apartments[key]) return;

      const stats = rows.reduce((acc, row) => {
        if (!row) return acc;

        const gross = Number(row.gross) || 0;
        const nights = Number(row.nights) || 0;
        const net = Number(row.net) || 0;
        const month = row.month;

        acc.totalGross += gross;
        acc.totalNights += nights;
        acc.totalNet += net;
        
        if (month) {
          if (!acc.monthlyStats[month]) {
            acc.monthlyStats[month] = { nights: 0, revenue: 0, count: 0 };
          }
          acc.monthlyStats[month].nights += nights;
          acc.monthlyStats[month].revenue += gross;
          acc.monthlyStats[month].count += 1;
        }
        
        return acc;
      }, { 
        totalGross: 0, 
        totalNights: 0, 
        totalNet: 0,
        monthlyStats: {} as Record<string, MonthlyStats>
      });

      const apt = apartments[key];
      apt.avgNightlyRate = stats.totalNights > 0 ? stats.totalGross / stats.totalNights : 0;
      apt.occupancyRate = rows.length > 0 ? (stats.totalNights / (rows.length * 30)) * 100 : 0;
      apt.profitMargin = stats.totalGross > 0 ? (stats.totalNet / stats.totalGross) * 100 : 0;
      apt.revenuePerDay = rows.length > 0 ? stats.totalGross / (rows.length * 30) : 0;
      
      apt.monthlyPerformance = Object.entries(stats.monthlyStats).map(([month, mStats]) => ({
        month,
        avgNights: mStats.count > 0 ? mStats.nights / mStats.count : 0,
        avgRevenue: mStats.count > 0 ? mStats.revenue / mStats.count : 0
      }));
    });

    return apartments;
  }, [data]);

  const apartmentData = useMemo(() => processData(), [processData]);

// ... previous code ...

  if (Object.keys(apartmentData).length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data available for comparison
      </div>
    );
  }

const comparisonData = [
  {
    metric: 'Occupancy Rate (%)',
    Lovely: (apartmentData['Nuno Gomez Piano uno - Lovely'] as ApartmentInfo)?.occupancyRate ?? 0,
    Relaxing: (apartmentData['Nuno Gomez Piano terra - Relaxing'] as ApartmentInfo)?.occupancyRate ?? 0,
    type: 'percentage'
  },
  {
    metric: 'Profit Margin (%)',
    Lovely: (apartmentData['Nuno Gomez Piano uno - Lovely'] as ApartmentInfo)?.profitMargin ?? 0,
    Relaxing: (apartmentData['Nuno Gomez Piano terra - Relaxing'] as ApartmentInfo)?.profitMargin ?? 0,
    type: 'percentage'
  },
  {
    metric: 'Nightly Rate (€)',
    Lovely: (apartmentData['Nuno Gomez Piano uno - Lovely'] as ApartmentInfo)?.avgNightlyRate ?? 0,
    Relaxing: (apartmentData['Nuno Gomez Piano terra - Relaxing'] as ApartmentInfo)?.avgNightlyRate ?? 0,
    type: 'currency'
  },
  {
    metric: 'Revenue/Day (€)',
    Lovely: (apartmentData['Nuno Gomez Piano uno - Lovely'] as ApartmentInfo)?.revenuePerDay ?? 0,
    Relaxing: (apartmentData['Nuno Gomez Piano terra - Relaxing'] as ApartmentInfo)?.revenuePerDay ?? 0,
    type: 'currency'
  }
];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = comparisonData.find(d => d.metric === label);
    const formatValue = (value: number) => {
      if (data?.type === 'percentage') {
        return `${Math.round(value)}%`;
      }
      return `€${Math.round(value).toLocaleString()}`;
    };

    return (
      <div className="bg-white p-3 border rounded shadow">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const monthlyPerformanceData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(monthNum => {
    const monthName = new Date(2024, monthNum - 1).toLocaleString('default', { month: 'short' });
    return {
      month: monthName,
      'Lovely': apartmentData['Nuno Gomez Piano uno - Lovely']?.monthlyPerformance
        ?.find(m => m?.month && new Date(Date.parse(m.month + " 1, 2024")).getMonth() === monthNum - 1)?.avgRevenue || 0,
      'Relaxing': apartmentData['Nuno Gomez Piano terra - Relaxing']?.monthlyPerformance
        ?.find(m => m?.month && new Date(Date.parse(m.month + " 1, 2024")).getMonth() === monthNum - 1)?.avgRevenue || 0
    };
  });

  const renderComparisonChart = () => {
    if (chartType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            <Radar
              name="Lovely"
              dataKey="Lovely"
              stroke={LOVELY_COLOR}
              fill={LOVELY_COLOR}
              fillOpacity={0.5}
            />
            <Radar
              name="Relaxing"
              dataKey="Relaxing"
              stroke={RELAXING_COLOR}
              fill={RELAXING_COLOR}
              fillOpacity={0.5}
            />
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={comparisonData} 
          layout="vertical"
          margin={{ top: 20, right: 40, bottom: 20, left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="metric" type="category" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Lovely" fill={LOVELY_COLOR} barSize={20} />
          <Bar dataKey="Relaxing" fill={RELAXING_COLOR} barSize={20} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Key Performance Metrics</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('radar')}
              className={`px-2 py-1 text-sm rounded ${
                chartType === 'radar' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setChartType('bars')}
              className={`px-2 py-1 text-sm rounded ${
                chartType === 'bars' ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`}
            >
              Bars
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {renderComparisonChart()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `€${Math.round(Number(value)).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Lovely" fill={LOVELY_COLOR} />
                <Bar dataKey="Relaxing" fill={RELAXING_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApartmentComparisonWidgets;