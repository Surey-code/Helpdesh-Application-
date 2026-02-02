import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Avatar upload (stored in filesystem; url stored in DB)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Invalid file type. Only jpg, png, webp are allowed.'));
  },
});

// ----------------------------
// Profile (current user) routes
// ----------------------------

// Get my profile
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// Update my profile (name/department/avatarUrl)
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, department, avatarUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department: department || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(req.body.city !== undefined && { city: req.body.city || null }),
        ...(req.body.state !== undefined && { state: req.body.state || null }),
        ...(req.body.country !== undefined && { country: req.body.country || null }),
        ...(req.body.phone !== undefined && { phone: req.body.phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        department: true,
        avatarUrl: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'PROFILE_UPDATE',
      entity: 'User',
      entityId: req.user.id,
      req,
    });

    res.json({ message: 'Profile updated', user: updated });
  } catch (e) {
    console.error('Update profile error:', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload my avatar
router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        department: true,
        avatarUrl: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'PROFILE_AVATAR_UPLOAD',
      entity: 'User',
      entityId: req.user.id,
      req,
      meta: { avatarUrl },
    });

    res.status(201).json({ message: 'Avatar uploaded', user: updated });
  } catch (e) {
    console.error('Avatar upload error:', e);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Change my password
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const fullUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!fullUser) return res.status(404).json({ error: 'User not found' });

    const ok = await bcrypt.compare(currentPassword, fullUser.password);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    await logActivity({
      userId: req.user.id,
      action: 'PROFILE_PASSWORD_CHANGE',
      entity: 'User',
      entityId: req.user.id,
      req,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    console.error('Change password error:', e);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// My recent activity
router.get('/me/activity', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
    const activity = await prisma.userActivityLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json(activity);
  } catch (e) {
    console.error('Get my activity error:', e);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Get all users (Admin/Manager only)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { role } = req.query;

    let where = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        city: true,
        state: true,
        country: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add Agent/Manager (Admin only)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!['AGENT', 'MANAGER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be AGENT, MANAGER, or ADMIN' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department: department || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user.id,
      req,
      meta: { createdRole: user.role },
    });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, avatarUrl, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'USER_UPDATE',
      entity: 'User',
      entityId: id,
      req,
    });

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate/Activate user (Admin only)
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive is required' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: updated.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entity: 'User',
      entityId: id,
      req,
    });

    res.json({ message: 'User status updated', user: updated });
  } catch (e) {
    console.error('Update user status error:', e);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Admin reset user password (sets a temporary password)
router.post('/:id/reset-password', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tempPassword } = req.body;

    const passwordToSet = tempPassword || `Temp${Math.random().toString(36).slice(2, 8)}!`;
    if (passwordToSet.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(passwordToSet, 10);
    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await logActivity({
      userId: req.user.id,
      action: 'USER_PASSWORD_RESET_ADMIN',
      entity: 'User',
      entityId: id,
      req,
    });

    // Keep response safe; return temp password only if explicitly requested
    res.json({
      message: 'Password reset successful',
      ...(tempPassword ? { tempPassword: passwordToSet } : {}),
      user,
    });
  } catch (e) {
    console.error('Admin reset password error:', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    await logActivity({
      userId: req.user.id,
      action: 'USER_DELETE',
      entity: 'User',
      entityId: id,
      req,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
