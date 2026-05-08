'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useDisconnect, usePublicClient, useSendTransaction } from "wagmi";
import { switchChain, getAccount } from "@wagmi/core";
import type { Hash, Hex } from "viem";
import { appChain, wagmiConfig } from "@/config/wagmi";

type WalletTransaction = {
  to: string;
  value?: string; // expected hex wei string (0x...) or decimal wei to be normalized
  data?: string;
  gas?: string; // hex or decimal, will be normalized
  gasPrice?: string; // hex or decimal, will be normalized
  chainId?: number | string; // optional override
};

type WalletTransactionResult = {
  hash: string | null;
  error: string | null;
};

type WalletContextValue = {
  address: string | null;
  chainId: string | null;
  provider: unknown | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: (email?: string) => Promise<{ address: string; chainId: string } | null>;
  /** True when MetaMask SDK mobile path is available. */
  isMobileWalletAvailable: boolean;
  disconnect: () => void;
  sendTransaction: (tx: WalletTransaction) => Promise<WalletTransactionResult>;
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
  sendTransaction: async () => ({
    hash: null,
    error: "Wallet not connected",
  }),
  isMobileWalletAvailable: false,
};

export const WalletCtx = createContext<WalletContextValue>(defaultContext);

type Props = {
  children: ReactNode;
};

export const WalletProvider = ({ children }: Props) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openConnectModal } = useConnectModal();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { isConnected, address } = useAccount();
  const chainIdDecimal = useChainId();
  const chainId = chainIdDecimal ? `0x${chainIdDecimal.toString(16)}` : null;
  const connectedAddress = address ?? null;
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const provider = null;
  const isMobileWalletAvailable = true;

  const disconnect = useCallback(() => {
    disconnectWallet();
    setError(null);
  }, [disconnectWallet]);

  const connect = useCallback(async (email?: string) => {
    void email;
    setIsConnecting(true);
    setError(null);

    try {
      if (!isConnected) {
        await openConnectModal?.();
      }

      const account = getAccount(wagmiConfig);
      if (!account.address) {
        return null;
      }

      if (account.chainId !== appChain.id) {
        await switchChain(wagmiConfig, { chainId: appChain.id });
      }

      return {
        address: account.address,
        chainId: `0x${appChain.id.toString(16)}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet.";
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const sendTransaction = useCallback(
    async (tx: WalletTransaction): Promise<WalletTransactionResult> => {
      const toHex = (raw?: string): Hex | undefined => {
        if (!raw) return undefined;
        if (raw.startsWith("0x") || raw.startsWith("0X")) return raw as Hex;
        try {
          return `0x${BigInt(raw).toString(16)}` as Hex;
        } catch {
          return undefined;
        }
      };

      if (!connectedAddress) {
        throw new Error("No connected account. Connect MetaMask first.");
      }
      if (!publicClient) {
        throw new Error("Public client is not available.");
      }

      const txValue = tx.value ? BigInt(tx.value) : undefined;
      const txGas = tx.gas ? BigInt(tx.gas) : undefined;
      const txGasPrice = tx.gasPrice ? BigInt(tx.gasPrice) : undefined;
      const txData = toHex(tx.data);

      let hash: string | undefined;
      try {
        hash = await sendTransactionAsync({
          account: address as Hex,
          // wagmi requires a checksummed hex address
          // and we only enter this path when connectedAddress exists.
          to: tx.to as Hex,
          value: txValue,
          gas: txGas,
          gasPrice: txGasPrice,
          data: txData,
        });
      } catch (err) {
        console.warn("Failed to send transaction", err);
        const message =
          (err as any)?.code === 4001
            ? "User rejected the transaction in MetaMask."
            : err instanceof Error
            ? err.message
            : "Failed to send transaction.";
        return { hash: null, error: message };
      }

      if (!hash) {
        return { hash: null, error: "Failed to obtain transaction hash." };
      }

      let receipt;
      try {
        receipt = await publicClient.waitForTransactionReceipt({
          hash: hash as Hash,
          confirmations: 1,
          pollingInterval: 2000,
          timeout: 120_000,
        });
      } catch (err) {
        console.warn("Failed to fetch transaction receipt", err);
        const message = err instanceof Error ? err.message : "Failed to fetch transaction receipt.";
        return { hash: null, error: message };
      }

      if (!receipt) {
        console.warn("Transaction receipt not found within timeout", hash);
        return {
          hash: null,
          error: "Transaction not mined within the expected time.",
        };
      }

      const isSuccess = receipt.status === "success";

      if (!isSuccess) {
        console.warn("Transaction failed on-chain", { hash, receipt });
        return {
          hash: null,
          error: "Transaction failed on-chain.",
        };
      }

      return { hash, error: null };
    },
    [connectedAddress, chainId, provider, publicClient, sendTransactionAsync]
  );

  return (
    <WalletCtx.Provider
      value={{
        address: connectedAddress,
        chainId,
        provider,
        isConnecting,
        isConnected,
        error,
        connect,
        disconnect,
        sendTransaction,
        isMobileWalletAvailable,
      }}
    >
      {children}
    </WalletCtx.Provider>
  );
};

export const useWallet = () => useContext(WalletCtx);


