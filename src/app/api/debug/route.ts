import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    // Debug: Check what we're getting
    console.log('GHL_TOKEN exists:', !!ghlToken);
    console.log('GHL_TOKEN length:', ghlToken?.length);
    console.log('GHL_TOKEN first 10:', ghlToken?.substring(0, 10));
    console.log('LOCATION_ID:', ghlLocationId);
    
    if (!ghlToken || !ghlLocationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        debug: {
          hasToken: !!ghlToken,
          hasLocation: !!ghlLocationId
        }
      }, { status: 500 });
    }
    
    // Test direct API call
    const testUrl = `https://rest.gohighlevel.com/v1/contacts?locationId=${ghlLocationId}&limit=1`;
    console.log('Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GHL Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('GHL Error:', errorText);
      return NextResponse.json({
        success: false,
        error: `GHL API error: ${response.status}`,
        details: errorText,
        debug: {
          tokenPrefix: ghlToken.substring(0, 10),
          locationId: ghlLocationId
        }
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'GHL API connection successful',
      contactsCount: data.contacts?.length || 0,
      total: data.total || 0
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
