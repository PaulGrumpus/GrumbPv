import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { message_receipts, read_state } from '@prisma/client';
import { newMessageReceiptParam } from '../../types/message.receipt.js';
import { prisma } from '../../prisma.js';

export class MessageReceiptService {
  private prisma = prisma;

  public async createMessageReceipt(
    messageReceipt: newMessageReceiptParam
  ): Promise<message_receipts> {
    try {
      const newMessageReceipt = await this.prisma.message_receipts.create({
        data: {
          message_id: messageReceipt.message_id,
          user_id: messageReceipt.user_id,
          state: messageReceipt.state as read_state,
        },
      });
      return newMessageReceipt;
    } catch (error) {
      logger.error('Error creating message receipt', { error });
      throw new AppError('Error creating message receipt', 500, 'MESSAGE_RECEIPT_CREATE_FAILED');
    }
  }

  public async getMessageReceiptById(id: string): Promise<message_receipts> {
    try {
      const messageReceipt = await this.prisma.message_receipts.findUnique({
        where: { id },
      });
      if (!messageReceipt) {
        throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
      }
      return messageReceipt;
    } catch (error) {
      logger.error('Error getting message receipt by id', { error });
      throw new AppError(
        'Error getting message receipt by id',
        500,
        'MESSAGE_RECEIPT_GET_BY_ID_FAILED'
      );
    }
  }

  public async getMessageReceiptsByMessageId(messageId: string): Promise<message_receipts[]> {
    try {
      const messageReceipts = await this.prisma.message_receipts.findMany({
        where: { message_id: messageId },
      });
      return messageReceipts;
    } catch (error) {
      logger.error('Error getting message receipts by message id', { error });
      throw new AppError(
        'Error getting message receipts by message id',
        500,
        'MESSAGE_RECEIPTS_GET_BY_MESSAGE_ID_FAILED'
      );
    }
  }

  public async getMessageReceiptsByUserId(userId: string): Promise<message_receipts[]> {
    try {
      const messageReceipts = await this.prisma.message_receipts.findMany({
        where: { user_id: userId },
      });
      return messageReceipts;
    } catch (error) {
      logger.error('Error getting message receipts by user id', { error });
      throw new AppError(
        'Error getting message receipts by user id',
        500,
        'MESSAGE_RECEIPTS_GET_BY_USER_ID_FAILED'
      );
    }
  }

  public async getMessageReceiptsByMessageIdAndUserId(
    messageId: string,
    userId: string
  ): Promise<message_receipts> {
    try {
      const messageReceipt = await this.prisma.message_receipts.findUnique({
        where: {
          message_id_user_id: { message_id: messageId, user_id: userId },
        },
      });
      if (!messageReceipt) {
        throw new AppError('Message receipt not found', 404, 'MESSAGE_RECEIPT_NOT_FOUND');
      }
      return messageReceipt;
    } catch (error) {
      logger.error('Error getting message receipt by message id and user id', { error });
      throw new AppError(
        'Error getting message receipt by message id and user id',
        500,
        'MESSAGE_RECEIPT_GET_BY_MESSAGE_ID_AND_USER_ID_FAILED'
      );
    }
  }

  public async getMessageReceiptsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<message_receipts[]> {
    try {
      const messageReceipts = await this.prisma.message_receipts.findMany({
        where: { created_at: { gte: startDate, lte: endDate } },
        orderBy: { created_at: 'desc' },
      });
      return messageReceipts;
    } catch (error) {
      logger.error('Error getting message receipts by date range', { error });
      throw new AppError(
        'Error getting message receipts by date range',
        500,
        'MESSAGE_RECEIPTS_GET_BY_DATE_RANGE_FAILED'
      );
    }
  }

  public async getAllMessageReceipts(): Promise<message_receipts[]> {
    try {
      const messageReceipts = await this.prisma.message_receipts.findMany({
        orderBy: { created_at: 'desc' },
      });
      return messageReceipts;
    } catch (error) {
      logger.error('Error getting all message receipts', { error });
      throw new AppError(
        'Error getting all message receipts',
        500,
        'MESSAGE_RECEIPTS_GET_ALL_FAILED'
      );
    }
  }

  public async updateMessageReceipt(
    message_id: string,
    user_id: string,
    state: read_state
  ): Promise<message_receipts> {
    try {
      const updatedMessageReceipt = await this.prisma.message_receipts.update({
        where: {
          message_id_user_id: { message_id, user_id },
        },
        data: {
          state: state,
        },
      });
      return updatedMessageReceipt;
    } catch (error) {
      logger.error('Error updating message receipt', { error });
      throw new AppError('Error updating message receipt', 500, 'MESSAGE_RECEIPT_UPDATE_FAILED');
    }
  }

  public async markMessageAsDelivered(message_id: string, user_id: string): Promise<message_receipts | null> {
    try {
      // First check if receipt exists with 'sent' state
      const existingReceipt = await this.prisma.message_receipts.findUnique({
        where: {
          message_id_user_id: { message_id, user_id },
        },
      });

      // If not found or state is not 'sent', return null
      if (!existingReceipt) {
        logger.warn('Message receipt not found with sent state', { message_id, user_id });
        return null;
      }

      if (existingReceipt.state !== 'sent') {
        logger.warn('Message not sent', { message_id, user_id });
        return null;
      }

      // Update to 'delivered' state
      const updatedMessageReceipt = await this.prisma.message_receipts.update({
        where: {
          message_id_user_id: { message_id, user_id },
        },
        data: {
          state: 'delivered',
        },
      });
      return updatedMessageReceipt;
    } catch (error) {
      logger.error('Error marking message as delivered', { error });
      throw new AppError('Error marking message as delivered', 500, 'MESSAGE_RECEIPT_MARK_AS_DELIVERED_FAILED');
    }
  }

  public async markMessageAsRead(message_id: string, user_id: string): Promise<message_receipts | null> {
    try {
      // First check if receipt exists with 'delivered' state (preferred)
      let existingReceipt = await this.prisma.message_receipts.findUnique({
        where: {
          message_id_user_id: { message_id, user_id },
        },
      });

      // If not found with 'delivered', check for 'sent' state
      if (!existingReceipt) {
        logger.warn('Message receipt not found with delivered state', { message_id, user_id });
        return null;
      }

      const updatedMessageReceipt = await this.prisma.message_receipts.update({
        where: {
          message_id_user_id: { message_id, user_id },
        },
        data: {
          state: 'read',
        },
      });
      return updatedMessageReceipt;
    } catch (error) {
      logger.error('Error marking message as read', { error });
      throw new AppError('Error marking message as read', 500, 'MESSAGE_RECEIPT_MARK_AS_READ_FAILED');
    }
  }

  public async deleteMessageReceipt(id: string): Promise<void> {
    try {
      await this.prisma.message_receipts.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting message receipt', { error });
      throw new AppError('Error deleting message receipt', 500, 'MESSAGE_RECEIPT_DELETE_FAILED');
    }
  }
}

export const messageReceiptService = new MessageReceiptService();
