'use client';

export const CONFIG = {
    userRole: process.env.NEXT_PUBLIC_USER_ROLE || "freelancer",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "0x61",
    chainName: process.env.NEXT_PUBLIC_CHAIN_NAME || "BNB Smart Chain Testnet",
    nativeCurrency: {
        name: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_NAME || "Binance Coin",
        symbol: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL || "tBNB",
        decimals: process.env.NEXT_PUBLIC_NATIVE_CURRENCY_DECIMALS || 18,
    },
    rpcUrls: process.env.NEXT_PUBLIC_RPC_URLS || ["https://bsc-testnet-rpc.publicnode.com", "https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
    blockExplorerUrls: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URLS || "https://testnet.bscscan.com",   
    ipfsGateWay: process.env.NEXT_PUBLIC_IPFS_GATEWATY_URL || "https://brown-decisive-tyrannosaurus-507.mypinata.cloud/ipfs",
}

export const EscrowBackendConfig = {
    baseURL: process.env.NEXT_PUBLIC_ESCROW_BACKEND_URL || "http://localhost:5000/api/v1",
    uploadedImagesURL: process.env.NEXT_PUBLIC_ESCROW_BACKEND_UPLOADS_URL + "/images/",
}

export const websocket = {
    WEBSOCKET_URI: process.env.NEXT_PUBLIC_ESCROW_WEBSOCKET_URL || "ws://localhost:5000",
    WEBSOCKET_SEND_NEW_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_SEND_NEW_MESSAGE || "sendNewMessage",
    WEBSOCKET_NEW_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_NEW_MESSAGE || "newMessage",
    WEBSOCKET_SEND_MESSAGE_RECEIPT: process.env.NEXT_PUBLIC_WEBSOCKET_SEND_MESSAGE_RECEIPT || "sendMessageReceipt",
    WEBSOCKET_MESSAGE_RECEIPT: process.env.NEXT_PUBLIC_WEBSOCKET_MESSAGE_RECEIPT || "messageReceipt",
    WEBSOCKET_WRITING_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_WRITING_MESSAGE || "writingMessage",
    WEBSOCKET_SEND_WRITING_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_SEND_WRITING_MESSAGE || "sendWritingMessage",
    WEBSOCKET_SEND_STOP_WRITING_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_SEND_STOP_WRITING_MESSAGE || "sendStopWritingMessage",
    WEBSOCKET_STOP_WRITING_MESSAGE: process.env.NEXT_PUBLIC_WEBSOCKET_STOP_WRITING_MESSAGE || "stopWritingMessage",
    WEBSOCKET_NEW_NOTIFICATION: process.env.NEXT_PUBLIC_WEBSOCKET_NEW_NOTIFICATION || "newNotification",
    WEBSOCKET_MESSAGE_RECEIPT_UPDATED: process.env.NEXT_PUBLIC_WEBSOCKET_MESSAGE_RECEIPT_UPDATED || "messageReceiptUpdated",
}
