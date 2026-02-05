import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get transporter based on db settings
const getTransporter = async () => {
    const settings = await prisma.systemSettings.findFirst();

    if (!settings || !settings.smtpHost) {
        throw new Error('Email settings not configured');
    }

    return nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort,
        secure: settings.smtpSecure, // true for 465, false for other ports
        auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
        },
    });
};

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const settings = await prisma.systemSettings.findFirst();

        if (!settings || !settings.enableEmailAlerts) {
            console.log('Email alerts are disabled or not configured.');
            return false;
        }

        const transporter = await getTransporter();

        const info = await transporter.sendMail({
            from: settings.emailFrom || settings.smtpUser, // sender address
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

export const verifyConnection = async (settings) => {
    try {
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: settings.smtpPort,
            secure: settings.smtpSecure,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass,
            },
        });

        await transporter.verify();
        return true;
    } catch (error) {
        console.error("SMTP Connection Verification Failed:", error);
        throw error;
    }
};
