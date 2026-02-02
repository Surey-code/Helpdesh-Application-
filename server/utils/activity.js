import prisma from '../config/database.js';

export async function logActivity({
  userId = null,
  action,
  entity = null,
  entityId = null,
  req = null,
  meta = null,
}) {
  try {
    const ip =
      req?.headers?.['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req?.ip ||
      req?.socket?.remoteAddress ||
      null;

    const userAgent = req?.headers?.['user-agent'] || null;

    await prisma.userActivityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ip,
        userAgent,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch (e) {
    // Never block request flow due to logging
    console.error('Activity log error:', e);
  }
}

