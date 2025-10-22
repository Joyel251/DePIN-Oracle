import { NextRequest, NextResponse } from 'next/server';
import { analyzeHeliumHotspot } from '@/lib/api/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, network, topicId } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Device address is required' },
        { status: 400 }
      );
    }

    if (!network || network !== 'helium') {
      return NextResponse.json(
        { error: 'Only Helium network is currently supported' },
        { status: 400 }
      );
    }

    const result = await analyzeHeliumHotspot(address, topicId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze device' },
      { status: 500 }
    );
  }
}
