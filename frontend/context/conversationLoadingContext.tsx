'use client'

import { createContext, ReactNode, useState } from 'react';
import { ConversationLoadingContextType, conversationLoadingState } from '@/types/loading';

const defaultProvider: ConversationLoadingContextType = {
  conversationLoadingState: "pending",
  setconversationLoadingState: () => {},
};

const ConversationLoadingCtx = createContext<ConversationLoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const ConversationLoadingProvider = ({ children }: Props) => {
    const [conversationLoadingState, setconversationLoadingState] = useState<conversationLoadingState>("pending");

    return (
        <ConversationLoadingCtx.Provider value={{ conversationLoadingState, setconversationLoadingState }}>
            {children}
        </ConversationLoadingCtx.Provider>  
    );
};

export { ConversationLoadingCtx, ConversationLoadingProvider };