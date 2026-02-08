import { NextRequest, NextResponse } from 'next/server';
import { BusinessIntelligence } from '@/lib/apis/business-intelligence';

export async function GET(request: NextRequest) {
  try {
    // Get API credentials from environment
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const metaToken = process.env.META_ACCESS_TOKEN;
    const metaAdAccountId = process.env.META_AD_ACCOUNT_ID;
    const qbToken = process.env.QB_ACCESS_TOKEN;
    const qbRealmId = process.env.QB_REALM_ID;

    // Initialize BI engine
    const bi = new BusinessIntelligence(
      ghlToken,
      ghlLocationId,
      metaToken,
      metaAdAccountId,
      qbToken,
      qbRealmId
    );

    // Get dashboard data
    const data = await bi.getDashboardData();

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
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