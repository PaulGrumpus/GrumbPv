'use client'

import { createContext, ReactNode, useEffect, useState } from 'react';
import { LoadingContextType, LoadingState } from '@/types/loading';
import { useRouter } from 'next/navigation';

const defaultProvider: LoadingContextType = {
  loadingState: "pending",
  setLoadingState: () => {},
};

const LoadingCtx = createContext<LoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const LoadingProvider = ({ children }: Props) => {
    const [loadingState, setLoadingState] = useState<LoadingState>("pending");
    const router = useRouter();

    useEffect(() => {
        if(loadingState === 'failure') {
            router.push('/')
        }
    }, [loadingState])

    return (
        <LoadingCtx.Provider value={{ loadingState, setLoadingState }}>
            {children}
        </LoadingCtx.Provider>  
    );
};

export { LoadingCtx, LoadingProvider };