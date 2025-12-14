'use client';

import { createContext, ReactNode, useState } from "react";
import { NotificationContextType, Notification } from "../types/notification";


const defaultProvider: NotificationContextType = {
    notifications: [],
    setNotifications: () => {},
    notificationsError: '',
    setNotificationsError: () => {},
};

export const NotificationCtx = createContext<NotificationContextType>(defaultProvider);

type Props = {
    children: ReactNode;
};

export const NotificationProvider = ({ children }: Props) => {
    const [notifications, setNotifications] = useState<Notification[]>(defaultProvider.notifications);
    const [notificationsError, setNotificationsError] = useState<string>(defaultProvider.notificationsError);

    return (
        <NotificationCtx.Provider value={{ notifications, setNotifications, notificationsError, setNotificationsError }}>
            {children}
        </NotificationCtx.Provider>
    );
};