import { toast } from "react-toastify";
import { CONFIG } from "@/config/config";
import { checkUserByAddress } from "./functions";

const isSameChain = (current?: string | null, target?: string | null) =>
    current?.toLowerCase() === target?.toLowerCase();

type MetaMaskProvider = {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

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
    rpcUrls: CONFIG.rpcUrls,
    blockExplorerUrls: CONFIG.blockExplorerUrls,
} as const;

const getEthereumProvider = () => (typeof window === "undefined" ? undefined : window.ethereum);

const switchOrAddTargetChain = async (provider: MetaMaskProvider) => {
    try {
        console.log("provider.request", provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_PARAMS.chainId }],
        }));
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
        console.log("error", error);
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
        console.log("currentChainId", currentChainId);
        console.log("NETWORK_PARAMS.chainId", NETWORK_PARAMS.chainId);
        if (!isSameChain(currentChainId, NETWORK_PARAMS.chainId)) {
            switchOrAddTargetChain(provider);
            // throw new Error("Chain not supported. Please switch to the supported chain.");
        }

        const accounts = (await provider.request({
            method: "eth_requestAccounts",
        })) as string[];

        console.log("accounts", accounts);
           
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