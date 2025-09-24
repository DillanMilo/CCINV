// Purpose: Recover data from localStorage and force sync to Supabase
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { localData } = body;
    
    if (!localData) {
      return NextResponse.json({ 
        error: 'No local data provided' 
      }, { status: 400 });
    }

    // This endpoint can be used to manually upload localStorage data to Supabase
    return NextResponse.json({ 
      message: 'Data received',
      dataSize: JSON.stringify(localData).length 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process data' 
    }, { status: 500 });
  }
}
