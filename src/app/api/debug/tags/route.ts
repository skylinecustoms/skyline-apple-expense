import { NextRequest, NextResponse } from 'next/server';
import { GHLAPI } from '@/lib/apis/ghl';

export async function GET(request: NextRequest) {
  try {
    const ghlToken = process.env.GHL_API_TOKEN;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    if (!ghlToken || !ghlLocationId) {
      return NextResponse.json({ error: 'Missing GHL credentials' }, { status: 500 });
    }
    
    const ghl = new GHLAPI(ghlToken, ghlLocationId);
    
    // Get ALL unique tags from recent contacts
    const allContacts = await ghl.getAllContacts();
    
    const tagCounts: Record<string, number> = {};
    const recentContacts = allContacts.slice(0, 50); // Last 50 contacts
    
    for (const contact of recentContacts) {
      const tags = contact.tags || [];
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    
    // Sort by count
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
    
    // Show sample contacts with their tags
    const samples = recentContacts.slice(0, 10).map(c => ({
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
      dateAdded: c.dateAdded,
      tags: c.tags || []
    }));
    
    // Show only facebook and organic leads with dates
    const leadContacts = allContacts.filter(c => {
      const tags = c.tags || [];
      return tags.includes('facebook') || tags.includes('organic');
    }).slice(0, 30).map(c => ({
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
      dateAdded: c.dateAdded,
      dateCreated: c.dateCreated,
      tags: (c.tags || []).filter((t: string) => t === 'facebook' || t === 'organic')
    }));
    
    return NextResponse.json({
      success: true,
      total_contacts_checked: allContacts.length,
      top_tags: sortedTags,
      sample_contacts: samples,
      facebook_organic_leads: leadContacts
    });
    
  } catch (error) {
    console.error('Debug tags error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
