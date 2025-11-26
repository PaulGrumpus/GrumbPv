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
    blockExplorerUrls: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URLS || ["https://testnet.bscscan.com"],    
}

export const EscrowBackendConfig = {
    baseURL: process.env.NEXT_PUBLIC_ESCROW_BACKEND_URL || "http://localhost:5000/api/v1",
    uploadedImagesURL: process.env.NEXT_PUBLIC_ESCROW_BACKEND_UPLOADS_URL + "/images/",
}
