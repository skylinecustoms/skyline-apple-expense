import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    if (!ghlToken || !ghlLocationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        debug: { hasToken: !!ghlToken, hasLocation: !!ghlLocationId }
      }, { status: 500 });
    }
    
    // Test v1 API (Bearer token)
    const v1Url = `https://rest.gohighlevel.com/v1/contacts?locationId=${ghlLocationId}&limit=1`;
    const v1Response = await fetch(v1Url, {
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test v2 API (Private token in header)
    const v2Url = `https://services.leadconnectorhq.com/contacts?locationId=${ghlLocationId}&limit=1`;
    const v2Response = await fetch(v2Url, {
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    // Test v2 with Token header (alternative auth)
    const v2bUrl = `https://services.leadconnectorhq.com/contacts?locationId=${ghlLocationId}&limit=1`;
    const v2bResponse = await fetch(v2bUrl, {
      headers: {
        'Token': `${ghlToken}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      }
    });
    
    return NextResponse.json({
      success: true,
      tests: {
        v1: { status: v1Response.status, ok: v1Response.ok },
        v2_bearer: { status: v2Response.status, ok: v2Response.ok },
        v2_token: { status: v2bResponse.status, ok: v2bResponse.ok }
      },
      debug: {
        tokenPrefix: ghlToken.substring(0, 10),
        tokenLength: ghlToken.length,
        locationId: ghlLocationId,
        locationLength: ghlLocationId.length
      }
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
