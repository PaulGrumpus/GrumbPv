import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc, bscTestnet } from "wagmi/chains";

const rawChainId = (process.env.NEXT_PUBLIC_CHAIN_ID || "0x38").toLowerCase();
const isMainnet = rawChainId === "0x38" || rawChainId === "56";

export const appChain = isMainnet ? bsc : bscTestnet;

export const wagmiConfig = getDefaultConfig({
  appName: "GrumbPv",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "00000000000000000000000000000000",
  chains: [appChain],
  ssr: true,
});

