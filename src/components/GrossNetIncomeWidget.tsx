import React, { useState } from 'react';
import { AreaChart, Area, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format, parse, getYear, getMonth, getDaysInMonth } from 'date-fns';

interface RowData {
 year: number;
 month: number;
 gross: number | string;
 net: number | string;
 nights: number | string;
 [key: string]: any;
}

interface ProcessedDataEntry {
 month?: string;
 year?: number;
 gross: number;
 net: number;
 nights: number;
 monthSort?: string;
 daysInMonth?: number;
 occupancyRate?: number;
 _type?: {
   gross: string;
   net: string;
   nights: string;
 };
}

interface MonthMapEntry {
 month: string;
 monthSort: string;
 gross: number;
 net: number;
 nights: number;
 daysInMonth: number;
 _type: {
   gross: string;
   net: string;
   nights: string;
 };
}

interface YearMapEntry {
 year: number;
 gross: number;
 net: number;
 nights: number;
 _type: {
   gross: string;
   net: string;
   nights: string;
 };
}

const GrossNetIncomeWidget = ({ data }: { data: Record<string, RowData[]> }) => {
 const [view, setView] = useState('monthly');

 const processData = (): ProcessedDataEntry[] => {
   const rawData = Object.values(data || {}).flat().filter(row => row?.gross !== undefined);
   
   if (view === 'monthly') {
     const monthMap = rawData.reduce((acc: Record<string, MonthMapEntry>, row) => {
       const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
       if (!acc[key]) {
         acc[key] = {
           month: `${row.month} ${row.year}`,
           monthSort: key,
           gross: 0,
           net: 0,
           nights: 0,
           daysInMonth: getDaysInMonth(parse(key, 'yyyy-MM', new Date())),
           _type: {
             gross: 'currency',
             net: 'currency',
             nights: 'number'
           }
         };
       }
       acc[key].gross += Number(row.gross) || 0;
       acc[key].net += Number(row.net) || 0;
       acc[key].nights += Number(row.nights) || 0;
       return acc;
     }, {} as Record<string, MonthMapEntry>);

     return Object.values(monthMap)
       .sort((a, b) => {
         const [yearA, monthA] = a.monthSort.split('-').map(Number);
         const [yearB, monthB] = b.monthSort.split('-').map(Number);
         
         if (yearA !== yearB) {
           return yearA - yearB;
         }
         return monthA - monthB;
       })
       .map(entry => ({
         ...entry,
         occupancyRate: Math.round((entry.nights / (entry.daysInMonth * 2)) * 100)
       }));
   }
   
   return Object.values(
     rawData.reduce((acc: Record<number, YearMapEntry>, row) => {
       const year = row.year;
       if (!acc[year]) {
         acc[year] = { 
           year, 
           gross: 0, 
           net: 0, 
           nights: 0,
           _type: {
             gross: 'currency',
             net: 'currency',
             nights: 'number'
           }
         };
       }
       acc[year].gross += Number(row.gross) || 0;
       acc[year].net += Number(row.net) || 0;
       acc[year].nights += Number(row.nights) || 0;
       return acc;
     }, {} as Record<number, YearMapEntry>)
   ).sort((a, b) => a.year - b.year)
   .map(entry => ({
     ...entry,
     occupancyRate: Math.round((entry.nights / (366 * 2)) * 100)
   }));
 };

 const chartData = processData();

 const calendarData = chartData.reduce((data, entry) => {
  if (view === 'monthly' && entry.month) {
    const month = parse(entry.month, 'MMMM yyyy', new Date());
    const numDays = getDaysInMonth(month);

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(getYear(month), getMonth(month), day);
      data.push({
        date,
        nights: Math.round(entry.nights / numDays),
      });
    }
  } else if (view === 'yearly' && entry.year !== undefined) {
    const year = Number(entry.year);
    for (let month = 0; month < 12; month++) {
      const numDays = getDaysInMonth(new Date(year, month));
      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month, day);
        data.push({
          date,
          nights: Math.round(entry.nights / (12 * numDays)),
        });
      }
    }
  }
  return data;
}, []);

 const CustomTooltip = ({ 
   active, 
   payload, 
   label 
 }: { 
   active?: boolean; 
   payload?: Array<{
     dataKey?: string;
     value: number;
     name?: string;
     color?: string;
     payload?: {
       nights: number;
     }
   }>;
   label?: string 
 }) => {
   if (!active || !payload) return null;
   
   return (
     <div className="bg-white p-4 border rounded shadow-lg">
       <p className="font-bold">{label}</p>
       {payload.map((item, index) => {
         let value;
         if (item.dataKey === 'nights') {
           const totalNights = view === 'monthly' 
             ? item.payload?.nights 
             : (item.payload?.nights || 0) / 12;
           value = `${Math.round(totalNights)} nights`;
         } else {
           value = `€${Math.round(item.value).toLocaleString()}`;
         }
         
         return (
           <p 
             key={index}
             style={{ color: item.color }}
             className="text-sm"  
           >
             {item.name}: {value}
           </p>
         );
       })}
     </div>
   );
 };

 const formatYAxis = (value: number) => {
   return `${value} (${Math.round((value / (view === 'monthly' ? 60 : 732)) * 100)}%)`;
 };

 return (
   <div className="widget">
     <div className="flex justify-between items-center mb-4">
       <h2 className="text-xl font-bold">Revenue & Occupancy</h2>
       <div className="flex gap-4">
         <button
           onClick={() => setView('monthly')}
           className={`px-4 py-2 rounded ${view === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}  
         >
           Monthly
         </button>
         <button
           onClick={() => setView('yearly')}
           className={`px-4 py-2 rounded ${view === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
         >
           Yearly
         </button>
       </div>
     </div>
     
     <div className="mb-8">
       <ResponsiveContainer width="100%" height={300}>
         <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
           <defs>
             <linearGradient id="grossColor" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
               <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
             </linearGradient>
             <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
               <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
             </linearGradient>
           </defs>
           <XAxis dataKey={view === 'monthly' ? 'month' : 'year'} />
           <YAxis domain={[0, 'dataMax']} tickLine={false} axisLine={false} />
           <CartesianGrid strokeDasharray="3 3" />
           <Tooltip content={<CustomTooltip />} />
           <Area type="monotone" dataKey="gross" stroke="#8884d8" fillOpacity={1} fill="url(#grossColor)" />
           <Area type="monotone" dataKey="net" stroke="#82ca9d" fillOpacity={1} fill="url(#netColor)" />
         </AreaChart>
       </ResponsiveContainer>
       
       <ResponsiveContainer width="100%" height={150}>
         <BarChart data={chartData}>
           <XAxis dataKey={view === 'monthly' ? 'month' : 'year'} />
           <YAxis domain={[0, 'dataMax']} tickLine={false} axisLine={false} />
           <Tooltip content={<CustomTooltip />} />
           <Bar dataKey="nights" fill="#ff7300">
             {chartData.map((entry, index) => {
               const roundedNights = Math.round(view === 'monthly' ? entry.nights : entry.nights / 12);
               return (
                 <Cell
                   key={`cell-${index}`}
                   fill={`rgba(255,115,0,${entry.occupancyRate / 100})`}
                   label={roundedNights > 0 ? roundedNights : ''}
                 />
               );
             })}
           </Bar>
         </BarChart>
       </ResponsiveContainer>
     </div>

     <div>
       <h3 className="text-lg font-semibold mb-4">Occupancy Calendar</h3>
       <div className="flex flex-wrap">
         {calendarData.map((entry, index) => (
           <div
             key={index}
             className="w-4 h-4 m-0.5 rounded"
             style={{
               backgroundColor: `rgba(255, 115, 0, ${entry.nights / 2})`,
             }}
             title={`${format(entry.date, 'MMM d, yyyy')}: ${entry.nights} nights`}
           />
         ))}
       </div>
     </div>
   </div>
 );
};

export default GrossNetIncomeWidget;