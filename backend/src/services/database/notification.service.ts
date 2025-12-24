import { Prisma, notifications } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { emitNotification } from '../../routes/notification.socket.route.js';

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
      emitNotification(newNotification.user_id, newNotification);
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
