import { Socket } from "socket.io";
import { msg_type, newMessageParam } from "../types/message";
import { messageController } from "../controllers/chat/message.controller";

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
            const { user_id, conversation_id, message } = param;

            if (!user_id || !conversation_id || !message) {
                throw new Error("Invalid parameters");
            }

            // Save message
            const result = await messageController.createMessage({
                user_id: user_id,
                conversation_id: conversation_id,
                message: message as string,
                kind: msg_type.text,
            });

            // Broadcast ONLY to users inside this room
            io.to(conversation_id).emit("newMessage", result);

        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    });

    // Cleanup
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
    });
};