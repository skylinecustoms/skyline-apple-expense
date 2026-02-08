import { NextRequest, NextResponse } from 'next/server';
import { GHLAPI } from '@/lib/apis/ghl';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'yesterday';
    
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    if (!ghlToken || !ghlLocationId) {
      return NextResponse.json({ error: 'Missing GHL credentials' }, { status: 500 });
    }
    
    const ghl = new GHLAPI(ghlToken, ghlLocationId);
    const periodData = await ghl.getPeriodBusinessData(period);
    
    return NextResponse.json({
      success: true,
      period,
      total_leads: periodData.total_contacts,
      hot_leads: periodData.hot_leads.total,
      leads_by_source: periodData.leads_by_source,
      customers: periodData.customers.total_paying
    });
    
  } catch (error) {
    console.error('Debug leads error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
