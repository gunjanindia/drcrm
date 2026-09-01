import { NextResponse } from 'next/server';
import { globalStore } from '@/lib/store';

export async function GET() {
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

    const pkg = globalStore.packages.find((p) => p.id === packageId) || globalStore.packages[1];
    const manager = globalStore.users.find((u) => u.role === 'ACCOUNT_MANAGER') || globalStore.users[0];

    const newClient = {
      id: `cli_${Date.now()}`,
      tenantId: 'tenant_main',
      businessName: businessName.trim(),
      legalName: `${businessName.trim()} LLP`,
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

    globalStore.clients.unshift(newClient);
    globalStore.saveToFile();
    return NextResponse.json({ success: true, data: newClient });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
