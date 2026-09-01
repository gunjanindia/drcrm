import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ success: true, data: globalStore.tasks });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = globalStore.createTask(body);
    return NextResponse.json({ success: true, data: task });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    const updated = globalStore.updateTask(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update task' }, { status: 500 });
  }
}
