// Purpose: CSV export endpoint for income records
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

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

    const supabase = createClient();
    
    // TODO: Replace with actual Supabase query when income table exists
    const mockData = [
      {
        date: '2024-12-15',
        description: 'Website Development - Acme Corp',
        category: 'Services',
        amount: 2500.00,
      },
      {
        date: '2024-12-20',
        description: 'Client appreciation tip',
        category: 'Tips',
        amount: 150.00,
      },
    ];

    // Generate CSV
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...mockData.map(row => 
        [row.date, `"${row.description}"`, row.category, row.amount].join(',')
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