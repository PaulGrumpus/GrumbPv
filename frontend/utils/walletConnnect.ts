import { toast } from "react-toastify";
import { CONFIG } from "@/config/config";
import { checkUserByAddress } from "./functions";

const isSameChain = (current?: string | null, target?: string | null) =>
    current?.toLowerCase() === target?.toLowerCase();

/** EIP-1193–like provider (injected or MetaMask SDK). */
export type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

/** MetaMask SDK instance (lazy-inited) and provider when connected via mobile. */
let metamaskSdk: import("@metamask/sdk").MetaMaskSDK | null = null;
let metamaskSdkProvider: MetaMaskProvider | null = null;

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

/** Returns the MetaMask SDK provider when connected via SDK (mobile path). */
export const getMetaMaskSdkProvider = (): MetaMaskProvider | null => metamaskSdkProvider;

/** Whether mobile wallet path is available (MetaMask SDK in browser). */
export const isMobileWalletAvailable = () => typeof window !== "undefined";

/** Disconnect MetaMask SDK session and clear stored provider. */
export const disconnectMetaMaskSdk = (): void => {
    metamaskSdkProvider = null;
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

/** Connect via MetaMask SDK (deep link). Use when no injected MetaMask (e.g. mobile browser). */
export const connectMetaMaskSdk = async (email?: string): Promise<{ address: string; chainId: string } | null> => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        if (!metamaskSdk) {
            const { MetaMaskSDK } = await import("@metamask/sdk");
            metamaskSdk = new MetaMaskSDK({
                dappMetadata: {
                    name: "GrumbPv",
                    url: window.location.origin,
                },
            });
            await metamaskSdk.init();
        }

        const accounts = (await metamaskSdk.connect()) as string[] | undefined;
        if (!accounts?.length) {
            toast.error("No accounts returned from MetaMask.");
            return null;
        }

        const provider = metamaskSdk.getProvider() as unknown as MetaMaskProvider;
        metamaskSdkProvider = provider;

        const invalidConnectingAccount = await existingWalletAccount(accounts[0], email);
        if (invalidConnectingAccount) {
            toast.error("Wallet address already exists! Connected to another wallet account!", {
                position: "top-right",
                autoClose: 5000,
            });
            disconnectMetaMaskSdk();
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
        disconnectMetaMaskSdk();
        return null;
    }
};

/**
 * Connect wallet: uses MetaMask (injected) when available, otherwise MetaMask SDK (mobile).
 * Returns { address, chainId, via } and the context should set provider to getEthereumProvider() or getMetaMaskSdkProvider() accordingly.
 */
export const connectWallet = async (email?: string): Promise<{ address: string; chainId: string; via: "injected" | "sdk" } | null> => {
    const injected = getEthereumProvider();
    if (injected?.isMetaMask) {
        const result = await connectMetaMaskWallet(email);
        return result ? { ...result, via: "injected" as const } : null;
    }
    if (isMobileWalletAvailable()) {
        const result = await connectMetaMaskSdk(email);
        return result ? { ...result, via: "sdk" as const } : null;
    }
    toast.error("No wallet available. Install MetaMask to continue.", {
        position: "top-right",
        autoClose: 5000,
    });
    return null;
};