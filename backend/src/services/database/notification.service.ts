import { Prisma, notifications } from "@prisma/client";
import { prisma } from "../../prisma";
import { logger } from "../../utils/logger";
import { AppError } from "../../middlewares/errorHandler";

export class NotificationService {
    private prisma = prisma;

    public async createNotification(notification: notifications): Promise<notifications> {
        try {
            const newNotification = await this.prisma.notifications.create({ data: {
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
            } });
            if (!newNotification) {
                throw new AppError('Notification not created', 400, 'NOTIFICATION_NOT_CREATED');
            }
            return newNotification;
        }
        catch (error) {
            logger.error('Error creating notification', { error });
            throw new AppError('Error creating notification', 500, 'NOTIFICATION_CREATE_FAILED');
        }
    }

    public async getNotificationsByUserIdWithFilters(userId: string, read?: boolean | undefined): Promise<notifications[]> {
        try {
            if(read !== undefined) {
                const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId } });
                return notifications;
            } else if(read === true) {
                const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId, read_at: { not: null } } });
                return notifications;
            } else {
                const notifications = await this.prisma.notifications.findMany({ where: { user_id: userId, read_at: null } });
                return notifications;
            }
        }
        catch (error) {
            logger.error('Error getting notifications', { error });
            throw new AppError('Error getting notifications', 500, 'NOTIFICATIONS_GET_FAILED');
        }
    }

    public async updateNotification(id: string, read_at: Date): Promise<notifications> {
        try {
            const updatedNotification = await this.prisma.notifications.update({ where: { id }, data: {
                read_at: read_at,
            } });
            if (!updatedNotification) {
                throw new AppError('Notification not updated', 400, 'NOTIFICATION_NOT_UPDATED');
            }
            return updatedNotification;
        }
        catch (error) {
            logger.error('Error updating notification', { error });
            throw new AppError('Error updating notification', 500, 'NOTIFICATION_UPDATE_FAILED');
        }
    }
}

export const notificationService = new NotificationService();