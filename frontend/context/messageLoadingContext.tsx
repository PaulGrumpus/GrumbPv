'use client'

import { createContext, ReactNode, useState } from 'react';
import { MessageLoadingContextType, messageLoadingState } from '@/types/loading';

const defaultProvider: MessageLoadingContextType = {
  messageLoadingState: "pending",
  setmessageLoadingState: () => {},
};

const MessageLoadingCtx = createContext<MessageLoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const MessageLoadingProvider = ({ children }: Props) => {
    const [messageLoadingState, setmessageLoadingState] = useState<messageLoadingState>("pending");

    return (
        <MessageLoadingCtx.Provider value={{ messageLoadingState, setmessageLoadingState }}>
            {children}
        </MessageLoadingCtx.Provider>  
    );
};

export { MessageLoadingCtx, MessageLoadingProvider };