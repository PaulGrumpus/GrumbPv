import dotenv from 'dotenv';
dotenv.config();

export const websocket = {
    WEBSOCKET_URI: process.env.WEBSOCKET_URI,
    WEBSOCKET_SEND_NEW_MESSAGE: process.env.WEBSOCKET_SEND_NEW_MESSAGE || "sendNewMessage",
    WEBSOCKET_NEW_MESSAGE: process.env.WEBSOCKET_NEW_MESSAGE || "newMessage",
    WEBSOCKET_SEND_MESSAGE_RECEIPT: process.env.WEBSOCKET_SEND_MESSAGE_RECEIPT || "sendMessageReceipt",
    WEBSOCKET_MESSAGE_RECEIPT: process.env.WEBSOCKET_MESSAGE_RECEIPT || "messageReceipt",
}