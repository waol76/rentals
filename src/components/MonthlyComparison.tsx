// MonthlyComparison.tsx (Continued)
// This component shows month-to-month trends for selected metrics

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MonthName, monthNameToNumber } from '@/utils/dateUtils';

interface MonthlyComparisonProps {
  data: any;
}

interface FormattedData {
  month: string;
  relaxingGross?: number;
  relaxingNet?: number;
  lovelyGross?: number;
  lovelyNet?: number;
  relaxingOccupancy?: number;
  lovelyOccupancy?: number;
  relaxingGrossGrowth?: number;
  relaxingNetGrowth?: number;
  lovelyGrossGrowth?: number;
  lovelyNetGrowth?: number;
  year: number;
}

const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('income');
  const [chartType, setChartType] = useState<string>('line');

  // Extract all available years from the data
  const availableYears = useMemo(() => {
    if (!data) return [];
    
    const years = new Set<number>();
    
    Object.values(data).forEach((propertyData: any) => {
      propertyData.forEach((entry: any) => {
        if (entry.year) {
          years.add(Number(entry.year));
        }
      });
    });
    
    return Array.from(years).sort();
  }, [data]);

  // Process data for monthly comparison
  const prepareData = () => {
    if (!data) return [];
    
    const apartments = Object.keys(data);
    if (apartments.length === 0) return [];
    
    // Use latest year if none selected
    const year = selectedYear || (availableYears.length > 0 ? Math.max(...availableYears) : new Date().getFullYear());
    
    const monthOrder = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    // Create an array with all months
    const formattedData: FormattedData[] = monthOrder.map(monthName => ({
      month: monthName,
      year
    }));
    
    // Populate with actual data
    apartments.forEach(apt => {
      const isRelaxing = apt.includes('Relaxing');
      const isLovely = apt.includes('Lovely');
      
      data[apt].forEach((item: any) => {
        if (Number(item.year) === year && item.month) {
          const monthIndex = monthOrder.indexOf(item.month);
          if (monthIndex !== -1) {
            if (isRelaxing) {
              formattedData[monthIndex].relaxingGross = Number(item.gross);
              formattedData[monthIndex].relaxingNet = Number(item.net);
              formattedData[monthIndex].relaxingOccupancy = Number(item.nights) / (new Date(year, monthIndex + 1, 0).getDate()) * 100;
            } else if (isLovely) {
              formattedData[monthIndex].lovelyGross = Number(item.gross);
              formattedData[monthIndex].lovelyNet = Number(item.net);
              formattedData[monthIndex].lovelyOccupancy = Number(item.nights) / (new Date(year, monthIndex + 1, 0).getDate()) * 100;
            }
          }
        }
      });
    });
    
    // Calculate month-over-month growth rates
    for (let i = 1; i < formattedData.length; i++) {
      const currentMonth = formattedData[i];
      const previousMonth = formattedData[i-1];
      
      // Calculate growth for relaxing property
      if (currentMonth.relaxingGross && previousMonth.relaxingGross && previousMonth.relaxingGross > 0) {
        currentMonth.relaxingGrossGrowth = 
          ((currentMonth.relaxingGross - previousMonth.relaxingGross) / previousMonth.relaxingGross) * 100;
      }
      
      if (currentMonth.relaxingNet && previousMonth.relaxingNet && previousMonth.relaxingNet > 0) {
        currentMonth.relaxingNetGrowth = 
          ((currentMonth.relaxingNet - previousMonth.relaxingNet) / previousMonth.relaxingNet) * 100;
      }
      
      // Calculate growth for lovely property
      if (currentMonth.lovelyGross && previousMonth.lovelyGross && previousMonth.lovelyGross > 0) {
        currentMonth.lovelyGrossGrowth = 
          ((currentMonth.lovelyGross - previousMonth.lovelyGross) / previousMonth.lovelyGross) * 100;
      }
      
      if (currentMonth.lovelyNet && previousMonth.lovelyNet && previousMonth.lovelyNet > 0) {
        currentMonth.lovelyNetGrowth = 
          ((currentMonth.lovelyNet - previousMonth.lovelyNet) / previousMonth.lovelyNet) * 100;
      }
    }
    
    return formattedData;
  };

  const chartData = prepareData();

  // Get peak months for each metric
  const getPeakMonths = () => {
    if (chartData.length === 0) return {};
    
    // Find peak gross income month for each property
    const relaxingGrossPeak = [...chartData].sort((a, b) => (b.relaxingGross || 0) - (a.relaxingGross || 0))[0];
    const lovelyGrossPeak = [...chartData].sort((a, b) => (b.lovelyGross || 0) - (a.lovelyGross || 0))[0];
    
    // Find peak net income month for each property
    const relaxingNetPeak = [...chartData].sort((a, b) => (b.relaxingNet || 0) - (a.relaxingNet || 0))[0];
    const lovelyNetPeak = [...chartData].sort((a, b) => (b.lovelyNet || 0) - (a.lovelyNet || 0))[0];
    
    // Find peak occupancy month for each property
    const relaxingOccupancyPeak = [...chartData].sort((a, b) => (b.relaxingOccupancy || 0) - (a.relaxingOccupancy || 0))[0];
    const lovelyOccupancyPeak = [...chartData].sort((a, b) => (b.lovelyOccupancy || 0) - (a.lovelyOccupancy || 0))[0];
    
    return {
      relaxingGrossPeak,
      lovelyGrossPeak,
      relaxingNetPeak,
      lovelyNetPeak,
      relaxingOccupancyPeak,
      lovelyOccupancyPeak
    };
  };

  const peakData = getPeakMonths();

  const renderChart = () => {
    switch (selectedMetric) {
      case 'income':
        return chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="relaxingGross" name="Relaxing Gross" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="relaxingNet" name="Relaxing Net" stroke="#82ca9d" />
              <Line type="monotone" dataKey="lovelyGross" name="Lovely Gross" stroke="#ff7300" />
              <Line type="monotone" dataKey="lovelyNet" name="Lovely Net" stroke="#0088fe" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              <Bar dataKey="relaxingGross" name="Relaxing Gross" fill="#8884d8" />
              <Bar dataKey="lovelyGross" name="Lovely Gross" fill="#ff7300" />
              <Bar dataKey="relaxingNet" name="Relaxing Net" fill="#82ca9d" />
              <Bar dataKey="lovelyNet" name="Lovely Net" fill="#0088fe" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'occupancy':
        return chartType === 'line' ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="relaxingOccupancy" name="Relaxing Occupancy" stroke="#8884d8" />
              <Line type="monotone" dataKey="lovelyOccupancy" name="Lovely Occupancy" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="relaxingOccupancy" name="Relaxing Occupancy" fill="#8884d8" />
              <Bar dataKey="lovelyOccupancy" name="Lovely Occupancy" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.slice(1)} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="relaxingGrossGrowth" name="Relaxing Gross MoM %" stroke="#8884d8" />
              <Line type="monotone" dataKey="lovelyGrossGrowth" name="Lovely Gross MoM %" stroke="#ff7300" />
              <Line type="monotone" dataKey="relaxingNetGrowth" name="Relaxing Net MoM %" stroke="#82ca9d" />
              <Line type="monotone" dataKey="lovelyNetGrowth" name="Lovely Net MoM %" stroke="#0088fe" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Select a metric to display</div>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Comparison</CardTitle>
        <div className="flex gap-4">
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            className="px-2 py-1 border rounded"
          >
            <option value="">Latest Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="income">Income</option>
            <option value="occupancy">Occupancy</option>
            <option value="growth">Month-over-Month Growth</option>
          </select>
          {selectedMetric !== 'growth' && (
            <div className="flex border rounded">
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-1 ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-1 ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Bar
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderChart()}
        
        {/* Peak performance insights */}
        {peakData && selectedMetric !== 'growth' && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-3">Peak Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Relaxing Property</h4>
                {selectedMetric === 'income' && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Peak Gross Income:</span> {peakData.relaxingGrossPeak?.month || 'N/A'} - 
                      €{(peakData.relaxingGrossPeak?.relaxingGross || 0).toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Peak Net Income:</span> {peakData.relaxingNetPeak?.month || 'N/A'} - 
                      €{(peakData.relaxingNetPeak?.relaxingNet || 0).toFixed(2)}
                    </p>
                  </>
                )}
                {selectedMetric === 'occupancy' && (
                  <p className="text-sm">
                    <span className="font-medium">Peak Occupancy:</span> {peakData.relaxingOccupancyPeak?.month || 'N/A'} - 
                    {(peakData.relaxingOccupancyPeak?.relaxingOccupancy || 0).toFixed(1)}%
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Lovely Property</h4>
                {selectedMetric === 'income' && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Peak Gross Income:</span> {peakData.lovelyGrossPeak?.month || 'N/A'} - 
                      €{(peakData.lovelyGrossPeak?.lovelyGross || 0).toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Peak Net Income:</span> {peakData.lovelyNetPeak?.month || 'N/A'} - 
                      €{(peakData.lovelyNetPeak?.lovelyNet || 0).toFixed(2)}
                    </p>
                  </>
                )}
                {selectedMetric === 'occupancy' && (
                  <p className="text-sm">
                    <span className="font-medium">Peak Occupancy:</span> {peakData.lovelyOccupancyPeak?.month || 'N/A'} - 
                    {(peakData.lovelyOccupancyPeak?.lovelyOccupancy || 0).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyComparison;
