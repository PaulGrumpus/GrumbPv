import { Socket } from "socket.io";
import { msg_type, newMessageParam } from "../types/message.js";
import { messageController } from "../controllers/chat/message.controller.js";
import { newMessageReceiptParam } from "../types/message.receipt.js";
import { messageReceiptService } from "../services/database/message.receipt.service.js";
import { websocket } from "../config/websocket.js";

export const socket_router = (
    socket: Socket,
    io: any
) => {
  
    // User joins a conversation room
    socket.on("joinRoom", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined room ${conversationId}`);
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
            const { user_id, conversation_id, body_text } = param;

            if (!user_id || !conversation_id || !body_text) {
                throw new Error("Invalid parameters");
            }

            // Save message
            const result = await messageController.createMessage({
                user_id: user_id,
                conversation_id: conversation_id,
                body_text: body_text as string,
                kind: msg_type.text,
            });

            // Broadcast ONLY to users inside this room
            io.to(conversation_id).emit(websocket.WEBSOCKET_NEW_MESSAGE, result);

        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    });

    socket.on(websocket.WEBSOCKET_SEND_MESSAGE_RECEIPT, async (param: newMessageReceiptParam) => {
        try {
            const { message_id, user_id, state } = param;

            if (!message_id || !user_id || !state) {
                throw new Error("Invalid parameters");
            }
            let result
            const existingMessageReceipt = await messageReceiptService.getMessageReceiptsByMessageIdAndUserId(message_id, user_id);
            if (existingMessageReceipt) {
                result = await messageReceiptService.updateMessageReceipt(
                    message_id,
                    user_id,
                    state,
                );
            } else {
                result = await messageReceiptService.createMessageReceipt({
                    message_id: message_id,
                    user_id: user_id,
                    state: state,
                });
            }
            if (!result) {
                throw new Error("Message receipt not created");
            }
            io.to(message_id).emit(websocket.WEBSOCKET_MESSAGE_RECEIPT, result);
        }
        catch (error) {
            console.error("❌ Error sending message receipt:", error);
        }
    });

    // Cleanup
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
    });
};