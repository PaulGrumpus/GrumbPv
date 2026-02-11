"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/navbar";
import FooterToggle from "@/components/footerToggle";

const HIDE_CHROME_PATHS = new Set(["/resetPassword"]);
const HIDE_CHROME_PREFIXES = ["/admin"];

const ConditionalShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const hideChrome = pathname
    ? HIDE_CHROME_PATHS.has(pathname) || HIDE_CHROME_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  return (
    <>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <FooterToggle />}
      <ToastContainer />
    </>
  );
};

export default ConditionalShell;
