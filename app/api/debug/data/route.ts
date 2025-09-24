// Purpose: Debug endpoint to check what data exists in Supabase
import { NextRequest, NextResponse } from 'next/server';
import { supabase, SYNC_KEY } from '@/lib/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking data with SYNC_KEY:', SYNC_KEY);
    
    const { data: supabaseData, error } = await supabase
      .from('app_data')
      .select('*')
      .eq('sync_key', SYNC_KEY)
      .single();

    if (error) {
      console.error('Debug: Supabase error:', error);
      return NextResponse.json({
        error: true,
        details: error,
        sync_key: SYNC_KEY
      });
    }

    if (!supabaseData) {
      return NextResponse.json({
        error: false,
        message: 'No data found',
        sync_key: SYNC_KEY
      });
    }

    const appData = JSON.parse(supabaseData.data);
    
    return NextResponse.json({
      error: false,
      sync_key: SYNC_KEY,
      data_found: true,
      invoice_count: appData.invoices?.length || 0,
      expense_count: appData.expenses?.length || 0,
      income_count: appData.income?.length || 0,
      invoice_ids: appData.invoices?.map((inv: any) => ({
        id: inv.id,
        number: inv.invoice_number,
        client: inv.client_name
      })) || [],
      last_sync: appData.lastSync
    });

  } catch (error) {
    console.error('Debug: Unexpected error:', error);
    return NextResponse.json({
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error',
      sync_key: SYNC_KEY
    });
  }
}
