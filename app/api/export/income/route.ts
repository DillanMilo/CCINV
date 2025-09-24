// Purpose: CSV export endpoint for income records
import { NextRequest, NextResponse } from 'next/server';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

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
        { error: 'Failed to load income data' },
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
    const allIncome = appData.income || [];

    // Filter income by date range
    const filteredIncome = allIncome.filter((income: any) => {
      const incomeDate = new Date(income.date);
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return incomeDate >= fromDate && incomeDate <= toDate;
    });

    // Generate CSV
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...filteredIncome.map((income: any) => 
        [income.date, `"${income.description}"`, income.category, income.amount].join(',')
      )
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="income-${from}-to-${to}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting income:', error);
    return NextResponse.json(
      { error: 'Failed to export income data' },
      { status: 500 }
    );
  }
}