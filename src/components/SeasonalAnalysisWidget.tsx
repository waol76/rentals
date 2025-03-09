// SeasonalAnalysisWidget.tsx
// This component shows seasonal patterns and comparisons

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthName, monthNameToNumber } from '@/utils/dateUtils';

interface SeasonalAnalysisProps {
  data: any;
}

// Define seasons
const seasonDefinitions = {
  'Winter': ['December', 'January', 'February'],
  'Spring': ['March', 'April', 'May'],
  'Summer': ['June', 'July', 'August'],
  'Fall': ['September', 'October', 'November']
};

// List of season names
const seasonNames = ['Winter', 'Spring', 'Summer', 'Fall'];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SeasonalAnalysisWidget: React.FC<SeasonalAnalysisProps> = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('both');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Get all available years from the data
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

  // Prepare data for the selected year and property
  const prepareSeasonalData = () => {
    if (!data) return [];
    
    const apartments = Object.keys(data);
    if (apartments.length === 0) return [];
    
    // Use latest year if none selected
    const year = selectedYear || Math.max(...availableYears);
    
    // Initialize seasonal data structure
    const seasonalData: Record<string, any> = {};
    seasonNames.forEach(season => {
      seasonalData[season] = {
        season,
        relaxingGross: 0,
        relaxingNet: 0,
        relaxingNights: 0,
        lovelyGross: 0,
        lovelyNet: 0,
        lovelyNights: 0,
        count: 0, // To calculate averages
      };
    });
    
    // Process each apartment's data
    apartments.forEach(apt => {
      const isRelaxing = apt.includes('Relaxing');
      const isLovely = apt.includes('Lovely');
      
      // Skip if we're filtering by property and this isn't the one
      if (selectedProperty !== 'both') {
        if ((selectedProperty === 'relaxing' && !isRelaxing) || 
            (selectedProperty === 'lovely' && !isLovely)) {
          return;
        }
      }
      
      // Process each entry in the apartment data
      data[apt].forEach((entry: any) => {
        if (Number(entry.year) === year && entry.month) {
          // Find which season this month belongs to
          const season = Object.entries(seasonDefinitions).find(([_, months]) => 
            months.includes(entry.month)
          )?.[0];
          
          if (season) {
            if (isRelaxing) {
              seasonalData[season].relaxingGross += Number(entry.gross) || 0;
              seasonalData[season].relaxingNet += Number(entry.net) || 0;
              seasonalData[season].relaxingNights += Number(entry.nights) || 0;
            } else if (isLovely) {
              seasonalData[season].lovelyGross += Number(entry.gross) || 0;
              seasonalData[season].lovelyNet += Number(entry.net) || 0;
              seasonalData[season].lovelyNights += Number(entry.nights) || 0;
            }
            seasonalData[season].count++;
          }
        }
      });
    });
    
    // Convert to array format for charts
    return Object.values(seasonalData);
  };
  
  const chartData = prepareSeasonalData();
  
  // Get appropriate data values based on selected metric and property
  const getMetricValues = (data: any[]) => {
    return data.map(item => {
      let value = 0;
      
      if (selectedMetric === 'revenue') {
        if (selectedProperty === 'relaxing') {
          value = item.relaxingGross;
        } else if (selectedProperty === 'lovely') {
          value = item.lovelyGross;
        } else {
          value = item.relaxingGross + item.lovelyGross;
        }
      } else if (selectedMetric === 'net') {
        if (selectedProperty === 'relaxing') {
          value = item.relaxingNet;
        } else if (selectedProperty === 'lovely') {
          value = item.lovelyNet;
        } else {
          value = item.relaxingNet + item.lovelyNet;
        }
      } else if (selectedMetric === 'nights') {
        if (selectedProperty === 'relaxing') {
          value = item.relaxingNights;
        } else if (selectedProperty === 'lovely') {
          value = item.lovelyNights;
        } else {
          value = item.relaxingNights + item.lovelyNights;
        }
      }
      
      return {
        ...item,
        value
      };
    });
  };
  
  const formattedData = getMetricValues(chartData);
  
  // Format the tooltip values based on the metric
  const formatTooltipValue = (value: number) => {
    if (selectedMetric === 'revenue' || selectedMetric === 'net') {
      return `€${value.toFixed(2)}`;
    } else {
      return value.toString();
    }
  };
  
  // Get the chart title based on selections
  const getChartTitle = () => {
    const metricText = selectedMetric === 'revenue' 
      ? 'Gross Revenue' 
      : selectedMetric === 'net' 
        ? 'Net Income' 
        : 'Nights Booked';
    
    const propertyText = selectedProperty === 'both' 
      ? 'Both Properties' 
      : selectedProperty === 'relaxing' 
        ? 'Relaxing Property' 
        : 'Lovely Property';
    
    return `Seasonal ${metricText} - ${propertyText} (${selectedYear || 'Latest Year'})`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seasonal Analysis</CardTitle>
        <div className="flex flex-wrap gap-2">
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
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="both">Both Properties</option>
            <option value="relaxing">Relaxing Only</option>
            <option value="lovely">Lovely Only</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="revenue">Gross Revenue</option>
            <option value="net">Net Income</option>
            <option value="nights">Nights Booked</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip formatter={(value) => formatTooltipValue(Number(value))} />
              <Legend />
              <Bar dataKey="value" name={selectedMetric === 'revenue' ? 'Revenue' : selectedMetric === 'net' ? 'Net Income' : 'Nights'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-medium mb-4">Distribution by Season</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatTooltipValue(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeasonalAnalysisWidget;