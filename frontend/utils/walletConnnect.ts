import { toast } from "react-toastify";
import { CONFIG } from "@/config/config";
import { checkUserByAddress } from "./functions";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

type WalletConnectProvider = InstanceType<typeof EthereumProvider>;

const isSameChain = (current?: string | null, target?: string | null) =>
    current?.toLowerCase() === target?.toLowerCase();

/** EIP-1193–like provider (injected or WalletConnect). */
export type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

let walletConnectProviderInstance: WalletConnectProvider | null = null;

declare global {
    interface Window {
        ethereum?: MetaMaskProvider;
    }
}

const normalizeChainId = (value?: string | null) => {
    if (!value) {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    if (trimmed.startsWith("0x")) {
        return `0x${trimmed.slice(2).toLowerCase()}`;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
        return `0x${parsed.toString(16)}`;
    }
    return trimmed.toLowerCase();
};

const normalizeUrlList = (value?: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((v) => (v ?? "").toString().trim()).filter(Boolean);
    }
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.map((v) => (v ?? "").toString().trim()).filter(Boolean);
        }
    } catch (_err) {
        // fall through to comma split
    }
    return value
        .toString()
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
};

const nativeCurrencyDecimals = (() => {
    return Number(CONFIG.nativeCurrency?.decimals);
})();

const TARGET_CHAIN_ID = normalizeChainId(CONFIG.chainId);

const NETWORK_PARAMS = {
    chainId: TARGET_CHAIN_ID,
    chainName: CONFIG.chainName,
    nativeCurrency: {
        name: CONFIG.nativeCurrency?.name,
        symbol: CONFIG.nativeCurrency?.symbol,
        decimals: nativeCurrencyDecimals,
    },
    rpcUrls: normalizeUrlList(CONFIG.rpcUrls),
    blockExplorerUrls: normalizeUrlList(CONFIG.blockExplorerUrls),
} as const;

export const getEthereumProvider = () => (typeof window === "undefined" ? undefined : window.ethereum);

/** Returns the WalletConnect provider instance if a session is active (for use after connectWalletConnect). */
export const getWalletConnectProvider = (): WalletConnectProvider | null => walletConnectProviderInstance;

/** Whether WalletConnect is configured (project ID set). */
export const isWalletConnectAvailable = () =>
    typeof CONFIG.walletConnectProjectId === "string" && CONFIG.walletConnectProjectId.length > 0;

/** Disconnect WalletConnect session and clear stored provider. */
export const disconnectWalletConnect = async (): Promise<void> => {
    if (walletConnectProviderInstance) {
        try {
            await walletConnectProviderInstance.disconnect();
        } catch (_err) {
            // ignore
        }
        walletConnectProviderInstance = null;
    }
};

const switchOrAddTargetChain = async (provider: MetaMaskProvider) => {
    try {
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_PARAMS.chainId }],
        });
    } catch (error) {
        const typedError = error as { code?: number };
        if (typedError?.code === 4902) {
            await provider.request({
                method: "wallet_addEthereumChain",
                params: [NETWORK_PARAMS],
            });
            return;
        }
        throw error;
    }
};

const shortenAddress = (address: string) => {
    if (!address) {
        return "";
    }
    return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

const existingWalletAccount = async (address: string, email?: string) => {
    const response = await checkUserByAddress(address);
    if(response.success && response.data && response.data.id) {
        if(email && response.data.email !== email) {
            return true
        } else {
            return false;
        }
    } else {
        return false;
    }
} 

export const connectMetaMaskWallet = async (email?: string): Promise<{ address: string; chainId: string } | null> => {
    const provider = getEthereumProvider();

    if (!provider?.isMetaMask) {
        toast.error("MetaMask is required. Install the extension to continue.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        return null;
    }

    try {
        const currentChainId = (await provider.request({ method: "eth_chainId" })) as string;
        if (!isSameChain(currentChainId, NETWORK_PARAMS.chainId)) {
            await switchOrAddTargetChain(provider);
            // throw new Error("Chain not supported. Please switch to the supported chain.");
        }

        const accounts = (await provider.request({
            method: "eth_requestAccounts",
        })) as string[];

        const invalidConnectingAccount = await existingWalletAccount(accounts[0], email);
        if(invalidConnectingAccount) {
            toast.error("Wallet address already exists! Connected to another wallet account!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return null;
        }

        if (!accounts || accounts.length === 0) {
            throw new Error("No wallet accounts returned by MetaMask.");
        }

        const latestChainId = (await provider.request({ method: "eth_chainId" })) as string;

        toast.success(`Connected ${shortenAddress(accounts[0])} on ${NETWORK_PARAMS.chainName}.`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });

        return { address: accounts[0], chainId: latestChainId };
    } catch (error) {
        toast.error(error as string,{
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        return null;
    }
};

/** Chain ID as decimal number for WalletConnect optionalChains. */
const getTargetChainIdNum = (): number => {
    const hex = TARGET_CHAIN_ID;
    if (!hex) return 97;
    const n = parseInt(hex, 16);
    return Number.isFinite(n) ? n : 97;
};

/** Connect via WalletConnect (QR / deep link). Use when no injected MetaMask (e.g. mobile browser). */
export const connectWalletConnect = async (email?: string): Promise<{ address: string; chainId: string } | null> => {
    const projectId = CONFIG.walletConnectProjectId?.trim();
    if (!projectId) {
        toast.error("WalletConnect is not configured. Add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your environment.", {
            position: "top-right",
            autoClose: 5000,
        });
        return null;
    }

    try {
        if (!walletConnectProviderInstance) {
            walletConnectProviderInstance = await EthereumProvider.init({
                projectId,
                optionalChains: [getTargetChainIdNum()],
                showQrModal: true,
                metadata: {
                    name: "GrumbPv",
                    description: "Connect your wallet",
                    url: typeof window !== "undefined" ? window.location.origin : "",
                    icons: [],
                },
            });
        }

        await walletConnectProviderInstance.connect();
        const provider = walletConnectProviderInstance as unknown as MetaMaskProvider;

        const accounts = (await provider.request({ method: "eth_accounts" })) as string[] | undefined;
        if (!accounts?.length) {
            toast.error("No accounts returned from wallet.");
            return null;
        }

        const invalidConnectingAccount = await existingWalletAccount(accounts[0], email);
        if (invalidConnectingAccount) {
            toast.error("Wallet address already exists! Connected to another wallet account!", {
                position: "top-right",
                autoClose: 5000,
            });
            await disconnectWalletConnect();
            return null;
        }

        let chainId = (await provider.request({ method: "eth_chainId" })) as string;
        if (!isSameChain(chainId, NETWORK_PARAMS.chainId)) {
            await switchOrAddTargetChain(provider);
            chainId = (await provider.request({ method: "eth_chainId" })) as string;
        }

        toast.success(`Connected ${shortenAddress(accounts[0])} on ${NETWORK_PARAMS.chainName}.`, {
            position: "top-right",
            autoClose: 5000,
        });

        return { address: accounts[0], chainId };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message, { position: "top-right", autoClose: 5000 });
        return null;
    }
};

/**
 * Connect wallet: uses MetaMask (injected) when available, otherwise WalletConnect (mobile).
 * Returns { address, chainId } and the context should set provider to getEthereumProvider() or getWalletConnectProvider() accordingly.
 */
export const connectWallet = async (email?: string): Promise<{ address: string; chainId: string; via: "injected" | "walletconnect" } | null> => {
    const injected = getEthereumProvider();
    if (injected?.isMetaMask) {
        const result = await connectMetaMaskWallet(email);
        return result ? { ...result, via: "injected" as const } : null;
    }
    if (isWalletConnectAvailable()) {
        const result = await connectWalletConnect(email);
        return result ? { ...result, via: "walletconnect" as const } : null;
    }
    toast.error("No wallet available. Install MetaMask or use a WalletConnect-compatible browser.", {
        position: "top-right",
        autoClose: 5000,
    });
    return null;
};