// Purpose: Google Sheets API helper for appending financial records
// Note: Only import server-side modules when actually running on server
let google: any;
let readFileSync: any;
let join: any;

// Dynamic imports for server-side only
if (typeof window === 'undefined') {
  google = require('googleapis').google;
  readFileSync = require('fs').readFileSync;
  join = require('path').join;
}

export interface FinanceRecord {
  date: string;              // 'YYYY-MM-DD'
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  description: string;
  taxDeductible: boolean;
}

/**
 * Appends a financial record to the appropriate Google Sheet tab
 * @param record - The financial record to append
 * @throws Error if authentication or API call fails
 */
export async function appendFinanceRecord(record: FinanceRecord): Promise<void> {
  // Only run on server-side
  if (typeof window !== 'undefined') {
    throw new Error('Google Sheets API can only be called from server-side');
  }

  try {
    // Load service account credentials
    const serviceAccountPath = join(process.cwd(), 'lib', 'service-account.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Get spreadsheet ID from environment variable
    const spreadsheetId = process.env.SHEET_ID;
    if (!spreadsheetId) {
      throw new Error('SHEET_ID environment variable is not set');
    }

    // Determine the correct sheet tab name based on record type
    const sheetName = record.type === 'Income' ? 'Income' : 'Expenses';

    // Prepare the row data
    const rowData = [
      record.date,
      record.type,
      record.amount,
      record.category,
      record.description,
      record.taxDeductible ? 'TRUE' : 'FALSE'
    ];

    // Append the row to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:F`, // Append to columns A through F
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    console.log(`Successfully appended ${record.type} record to ${sheetName} sheet:`, {
      updatedRows: response.data.updates?.updatedRows,
      updatedColumns: response.data.updates?.updatedColumns,
    });

  } catch (error) {
    console.error('Error appending finance record to Google Sheets:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Failed to append finance record: ${error.message}`);
    } else {
      throw new Error('Failed to append finance record: Unknown error occurred');
    }
  }
}
