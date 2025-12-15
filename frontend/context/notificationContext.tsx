'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { NotificationContextType, Notification, NotificationEntity } from "../types/notification";
import useSocket from "@/service/socket";
import { getJobMilestoneById, getNotificationsByUserIdWithFilters } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import { NotificationLoadingCtx } from "./notificationLoadingContext";
import { UserLoadingCtx } from "./userLoadingContext";
import { websocket } from "@/config/config";
import { useProjectInfo } from "./projectInfoContext";
import { ProjectInfoLoadingCtx } from "./projectInfoLoadingContext";

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
    const { projectInfoLoadingState } = useContext(ProjectInfoLoadingCtx);
    const { setnotificationLoadingState } = useContext(NotificationLoadingCtx);
    const { jobMilestonesInfo, setJobMilestonesInfo } = useProjectInfo();
    
    const init = async () => {
        if(projectInfoLoadingState === "success") {
            setnotificationLoadingState("pending");
            const notifications = await getNotificationsByUserIdWithFilters(userInfo.id, false);
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
    }, [projectInfoLoadingState]);

    useEffect(() => {
        console.log("test-notifications", notifications);
    }, [notifications]);

    useEffect(() => {
        if(notificationSocket.isConnected) {
            notificationSocket.socket?.emit("joinUserRoom", userInfo.id);
            notificationSocket.socket?.on(websocket.WEBSOCKET_NEW_NOTIFICATION, async (notification: Notification) => {
                setNotifications((prev) => [...prev, notification]);
                if (notification.entity_type === NotificationEntity.milestone) {
                    const updatedMilestoneInfo = await getJobMilestoneById(notification.entity_id);
                    if (updatedMilestoneInfo.success) {
                        jobMilestonesInfo.forEach((jobMilestone) => {
                            if(jobMilestone.id === notification.entity_id) {
                                jobMilestone.status = updatedMilestoneInfo.data.status;
                            }
                        });
                        setJobMilestonesInfo(jobMilestonesInfo);
                    }

                    console.log("test-jobMilestonesInfo", jobMilestonesInfo);
                }
            });
        }
    }, [notificationSocket.isConnected]);

    useEffect(() => {
        console.log("notifications", notifications);
    }, [notifications]);

    return (
        <NotificationCtx.Provider value={{ notifications, setNotifications, notificationsError, setNotificationsError }}>
            {children}
        </NotificationCtx.Provider>
    );
};