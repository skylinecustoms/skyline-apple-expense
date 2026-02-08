import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'qb-manual-data.json');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate data structure
    const requiredPeriods = ['last_7_days', 'last_30_days', 'current_month', 'january'];
    for (const period of requiredPeriods) {
      if (!data[period] || typeof data[period].revenue !== 'number') {
        return NextResponse.json(
          { error: `Missing or invalid revenue for ${period}` },
          { status: 400 }
        );
      }
    }
    
    // Save to file
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'QB data updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save QB data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({
      last_7_days: { revenue: 0, expenses: 0 },
      last_30_days: { revenue: 0, expenses: 0 },
      current_month: { revenue: 0, expenses: 0 },
      january: { revenue: 0, expenses: 0 }
    });
  }
}