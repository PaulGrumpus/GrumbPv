import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../../utils/logger.js';
import { getEmailTemplate } from './email.templates.js';
import dotenv from "dotenv";
dotenv.config();

export interface EmailOptions {
  to: string;
  subject: string;
  template: 'notification' | 'welcome' | 'job_update' | 'application_update' | 'contact';
  data: {
    title?: string;
    body?: string;
    userName?: string;
    actionUrl?: string;
    actionText?: string;
    footerText?: string;
    name?: string;
    email?: string;
    enquiry?: string;
    [key: string]: any;
  };
}

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // Only initialize transporter if credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      logger.info('Email service: SMTP credentials configured', {
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      });
      logger.info('Email service: SMTP host configured', {
        SMTP_HOST: process.env.SMTP_HOST,
      });
      logger.info('Email service: SMTP port configured', {
        SMTP_PORT: process.env.SMTP_PORT,
      });
      logger.info('Email service: SMTP secure configured', {
        SMTP_SECURE: process.env.SMTP_SECURE,
      });
      this.isConfigured = true;
      // Initialize nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false, // For development, set to true in production
        },
      });

      // Verify connection configuration asynchronously (non-blocking)
      this.verifyConnection().catch((error) => {
        logger.warn('Email service: SMTP connection verification failed, emails may not be sent', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
    } else {
      logger.warn(
        'Email service: SMTP credentials not configured. Email notifications will be disabled. Set SMTP_USER and SMTP_PASSWORD environment variables to enable.'
      );
    }
  }

  private async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service: SMTP connection verified successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code;
      
      // Provide helpful error messages based on error type
      if (errorCode === 'EAUTH') {
        logger.warn('Email service: SMTP authentication failed. Please check your SMTP_USER and SMTP_PASSWORD credentials.', {
          error: errorMessage,
        });
      } else {
        logger.warn('Email service: SMTP connection verification failed', {
          error: errorMessage,
          code: errorCode,
        });
      }
      // Don't throw error here, allow the service to be created but log the issue
    }
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Check if email service is configured
      if (!this.isConfigured || !this.transporter) {
        logger.debug('Email service: SMTP not configured, skipping email send', {
          to: options.to,
          subject: options.subject,
        });
        return;
      }

      const html = getEmailTemplate(options.template, options.data);
      const from = process.env.SMTP_FROM || `"${process.env.SMTP_FROM_NAME || 'GrumBuild'}" <${process.env.SMTP_USER}>`;

      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html,
        // Plain text fallback
        text: this.generatePlainText(options.data),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code;
      
      logger.error('Error sending email', {
        error: errorMessage,
        code: errorCode,
        to: options.to,
        subject: options.subject,
      });
      
      // Don't throw error - email failures shouldn't break the application flow
      // The error is logged for monitoring purposes
    }
  }

  public async sendNotificationEmail(
    to: string,
    title: string,
    body: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: title,
      template: 'notification',
      data: {
        title,
        body,
        actionUrl,
        actionText: actionText || 'View Details',
      },
    });
  }

  /** Send contact form submission to contact@ (recipient). Uses same SMTP as other emails (notifications@). */
  public async sendContactEmail(
    to: string,
    name: string,
    email: string,
    inquiry: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `New Contact Form Submission from ${name}`,
      template: 'contact',
      data: {
        name,
        email,
        inquiry,
      },
    });
  }

  private generatePlainText(data: EmailOptions['data']): string {
    let text = '';
    if (data.title) text += `${data.title}\n\n`;
    if (data.body) text += `${data.body}\n\n`;
    if (data.actionUrl) {
      text += `${data.actionText || 'Click here'}: ${data.actionUrl}\n\n`;
    }
    return text;
  }
}

export const emailService = new EmailService();

