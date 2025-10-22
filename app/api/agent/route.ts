import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/agent/depinAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get AI agent instance
    const agent = getAgent();

    // Process query through agent
    const result = await agent.processQuery({ message, context });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent processing failed' },
      { status: 500 }
    );
  }
}
