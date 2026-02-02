import prisma from '../config/database.js';

export const sendEmail = (userEmail, subject, message) => {
  // Mock email function
  console.log(`📧 Sending Email to ${userEmail}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Message: ${message}`);
  // In production, integrate with email service (SendGrid, AWS SES, etc.)
};

// Create in-app notification
export const createNotification = async (userId, type, title, message, ticketId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        ticketId,
        status: 'UNREAD',
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
