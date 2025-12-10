import { Socket } from "socket.io";
import { msg_type, newMessageParam } from "../types/message.js";
import { messageController } from "../controllers/chat/message.controller.js";
import { newMessageReceiptParam } from "../types/message.receipt.js";
import { messageReceiptController } from "../controllers/chat/message.receipt.controller.js";

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
    socket.on("sendMessage", async (param: newMessageParam) => {
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
            io.to(conversation_id).emit("newMessage", result);

        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    });

    socket.on("sendMessageReceipt", async (param: newMessageReceiptParam) => {
        try {
            const { message_id, user_id, state } = param;

            if (!message_id || !user_id || !state) {
                throw new Error("Invalid parameters");
            }
            let result
            const existingMessageReceipt = await messageReceiptController.getMessageReceiptsByMessageIdAndUserId(message_id, user_id);
            if (existingMessageReceipt) {
                result = await messageReceiptController.updateMessageReceipt({
                    message_id: message_id,
                    user_id: user_id,
                    state: state,
                });
            } else {
                result = await messageReceiptController.createMessageReceipt({
                    message_id: message_id,
                    user_id: user_id,
                    state: state,
                });
            }
            if (!result) {
                throw new Error("Message receipt not created");
            }
            io.to(message_id).emit("messageReceipt", result);
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