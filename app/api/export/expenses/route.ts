// Purpose: CSV export endpoint for expense records
import { NextRequest, NextResponse } from 'next/server';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const includeFixed = searchParams.get('includeFixed') === 'true';

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to date parameters are required' },
        { status: 400 }
      );
    }

    // Load data from Supabase
    const { data: supabaseData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('sync_key', SYNC_KEY)
      .single();

    if (error) {
      console.error('Error loading data:', error);
      return NextResponse.json(
        { error: 'Failed to load expense data' },
        { status: 500 }
      );
    }

    if (!supabaseData) {
      return NextResponse.json(
        { error: 'No data found' },
        { status: 404 }
      );
    }

    const appData = JSON.parse(supabaseData.data);
    const allExpenses = appData.expenses || [];
    const fixedExpenses = appData.fixedExpenses || [];

    // Filter expenses by date range
    const filteredExpenses = allExpenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return expenseDate >= fromDate && expenseDate <= toDate;
    });

    // Generate CSV rows
    const headers = ['Date', 'Description', 'Category', 'Merchant', 'Amount', 'Tax Deductible', 'Type'];
    const csvRows = [headers.join(',')];

    // Add regular expenses
    const regularExpenseRows = filteredExpenses.map((expense: any) => 
      [
        expense.date, 
        `"${expense.description}"`, 
        expense.category, 
        expense.merchant || '', 
        expense.amount,
        expense.tax_deductible ? 'Yes' : 'No',
        'Regular'
      ].join(',')
    );
    csvRows.push(...regularExpenseRows);

    // Add fixed expenses if requested
    if (includeFixed) {
      const fixedExpenseRows = fixedExpenses.map((fixedExpense: any) => 
        [
          'Monthly', 
          `"${fixedExpense.description} (Fixed)"`, 
          fixedExpense.category, 
          '', 
          fixedExpense.amount,
          'Yes', // Fixed expenses are typically tax deductible
          'Fixed'
        ].join(',')
      );
      csvRows.push(...fixedExpenseRows);
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="expenses-${from}-to-${to}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting expenses:', error);
    return NextResponse.json(
      { error: 'Failed to export expense data' },
      { status: 500 }
    );
  }
}