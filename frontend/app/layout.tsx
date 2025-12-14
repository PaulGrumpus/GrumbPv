import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Poppins, Inter } from "next/font/google";
import "./globals.css";
import FooterToggle from "@/components/footerToggle";
import Navbar from "@/components/navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserInfoProvider } from "@/context/userContext";
import { UserLoadingProvider } from "@/context/userLoadingContext";
import { ConversationLoadingProvider } from "@/context/conversationLoadingContext";
import { ConversationsInfoProvider } from "@/context/conversationsContext";
import { MessagesInfoProvider } from "@/context/messagesContext";
import { MessageLoadingProvider } from "@/context/messageLoadingContext";
import SocketContextProvider from "@/context/socketContext";
import { WalletProvider } from "@/context/walletContext";
import { ProjectInfoLoadingProvider } from "@/context/projectInfoLoadingContext";
import { ProjectInfoProvider } from "@/context/projectInfoContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Grumpus - The platform for freelancers and clients (Beta Version)",
  description: "Grumpus is the platform for freelancers and clients (Beta Version)",
  icons: {
    icon: "/Grmps/grmps.jpg", // Change this to your custom favicon path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${poppins.variable} ${inter.variable} antialiased bg-white`}
      >
        <WalletProvider>
          <UserLoadingProvider>
            <UserInfoProvider>
              <SocketContextProvider>
                <ProjectInfoLoadingProvider>
                  <ProjectInfoProvider>
                    <ConversationLoadingProvider>
                      <ConversationsInfoProvider>
                        <MessageLoadingProvider>
                          <MessagesInfoProvider>
                            <Navbar />
                            {children}
                            <FooterToggle />
                            <ToastContainer />
                          </MessagesInfoProvider>
                        </MessageLoadingProvider>
                      </ConversationsInfoProvider>
                    </ConversationLoadingProvider>
                  </ProjectInfoProvider>
                </ProjectInfoLoadingProvider>
              </SocketContextProvider>
            </UserInfoProvider>
          </UserLoadingProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
