import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface PlatformMonthData {
  bookingRevenue: number;
  airbnbRevenue: number;
  directRevenue: number;
  bookingCommissions: number;
  airbnbCommissions: number;
  bookingNights: number;
  airbnbNights: number;
  directNights: number;
}

interface PlatformSplitWidgetProps {
  platformData: Record<string, Record<string, PlatformMonthData>>;
  selectedYear: 'all' | number;
}

const MONTH_ORDER: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4,
  May: 5, June: 6, July: 7, August: 8,
  September: 9, October: 10, November: 11, December: 12
};

const BOOKING_COLOR = '#3b82f6';
const AIRBNB_COLOR = '#ef4444';
const DIRECT_COLOR = '#22c55e';

const PlatformSplitWidget: React.FC<PlatformSplitWidgetProps> = ({ platformData, selectedYear }) => {
  const processedData = useMemo(() => {
    if (!platformData) return { monthlyData: [], totals: { booking: 0, airbnb: 0, direct: 0, bookingNights: 0, airbnbNights: 0, directNights: 0, bookingComm: 0, airbnbComm: 0 } };

    const monthlyMap = new Map<string, {
      month: string;
      year: number;
      sortKey: number;
      bookingRevenue: number;
      airbnbRevenue: number;
      directRevenue: number;
      bookingNights: number;
      airbnbNights: number;
      directNights: number;
      bookingCommissions: number;
      airbnbCommissions: number;
    }>();

    for (const apartment of Object.keys(platformData)) {
      const months = platformData[apartment];
      for (const [monthYear, values] of Object.entries(months)) {
        const parts = monthYear.split(' ');
        const monthName = parts[0];
        const year = parseInt(parts[1]);

        if (selectedYear !== 'all' && year !== selectedYear) continue;

        const key = `${monthName} ${year}`;
        const existing = monthlyMap.get(key) || {
          month: `${monthName.slice(0, 3)} ${String(year).slice(2)}`,
          year,
          sortKey: year * 100 + (MONTH_ORDER[monthName] || 0),
          bookingRevenue: 0,
          airbnbRevenue: 0,
          directRevenue: 0,
          bookingNights: 0,
          airbnbNights: 0,
          directNights: 0,
          bookingCommissions: 0,
          airbnbCommissions: 0,
        };

        existing.bookingRevenue += values.bookingRevenue || 0;
        existing.airbnbRevenue += values.airbnbRevenue || 0;
        existing.directRevenue += values.directRevenue || 0;
        existing.bookingNights += values.bookingNights || 0;
        existing.airbnbNights += values.airbnbNights || 0;
        existing.directNights += values.directNights || 0;
        existing.bookingCommissions += values.bookingCommissions || 0;
        existing.airbnbCommissions += values.airbnbCommissions || 0;

        monthlyMap.set(key, existing);
      }
    }

    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => a.sortKey - b.sortKey);

    const totals = monthlyData.reduce(
      (acc, row) => ({
        booking: acc.booking + row.bookingRevenue,
        airbnb: acc.airbnb + row.airbnbRevenue,
        direct: acc.direct + row.directRevenue,
        bookingNights: acc.bookingNights + row.bookingNights,
        airbnbNights: acc.airbnbNights + row.airbnbNights,
        directNights: acc.directNights + row.directNights,
        bookingComm: acc.bookingComm + row.bookingCommissions,
        airbnbComm: acc.airbnbComm + row.airbnbCommissions,
      }),
      { booking: 0, airbnb: 0, direct: 0, bookingNights: 0, airbnbNights: 0, directNights: 0, bookingComm: 0, airbnbComm: 0 }
    );

    return { monthlyData, totals };
  }, [platformData, selectedYear]);

  const { monthlyData, totals } = processedData;
  const totalRevenue = totals.booking + totals.airbnb + totals.direct;
  const totalNights = totals.bookingNights + totals.airbnbNights + totals.directNights;

  const pieData = [
    { name: 'Booking.com', value: totals.booking },
    { name: 'Airbnb', value: totals.airbnb },
    ...(totals.direct > 0 ? [{ name: 'Direct', value: totals.direct }] : [])
  ].filter(d => d.value > 0);

  const PIE_COLORS = [BOOKING_COLOR, AIRBNB_COLOR, DIRECT_COLOR];

  const formatTooltip = (value: number) => `€${Math.round(value).toLocaleString()}`;
  const customLabel = ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`;

  const bookingAvgRate = totals.bookingNights > 0 ? totals.booking / totals.bookingNights : 0;
  const airbnbAvgRate = totals.airbnbNights > 0 ? totals.airbnb / totals.airbnbNights : 0;
  const bookingCommRate = totals.booking > 0 ? (totals.bookingComm / totals.booking) * 100 : 0;
  const airbnbCommRate = totals.airbnb > 0 ? (totals.airbnbComm / totals.airbnb) * 100 : 0;

  if (monthlyData.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Booking.com Revenue</p>
            <p className="text-2xl font-bold" style={{ color: BOOKING_COLOR }}>
              €{Math.round(totals.booking).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {totalRevenue > 0 ? `${((totals.booking / totalRevenue) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Airbnb Revenue</p>
            <p className="text-2xl font-bold" style={{ color: AIRBNB_COLOR }}>
              €{Math.round(totals.airbnb).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {totalRevenue > 0 ? `${((totals.airbnb / totalRevenue) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Nightly Rate</p>
            <div className="flex gap-3">
              <div>
                <p className="text-lg font-bold" style={{ color: BOOKING_COLOR }}>€{Math.round(bookingAvgRate)}</p>
                <p className="text-xs text-gray-500">Booking</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: AIRBNB_COLOR }}>€{Math.round(airbnbAvgRate)}</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Commission Rate</p>
            <div className="flex gap-3">
              <div>
                <p className="text-lg font-bold" style={{ color: BOOKING_COLOR }}>{bookingCommRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Booking</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: AIRBNB_COLOR }}>{airbnbCommRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Airbnb</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar Chart - Revenue by Platform */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Monthly Revenue by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    interval={monthlyData.length > 12 ? 1 : 0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`€${Math.round(value).toLocaleString()}`, name]}
                  />
                  <Legend />
                  <Bar dataKey="bookingRevenue" name="Booking.com" stackId="revenue" fill={BOOKING_COLOR} />
                  <Bar dataKey="airbnbRevenue" name="Airbnb" stackId="revenue" fill={AIRBNB_COLOR} />
                  {totals.direct > 0 && (
                    <Bar dataKey="directRevenue" name="Direct" stackId="revenue" fill={DIRECT_COLOR} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Revenue Share */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Revenue Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={customLabel}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-sm text-gray-600">
              <p>{totalNights.toLocaleString()} total nights ({totals.bookingNights} Booking / {totals.airbnbNights} Airbnb{totals.directNights > 0 ? ` / ${totals.directNights} Direct` : ''})</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformSplitWidget;
