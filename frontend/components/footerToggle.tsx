'use client';

import Footer from "@/components/footer";
import { usePathname } from "next/navigation";

const FooterToggle = () => {
  const pathname = usePathname();
  const hideOnChat = pathname?.startsWith("/chat");

  if (hideOnChat) return null;
  return <Footer />;
};

export default FooterToggle;

