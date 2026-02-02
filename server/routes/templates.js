import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all templates (public)
router.get('/', authenticate, async (req, res) => {
  try {
    const templates = await prisma.ticketTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get single template
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.ticketTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create template (Admin only)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, subject, description, priority, category } = req.body;

    if (!name || !subject || !description) {
      return res.status(400).json({ error: 'Name, subject, and description are required' });
    }

    const template = await prisma.ticketTemplate.create({
      data: {
        name,
        subject,
        description,
        priority: priority || 'MEDIUM',
        category: category || null,
      },
    });

    res.status(201).json({
      message: 'Template created successfully',
      template,
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template (Admin only)
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, description, priority, category, isActive } = req.body;

    const template = await prisma.ticketTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      message: 'Template updated successfully',
      template,
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template (Admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ticketTemplate.delete({
      where: { id },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
