import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all SLAs
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const slas = await prisma.sLA.findMany({
      orderBy: { priority: 'asc' },
    });

    res.json(slas);
  } catch (error) {
    console.error('Get SLAs error:', error);
    res.status(500).json({ error: 'Failed to fetch SLAs' });
  }
});

// Update SLA
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { responseTimeMinutes, resolutionTimeMinutes } = req.body;

    if (!responseTimeMinutes || !resolutionTimeMinutes) {
      return res.status(400).json({ error: 'Response time and resolution time are required' });
    }

    const sla = await prisma.sLA.update({
      where: { id },
      data: {
        responseTimeMinutes,
        resolutionTimeMinutes,
      },
    });

    res.json({
      message: 'SLA updated successfully',
      sla,
    });
  } catch (error) {
    console.error('Update SLA error:', error);
    res.status(500).json({ error: 'Failed to update SLA' });
  }
});

export default router;
