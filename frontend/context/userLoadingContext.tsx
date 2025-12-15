'use client'

import { createContext, ReactNode, useState } from 'react';
import { LoadingContextType, userLoadingState } from '@/types/loading';

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

    return (
        <UserLoadingCtx.Provider value={{ userLoadingState, setuserLoadingState }}>
            {children}
        </UserLoadingCtx.Provider>  
    );
};

export { UserLoadingCtx, UserLoadingProvider };