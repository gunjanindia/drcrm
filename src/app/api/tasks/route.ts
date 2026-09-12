import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalStore } from '@/lib/store';

export async function GET() {
  try {
    if (process.env.DATABASE_URL) {
      const tasks = await prisma.task.findMany({
        include: { client: true, assignedTo: true },
        orderBy: { createdAt: 'desc' },
      });

      const mappedTasks = tasks.map((t) => ({
        id: t.id,
        tenantId: t.tenantId,
        clientId: t.clientId,
        clientName: t.client?.businessName || 'Client Account',
        projectId: t.projectId || undefined,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        assignedToId: t.assignedToId,
        assignedToName: t.assignedTo?.name || (t.assignedToId === 'usr_del_exec1' ? 'Rohan Gupta' : 'Amit Kumar'),
        slaDeadline: t.slaDeadline?.toISOString(),
        dueDate: t.dueDate?.toISOString(),
        deliverableUrl: t.deliverableUrl || undefined,
        deliverableType: t.deliverableType || undefined,
        approvalStatus: t.approvalStatus || undefined,
        approvalComment: t.approvalComment || undefined,
        completedAt: t.completedAt?.toISOString(),
        isRecurring: t.isRecurring,
        createdAt: t.createdAt?.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: mappedTasks,
        source: 'NEON_POSTGRESQL',
        count: mappedTasks.length,
      });
    }
  } catch (e: any) {
    console.error('Direct Prisma GET /api/tasks error:', e);
  }

  await globalStore.syncFromDb();
  return NextResponse.json({ success: true, data: globalStore.tasks, source: 'FALLBACK_STORE' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, clientId, priority, status, assignedToId, dueDate, slaDeadline } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      // Find a valid client in DB
      let targetClientId = clientId;
      const clientExists = targetClientId
        ? await prisma.client.findUnique({ where: { id: targetClientId } }).catch(() => null)
        : null;

      if (!clientExists) {
        const firstClient = await prisma.client.findFirst().catch(() => null);
        if (firstClient) {
          targetClientId = firstClient.id;
        } else {
          // create default client if none exists
          const defaultClient = await prisma.client.create({
            data: {
              tenantId: 'tenant_main',
              businessName: body.clientName || 'General Operations Account',
              legalName: 'General Operations Account',
              category: 'Local Business',
              phone: '+91 70047 00318',
              whatsapp: '+91 70047 00318',
              email: 'operations@digitalranchi.in',
              address: 'Ranchi, Jharkhand',
              city: 'Ranchi',
              state: 'Jharkhand',
              pincode: '834001',
              assignedManagerId: 'usr_super_admin',
              packageId: 'pkg_growth_999',
              packageName: 'Growth Kickstart',
              monthlyRevenue: 999.0,
              renewalDate: new Date(Date.now() + 30 * 86400000),
            },
          }).catch(() => null);
          if (defaultClient) targetClientId = defaultClient.id;
        }
      }

      // Find a valid user in DB
      let targetAssigneeId = assignedToId;
      const userExists = targetAssigneeId
        ? await prisma.user.findUnique({ where: { id: targetAssigneeId } }).catch(() => null)
        : null;

      if (!userExists) {
        const firstUser = await prisma.user.findFirst({ where: { role: { not: 'CLIENT' } } }).catch(() => null);
        targetAssigneeId = firstUser ? firstUser.id : 'usr_super_admin';
      }

      const newTask = await prisma.task.create({
        data: {
          tenantId: 'tenant_main',
          clientId: targetClientId,
          title: title.trim(),
          description: (description || title).trim(),
          priority: priority || 'MEDIUM',
          status: status || 'ASSIGNED',
          assignedToId: targetAssigneeId,
          slaDeadline: slaDeadline ? new Date(slaDeadline) : new Date(Date.now() + 86400000),
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000),
          isRecurring: false,
        },
        include: { client: true, assignedTo: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: newTask.id,
          tenantId: newTask.tenantId,
          clientId: newTask.clientId,
          clientName: newTask.client?.businessName || body.clientName || 'Client Account',
          projectId: newTask.projectId || undefined,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: newTask.status,
          assignedToId: newTask.assignedToId,
          assignedToName: newTask.assignedTo?.name || 'Assigned User',
          slaDeadline: newTask.slaDeadline.toISOString(),
          dueDate: newTask.dueDate.toISOString(),
          completedAt: newTask.completedAt?.toISOString(),
          isRecurring: newTask.isRecurring,
          createdAt: newTask.createdAt.toISOString(),
        },
      });
    }

    const task = await globalStore.createTask(body);
    return NextResponse.json({ success: true, data: task });
  } catch (err: any) {
    console.error('POST /api/tasks error:', err);
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

    if (process.env.DATABASE_URL) {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.status !== undefined) {
        updateData.status = updates.status;
        if (updates.status === 'COMPLETED') {
          updateData.completedAt = new Date();
        } else if (updates.completedAt !== undefined) {
          updateData.completedAt = updates.completedAt ? new Date(updates.completedAt) : null;
        }
      }
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.assignedToId !== undefined) {
        const userExists = await prisma.user.findUnique({ where: { id: updates.assignedToId } }).catch(() => null);
        if (userExists) {
          updateData.assignedToId = updates.assignedToId;
        }
      }
      if (updates.dueDate !== undefined) updateData.dueDate = new Date(updates.dueDate);
      if (updates.slaDeadline !== undefined) updateData.slaDeadline = new Date(updates.slaDeadline);
      if (updates.deliverableUrl !== undefined) updateData.deliverableUrl = updates.deliverableUrl;
      if (updates.deliverableType !== undefined) updateData.deliverableType = updates.deliverableType;
      if (updates.approvalStatus !== undefined) updateData.approvalStatus = updates.approvalStatus;
      if (updates.approvalComment !== undefined) updateData.approvalComment = updates.approvalComment;

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
        include: { client: true, assignedTo: true },
      });

      // Update in-memory fallback store if present
      const storeIdx = globalStore.tasks.findIndex((t) => t.id === id);
      if (storeIdx !== -1) {
        globalStore.tasks[storeIdx] = {
          ...globalStore.tasks[storeIdx],
          ...updates,
          status: updatedTask.status as any,
          completedAt: updatedTask.completedAt?.toISOString(),
        };
        globalStore.saveToFile();
      }

      return NextResponse.json({
        success: true,
        data: {
          id: updatedTask.id,
          tenantId: updatedTask.tenantId,
          clientId: updatedTask.clientId,
          clientName: updatedTask.client?.businessName || 'Client Account',
          projectId: updatedTask.projectId || undefined,
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          assignedToId: updatedTask.assignedToId,
          assignedToName: updatedTask.assignedTo?.name || 'Assigned User',
          slaDeadline: updatedTask.slaDeadline?.toISOString(),
          dueDate: updatedTask.dueDate?.toISOString(),
          deliverableUrl: updatedTask.deliverableUrl || undefined,
          deliverableType: updatedTask.deliverableType || undefined,
          approvalStatus: updatedTask.approvalStatus || undefined,
          approvalComment: updatedTask.approvalComment || undefined,
          completedAt: updatedTask.completedAt?.toISOString(),
          isRecurring: updatedTask.isRecurring,
          createdAt: updatedTask.createdAt?.toISOString(),
        },
      });
    }

    const updated = await globalStore.updateTask(id, updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('PATCH /api/tasks error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await prisma.task.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: 'Task deleted permanently from Neon database' });
    }

    const index = globalStore.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      globalStore.tasks.splice(index, 1);
      globalStore.saveToFile();
    }
    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/tasks error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete task' }, { status: 500 });
  }
}
