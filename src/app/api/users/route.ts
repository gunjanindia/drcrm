import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';
import { hashPassword } from '@/lib/auth';
import { UserRole } from '@/types';

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbUsers && dbUsers.length > 0) {
        return NextResponse.json({
          success: true,
          data: dbUsers.map((u) => ({
            id: u.id,
            tenantId: u.tenantId,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            department: u.department || undefined,
            avatarUrl: u.avatarUrl || undefined,
            clientId: u.clientId || undefined,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          })),
          source: 'NEON_POSTGRESQL',
        });
      }
    }
  } catch (e: any) {
    console.error('Direct Prisma GET /api/users error:', e);
  }

  await globalStore.syncFromDb().catch(() => {});
  return NextResponse.json({
    success: true,
    data: globalStore.users.map((u) => ({
      id: u.id,
      tenantId: u.tenantId,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      department: u.department,
      avatarUrl: u.avatarUrl,
      clientId: u.clientId,
      createdAt: u.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, department, password } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const userRole: UserRole = role || 'DELIVERY_EXECUTIVE';
    const plainPassword = password && password.trim() ? password.trim() : 'Password@123';
    const passwordHash = await hashPassword(plainPassword);

    let createdUser = null;

    if (process.env.DATABASE_URL) {
      try {
        // Ensure default tenant exists
        const tenant = await prisma.tenant.upsert({
          where: { domain: 'digitalranchi.in' },
          update: {},
          create: {
            id: 'tenant_main',
            name: 'Digital Ranchi',
            domain: 'digitalranchi.in',
            isActive: true,
          },
        });

        const dbUser = await prisma.user.upsert({
          where: { email: cleanEmail },
          update: {
            name: name.trim(),
            phone: cleanPhone,
            role: userRole,
            department: department?.trim() || null,
            passwordHash: passwordHash,
          },
          create: {
            tenantId: tenant.id,
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            role: userRole,
            department: department?.trim() || null,
            passwordHash: passwordHash,
            isActive: true,
          },
        });

        createdUser = {
          id: dbUser.id,
          tenantId: dbUser.tenantId,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: dbUser.role as UserRole,
          department: dbUser.department || undefined,
          passwordHash: dbUser.passwordHash,
          createdAt: dbUser.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString(),
        };
      } catch (dbErr: any) {
        console.error('Failed to create user in database:', dbErr);
      }
    }

    // Always update globalStore as well
    if (!createdUser) {
      createdUser = globalStore.createUser({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: userRole,
        department: department?.trim() || 'Operations',
        passwordHash,
      });
    } else {
      // Sync into memory store
      const existingIdx = globalStore.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      if (existingIdx >= 0) {
        globalStore.users[existingIdx] = createdUser;
      } else {
        globalStore.users.unshift(createdUser);
      }
      globalStore.saveToFile();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
        department: createdUser.department,
        createdAt: createdUser.createdAt,
      },
      message: `Staff account for ${name} created successfully. Default password is ${plainPassword}.`,
    });
  } catch (error: any) {
    console.error('Error creating staff user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, role, department, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;
    let passwordHash: string | undefined;
    if (password && password.trim()) {
      passwordHash = await hashPassword(password.trim());
    }

    if (process.env.DATABASE_URL) {
      try {
        await prisma.user.update({
          where: { id },
          data: {
            ...(name ? { name: name.trim() } : {}),
            ...(cleanEmail ? { email: cleanEmail } : {}),
            ...(cleanPhone ? { phone: cleanPhone } : {}),
            ...(role ? { role } : {}),
            ...(department !== undefined ? { department: department?.trim() || null } : {}),
            ...(passwordHash ? { passwordHash } : {}),
          },
        });
      } catch (dbErr) {
        console.error('Failed to update user in DB:', dbErr);
      }
    }

    // Update globalStore
    try {
      globalStore.updateUser(id, {
        ...(name ? { name: name.trim() } : {}),
        ...(cleanEmail ? { email: cleanEmail } : {}),
        ...(cleanPhone ? { phone: cleanPhone } : {}),
        ...(role ? { role } : {}),
        ...(department !== undefined ? { department: department?.trim() || undefined } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      });
    } catch {
      // User might only have existed in DB
    }

    return NextResponse.json({
      success: true,
      message: 'Staff user updated successfully.',
    });
  } catch (error: any) {
    console.error('Error updating staff user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      try {
        await prisma.user.delete({
          where: { id },
        });
      } catch (dbErr) {
        console.error('Failed to delete user from DB:', dbErr);
      }
    }

    globalStore.deleteUser(id);

    return NextResponse.json({
      success: true,
      message: 'Staff user deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting staff user:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
