// Purpose: Test script for Google Sheets integration
// Run with: node scripts/test-google-sheets.js

const { appendFinanceRecord } = require('../lib/google-sheets');

async function testGoogleSheetsIntegration() {
  console.log('🧪 Testing Google Sheets Integration...\n');

  try {
    // Test income record
    console.log('📈 Testing income record...');
    await appendFinanceRecord({
      date: '2024-12-20',
      type: 'Income',
      amount: 100.00,
      category: 'Test',
      description: 'Test income record from script',
      taxDeductible: true
    });
    console.log('✅ Income record added successfully!\n');

    // Test expense record
    console.log('📉 Testing expense record...');
    await appendFinanceRecord({
      date: '2024-12-20',
      type: 'Expense',
      amount: 50.00,
      category: 'Test',
      description: 'Test expense record from script',
      taxDeductible: false
    });
    console.log('✅ Expense record added successfully!\n');

    console.log('🎉 All tests passed! Check your Google Sheet to verify the records were added.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure SHEET_ID is set in your .env.local file');
    console.log('2. Verify service-account.json exists in /lib/');
    console.log('3. Check that the service account has access to your Google Sheet');
    console.log('4. Ensure your Google Sheet has "Income" and "Expenses" tabs');
    process.exit(1);
  }
}

// Run the test
testGoogleSheetsIntegration();
