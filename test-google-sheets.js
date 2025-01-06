require('dotenv').config();
const { google } = require('googleapis');

// Log environment variables for debugging
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY);
console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);


// Rest of the code

const testGoogleSheetsAPI = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E', // Adjust range if needed
    });

    console.log('API Response:');
    console.log(response.data);
  } catch (error) {
    console.error('Error accessing Google Sheets API:', error);
  }
};

testGoogleSheetsAPI();
