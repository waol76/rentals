import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RowData {
 gross: number | string;
 commissions: number | string;
 management: number | string;
 internet: number | string;
 electricity: number | string;
 water: number | string;
 condominio: number | string;
 extra: number | string;
 [key: string]: number | string;
}

interface ExpenseCategories {
 commissions: number;
 management: number;
 internet: number;
 electricity: number;
 water: number;
 condominio: number;
 extra: number;
}

interface FinancialSummary {
 grossIncome: number;
 commissions: number;
 management: number;
 internet: number;
 electricity: number;
 water: number;
 condominio: number;
 extra: number;
}

interface PieChartData {
 name: string;
 value: number;
}

const ExpenseBreakdownWidget = ({ data }: { data: Record<string, RowData[]> }) => {
 const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];

 const calculateFinancials = (): FinancialSummary => {
   const expenses = Object.values(data).flat().reduce(
     (acc, row) => {
       if (!row) return acc;
       
       const grossIncome = Math.abs(Number(row.gross) || 0);
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
         ...Object.keys(expenseCategories).reduce((expAcc, key) => ({
           ...expAcc,
           [key as keyof ExpenseCategories]: 
             ((acc as any)[key] || 0) + expenseCategories[key as keyof ExpenseCategories]
         }), {})
       };
     },
     { 
       grossIncome: 0,
       commissions: 0,
       management: 0,
       internet: 0,
       electricity: 0,
       water: 0,
       condominio: 0,
       extra: 0
     }
   );

   const totalExpenses = Object.entries(expenses)
     .filter(([key]) => key !== 'grossIncome')
     .reduce((sum, [, value]) => sum + value, 0);

   const netIncome = expenses.grossIncome - totalExpenses;

   return {
     ...expenses,
     totalExpenses,
     netIncome
   };
 };

 const { grossIncome, totalExpenses, netIncome } = calculateFinancials();

 const incomeVsExpensesData: PieChartData[] = [
   { name: 'Net Income', value: netIncome },
   { name: 'Total Expenses', value: totalExpenses }
 ].filter(item => item.value > 0);

 const expenseBreakdownData: PieChartData[] = Object.entries({
   commissions: grossIncome.commissions,
   management: grossIncome.management,
   internet: grossIncome.internet,
   electricity: grossIncome.electricity,
   water: grossIncome.water,
   condominio: grossIncome.condominio,
   extra: grossIncome.extra
 })
   .map(([name, value]) => ({
     name: name.charAt(0).toUpperCase() + name.slice(1),
     value
   }))
   .filter(item => item.value > 0);

 const formatTooltip = (value: number) => `€${Math.round(value).toLocaleString()}`;
 const customLabel = ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`;

 return (
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     <Card className="lg:col-span-1">
       <CardHeader className="pb-2">
         <CardTitle className="text-xl">Income Distribution</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-[400px] flex items-center">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={incomeVsExpensesData}
                 dataKey="value"
                 nameKey="name"
                 cx="50%"
                 cy="50%"
                 outerRadius={150}
                 label={customLabel}
               >
                 {incomeVsExpensesData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                 ))}
               </Pie>
               <Tooltip formatter={formatTooltip} />
               <Legend verticalAlign="bottom" height={36} />
             </PieChart>
           </ResponsiveContainer>
         </div>
         <div className="mt-4 grid grid-cols-2 gap-4">
           <div className="text-center p-4 bg-gray-50 rounded-lg">
             <p className="text-sm text-gray-600">Total Revenue</p>
             <p className="text-xl font-bold text-green-600">
               €{Math.round(grossIncome).toLocaleString()}
             </p>
           </div>
           <div className="text-center p-4 bg-gray-50 rounded-lg">
             <p className="text-sm text-gray-600">Net Income</p>
             <p className="text-xl font-bold text-blue-600">
               €{Math.round(netIncome).toLocaleString()}
             </p>
           </div>
         </div>
       </CardContent>
     </Card>

     <Card className="lg:col-span-1">
       <CardHeader className="pb-2">
         <CardTitle className="text-xl">Expense Breakdown</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-[400px] flex items-center">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={expenseBreakdownData}
                 dataKey="value"
                 nameKey="name"
                 cx="50%"
                 cy="50%"
                 outerRadius={150}
                 label={customLabel}
               >
                 {expenseBreakdownData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip formatter={formatTooltip} />
               <Legend verticalAlign="bottom" height={36} />
             </PieChart>
           </ResponsiveContainer>
         </div>
         <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg">
           <p className="text-sm text-gray-600">Total Expenses</p>
           <p className="text-xl font-bold text-red-600">
             €{Math.round(totalExpenses).toLocaleString()}
           </p>
         </div>
       </CardContent>
     </Card>
   </div>
 );
};

export default ExpenseBreakdownWidget;