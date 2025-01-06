'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Define a more specific type for sheet data
interface SheetData {
  [tableName: string]: any[];
}

// Define the response type from the API
interface SheetsResponse {
  data: SheetData;
}

const GoogleSheetsImporter: React.FC = () => {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sheets');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const { data }: SheetsResponse = await response.json();
        console.log('Fetched sheet data:', data); // Debugging log
        setSheetData(data);
      } catch (_err) {
        // Use underscore prefix for unused error variable
        const errorMessage = _err instanceof Error ? _err.message : 'An unknown error occurred';
        console.error('Error fetching data:', errorMessage);
        setError('Failed to fetch data from Google Sheets.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadAsCSV = (tableName: string, data: any[]) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName);

    const csvData = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${tableName}.csv`);
  };

  const downloadAsExcel = (data: SheetData) => {
    const workbook = XLSX.utils.book_new();
    const usedNames = new Set<string>();

    Object.entries(data).forEach(([tableName, tableData]) => {
      let shortName = tableName.slice(0, 31);

      // Ensure uniqueness by appending a number if necessary
      let counter = 1;
      while (usedNames.has(shortName)) {
        shortName = `${tableName.slice(0, 28)}_${counter}`; // Leave space for suffix
        counter++;
      }
      usedNames.add(shortName);

      const worksheet = XLSX.utils.aoa_to_sheet(tableData);
      XLSX.utils.book_append_sheet(workbook, worksheet, shortName);
    });

    XLSX.writeFile(workbook, 'ExtractedTables.xlsx');
  };

  if (loading) {
    return <p>Loading data from Google Sheets...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!sheetData || Object.keys(sheetData).length === 0) {
    return <p>No data found in the specified tables.</p>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Extracted Tables</h3>
      <div className="flex space-x-4 my-4">
        <button
          onClick={() => downloadAsExcel(sheetData)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download All as Excel
        </button>
      </div>
      {Object.entries(sheetData).map(([tableName, rows]) => (
        <div key={tableName} className="mb-4">
          <h4 className="text-md font-bold mb-2">{tableName}</h4>
          <button
            onClick={() => downloadAsCSV(tableName, rows)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
          >
            Download {tableName} as CSV
          </button>
        </div>
      ))}
    </div>
  );
};

export default GoogleSheetsImporter;