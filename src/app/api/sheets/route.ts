import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const parseValue = (value: string): number => {
  const cleanedValue = String(value || '0').replace(/[^0-9.-]/g, '');
  return parseFloat(cleanedValue) || 0;
};

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const tablesToLoad = [
      { tab: 'Nuno Gomez Piano uno - Lovely', range: 'A1:Z50' },
      { tab: 'Nuno Gomez Piano terra - Relaxing', range: 'A1:Z50' },
    ];

    const sheetData = {} as Record<string, unknown[]>;

    for (const table of tablesToLoad) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${table.tab}!${table.range}`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) continue;


      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        try {
          const rowData = headers.reduce((acc, header, index) => {
            acc[header.trim()] = row[index] || '';
            return acc;
          }, {});

          const gross = parseValue(rowData['Gross Income']);
          const expenses = {
            commissions: parseValue(rowData['Commissions (Booking, AirBnB)']),
            management: parseValue(rowData['Property Management']),
            internet: parseValue(rowData['Internet']),
            electricity: parseValue(rowData['Electricity']),
            water: parseValue(rowData['Water']),
            condominio: parseValue(rowData['Condominio']),
            extra: parseValue(rowData['Extra']),
          };

          // Safely calculate total expenses and net
          const totalExpenses = Object.values(expenses)
            .filter((val) => !isNaN(val)) // Exclude invalid numbers
            .reduce((sum, val) => sum + val, 0);

          return {
            month: rowData['Month']?.trim(),
            year: rowData['Year']?.trim(),
            nights: parseInt(rowData['Nights']) || 0,
            gross,
            net: gross + totalExpenses, // Add total expenses (already negative) to gross
            ...expenses,
          };
        } catch (err) {
          console.error('Error processing row:', row, err);
          return null; // Exclude problematic rows now
        }
      }).filter(Boolean); // Remove any null rows

      sheetData[table.tab] = data;
    }

    console.log('Processed Sheet Data:', sheetData); // Final processed data
    return NextResponse.json({ data: sheetData });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Google Sheets', 
        details: error instanceof Error ? error.message : 'Unknown error' 
       },
      { status: 500 }
    );
  }
}
