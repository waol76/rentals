// AnalyticsView.tsx
import React from 'react';
import MonthlyComparison from './MonthlyComparison';
import YearOverYearComparison from './YearOverYearComparison';
import SeasonalAnalysisWidget from './SeasonalAnalysisWidget';
import IncomeExpenseTable from './IncomeExpenseTable';

interface AnalyticsViewProps {
  data: any;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-2">Advanced Analytics</h2>
        <p className="text-gray-600">
          Explore detailed rental performance trends and patterns with these advanced analysis tools.
          Compare months, years, and seasons to identify opportunities for optimization.
        </p>
      </div>

      <div className="space-y-8">
        <MonthlyComparison data={data} />
        <YearOverYearComparison data={data} />
        <SeasonalAnalysisWidget data={data} />
        <IncomeExpenseTable />
      </div>
    </div>
  );
};

export default AnalyticsView;
