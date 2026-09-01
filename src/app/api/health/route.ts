import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const isDbConfigured = Boolean(process.env.DATABASE_URL);
    
    if (!isDbConfigured) {
      return NextResponse.json({
        status: 'WARNING',
        message: 'DATABASE_URL environment variable is missing on this server instance.',
        dbConnected: false,
      });
    }

    const [leads, clients, users, tasks] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.client.findMany(),
      prisma.user.findMany(),
      prisma.task.findMany(),
    ]);

    return NextResponse.json({
      status: 'HEALTHY',
      dbConnected: true,
      timestamp: new Date().toISOString(),
      counts: {
        leads: leads.length,
        clients: clients.length,
        users: users.length,
        tasks: tasks.length,
      },
      liveLeads: leads.map((l: any) => ({
        id: l.id,
        businessName: l.businessName,
        contactName: l.contactName,
        phone: l.phone,
        status: l.status,
        auditScore: l.auditScore,
        createdAt: l.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'DATABASE_ERROR',
      dbConnected: false,
      error: error?.message || 'Failed to query database',
    }, { status: 500 });
  }
}
