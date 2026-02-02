import express from 'express';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all KB articles (public)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    let where = {
      visibility: 'PUBLIC',
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const articles = await prisma.kBArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(articles);
  } catch (error) {
    console.error('Get KB articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.kBArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (article.visibility !== 'PUBLIC') {
      return res.status(403).json({ error: 'Article is not public' });
    }

    res.json(article);
  } catch (error) {
    console.error('Get KB article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Create article (Admin only)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { title, content, category, visibility } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const article = await prisma.kBArticle.create({
      data: {
        title,
        content,
        category,
        visibility: visibility || 'PUBLIC',
      },
    });

    res.status(201).json({
      message: 'Article created successfully',
      article,
    });
  } catch (error) {
    console.error('Create KB article error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Update article (Admin only)
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, visibility } = req.body;

    const article = await prisma.kBArticle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(visibility && { visibility }),
      },
    });

    res.json({
      message: 'Article updated successfully',
      article,
    });
  } catch (error) {
    console.error('Update KB article error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// Delete article (Admin only)
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.kBArticle.delete({
      where: { id },
    });

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete KB article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
