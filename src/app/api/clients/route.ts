import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: clients, source: 'NEON_POSTGRESQL' });
    }
  } catch (e: any) {
    console.error('Direct Prisma GET /api/clients error:', e);
  }

  await globalStore.syncFromDb();
  return NextResponse.json({ success: true, data: globalStore.clients });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, category, phone, email, city, address, packageId } = body;

    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const pkg = globalStore.packages.find((p) => p.id === packageId) || globalStore.packages[1] || { id: 'pkg_growth_999', name: 'Growth Accelerate', price: 999 };
    const manager = globalStore.users.find((u) => u.role === 'ACCOUNT_MANAGER') || globalStore.users[0] || { id: 'usr_super_admin', name: 'Gunjan Kumar' };

    if (process.env.DATABASE_URL) {
      const cleanPhone = (phone || '+91 9431100000').trim();
      const newClient = await prisma.client.create({
        data: {
          tenantId: 'tenant_main',
          businessName: businessName.trim(),
          legalName: `${businessName.trim()} Pvt Ltd`,
          category: category || 'Local Business',
          phone: cleanPhone,
          whatsapp: cleanPhone,
          email: email || `contact@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
          address: address || `${city || 'Ranchi'}, Jharkhand`,
          city: city || 'Ranchi',
          state: 'Jharkhand',
          pincode: '834001',
          assignedManagerId: manager.id,
          packageId: pkg.id,
          packageName: pkg.name,
          healthScore: 'GREEN',
          healthReason: 'Active account created in CRM',
          monthlyRevenue: pkg.price,
          activeSince: new Date(),
          renewalDate: new Date(Date.now() + 30 * 86400000),
          reviewCount: 0,
          averageRating: 5.0,
          gbpScore: 80,
          status: 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, data: newClient });
    }

    const fallbackClient = {
      id: `cli_${Date.now()}`,
      tenantId: 'tenant_main',
      businessName: businessName.trim(),
      legalName: `${businessName.trim()} Pvt Ltd`,
      category: category || 'Local Business',
      phone: phone || '+91 94311 00000',
      whatsapp: phone || '+91 94311 00000',
      email: email || `contact@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`,
      address: address || `${city || 'Ranchi'}, Jharkhand`,
      city: city || 'Ranchi',
      state: 'Jharkhand',
      pincode: '834001',
      assignedManagerId: manager.id,
      assignedManagerName: manager.name,
      packageId: pkg.id,
      packageName: pkg.name,
      healthScore: 'GREEN' as const,
      healthReason: 'Active account onboarded in CRM',
      monthlyRevenue: pkg.price,
      activeSince: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      reviewCount: 0,
      averageRating: 5.0,
      gbpScore: 80,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };

    globalStore.clients.unshift(fallbackClient);
    globalStore.saveToFile();
    return NextResponse.json({ success: true, data: fallbackClient });
  } catch (err: any) {
    console.error('POST /api/clients error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
