// Purpose: Client-side PDF generation endpoint
import { NextRequest, NextResponse } from 'next/server';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    console.log('Client PDF request for invoice ID:', invoiceId);
    
    // Load data from Supabase
    const { data: supabaseData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('sync_key', SYNC_KEY)
      .single();

    if (error) {
      console.error('Error loading data:', error);
      return NextResponse.json(
        { error: 'Failed to load invoice data', details: error.message },
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
    const invoice = appData.invoices.find((inv: any) => inv.id === invoiceId);
    const profile = appData.profile;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Return invoice data for client-side PDF generation
    return NextResponse.json({
      invoice,
      profile
    });

  } catch (error) {
    console.error('Error loading invoice data:', error);
    return NextResponse.json(
      { error: 'Failed to load invoice data' },
      { status: 500 }
    );
  }
}
