'use client'

import { createContext, ReactNode, useState } from 'react';
import { NotificationLoadingContextType, notificationLoadingState } from '@/types/loading';

const defaultProvider: NotificationLoadingContextType = {
  notificationLoadingState: "pending",
  setnotificationLoadingState: () => {},
};

const NotificationLoadingCtx = createContext<NotificationLoadingContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

const NotificationLoadingProvider = ({ children }: Props) => {
    const [notificationLoadingState, setnotificationLoadingState] = useState<notificationLoadingState>("pending");

    return (
        <NotificationLoadingCtx.Provider value={{ notificationLoadingState, setnotificationLoadingState }}>
            {children}
        </NotificationLoadingCtx.Provider>  
    );
};

export { NotificationLoadingCtx, NotificationLoadingProvider };