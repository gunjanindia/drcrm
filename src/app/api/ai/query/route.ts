import { NextResponse } from 'next/server';
import { aiAssistantEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await aiAssistantEngine.queryOperationsAssistant(query);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'AI processing error' }, { status: 500 });
  }
}
