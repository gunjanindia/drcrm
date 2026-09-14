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

import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessName,
      contactName,
      category,
      phone,
      email,
      city,
      address,
      googleMapsUrl,
      averageRating,
      reviewCount,
      gbpScore,
      packageId,
      password = 'Client@1234',
      initialCredits = 100,
    } = body;

    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const cleanPhone = (phone || '+91 9431100000').trim();
    const cleanEmail = (email || `contact@${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`).trim().toLowerCase();
    const cleanPassword = password.trim() || 'Client@1234';
    const passwordHash = await hashPassword(cleanPassword);

    const pkg = globalStore.packages.find((p) => p.id === packageId) || globalStore.packages[1] || { id: 'pkg_growth_999', name: 'Growth Accelerate', price: 999 };
    const manager = globalStore.users.find((u) => u.role === 'ACCOUNT_MANAGER') || globalStore.users[0] || { id: 'usr_super_admin', name: 'Gunjan Kumar' };

    let createdClient: any = null;

    if (process.env.DATABASE_URL) {
      try {
        const newClient = await prisma.client.create({
          data: {
            tenantId: 'tenant_main',
            businessName: businessName.trim(),
            legalName: `${businessName.trim()} Pvt Ltd`,
            category: category || 'Local Business',
            phone: cleanPhone,
            whatsapp: cleanPhone,
            email: cleanEmail,
            address: address || `${city || 'Ranchi'}, Jharkhand`,
            city: city || 'Ranchi',
            state: 'Jharkhand',
            pincode: '834001',
            googleMapsUrl: googleMapsUrl || undefined,
            assignedManagerId: manager.id,
            packageId: pkg.id,
            packageName: pkg.name,
            healthScore: 'GREEN',
            healthReason: 'Active account provisioned with Client 360 portal',
            monthlyRevenue: pkg.price,
            activeSince: new Date(),
            renewalDate: new Date(Date.now() + 30 * 86400000),
            reviewCount: typeof reviewCount === 'number' ? reviewCount : 24,
            averageRating: typeof averageRating === 'number' ? averageRating : 4.8,
            gbpScore: typeof gbpScore === 'number' ? gbpScore : 82,
            status: 'ACTIVE',
          },
        });

        // Create or update linked CLIENT User
        await prisma.user.upsert({
          where: { email: cleanEmail },
          update: {
            name: contactName?.trim() || businessName.trim(),
            phone: cleanPhone,
            passwordHash,
            role: 'CLIENT',
            clientId: newClient.id,
          },
          create: {
            tenantId: 'tenant_main',
            name: contactName?.trim() || businessName.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash,
            role: 'CLIENT',
            clientId: newClient.id,
            department: 'Client Portal',
          },
        });

        createdClient = newClient;
      } catch (dbErr) {
        console.error('Prisma client creation failed, falling back to globalStore:', dbErr);
      }
    }

    if (!createdClient) {
      const fallbackClient = {
        id: `cli_${Date.now()}`,
        tenantId: 'tenant_main',
        businessName: businessName.trim(),
        legalName: `${businessName.trim()} Pvt Ltd`,
        category: category || 'Local Business',
        phone: cleanPhone,
        whatsapp: cleanPhone,
        email: cleanEmail,
        address: address || `${city || 'Ranchi'}, Jharkhand`,
        city: city || 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        googleMapsUrl: googleMapsUrl || undefined,
        assignedManagerId: manager.id,
        assignedManagerName: manager.name,
        packageId: pkg.id,
        packageName: pkg.name,
        healthScore: 'GREEN' as const,
        healthReason: 'Active account onboarded in CRM',
        monthlyRevenue: pkg.price,
        activeSince: new Date().toISOString(),
        renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        reviewCount: typeof reviewCount === 'number' ? reviewCount : 24,
        averageRating: typeof averageRating === 'number' ? averageRating : 4.8,
        gbpScore: typeof gbpScore === 'number' ? gbpScore : 82,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
      };

      globalStore.clients.unshift(fallbackClient);

      // Create linked client user in store
      globalStore.users.unshift({
        id: `usr_${fallbackClient.id}`,
        tenantId: 'tenant_main',
        name: contactName?.trim() || businessName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: 'CLIENT',
        clientId: fallbackClient.id,
        department: 'Client Portal',
        passwordHash,
        createdAt: new Date().toISOString(),
      });

      globalStore.saveToFile();
      createdClient = fallbackClient;
    }

    return NextResponse.json({
      success: true,
      data: createdClient,
      credentials: {
        loginIdentifier: cleanEmail,
        mobileNumber: cleanPhone,
        password: cleanPassword,
        loginUrl: '/login',
      },
      message: 'Client 360 Portal provisioned and client user account created successfully!',
    });
  } catch (err: any) {
    console.error('POST /api/clients error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
