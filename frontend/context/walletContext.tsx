'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  connectMetaMaskWallet,
  getEthereumProvider,
  type MetaMaskProvider,
} from "@/utils/walletConnnect";

type WalletTransaction = {
  to: string;
  value?: string; // expected hex wei string (0x...) or decimal wei to be normalized
  data?: string;
  gas?: string; // hex or decimal, will be normalized
  gasPrice?: string; // hex or decimal, will be normalized
  chainId?: number | string; // optional override
};

type WalletContextValue = {
  address: string | null;
  chainId: string | null;
  provider: MetaMaskProvider | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: (email?: string) => Promise<{ address: string; chainId: string } | null>;
  disconnect: () => void;
  sendTransaction: (tx: WalletTransaction) => Promise<string>;
};

const defaultContext: WalletContextValue = {
  address: null,
  chainId: null,
  provider: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => null,
  disconnect: () => {},
  sendTransaction: async () => {
    throw new Error("Wallet not connected");
  },
};

export const WalletCtx = createContext<WalletContextValue>(defaultContext);

type Props = {
  children: ReactNode;
};

export const WalletProvider = ({ children }: Props) => {
  const [provider, setProvider] = useState<MetaMaskProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = useMemo(() => Boolean(address), [address]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  useEffect(() => {
    const eth = getEthereumProvider();
    if (!eth) {
      return;
    }
    setProvider(eth);

    eth.request({ method: "eth_accounts" })
      .then((accounts) => {
        const accountList = accounts as string[];
        if (accountList && accountList.length > 0) {
          setAddress(accountList[0]);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch eth_accounts", err);
      });

    eth.request({ method: "eth_chainId" })
      .then((chain) => setChainId(chain as string))
      .catch((err) => console.warn("Failed to fetch chainId", err));

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[] | undefined;
      if (!accountList || accountList.length === 0) {
        disconnect();
        return;
      }
      setAddress(accountList[0]);
    };

    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === "string") {
        setChainId(nextChainId);
      }
    };

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  const connect = useCallback(async (email?: string) => {
    const eth = getEthereumProvider();
    if (!eth?.isMetaMask) {
      setError("MetaMask is required. Please install or unlock the extension.");
      return null;
    }
    console.log("test-email", email);
    setProvider(eth);
    setIsConnecting(true);
    setError(null);

    try {
      const result = await connectMetaMaskWallet(email);
      if (result) {
        setAddress(result.address);
        setChainId(result.chainId);
        return result;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet.";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const sendTransaction = useCallback(
    async (tx: WalletTransaction) => {
      const normalizeHex = (raw?: string) => {
        if (!raw) return undefined;
        if (raw.startsWith("0x") || raw.startsWith("0X")) return raw;
        try {
          return `0x${BigInt(raw).toString(16)}`;
        } catch {
          return raw;
        }
      };

      const eth = provider ?? getEthereumProvider();
      if (!eth) {
        throw new Error("Wallet provider not available. Connect MetaMask first.");
      }
      if (!address) {
        throw new Error("No connected account. Connect MetaMask first.");
      }

      const value = normalizeHex(tx.value);
      const gas = normalizeHex(tx.gas);
      const gasPrice = normalizeHex(tx.gasPrice);
      const txChainId = tx.chainId ?? chainId;
      const normalizedChainId =
        typeof txChainId === "number"
          ? `0x${txChainId.toString(16)}`
          : txChainId;

      const txParams = {
        from: address,
        ...tx,
        value,
        gas,
        gasPrice,
        chainId: normalizedChainId,
      };

      const hash = await eth.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      return hash as string;
    },
    [address, chainId, provider]
  );

  return (
    <WalletCtx.Provider
      value={{
        address,
        chainId,
        provider,
        isConnecting,
        isConnected,
        error,
        connect,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </WalletCtx.Provider>
  );
};

export const useWallet = () => useContext(WalletCtx);


