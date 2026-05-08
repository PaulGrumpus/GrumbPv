import { emailService } from '../services/email/email.service.js';
import { userService } from '../services/database/user.service.js';
import { logger } from './logger.js';
import type { notification_type, notification_entity } from '@prisma/client';
import {
  notification_type as notificationTypeValues,
  notification_entity as notificationEntityValues,
} from '../constants/prisma-enums.js';
import { config } from 'dotenv';
config();
/**
 * Helper function to send email notifications
 * This function fetches the user's email and sends a notification email
 */
export async function sendEmailNotification(
  userId: string,
  title: string,
  body: string,
  actionUrl?: string,
  actionText?: string
): Promise<void> {
  try {
    // Get user information to fetch email
    const user = await userService.getUserById(userId);
    
    // Only send email if user has an email address
    if (!user.email) {
      logger.info('User does not have an email address, skipping email notification', { userId });
      return;
    }

    // Send email notification
    await emailService.sendNotificationEmail(
      user.email,
      title,
      body,
      actionUrl,
      actionText
    );
  } catch (error) {
    // Log error but don't throw - email sending should not break the notification flow
    logger.error('Failed to send email notification', { error, userId, title });
  }
}

/**
 * Generate action URL based on notification type and entity
 */
export function generateNotificationActionUrl(
  entityType: notification_entity,
  entityId: string,
  notificationType?: notification_type,
  userRole?: "client" | "freelancer"
): string {
  const baseUrl = process.env.FRONTEND_URL || 'https://grumbuild.com';
  const bscScanUrl = process.env.BSC_SCAN_URL || 'https://testnet.bscscan.com';
  
  switch (entityType) {
    case notificationEntityValues.job:
      return `${baseUrl}/dashboard?view=my-jobs&jobId=${entityId}`;
    case notificationEntityValues.gig:
      return `${baseUrl}/dashboard?view=my-gigs&gigId=${entityId}`;
    case notificationEntityValues.job_application_doc:
      return `${baseUrl}/reference?jobApplicationId=${entityId}`;
    case notificationEntityValues.milestone:
      if(notificationType === notificationTypeValues.MILESTONE_ESCROW_DEPLOYED) {
        return `${bscScanUrl}/address/${entityId}`;
      }
      return `${baseUrl}/dashboard?view=dashboard&milestoneId=${entityId}`;
    case notificationEntityValues.bid:
      if(userRole === "client") {
        return `${baseUrl}/dashboard?view=my-jobs&jobId=${entityId}`;
      }
      return `${baseUrl}/dashboard?view=my-bids&bidId=${entityId}`;
    case notificationEntityValues.conversation:
      return `${baseUrl}/chat?conversation_id=${entityId}`;
    case notificationEntityValues.chain_tx:
      return `${bscScanUrl}/tx/${entityId}`;
    default:
      return `${baseUrl}`;
  }
}

/**
 * Generate action text based on notification type
 */
export function generateNotificationActionText(
  notificationType: notification_type
): string {
  switch (notificationType) {
    case notificationTypeValues.REQUIREMENT_DOCS_CREATED:
    case notificationTypeValues.REQUIREMENT_DOCS_CONFIRMED:
      return 'View Application Docs';
    case notificationTypeValues.JOB_POSTED:
    case notificationTypeValues.JOB_UPDATED:
    case 'JOB_EXPIRING_SOON' as notification_type:
      return 'View Job Details';
    case notificationTypeValues.GIG_POSTED:
    case notificationTypeValues.GIG_UPDATED:
      return 'View Gig Details';
    case notificationTypeValues.MILESTONE_STARTED:
    case notificationTypeValues.MILESTONE_FUNDED:
    case notificationTypeValues.MILESTONE_DELIVERED:
    case notificationTypeValues.MILESTONE_APPROVED:
    case notificationTypeValues.MILESTONE_FUNDS_RELEASED:
    case notificationTypeValues.MILESTONE_CANCELLED:
      return 'View Milestone Details';
    case notificationTypeValues.BID_SENT:
    case notificationTypeValues.BID_RECEIVED:
    case notificationTypeValues.BID_ACCEPTED:
    case notificationTypeValues.BID_DECLIEND:
      return 'View Bid Details';
    case notificationTypeValues.MESSAGE_RECEIVED:
      return 'Open Chat';
    case notificationTypeValues.DEPOSIT_FUNDS:
    case notificationTypeValues.WITHDRAW_FUNDS:
      return 'View Transaction Details';
    default:
      return 'View Details';
  }
}

