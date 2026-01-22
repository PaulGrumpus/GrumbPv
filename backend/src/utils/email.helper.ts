import { emailService } from '../services/email/email.service.js';
import { userService } from '../services/database/user.service.js';
import { logger } from './logger.js';
import { notification_type, notification_entity } from '@prisma/client';

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
    case notification_entity.job:
      return `${baseUrl}/dashboard?view=my-jobs&jobId=${entityId}`;
    case notification_entity.gig:
      return `${baseUrl}/dashboard?view=my-gigs&gigId=${entityId}`;
    case notification_entity.job_application_doc:
      return `${baseUrl}/reference?jobApplicationId=${entityId}`;
    case notification_entity.milestone:
      if(notificationType === notification_type.MILESTONE_ESCROW_DEPLOYED) {
        return `${bscScanUrl}/address/${entityId}`;
      }
      return `${baseUrl}/dashboard?view=dashboard&milestoneId=${entityId}`;
    case notification_entity.bid:
      if(userRole === "client") {
        return `${baseUrl}/dashboard?view=my-jobs&jobId=${entityId}`;
      }
      return `${baseUrl}/dashboard?view=my-bids&bidId=${entityId}`;
    case notification_entity.conversation:
      return `${baseUrl}/chat?conversation_id=${entityId}`;
    case notification_entity.chain_tx:
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
    case notification_type.REQUIREMENT_DOCS_CREATED:
    case notification_type.REQUIREMENT_DOCS_CONFIRMED:
      return 'View Application Docs';
    case notification_type.JOB_POSTED:
    case notification_type.JOB_UPDATED:
      return 'View Job Details';
    case notification_type.GIG_POSTED:
    case notification_type.GIG_UPDATED:
      return 'View Gig Details';
    case notification_type.MILESTONE_STARTED:
    case notification_type.MILESTONE_FUNDED:
    case notification_type.MILESTONE_DELIVERED:
    case notification_type.MILESTONE_APPROVED:
    case notification_type.MILESTONE_FUNDS_RELEASED:
    case notification_type.MILESTONE_CANCELLED:
      return 'View Milestone Details';
    case notification_type.BID_SENT:
    case notification_type.BID_RECEIVED:
    case notification_type.BID_ACCEPTED:
    case notification_type.BID_DECLIEND:
      return 'View Bid Details';
    case notification_type.MESSAGE_RECEIVED:
      return 'Open Chat';
    case notification_type.DEPOSIT_FUNDS:
    case notification_type.WITHDRAW_FUNDS:
      return 'View Transaction Details';
    default:
      return 'View Details';
  }
}

