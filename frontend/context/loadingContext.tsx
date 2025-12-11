'use client'

import { createContext, ReactNode, useEffect, useState } from 'react';
import { LoadingContextType, userLoadingState } from '@/types/loading';
import { useRouter } from 'next/navigation';

const defaultProvider: LoadingContextType = {
  userLoadingState: "pending",
  setuserLoadingState: () => {},
};

const UserLoadingCtx = createContext<LoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const UserLoadingProvider = ({ children }: Props) => {
    const [userLoadingState, setuserLoadingState] = useState<userLoadingState>("pending");
    const router = useRouter();

    return (
        <UserLoadingCtx.Provider value={{ userLoadingState, setuserLoadingState }}>
            {children}
        </UserLoadingCtx.Provider>  
    );
};

export { UserLoadingCtx, UserLoadingProvider };