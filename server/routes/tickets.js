import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendEmail, createNotification } from '../utils/notifications.js';

const router = express.Router();

// Get all tickets (with role-based filtering)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, assignedTo, search, dateFrom, dateTo, slaBreached, customerId } = req.query;
    const user = req.user;

    let where = {};

    // Customers can only see their own tickets
    if (user.role === 'CUSTOMER') {
      where.customerId = user.id;
    }

    // Agents can see only assigned tickets
    if (user.role === 'AGENT') {
      where.assignedAgentId = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedAgentId = assignedTo;
    }

    if (customerId && ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      where.customerId = customerId;
    }

    if (slaBreached === 'true') {
      where.slaBreached = true;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Full-text search (MySQL doesn't support case-insensitive mode, so we use contains)
    if (search) {
      const searchConditions = [
        { subject: { contains: search } },
        { description: { contains: search } },
      ];

      if (where.OR) {
        // If OR already exists (from AGENT role), combine with AND
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get SLA configuration for this priority
    const sla = await prisma.sLA.findUnique({
      where: { priority: ticket.priority }
    });
    ticket.sla = sla;

    // Check access permissions
    if (user.role === 'CUSTOMER' && ticket.customerId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Agents can only view their assigned tickets
    if (user.role === 'AGENT' && ticket.assignedAgentId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Filter internal comments for customers
    if (user.role === 'CUSTOMER') {
      ticket.comments = ticket.comments.filter(
        (comment) => comment.type === 'PUBLIC'
      );
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Create ticket (Customer)
router.post('/', authenticate, authorize('CUSTOMER'), async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const user = req.user;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority: priority || 'MEDIUM',
        customerId: user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log event
    await prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: user.id,
        type: 'TICKET_CREATED',
        meta: JSON.stringify({ subject: ticket.subject, priority: ticket.priority }),
      },
    });

    // Notify admins/agents
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'],
        },
      },
    });

    admins.forEach(async (admin) => {
      sendEmail(
        admin.email,
        'New Ticket Created',
        `A new ticket "${ticket.subject}" has been created by ${user.name}.`
      );
      await createNotification(
        admin.id,
        'TICKET_UPDATED',
        'New Ticket Created',
        `A new ticket "${ticket.subject}" has been created by ${user.name}.`,
        ticket.id
      );
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Update ticket (Agent/Admin)
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, description, priority, status, assignedAgentId } = req.body;
    const user = req.user;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Agents can only update tickets assigned to them
    if (user.role === 'AGENT' && ticket.assignedAgentId !== user.id && assignedAgentId !== user.id) {
      return res.status(403).json({ error: 'You can only update tickets assigned to you' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(subject && { subject }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(assignedAgentId !== undefined && { assignedAgentId }),
        // Set resolvedAt when status is RESOLVED or CLOSED
        ...(status && ['RESOLVED', 'CLOSED'].includes(status) && !ticket.resolvedAt && { resolvedAt: new Date() }),
        // Clear resolvedAt if status is changed back to something else
        ...(status && !['RESOLVED', 'CLOSED'].includes(status) && { resolvedAt: null }),
        // Set firstRespondedAt on first assignment if not already set
        ...(assignedAgentId && !ticket.firstRespondedAt && { firstRespondedAt: new Date() }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Log events (status/priority/assignment)
    const events = [];
    if (status && status !== ticket.status) {
      events.push({
        ticketId: id,
        actorId: user.id,
        type: 'STATUS_CHANGED',
        meta: JSON.stringify({ from: ticket.status, to: status }),
      });
    }
    if (priority && priority !== ticket.priority) {
      events.push({
        ticketId: id,
        actorId: user.id,
        type: 'PRIORITY_CHANGED',
        meta: JSON.stringify({ from: ticket.priority, to: priority }),
      });
    }
    if (assignedAgentId !== undefined && assignedAgentId !== ticket.assignedAgentId) {
      events.push({
        ticketId: id,
        actorId: user.id,
        type: assignedAgentId ? 'ASSIGNED' : 'UNASSIGNED',
        meta: JSON.stringify({ from: ticket.assignedAgentId, to: assignedAgentId }),
      });
    }
    if (events.length) {
      await prisma.ticketEvent.createMany({ data: events });
    }

    // Create notifications
    if (status && status !== ticket.status) {
      const customer = await prisma.user.findUnique({
        where: { id: ticket.customerId },
      });
      sendEmail(
        customer.email,
        'Ticket Status Updated',
        `Your ticket "${ticket.subject}" status has been updated to ${status}.`
      );
      await createNotification(
        customer.id,
        'TICKET_UPDATED',
        'Ticket Status Updated',
        `Your ticket "${ticket.subject}" status has been updated to ${status}.`,
        id
      );
    }

    if (assignedAgentId !== undefined && assignedAgentId !== ticket.assignedAgentId && assignedAgentId) {
      const assignedAgent = await prisma.user.findUnique({
        where: { id: assignedAgentId },
      });
      if (assignedAgent) {
        await createNotification(
          assignedAgent.id,
          'TICKET_ASSIGNED',
          'Ticket Assigned to You',
          `Ticket "${ticket.subject}" has been assigned to you.`,
          id
        );
      }
    }

    if (status === 'RESOLVED') {
      const customer = await prisma.user.findUnique({
        where: { id: ticket.customerId },
      });
      await createNotification(
        customer.id,
        'TICKET_RESOLVED',
        'Ticket Resolved',
        `Your ticket "${ticket.subject}" has been resolved.`,
        id
      );
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;
    const user = req.user;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Only agents/admins can create internal comments
    const commentType = type === 'INTERNAL' && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'].includes(user.role)
      ? 'INTERNAL'
      : 'PUBLIC';

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check access
    if (user.role === 'CUSTOMER' && ticket.customerId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        type: commentType,
        ticketId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Set firstRespondedAt if this is a public comment by an agent/admin and it's not already set
    if (commentType === 'PUBLIC' && ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'].includes(user.role) && !ticket.firstRespondedAt) {
      await prisma.ticket.update({
        where: { id },
        data: { firstRespondedAt: new Date() },
      });
    }

    // Log event
    await prisma.ticketEvent.create({
      data: {
        ticketId: id,
        actorId: user.id,
        type: 'COMMENT_ADDED',
        meta: JSON.stringify({ commentType }),
      },
    });

    // Notify relevant users
    if (commentType === 'PUBLIC') {
      if (user.role === 'CUSTOMER') {
        // Notify assigned agent or admins
        const notifyUsers = ticket.assignedAgentId
          ? [await prisma.user.findUnique({ where: { id: ticket.assignedAgentId } })]
          : await prisma.user.findMany({
            where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'AGENT'] } },
          });
        notifyUsers.forEach(async (notifyUser) => {
          if (notifyUser) {
            sendEmail(
              notifyUser.email,
              'New Comment on Ticket',
              `${user.name} commented on ticket "${ticket.subject}".`
            );
            await createNotification(
              notifyUser.id,
              'NEW_COMMENT',
              'New Comment on Ticket',
              `${user.name} commented on ticket "${ticket.subject}".`,
              id
            );
          }
        });
      } else {
        // Notify customer
        const customer = await prisma.user.findUnique({
          where: { id: ticket.customerId },
        });
        sendEmail(
          customer.email,
          'New Comment on Your Ticket',
          `A new comment has been added to your ticket "${ticket.subject}".`
        );
        await createNotification(
          customer.id,
          'NEW_COMMENT',
          'New Comment on Your Ticket',
          `A new comment has been added to your ticket "${ticket.subject}".`,
          id
        );
      }
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Update comment
router.put('/:ticketId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { ticketId, commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author or admins can edit
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
    if (comment.authorId !== user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:ticketId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { ticketId, commentId } = req.params;
    const user = req.user;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author or admins can delete
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
    if (comment.authorId !== user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Bulk update tickets
router.patch('/bulk-update', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'AGENT', 'MANAGER'), async (req, res) => {
  try {
    const { ticketIds, status, priority, assignedAgentId } = req.body;
    const user = req.user;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({ error: 'Ticket IDs array is required' });
    }

    // Build update data
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedAgentId !== undefined) updateData.assignedAgentId = assignedAgentId;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    // For agents, verify they can update these tickets
    if (user.role === 'AGENT') {
      const tickets = await prisma.ticket.findMany({
        where: { id: { in: ticketIds } },
      });

      const unauthorizedTickets = tickets.filter(
        (t) => t.assignedAgentId !== user.id && assignedAgentId !== user.id
      );

      if (unauthorizedTickets.length > 0) {
        return res.status(403).json({
          error: 'You can only update tickets assigned to you',
        });
      }
    }

    // Update tickets
    const updatedTickets = await prisma.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: updateData,
    });

    // Log events for each ticket
    const events = [];
    for (const ticketId of ticketIds) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) continue;

      if (status && status !== ticket.status) {
        events.push({
          ticketId,
          actorId: user.id,
          type: 'STATUS_CHANGED',
          meta: JSON.stringify({ from: ticket.status, to: status }),
        });
      }
      if (priority && priority !== ticket.priority) {
        events.push({
          ticketId,
          actorId: user.id,
          type: 'PRIORITY_CHANGED',
          meta: JSON.stringify({ from: ticket.priority, to: priority }),
        });
      }
      if (assignedAgentId !== undefined && assignedAgentId !== ticket.assignedAgentId) {
        events.push({
          ticketId,
          actorId: user.id,
          type: assignedAgentId ? 'ASSIGNED' : 'UNASSIGNED',
          meta: JSON.stringify({ from: ticket.assignedAgentId, to: assignedAgentId }),
        });
      }
    }

    if (events.length > 0) {
      await prisma.ticketEvent.createMany({ data: events });
    }

    res.json({
      message: `${updatedTickets.count} tickets updated successfully`,
      count: updatedTickets.count,
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update tickets' });
  }
});

// Ticket history / events
router.get('/:id/events', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    // Access check
    if (user.role === 'CUSTOMER' && ticket.customerId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const events = await prisma.ticketEvent.findMany({
      where: { ticketId: id },
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Get ticket events error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket history' });
  }
});

export default router;
