import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/email/email.service.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ContactController {
  async submitContactForm(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, inquiry } = req.body;

      // Validate required fields
      if (!name || !email || !inquiry) {
        throw new AppError('Name, email, and inquiry are required', 400, 'MISSING_FIELDS');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
      }

      // Contact form submissions go to CONTACT_EMAIL (contact@grumbuild.com). Emails are sent via SMTP_USER (notifications@).
      const recipientEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

      if (!recipientEmail) {
        logger.error('Contact email recipient not configured. Set CONTACT_EMAIL (e.g. contact@grumbuild.com) or SMTP_USER.');
        throw new AppError('Contact email recipient not configured', 500, 'EMAIL_NOT_CONFIGURED');
      }

      // Send email
      await emailService.sendContactEmail(recipientEmail, name, email, inquiry);

      logger.info('Contact form submission sent successfully', {
        name,
        email,
        recipientEmail,
      });

      res.json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const contactController = new ContactController();

