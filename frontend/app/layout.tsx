import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono, Roboto, Poppins, Inter } from "next/font/google";
import "./globals.css";
import ConditionalShell from "@/components/ConditionalShell";
import "react-toastify/dist/ReactToastify.css";
import "@rainbow-me/rainbowkit/styles.css";

/** Loaded async so wagmi/RainbowKit do not bloat the root layout chunk (avoids chunk load timeouts in dev). */
const AppProviders = dynamic(() => import("@/context/AppProviders"), {
  ssr: true,
  loading: () => (
    <div className="min-h-[100dvh] bg-white" aria-busy="true" aria-label="Loading application" />
  ),
});

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
        <AppProviders>
          <ConditionalShell>{children}</ConditionalShell>
        </AppProviders>
      </body>
    </html>
  );
}
