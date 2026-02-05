import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'), async (req, res) => {
  try {
    const user = req.user;
    const days = parseInt(req.query.days) || 30;

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let where = {
      createdAt: {
        gte: startDate
      }
    };

    // Agents see only their assigned tickets
    if (user.role === 'AGENT') {
      where.assignedAgentId = user.id;
    }

    // Get ticket counts by status
    const statusCounts = await prisma.ticket.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    // Get ticket counts by priority
    const priorityCounts = await prisma.ticket.groupBy({
      by: ['priority'],
      where,
      _count: {
        id: true,
      },
    });

    // Get SLA breached tickets
    const slaBreachedCount = await prisma.ticket.count({
      where: {
        ...where,
        slaBreached: true,
        status: {
          notIn: ['RESOLVED', 'CLOSED'],
        },
      },
    });

    // Get total tickets
    const totalTickets = await prisma.ticket.count({ where });

    // Get agent performance (ticket counts per agent within the timeframe)
    const agentPerformance = await prisma.user.findMany({
      where: {
        role: {
          in: ['AGENT', 'MANAGER', 'ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        assignedTickets: {
          where: {
            createdAt: {
              gte: startDate
            }
          },
          select: {
            id: true
          }
        }
      }
    });

    const formattedPerformance = agentPerformance.map(agent => ({
      id: agent.id,
      name: agent.name,
      isActive: agent.isActive,
      ticketCount: agent.assignedTickets?.length || 0
    }));

    // Get recent tickets within timeframe
    let recentTicketsWhere = { ...where };
    if (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role)) {
      recentTicketsWhere.assignedAgentId = null;
    }

    const recentTickets = await prisma.ticket.findMany({
      where: recentTicketsWhere,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get average response time and resolution time
    const ticketsWithMetrics = await prisma.ticket.findMany({
      where: {
        ...where,
        OR: [
          { firstRespondedAt: { not: null } },
          { resolvedAt: { not: null } }
        ]
      },
      select: {
        createdAt: true,
        firstRespondedAt: true,
        resolvedAt: true
      }
    });

    let totalResponseTime = 0;
    let respondedCount = 0;
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    ticketsWithMetrics.forEach(ticket => {
      if (ticket.firstRespondedAt) {
        totalResponseTime += (ticket.firstRespondedAt - ticket.createdAt);
        respondedCount++;
      }
      if (ticket.resolvedAt) {
        totalResolutionTime += (ticket.resolvedAt - ticket.createdAt);
        resolvedCount++;
      }
    });

    const averageResponseTime = respondedCount > 0 ? (totalResponseTime / respondedCount / (1000 * 60)) : 0; // In minutes
    const averageResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount / (1000 * 60)) : 0; // In minutes

    // Get tickets by date for the trend chart
    const ticketsByDate = await prisma.ticket.findMany({
      where,
      select: {
        createdAt: true,
        status: true,
      },
    });

    res.json({
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      }, {}),
      priorityCounts: priorityCounts.reduce((acc, item) => {
        acc[item.priority] = item._count.id;
        return acc;
      }, {}),
      slaBreachedCount,
      totalTickets,
      recentTickets,
      ticketsByDate,
      agentPerformance: formattedPerformance,
      averageResponseTime,
      averageResolutionTime,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get SLA statistics
router.get('/sla', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const slaBreached = await prisma.ticket.findMany({
      where: {
        slaBreached: true,
        status: {
          notIn: ['RESOLVED', 'CLOSED'],
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedAgent: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({ slaBreached });
  } catch (error) {
    console.error('SLA stats error:', error);
    res.status(500).json({ error: 'Failed to fetch SLA statistics' });
  }
});

export default router;
