import { NextResponse } from 'next/server';
import { getCurrentUserSession } from '@/lib/auth';
import { globalStore } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedClientId = searchParams.get('clientId');

    const targetClientId =
      session.role === 'CLIENT'
        ? (requestedClientId || session.clientId || globalStore.clients[0]?.id)
        : (requestedClientId || session.clientId || globalStore.clients[0]?.id);

    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const feedbacks = globalStore.getPrivateFeedbacks(targetClientId);
    const settings = globalStore.getAiReviewSettings(targetClientId);
    const telemetry = globalStore.getStandeeTelemetry(targetClientId);

    return NextResponse.json({
      success: true,
      data: {
        feedbacks,
        isShieldActive: settings.isShieldActive,
        totalIntercepted: telemetry.privateComplaintsIntercepted || feedbacks.length,
      },
    });
  } catch (err: any) {
    console.error('GET /api/portal/feedback error:', err);
    return NextResponse.json({ error: 'Failed to fetch private feedback' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feedbackId, status, resolutionNotes, isShieldActive, clientId } = body;

    const targetClientId =
      session.role === 'CLIENT'
        ? (session.clientId || clientId || globalStore.clients[0]?.id)
        : (clientId || session.clientId || globalStore.clients[0]?.id);

    // If updating master shield switch
    if (isShieldActive !== undefined && targetClientId) {
      globalStore.saveAiReviewSettings(targetClientId, { isShieldActive: !!isShieldActive });
    }

    // If updating a specific feedback status
    let updatedFeedback = null;
    if (feedbackId && status) {
      const feedback = globalStore.privateFeedbacks.find((f) => f.id === feedbackId);
      if (!feedback) {
        return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
      }

      // IDOR protection
      if (session.role === 'CLIENT' && feedback.clientId !== session.clientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      updatedFeedback = globalStore.updatePrivateFeedbackStatus(feedbackId, status, resolutionNotes);
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback record updated successfully.',
      data: updatedFeedback,
    });
  } catch (err: any) {
    console.error('PATCH /api/portal/feedback error:', err);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
