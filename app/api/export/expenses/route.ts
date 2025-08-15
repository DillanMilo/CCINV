// Purpose: CSV export endpoint for expense records
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
    
    // TODO: Replace with actual Supabase query when expenses table exists
    const mockData = [
      {
        date: '2024-12-01',
        description: 'Adobe Creative Cloud Subscription',
        category: 'Software',
        merchant: 'Adobe',
        amount: 89.99,
      },
      {
        date: '2024-12-15',
        description: 'Client meeting lunch',
        category: 'Meals & Entertainment',
        merchant: 'Corner Bistro',
        amount: 45.20,
      },
    ];

    // Generate CSV
    const headers = ['Date', 'Description', 'Category', 'Merchant', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...mockData.map(row => 
        [row.date, `"${row.description}"`, row.category, row.merchant || '', row.amount].join(',')
      )
    ];

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