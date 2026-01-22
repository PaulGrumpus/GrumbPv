import { Socket } from 'socket.io';
import { msg_type, newMessageParam } from '../types/message.js';
import { messageController } from '../controllers/chat/message.controller.js';
import { newMessageReceiptParam } from '../types/message.receipt.js';
import { messageReceiptService } from '../services/database/message.receipt.service.js';
import { websocket } from '../config/websocket.js';
import { messageService } from '../services/database/message.service.js';
import { conversationService } from '../services/database/conversation.service.js';
import { conversationParticipantService } from '../services/database/conversation.participant.service.js';
import { read_state } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const socket_router = (socket: Socket, io: any) => {
  // User joins a conversation room
  socket.on('joinRoom', (conversationId: string) => {
    socket.join(conversationId);
  });

  // Fetch messages in a room
  //   socket.on("fetchMessages", async (conversationId: string) => {
  //       try {
  //           const result = await chatController.handleFetchMessages(conversationId);

  //           socket.emit("chatHistory", result.message);
  //       } catch (error) {
  //           console.error("❌ Error fetching messages:", error);
  //       }
  //   });

  // User sends a message
  socket.on(websocket.WEBSOCKET_SEND_NEW_MESSAGE, async (param: newMessageParam) => {
    try {
      const { user_id, conversation_id, body_text, kind, created_at } = param;

      if (!user_id || !conversation_id || !body_text) {
        throw new Error('Invalid parameters');
      }

      // Save message
      const result = await messageController.createMessage({
        user_id: user_id,
        conversation_id: conversation_id,
        body_text: body_text as string,
        kind: kind as msg_type,
        created_at: created_at || new Date(),
      });

      // Broadcast ONLY to users inside this room
      io.to(conversation_id).emit(websocket.WEBSOCKET_NEW_MESSAGE, result);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  socket.on(websocket.WEBSOCKET_SEND_MESSAGE_RECEIPT, async (param: newMessageReceiptParam) => {
    try {
      const { message_id, user_id, state } = param;

      if (!message_id || !user_id || !state) {
        throw new Error('Invalid parameters');
      }

      logger.info('Sending message receipt', { message_id, user_id, state });

      let newState = state;

      if(state === 'delivered') {
        const updatedMessageReceipt = await messageReceiptService.markMessageAsDelivered(message_id, user_id);
        if (updatedMessageReceipt) {
          newState = updatedMessageReceipt.state;
        } else {
          logger.warn('Failed to mark message as delivered - receipt not found with sent state', { message_id, user_id });
          return; // Exit early if update failed
        }
      } else if(state === 'read') {
        const updatedMessageReceipt = await messageReceiptService.markMessageAsRead(message_id, user_id);
        if (updatedMessageReceipt) {
          newState = updatedMessageReceipt.state;
        } else {
          logger.warn('Failed to mark message as read - receipt not found with delivered state', { message_id, user_id });
          return; // Exit early if update failed
        }
      }

      const message = await messageService.getMessageById(message_id);
      const conversation = await conversationService.getConversationById(message.conversation_id);
      if(!conversation) {
        throw new Error('Conversation not found');
      }
      const conversationParticipants = await conversationParticipantService.getConversationParticipantsByConversationId(conversation.id);
      
      io.to(conversation.id).emit(websocket.WEBSOCKET_MESSAGE_RECEIPT_UPDATED, {
        ...message,
        receipts: conversationParticipants.map(participant => ({
          ...participant,
          state: participant.user_id === user_id ? newState : state,
        })),
      });
    } catch (error) {
      console.error('❌ Error sending message receipt:', error);
    }
  });

  socket.on(
    websocket.WEBSOCKET_SEND_WRITING_MESSAGE,
    async (param: { conversation_id: string; sender_id: string }) => {
      try {
        const { conversation_id, sender_id } = param;
        if (!conversation_id || !sender_id) {
          throw new Error('Invalid parameters');
        }
        io.to(conversation_id).emit(websocket.WEBSOCKET_WRITING_MESSAGE, {
          conversation_id: conversation_id,
          sender_id: sender_id,
        });
      } catch (error) {
        console.error('❌ Error sending writing message:', error);
      }
    }
  );

  socket.on(
    websocket.WEBSOCKET_SEND_STOP_WRITING_MESSAGE,
    async (param: { conversation_id: string; sender_id: string }) => {
      try {
        const { conversation_id, sender_id } = param;
        if (!conversation_id || !sender_id) {
          throw new Error('Invalid parameters');
        }
        io.to(conversation_id).emit(websocket.WEBSOCKET_STOP_WRITING_MESSAGE, {
          conversation_id: conversation_id,
          sender_id: sender_id,
        });
      } catch (error) {
        console.error('❌ Error sending stop writing message:', error);
      }
    }
  );

  // Cleanup
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
};
