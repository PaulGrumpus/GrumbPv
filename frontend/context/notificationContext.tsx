'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { NotificationContextType, Notification } from "../types/notification";
import useSocket from "@/service/socket";
import { getNotificationsByUserIdWithFilters } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import { NotificationLoadingCtx } from "./notificationLoadingContext";
import { UserLoadingCtx } from "./userLoadingContext";
import { websocket } from "@/config/config";

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
    const notificationSocket = useSocket();
    const { userInfo } = useContext(UserInfoCtx);
    const { userLoadingState } = useContext(UserLoadingCtx);
    const { setnotificationLoadingState } = useContext(NotificationLoadingCtx);

    const init = async () => {
        if(userLoadingState === "success") {
            setnotificationLoadingState("pending");
            const notifications = await getNotificationsByUserIdWithFilters(userInfo.id);
            if(notifications.success) {
                setNotifications(notifications.data ?? []);
            } else {
                setNotificationsError(notifications.error ?? 'Failed to get notifications');
            }
            setnotificationLoadingState("success");
        } else {
            setnotificationLoadingState("pending");
        }
    }

    useEffect(() => {
        init();
    }, [userLoadingState]);

    useEffect(() => {
        if(notificationSocket.isConnected) {
            notificationSocket.socket?.emit("joinUserRoom", userInfo.id);
            notificationSocket.socket?.on(websocket.WEBSOCKET_NEW_NOTIFICATION, (notification: Notification) => {
                setNotifications((prev) => [...prev, notification]);
            });
        }
    }, [notificationSocket.isConnected]);

    return (
        <NotificationCtx.Provider value={{ notifications, setNotifications, notificationsError, setNotificationsError }}>
            {children}
        </NotificationCtx.Provider>
    );
};