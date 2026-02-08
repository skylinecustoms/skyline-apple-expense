import { NextResponse } from 'next/server';
import { autoRefreshQBToken } from '@/lib/qb-auth-refresh';

export async function POST() {
  try {
    console.log('🔄 Starting QB token refresh...');
    await autoRefreshQBToken();
    
    return NextResponse.json({
      success: true,
      message: 'QuickBooks token refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('QB refresh API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'QB token refresh endpoint. Use POST to trigger refresh.',
    status: 'ready'
  });
}