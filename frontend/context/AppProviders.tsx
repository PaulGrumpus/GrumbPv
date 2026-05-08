"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";

import SocketContextProvider from "@/context/socketContext";
import { UserLoadingProvider } from "@/context/userLoadingContext";
import { UserInfoProvider } from "@/context/userContext";
import { DashboardLoadingProvider } from "@/context/dashboardLoadingContext";
import { DashboardProvider } from "@/context/dashboardContext";
import { MilestoneDeliveryProvider } from "@/context/milestoneDeliveryContext";
import { WalletProvider } from "@/context/walletContext";
import { appChain, wagmiConfig } from "@/config/wagmi";

const queryClient = new QueryClient();

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={appChain}>
          <WalletProvider>
            <SocketContextProvider>
              <UserLoadingProvider>
                <UserInfoProvider>
                  <DashboardLoadingProvider>
                    <DashboardProvider>
                      <MilestoneDeliveryProvider>{children}</MilestoneDeliveryProvider>
                    </DashboardProvider>
                  </DashboardLoadingProvider>
                </UserInfoProvider>
              </UserLoadingProvider>
            </SocketContextProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

