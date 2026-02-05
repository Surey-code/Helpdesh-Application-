import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyConnection, sendEmail } from '../services/emailService.js';
import { authenticate as authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to ensure user is SUPER_ADMIN
const requireSuperAdmin = [authenticateToken, authorize(['SUPER_ADMIN'])];

// GET /api/settings/email
router.get('/email', requireSuperAdmin, async (req, res) => {
    try {
        const settings = await prisma.systemSettings.findFirst();
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /api/settings/email
router.put('/email', requireSuperAdmin, async (req, res) => {
    try {
        const { id, smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, emailFrom, enableEmailAlerts, enableInAppAlerts, enableTicketAssign, enableSlaBreach } = req.body;

        const data = {
            smtpHost,
            smtpPort: parseInt(smtpPort),
            smtpUser,
            smtpPass,
            smtpSecure: Boolean(smtpSecure),
            emailFrom,
            enableEmailAlerts: Boolean(enableEmailAlerts),
            enableInAppAlerts: Boolean(enableInAppAlerts),
            enableTicketAssign: Boolean(enableTicketAssign),
            enableSlaBreach: Boolean(enableSlaBreach),
            updatedBy: req.user.id
        };

        let settings;
        if (id) {
            settings = await prisma.systemSettings.update({
                where: { id },
                data
            });
        } else {
            // Check if exist, if so update first one, else create
            const existing = await prisma.systemSettings.findFirst();
            if (existing) {
                settings = await prisma.systemSettings.update({
                    where: { id: existing.id },
                    data
                });
            } else {
                settings = await prisma.systemSettings.create({ data });
            }
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// POST /api/settings/email/test
router.post('/email/test', requireSuperAdmin, async (req, res) => {
    try {
        const { smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, emailFrom, testEmailTo } = req.body;

        // Verify connection first using the provided credentials
        const settings = {
            smtpHost,
            smtpPort: parseInt(smtpPort),
            smtpUser,
            smtpPass,
            smtpSecure: Boolean(smtpSecure),
        };

        await verifyConnection(settings);

        // Try to send a real email
        // We use a temporary transporter here to avoid saving to DB if it fails, 
        // OR we can rely on the service to use the passed config if we refactor.
        // For now, let's just use the service's verify and then build a temp one to send.

        // Actually, we should probably update the DB first? 
        // No, "Send Test Email" usually uses the form values without saving.

        // Import nodemailer here to keep it self-contained or import from service
        // Let's reuse verifyConnection from service which creates a transporter.

        // For sending the actual mail using the temp creds:
        // We'll just define a quick send here or export a helper from service that accepts config

        // Let's update `sendEmail` ... or just do:

        import('nodemailer').then(async (nodemailer) => {
            const transporter = nodemailer.default.createTransport({
                host: settings.smtpHost,
                port: settings.smtpPort,
                secure: settings.smtpSecure,
                auth: {
                    user: settings.smtpUser,
                    pass: settings.smtpPass,
                },
            });

            await transporter.sendMail({
                from: emailFrom || settings.smtpUser,
                to: testEmailTo,
                subject: 'Test Email from Helpdesk',
                text: 'This is a test email to verify your SMTP settings.',
                html: '<p>This is a test email to verify your <strong>SMTP settings</strong>.</p>',
            });
            res.json({ success: true, message: 'Test email sent successfully' });
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to send test email: ' + error.message });
    }
});

export default router;
