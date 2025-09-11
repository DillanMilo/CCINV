# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for automatically syncing income and expense records.

## Overview

The app includes a backend helper function `appendFinanceRecord` that writes financial records directly to Google Sheets using the Google Sheets API. This allows you to maintain a real-time backup of all your financial data in a spreadsheet format.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

### 2. Create a Service Account

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `creative-currents-sheets`
   - Description: `Service account for Creative Currents invoicing app`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 3. Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format and click "Create"
6. Download the JSON file and rename it to `service-account.json`
7. Move the file to `/lib/service-account.json` in your project

### 4. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it "Creative Currents Financial Records"
4. Create two tabs:
   - **Income** - for income records
   - **Expenses** - for expense records
5. Add headers to both tabs (Row 1):
   ```
   Date | Type | Amount | Category | Description | Tax Deductible
   ```
6. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 5. Share Sheet with Service Account

1. In your Google Sheet, click the "Share" button
2. Add the service account email (found in your `service-account.json` file)
3. Give it "Editor" permissions
4. Click "Send"

### 6. Configure Environment Variables

1. Copy `env-template.txt` to `.env.local`
2. Add your spreadsheet ID:
   ```
   SHEET_ID=your_google_sheet_id_here
   ```

## Usage

### API Endpoints

The integration provides two API endpoints:

#### Create Income Record

```bash
POST /api/income
Content-Type: application/json

{
  "date": "2024-12-20",
  "amount": 2500.00,
  "category": "Services",
  "description": "Website Development - Acme Corp",
  "taxDeductible": true
}
```

#### Create Expense Record

```bash
POST /api/expense
Content-Type: application/json

{
  "date": "2024-12-20",
  "amount": 89.99,
  "category": "Software",
  "description": "Adobe Creative Cloud Subscription",
  "taxDeductible": true
}
```

### Direct Function Usage

You can also use the helper function directly in your code:

```typescript
import { appendFinanceRecord } from "@/lib/google-sheets";

await appendFinanceRecord({
  date: "2024-12-20",
  type: "Income",
  amount: 2500.0,
  category: "Services",
  description: "Website Development - Acme Corp",
  taxDeductible: true,
});
```

## Data Format

Each record is appended as a row with the following columns:

| Column         | Description                      | Example                         |
| -------------- | -------------------------------- | ------------------------------- |
| Date           | Record date in YYYY-MM-DD format | 2024-12-20                      |
| Type           | Either "Income" or "Expense"     | Income                          |
| Amount         | Numeric amount                   | 2500.00                         |
| Category       | Category name                    | Services                        |
| Description    | Record description               | Website Development - Acme Corp |
| Tax Deductible | TRUE or FALSE                    | TRUE                            |

## Error Handling

The function throws descriptive errors for common issues:

- Missing or invalid environment variables
- Authentication failures
- Invalid record data
- Google Sheets API errors

## Security Notes

- Keep your `service-account.json` file secure and never commit it to version control
- The service account has minimal permissions (only access to the specific sheet)
- Consider using environment variables for sensitive data in production

## Troubleshooting

### Common Issues

1. **"SHEET_ID environment variable is not set"**

   - Make sure you've added `SHEET_ID` to your `.env.local` file

2. **"Failed to append finance record: Authentication failed"**

   - Verify your `service-account.json` file is in the correct location
   - Check that the service account email has access to the sheet

3. **"The caller does not have permission"**

   - Ensure the service account email is shared with the Google Sheet with "Editor" permissions

4. **"Unable to parse range"**
   - Make sure your Google Sheet has tabs named exactly "Income" and "Expenses"
   - Verify the sheet structure matches the expected format

### Testing the Integration

You can test the integration using curl:

```bash
# Test income endpoint
curl -X POST http://localhost:3000/api/income \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-20",
    "amount": 100.00,
    "category": "Test",
    "description": "Test income record",
    "taxDeductible": true
  }'

# Test expense endpoint
curl -X POST http://localhost:3000/api/expense \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-20",
    "amount": 50.00,
    "category": "Test",
    "description": "Test expense record",
    "taxDeductible": false
  }'
```
