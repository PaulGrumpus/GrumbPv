import { Prisma, notifications } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { emitNotification } from '../../routes/notification.socket.route.js';
import {
  sendEmailNotification,
  generateNotificationActionUrl,
  generateNotificationActionText,
} from '../../utils/email.helper.js';
import { userService } from './user.service.js';

export class NotificationService {
  private prisma = prisma;

  public async createNotification(
    notification: Prisma.notificationsUncheckedCreateInput
  ): Promise<notifications> {
    try {
      const newNotification = await this.prisma.notifications.create({
        data: {
          user_id: notification.user_id,
          actor_user_id: notification.actor_user_id,
          type: notification.type,
          entity_type: notification.entity_type,
          entity_id: notification.entity_id,
          title: notification.title,
          body: notification.body,
          payload: notification.payload ?? Prisma.JsonNull,
          read_at: null,
          created_at: new Date(),
        },
      });
      if (!newNotification) {
        throw new AppError('Notification not created', 400, 'NOTIFICATION_NOT_CREATED');
      }
      
      // Emit socket notification
      emitNotification(newNotification.user_id, newNotification);

      const user = await userService.getUserById(notification.user_id);

      if(!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      // Send email notification (non-blocking)
      const actionUrl = generateNotificationActionUrl(
        newNotification.entity_type,
        newNotification.entity_id,
        newNotification?.type,
        user.role === "client" ? "client" : "freelancer"
      );
      const actionText = generateNotificationActionText(newNotification.type);
      
      sendEmailNotification(
        newNotification.user_id,
        newNotification.title,
        newNotification.body,
        actionUrl,
        actionText
      ).catch((error) => {
        // Email sending errors are already logged in the helper function
        logger.error('Error sending email notification', { error });
        logger.debug('Email notification sent asynchronously', { notificationId: newNotification.id });
      });
      
      return newNotification;
    } catch (error) {
      logger.error('Error creating notification', { error });
      throw new AppError('Error creating notification', 500, 'NOTIFICATION_CREATE_FAILED');
    }
  }

  // public async getNotificationsByUserIdWithFilters(userId: string, read?: boolean): Promise<notifications[]> {
  //     try {
  //         if(read !== null) {
  //             const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId } });
  //             return notifications;
  //         } else if(read === true) {
  //             const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId, read_at: { not: null } } });
  //             return notifications;
  //         } else {
  //             const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId, read_at: null } });
  //             return notifications;
  //         }
  //     }
  //     catch (error) {
  //         logger.error('Error getting notifications', { error });
  //         throw new AppError('Error getting notifications', 500, 'NOTIFICATIONS_GET_FAILED');
  //     }
  // }

  public async getNotificationsByUserIdWithFilters(
    userId: string,
    read?: boolean
  ): Promise<notifications[]> {
    try {
      const where: any = { user_id: userId };

      if (read === true) {
        where.read_at = { not: null };
      } else if (read === false) {
        where.read_at = null;
      }
      // if read === undefined → no filter (all)

      return await this.prisma.notifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
      });
    } catch (error) {
      logger.error('Error getting notifications', { error });
      throw new AppError('Error getting notifications', 500, 'NOTIFICATIONS_GET_FAILED');
    }
  }

  public async updateNotification(id: string, read_at: Date): Promise<notifications> {
    try {
      const updatedNotification = await this.prisma.notifications.update({
        where: { id },
        data: {
          read_at: read_at,
        },
      });
      if (!updatedNotification) {
        throw new AppError('Notification not updated', 400, 'NOTIFICATION_NOT_UPDATED');
      }
      return updatedNotification;
    } catch (error) {
      logger.error('Error updating notification', { error });
      throw new AppError('Error updating notification', 500, 'NOTIFICATION_UPDATE_FAILED');
    }
  }

  public async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notifications.updateMany({
        where: {
          user_id: userId,
          read_at: null,
        },
        data: {
          read_at: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      logger.error('Error marking all notifications as read', { error });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Error marking all notifications as read',
        500,
        'NOTIFICATIONS_MARK_ALL_AS_READ_FAILED'
      );
    }
  }
}

export const notificationService = new NotificationService();
