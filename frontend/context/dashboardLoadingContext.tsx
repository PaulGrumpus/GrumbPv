'use client'

import { createContext, ReactNode, useState } from 'react';
import { DashboardLoadingContextType, dashboardLoadingState } from '@/types/loading';

const defaultProvider: DashboardLoadingContextType = {
  dashboardLoadingState: "pending",
  setdashboardLoadingState: () => {},
};

const DashboardLoadingCtx = createContext<DashboardLoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const DashboardLoadingProvider = ({ children }: Props) => {
    const [dashboardLoadingState, setdashboardLoadingState] = useState<dashboardLoadingState>("pending");

    return (
        <DashboardLoadingCtx.Provider value={{ dashboardLoadingState, setdashboardLoadingState }}>
            {children}
        </DashboardLoadingCtx.Provider>  
    );
};

export { DashboardLoadingCtx, DashboardLoadingProvider };