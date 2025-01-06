'use client';
import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TableData {
  [key: string]: Array<Record<string, any>>;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface ApiResponse {
  data: TableData;
}

const RawDataTable: React.FC = () => {
  const [data, setData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Rest of your component code...

  useEffect(() => {
const fetchData = async () => {
  try {
    const response = await fetch('/api/sheets');
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
    const { data }: ApiResponse = await response.json();

    setData(data);
    if (Object.keys(data).length > 0) {
      setSelectedTab(Object.keys(data)[0]);
    }
  } catch (err) {
    setError('Failed to fetch data from Google Sheets.');
  } finally {
    setLoading(false);
  }
};
    fetchData();
  }, []);

  const sortData = (rows, key) => {
    if (!key) return rows;

    const columnIndex = headers.findIndex((header) => header === key);
    if (columnIndex === -1) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[columnIndex];
      const bValue = b[columnIndex];

      const aNum = parseFloat(aValue?.replace(/[€%,]/g, ''));
      const bNum = parseFloat(bValue?.replace(/[€%,]/g, ''));

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  const headers = data[selectedTab]?.length > 0 ? Object.keys(data[selectedTab][0]) : [];
  const rows = data[selectedTab]?.map((row) => headers.map((header) => row[header] || '')) || [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return <div>No data available for the selected tab.</div>;
  }

  const sortedData = sortConfig.key ? sortData(rows, sortConfig.key) : rows;

  return (
    <div className="m-4 rounded-lg border bg-white shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Raw Rental Data</h3>
        <div className="flex gap-2 mt-4">
          {Object.keys(data).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setSortConfig({ key: null, direction: 'asc' });
              }}
              className={`px-4 py-2 rounded-lg ${
                selectedTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tab.replace(' - ', '\n')}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="p-3 text-left border font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      setSortConfig({
                        key: header,
                        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
                      })
                    }
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      <span className="text-gray-400">
                        {sortConfig.key === header && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 border">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RawDataTable;