// YearOverYearComparison.tsx
// This component shows year-over-year comparisons for specific metrics

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthName, monthNameToNumber } from '@/utils/dateUtils';

interface YearOverYearComparisonProps {
  data: any;
}

const YearOverYearComparison: React.FC<YearOverYearComparisonProps> = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [selectedProperty, setSelectedProperty] = useState<string>('both');

  const prepareData = () => {
    if (!data) return [];
    
    const apartments = Object.keys(data);
    if (apartments.length === 0) return [];
    
    // Find all years that have data for the selected month
    const yearData: any[] = [];
    const years = new Set<number>();
    
    apartments.forEach(apt => {
      data[apt].forEach((item: any) => {
        if (item.month === selectedMonth && item.year) {
          years.add(Number(item.year));
        }
      });
    });
    
    // Create formatted data for each year
    Array.from(years).sort().forEach(year => {
      const yearEntry: any = { year };
      
      apartments.forEach(apt => {
        const isRelaxing = apt.includes('Relaxing');
        const isLovely = apt.includes('Lovely');
        const propertyType = isRelaxing ? 'Relaxing' : isLovely ? 'Lovely' : 'Other';
        
        // Skip if we're filtering by property and this isn't the one
        if (selectedProperty !== 'both' && propertyType.toLowerCase() !== selectedProperty.toLowerCase()) {
          return;
        }
        
        const entry = data[apt].find((item: any) => 
          item.month === selectedMonth && Number(item.year) === year
        );
        
        if (entry) {
          if (selectedProperty === 'both') {
            yearEntry[`${propertyType}Gross`] = Number(entry.gross);
            yearEntry[`${propertyType}Net`] = Number(entry.net);
            yearEntry[`${propertyType}Occupancy`] = Number(entry.occupancy) * 100;
            yearEntry[`${propertyType}AvgPrice`] = Number(entry.nights) > 0 ? 
              Number(entry.gross) / Number(entry.nights) : 0;
          } else {
            yearEntry['gross'] = Number(entry.gross);
            yearEntry['net'] = Number(entry.net);
            yearEntry['occupancy'] = Number(entry.occupancy) * 100;
            yearEntry['avgPrice'] = Number(entry.nights) > 0 ? 
              Number(entry.gross) / Number(entry.nights) : 0;
          }
        }
      });
      
      yearData.push(yearEntry);
    });
    
    return yearData;
  };

  const chartData = prepareData();
  
  const allMonths = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Calculate percent changes between years
  const calculateYearOverYearChange = () => {
    if (chartData.length < 2) return null;
    
    const changes = [];
    for (let i = 1; i < chartData.length; i++) {
      const currentYear = chartData[i];
      const previousYear = chartData[i-1];
      
      let currentValue = 0;
      let previousValue = 0;
      
      if (selectedProperty === 'both') {
        if (selectedMetric === 'revenue') {
          currentValue = (currentYear.RelaxingGross || 0) + (currentYear.LovelyGross || 0);
          previousValue = (previousYear.RelaxingGross || 0) + (previousYear.LovelyGross || 0);
        } else if (selectedMetric === 'net') {
          currentValue = (currentYear.RelaxingNet || 0) + (currentYear.LovelyNet || 0);
          previousValue = (previousYear.RelaxingNet || 0) + (previousYear.LovelyNet || 0);
        } else if (selectedMetric === 'occupancy') {
          // Average occupancy across properties
          const currentRelaxing = currentYear.RelaxingOccupancy || 0;
          const currentLovely = currentYear.LovelyOccupancy || 0;
          const previousRelaxing = previousYear.RelaxingOccupancy || 0;
          const previousLovely = previousYear.LovelyOccupancy || 0;
          
          const currentCount = (currentRelaxing ? 1 : 0) + (currentLovely ? 1 : 0);
          const previousCount = (previousRelaxing ? 1 : 0) + (previousLovely ? 1 : 0);
          
          currentValue = currentCount > 0 ? (currentRelaxing + currentLovely) / currentCount : 0;
          previousValue = previousCount > 0 ? (previousRelaxing + previousLovely) / previousCount : 0;
        } else if (selectedMetric === 'avgPrice') {
          currentValue = (currentYear.RelaxingAvgPrice || 0 + currentYear.LovelyAvgPrice || 0) / 
            ((currentYear.RelaxingAvgPrice ? 1 : 0) + (currentYear.LovelyAvgPrice ? 1 : 0) || 1);
          previousValue = (previousYear.RelaxingAvgPrice || 0 + previousYear.LovelyAvgPrice || 0) / 
            ((previousYear.RelaxingAvgPrice ? 1 : 0) + (previousYear.LovelyAvgPrice ? 1 : 0) || 1);
        }
      } else {
        // Single property
        currentValue = currentYear[selectedMetric] || 0;
        previousValue = previousYear[selectedMetric] || 0;
      }
      
      const percentChange = previousValue > 0 
        ? ((currentValue - previousValue) / previousValue) * 100 
        : 0;
      
      changes.push({
        year: currentYear.year,
        previousYear: previousYear.year,
        change: percentChange.toFixed(1)
      });
    }
    
    return changes;
  };

  const yearOverYearChanges = calculateYearOverYearChange();

  const renderChart = () => {
    if (chartData.length === 0) {
      return <div className="text-center py-10">No data available for the selected month</div>;
    }
    
    switch (selectedMetric) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              {selectedProperty === 'both' ? (
                <>
                  <Bar dataKey="RelaxingGross" name="Relaxing Gross" fill="#8884d8" />
                  <Bar dataKey="LovelyGross" name="Lovely Gross" fill="#82ca9d" />
                </>
              ) : (
                <Bar dataKey="gross" name={`${selectedProperty} Gross`} fill="#8884d8" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'net':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              {selectedProperty === 'both' ? (
                <>
                  <Bar dataKey="RelaxingNet" name="Relaxing Net" fill="#8884d8" />
                  <Bar dataKey="LovelyNet" name="Lovely Net" fill="#82ca9d" />
                </>
              ) : (
                <Bar dataKey="net" name={`${selectedProperty} Net`} fill="#8884d8" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'occupancy':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Legend />
              {selectedProperty === 'both' ? (
                <>
                  <Line type="monotone" dataKey="RelaxingOccupancy" name="Relaxing Occupancy" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="LovelyOccupancy" name="Lovely Occupancy" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </>
              ) : (
                <Line type="monotone" dataKey="occupancy" name={`${selectedProperty} Occupancy`} stroke="#8884d8" activeDot={{ r: 8 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'avgPrice':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `€${Number(value).toFixed(2)}`} />
              <Legend />
              {selectedProperty === 'both' ? (
                <>
                  <Line type="monotone" dataKey="RelaxingAvgPrice" name="Relaxing Avg. Price" stroke="#8884d8" />
                  <Line type="monotone" dataKey="LovelyAvgPrice" name="Lovely Avg. Price" stroke="#82ca9d" />
                </>
              ) : (
                <Line type="monotone" dataKey="avgPrice" name={`${selectedProperty} Avg. Price`} stroke="#8884d8" />
              )}
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
        <CardTitle>Year-over-Year Comparison</CardTitle>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            {allMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="revenue">Gross Revenue</option>
            <option value="net">Net Income</option>
            <option value="occupancy">Occupancy Rate</option>
            <option value="avgPrice">Average Price</option>
          </select>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="both">Both Properties</option>
            <option value="relaxing">Relaxing Only</option>
            <option value="lovely">Lovely Only</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* YoY Change Summary */}
        {yearOverYearChanges && yearOverYearChanges.length > 0 && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Year-over-Year Changes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearOverYearChanges.map((change, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md ${
                    Number(change.change) > 0 
                      ? 'bg-green-100 text-green-800' 
                      : Number(change.change) < 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {change.year} vs {change.previousYear}
                  </p>
                  <p className="text-lg font-bold">
                    {Number(change.change) > 0 ? '+' : ''}{change.change}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YearOverYearComparison;
