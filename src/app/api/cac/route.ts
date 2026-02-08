import { NextRequest, NextResponse } from 'next/server';
import { BusinessIntelligence } from '@/lib/apis/business-intelligence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current_month';

    // Get API credentials from environment
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const metaToken = process.env.META_ACCESS_TOKEN;
    const metaAdAccountId = process.env.META_AD_ACCOUNT_ID;

    // Initialize BI engine
    const bi = new BusinessIntelligence(
      ghlToken,
      ghlLocationId,
      metaToken,
      metaAdAccountId
    );

    // Calculate CAC
    const cacData = await bi.calculatePeriodCAC(period);

    return NextResponse.json({
      success: true,
      data: cacData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('CAC API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
}