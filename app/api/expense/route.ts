// Purpose: API endpoint for creating expense records and syncing to Google Sheets
import { NextRequest, NextResponse } from 'next/server';
import { appendFinanceRecord } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { date, amount, category, description, taxDeductible } = body;
    
    if (!date || !amount || !category || !description || typeof taxDeductible !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: date, amount, category, description, taxDeductible' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create the finance record
    const financeRecord = {
      date,
      type: 'Expense' as const,
      amount,
      category,
      description,
      taxDeductible,
    };

    // Append to Google Sheets
    await appendFinanceRecord(financeRecord);

    return NextResponse.json(
      { 
        message: 'Expense record created successfully',
        record: financeRecord 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating expense record:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create expense record' 
      },
      { status: 500 }
    );
  }
}
