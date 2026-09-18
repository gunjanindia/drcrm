import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import { hashPassword, getCurrentUserSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // If logged in as a Client, only return the client's own record (IDOR protection)
  if (session.role === 'CLIENT') {
    let clientRecord = null;
    if (process.env.DATABASE_URL && prisma && session.clientId) {
      try {
        clientRecord = await prisma.client.findUnique({
          where: { id: session.clientId },
        });
      } catch (e) {}
    }
    if (!clientRecord && session.clientId) {
      clientRecord = globalStore.clients.find((c) => c.id === session.clientId);
    }
    if (!clientRecord && session.email) {
      clientRecord = globalStore.clients.find(
        (c) => c.email?.toLowerCase() === session.email.toLowerCase()
      );
    }
    return NextResponse.json({ success: true, data: clientRecord ? [clientRecord] : [] });
  }

  // Admin & Staff: Return all clients
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
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

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

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const subscriptionStatus = body.subscriptionStatus || 'TRIAL';
    const aiCreditBalance = typeof initialCredits === 'number' ? initialCredits : (body.aiCreditBalance ?? 50);

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
            aiCreditBalance,
            trialEndsAt,
            subscriptionStatus,
            isGbpLinked: !!body.isGbpLinked,
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
            aiCreditBalance,
            trialEndsAt,
            subscriptionStatus,
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
            aiCreditBalance,
            trialEndsAt,
            subscriptionStatus,
          },
        });

        createdClient = newClient;
      } catch (dbErr) {
        console.error('Prisma client creation failed, falling back to globalStore:', dbErr);
      }
    }

    // Always ensure client and client user exist in globalStore and file with passwordHash
    const finalClientId = createdClient?.id || `cli_${Date.now()}`;
    const storeClientRecord = {
      id: finalClientId,
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
      healthReason: 'Active account provisioned with Client 360 portal',
      monthlyRevenue: pkg.price,
      activeSince: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      reviewCount: typeof reviewCount === 'number' ? reviewCount : 24,
      averageRating: typeof averageRating === 'number' ? averageRating : 4.8,
      gbpScore: typeof gbpScore === 'number' ? gbpScore : 82,
      status: 'ACTIVE' as const,
      aiCreditBalance,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionStatus,
      isGbpLinked: !!body.isGbpLinked,
      createdAt: new Date().toISOString(),
    };

    const existingClientIdx = globalStore.clients.findIndex(
      (c) => c.id === finalClientId || c.email.toLowerCase() === cleanEmail
    );
    if (existingClientIdx !== -1) {
      globalStore.clients[existingClientIdx] = {
        ...globalStore.clients[existingClientIdx],
        ...storeClientRecord,
      };
    } else {
      globalStore.clients.unshift(storeClientRecord);
    }

    const storeUserRecord = {
      id: `usr_${finalClientId}`,
      tenantId: 'tenant_main',
      name: contactName?.trim() || businessName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: 'CLIENT' as const,
      clientId: finalClientId,
      department: 'Client Portal',
      passwordHash,
      aiCreditBalance,
      trialEndsAt: trialEndsAt.toISOString(),
      subscriptionStatus,
      createdAt: new Date().toISOString(),
    };

    const existingUserIdx = globalStore.users.findIndex(
      (u) => u.email.toLowerCase() === cleanEmail || u.clientId === finalClientId
    );
    if (existingUserIdx !== -1) {
      globalStore.users[existingUserIdx] = {
        ...globalStore.users[existingUserIdx],
        ...storeUserRecord,
      };
    } else {
      globalStore.users.unshift(storeUserRecord);
    }

    globalStore.saveToFile();
    if (!createdClient) createdClient = storeClientRecord;

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

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      status,
      healthScore,
      healthReason,
      monthlyRevenue,
      packageName,
      packageId,
      businessName,
      phone,
      email,
      googleMapsUrl,
      subscriptionStatus,
      aiCreditBalance,
      trialEndsAt,
      isGbpLinked,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // IDOR protection: Clients can only update their own record and cannot elevate admin fields
    if (session.role === 'CLIENT') {
      if (session.clientId !== id) {
        return NextResponse.json({ error: 'Forbidden: Cannot modify another client record' }, { status: 403 });
      }
    }

    let updatedClient: any = null;

    if (process.env.DATABASE_URL) {
      try {
        const updateData: any = {};
        if (session.role !== 'CLIENT') {
          if (status !== undefined) updateData.status = status;
          if (healthScore !== undefined) updateData.healthScore = healthScore;
          if (healthReason !== undefined) updateData.healthReason = healthReason;
          if (monthlyRevenue !== undefined) updateData.monthlyRevenue = Number(monthlyRevenue);
          if (packageName !== undefined) updateData.packageName = packageName;
          if (packageId !== undefined) updateData.packageId = packageId;
          if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
          if (aiCreditBalance !== undefined) updateData.aiCreditBalance = Number(aiCreditBalance);
          if (trialEndsAt !== undefined) updateData.trialEndsAt = new Date(trialEndsAt);
          if (isGbpLinked !== undefined) updateData.isGbpLinked = !!isGbpLinked;
        }
        if (businessName !== undefined) updateData.businessName = businessName;
        if (phone !== undefined) {
          updateData.phone = phone;
          updateData.whatsapp = phone;
        }
        if (email !== undefined) updateData.email = email;
        if (googleMapsUrl !== undefined) updateData.googleMapsUrl = googleMapsUrl;

        updatedClient = await prisma.client.update({
          where: { id },
          data: updateData,
        });
      } catch (dbErr) {
        console.error('Prisma PATCH client error, fallback to globalStore:', dbErr);
      }
    }

    // Update in globalStore as well
    const index = globalStore.clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      const isClientRole = session.role === 'CLIENT';
      globalStore.clients[index] = {
        ...globalStore.clients[index],
        ...(!isClientRole && status !== undefined && { status }),
        ...(!isClientRole && healthScore !== undefined && { healthScore }),
        ...(!isClientRole && healthReason !== undefined && { healthReason }),
        ...(!isClientRole && monthlyRevenue !== undefined && { monthlyRevenue: Number(monthlyRevenue) }),
        ...(!isClientRole && packageName !== undefined && { packageName }),
        ...(!isClientRole && packageId !== undefined && { packageId }),
        ...(businessName !== undefined && { businessName }),
        ...(phone !== undefined && { phone, whatsapp: phone }),
        ...(email !== undefined && { email }),
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(!isClientRole && subscriptionStatus !== undefined && { subscriptionStatus }),
        ...(!isClientRole && aiCreditBalance !== undefined && { aiCreditBalance: Number(aiCreditBalance) }),
        ...(!isClientRole && trialEndsAt !== undefined && { trialEndsAt }),
        ...(!isClientRole && isGbpLinked !== undefined && { isGbpLinked: !!isGbpLinked }),
      };
      globalStore.saveToFile();
      if (!updatedClient) updatedClient = globalStore.clients[index];
    }

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: `Client 360 portal status updated to ${status || 'updated'} successfully.`,
    });
  } catch (err: any) {
    console.error('PATCH /api/clients error:', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.role === 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      try {
        await prisma.$transaction([
          prisma.deliverableItem.deleteMany({ where: { clientId: id } }),
          prisma.taskComment.deleteMany({ where: { task: { clientId: id } } }),
          prisma.task.deleteMany({ where: { clientId: id } }),
          prisma.project.deleteMany({ where: { clientId: id } }),
          prisma.paymentRecord.deleteMany({ where: { clientId: id } }),
          prisma.invoiceItem.deleteMany({ where: { invoice: { clientId: id } } }),
          prisma.invoice.deleteMany({ where: { clientId: id } }),
          prisma.ticket.deleteMany({ where: { clientId: id } }),
          prisma.gbpProfile.deleteMany({ where: { clientId: id } }),
          prisma.recurringTaskRule.deleteMany({ where: { clientId: id } }),
          prisma.timelineActivity.deleteMany({ where: { clientId: id } }),
          prisma.user.deleteMany({ where: { clientId: id } }),
          prisma.client.delete({ where: { id } }),
        ]);
      } catch (dbErr) {
        console.error('Prisma DELETE client transaction error:', dbErr);
      }
    }

    // Clean up in globalStore
    globalStore.clients = globalStore.clients.filter((c) => c.id !== id);
    globalStore.users = globalStore.users.filter((u) => u.clientId !== id);
    globalStore.tasks = globalStore.tasks.filter((t) => t.clientId !== id);
    globalStore.deliverables = globalStore.deliverables.filter((d) => d.clientId !== id);
    globalStore.projects = globalStore.projects.filter((p) => p.clientId !== id);
    globalStore.invoices = globalStore.invoices.filter((i) => i.clientId !== id);
    globalStore.payments = globalStore.payments.filter((p) => p.clientId !== id);
    globalStore.tickets = globalStore.tickets.filter((t) => t.clientId !== id);
    globalStore.gbpProfiles = globalStore.gbpProfiles.filter((g) => g.clientId !== id);
    globalStore.activities = globalStore.activities.filter((a) => a.clientId !== id);
    globalStore.saveToFile();

    return NextResponse.json({
      success: true,
      message: 'Client 360 portal and all associated records deleted permanently.',
    });
  } catch (err: any) {
    console.error('DELETE /api/clients error:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
