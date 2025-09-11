// Purpose: API endpoint for creating expense records and syncing to Google Sheets
import { NextApiRequest, NextApiResponse } from 'next';
import { appendFinanceRecord } from '@/lib/google-sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, amount, category, description, taxDeductible } = req.body;
    
    // Validate required fields
    if (!date || !amount || !category) {
      return res.status(400).json({
        error: 'Missing required fields: date, amount, and category are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Amount must be a positive number'
      });
    }

    // Create the finance record
    const financeRecord = {
      date,
      type: 'Expense' as const,
      amount,
      category,
      description: description || '',
      taxDeductible: taxDeductible ?? true,
    };

    // Append to Google Sheets
    await appendFinanceRecord(financeRecord);

    return res.status(201).json({
      message: 'Expense record created successfully',
      record: financeRecord
    });

  } catch (error) {
    console.error('Error creating expense record:', error);
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create expense record'
    });
  }
}
