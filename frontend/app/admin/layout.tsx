'use client';

import { AdminProvider } from '@/context/adminContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
