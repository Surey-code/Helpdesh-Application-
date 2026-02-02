import prisma from '../config/database.js';
import { createNotification } from '../utils/notifications.js';
import { logActivity } from '../utils/activity.js';

export const checkSLA = async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        status: {
          notIn: ['RESOLVED', 'CLOSED'],
        },
      },
      include: {
        assignedAgent: true,
      },
    });

    const now = new Date();

    for (const ticket of tickets) {
      const sla = await prisma.sLA.findUnique({
        where: { priority: ticket.priority },
      });

      if (!sla) continue;

      const createdAt = new Date(ticket.createdAt);
      const responseDeadline = new Date(createdAt.getTime() + sla.responseTimeMinutes * 60000);
      const resolutionDeadline = new Date(createdAt.getTime() + sla.resolutionTimeMinutes * 60000);

      let slaBreached = false;

      // Check if response deadline passed (no comments yet)
      const hasComments = await prisma.comment.findFirst({
        where: { ticketId: ticket.id },
      });

      if (!hasComments && now > responseDeadline) {
        slaBreached = true;
      }

      // Check if resolution deadline passed
      if (now > resolutionDeadline) {
        slaBreached = true;
      }

      if (slaBreached !== ticket.slaBreached) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { slaBreached },
        });

        // Create notification if SLA breached
        if (slaBreached && ticket.assignedAgentId) {
          await createNotification(
            ticket.assignedAgentId,
            'SLA_BREACHED',
            'SLA Breached',
            `Ticket "${ticket.subject}" has breached its SLA deadline.`,
            ticket.id
          );
        }

        // Escalation: notify MANAGER/ADMIN/SUPER_ADMIN on breach (non-blocking)
        if (slaBreached) {
          const escalations = await prisma.user.findMany({
            where: { role: { in: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] }, isActive: true },
            select: { id: true },
          });

          await Promise.all(
            escalations.map((u) =>
              createNotification(
                u.id,
                'SLA_BREACHED',
                'SLA Escalation',
                `Ticket "${ticket.subject}" breached SLA and was escalated for attention.`,
                ticket.id
              )
            )
          );

          await logActivity({
            userId: null,
            action: 'SLA_ESCALATED',
            entity: 'Ticket',
            entityId: ticket.id,
            req,
            meta: { priority: ticket.priority, assignedAgentId: ticket.assignedAgentId || null },
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('SLA check error:', error);
    next();
  }
};
