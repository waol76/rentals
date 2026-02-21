import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ExpenseCategories {
 commissions: number;
 management: number;
 internet: number;
 electricity: number;
 water: number;
 condominio: number;
 extra: number;
}

interface SliceEntry {
  name: string;
  value: number;
  color: string;
}

const EXPENSE_COLORS: Record<string, string> = {
  'Net Income': '#22c55e',
  'Commissions': '#ef4444',
  'Management': '#f97316',
  'Internet': '#3b82f6',
  'Electricity': '#eab308',
  'Water': '#8b5cf6',
  'Condominio': '#06b6d4',
  'Extra': '#ec4899',
};

const ExpenseBreakdownWidget = ({ data }: { data: Record<string, any[]> }) => {

const calculateFinancials = () => {
  const result = Object.values(data).flat().reduce(
    (acc, row) => {
      if (!row) return acc;

      const grossIncome = Number(row.gross) || 0;
      const netValue = Number(row.net) || 0;
      const cleaningAmount = Math.abs(Number(row.cleaning) || 0);
      const expenseCategories: ExpenseCategories = {
        commissions: Math.abs(Number(row.commissions) || 0),
        management: Math.abs(Number(row.management) || 0),
        internet: Math.abs(Number(row.internet) || 0),
        electricity: Math.abs(Number(row.electricity) || 0),
        water: Math.abs(Number(row.water) || 0),
        condominio: Math.abs(Number(row.condominio) || 0),
        extra: Math.abs(Number(row.extra) || 0),
      };

      return {
        grossIncome: acc.grossIncome + grossIncome,
        netIncome: acc.netIncome + netValue,
        cleaning: acc.cleaning + cleaningAmount,
        ...Object.keys(expenseCategories).reduce((expAcc, key) => ({
          ...expAcc,
          [key]: (acc[key] || 0) + expenseCategories[key as keyof ExpenseCategories]
        }), {})
      };
    },
    { grossIncome: 0, netIncome: 0, cleaning: 0 }
  );

  const totalExpenses = result.grossIncome - result.netIncome;

  return {
    expenses: result,
    totalExpenses,
    netIncome: result.netIncome,
    totalCleaning: result.cleaning
  };
};

 const { expenses, totalExpenses, netIncome, totalCleaning } = calculateFinancials();

 // Single pie: net income + each expense category against total revenue
 const revenueBreakdown: SliceEntry[] = [
   { name: 'Net Income', value: netIncome, color: EXPENSE_COLORS['Net Income'] },
   ...Object.entries(expenses)
     .filter(([key]) => !['grossIncome', 'netIncome', 'cleaning'].includes(key))
     .map(([name, value]) => ({
       name: name.charAt(0).toUpperCase() + name.slice(1),
       value: value as number,
       color: EXPENSE_COLORS[name.charAt(0).toUpperCase() + name.slice(1)] || '#94a3b8',
     }))
     .filter(item => item.value > 0),
 ];

 // Horizontal bar data for expense categories only
 const expenseBarData = revenueBreakdown
   .filter(item => item.name !== 'Net Income')
   .sort((a, b) => b.value - a.value);

 const formatTooltip = (value: number) => `€${Math.round(value).toLocaleString()}`;

 const profitMargin = expenses.grossIncome > 0
   ? ((netIncome / expenses.grossIncome) * 100).toFixed(1)
   : '0';

 const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
   if (percent < 0.04) return null;
   const RADIAN = Math.PI / 180;
   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
   const x = cx + radius * Math.cos(-midAngle * RADIAN);
   const y = cy + radius * Math.sin(-midAngle * RADIAN);
   return (
     <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
       {`${(percent * 100).toFixed(0)}%`}
     </text>
   );
 };

 return (
   <Card>
     <CardHeader className="pb-2">
       <CardTitle className="text-xl">Profit & Loss</CardTitle>
     </CardHeader>
     <CardContent>
       {/* Summary cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
         <div className="text-center p-3 bg-gray-50 rounded-lg">
           <p className="text-xs text-gray-500">Total Revenue</p>
           <p className="text-lg font-bold text-gray-900">
             €{Math.round(expenses.grossIncome).toLocaleString()}
           </p>
         </div>
         <div className="text-center p-3 bg-green-50 rounded-lg">
           <p className="text-xs text-gray-500">Net Income</p>
           <p className="text-lg font-bold text-green-600">
             €{Math.round(netIncome).toLocaleString()}
           </p>
         </div>
         <div className="text-center p-3 bg-red-50 rounded-lg">
           <p className="text-xs text-gray-500">Total Expenses</p>
           <p className="text-lg font-bold text-red-500">
             €{Math.round(totalExpenses).toLocaleString()}
           </p>
         </div>
         <div className="text-center p-3 bg-gray-50 rounded-lg">
           <p className="text-xs text-gray-500">Profit Margin</p>
           <p className="text-lg font-bold text-gray-700">
             {profitMargin}%
           </p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Donut: where does every euro go? */}
         <div>
           <p className="text-sm font-medium text-gray-500 mb-2 text-center">Where every € goes</p>
           <div className="h-[350px] flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={revenueBreakdown}
                   dataKey="value"
                   nameKey="name"
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={140}
                   label={renderCustomLabel}
                   labelLine={false}
                 >
                   {revenueBreakdown.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip formatter={formatTooltip} />
                 <Legend
                   verticalAlign="bottom"
                   height={50}
                   formatter={(value: string) => <span className="text-xs">{value}</span>}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* Horizontal bar: expense breakdown ranked */}
         <div>
           <p className="text-sm font-medium text-gray-500 mb-2 text-center">Expense breakdown</p>
           <div className="h-[350px] flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={expenseBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
                 <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                 <Tooltip formatter={formatTooltip} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                   {expenseBarData.map((entry, index) => (
                     <Cell key={`bar-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>

       {/* Cleaning info */}
       {totalCleaning > 0 && (
         <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-sm text-gray-500">
           <span>Cleaning fees collected from guests:</span>
           <span className="font-semibold text-gray-700">€{Math.round(totalCleaning).toLocaleString()}</span>
           <span className="text-xs">(included in revenue)</span>
         </div>
       )}
     </CardContent>
   </Card>
 );
};

export default ExpenseBreakdownWidget;
