import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services/database/notification.service.js';

export class NotificationController {
    public async getNotificationsByUserIdWithFilters(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;
            const { read } = req.body;
            const result = await notificationService.getNotificationsByUserIdWithFilters(user_id, read as unknown as boolean | undefined);
            res.json({
                success: true,
                data: result,
                message: 'Notifications retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }   

    public async updateNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { read_at } = req.body;
            console.log("read_at", read_at);
            const read_at_date = new Date(read_at);
            console.log("read_at_date", read_at_date);
            const result = await notificationService.updateNotification(id, read_at_date);
            res.json({
                success: true,
                data: result,
                message: 'Notification updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    public async markAllNotificationsAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;
            const result = await notificationService.markAllNotificationsAsRead(user_id);
            res.json({
                success: true,
                data: result,
                message: 'Notifications marked as read successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const notificationController = new NotificationController();