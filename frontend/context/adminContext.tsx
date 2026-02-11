'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decodeToken } from '@/utils/jwt';

interface AdminInfo {
  id: string;
  email: string;
  role: string;
  display_name: string;
  image_id: string;
}

interface AdminContextType {
  adminInfo: AdminInfo | null;
  setAdminInfo: (info: AdminInfo | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType>({
  adminInfo: null,
  setAdminInfo: () => {},
  isLoading: true,
  logout: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded && decoded.role === 'admin') {
          setAdminInfo({
            id: decoded.id,
            email: decoded.email || '',
            role: decoded.role,
            display_name: decoded.display_name || 'Admin',
            image_id: decoded.image_id || 'default.jpg',
          });
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch {
        localStorage.removeItem('adminToken');
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminInfo(null);
  };

  return (
    <AdminContext.Provider value={{ adminInfo, setAdminInfo, isLoading, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
