
import React from 'react';

const IncomeExpenseTable = () => {
  const categories = [
    { type: 'Income', fields: ['Gross Income'] },
    {
      type: 'Expenses',
      fields: [
        'Commissions (Booking, AirBnB)',
        'Property Management',
        'Internet',
        'Electricity',
        'Water',
        'Condominio',
        'Extra',
      ],
    },
  ];

  return (
    <div className="widget mt-8">
      <h2 className="text-xl font-bold mb-4">Income and Expense Categories</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border text-left font-semibold">Type</th>
            <th className="p-3 border text-left font-semibold">Fields</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
            >
              <td className="p-3 border">{category.type}</td>
              <td className="p-3 border">{category.fields.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeExpenseTable;
