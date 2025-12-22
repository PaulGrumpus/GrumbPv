'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { NotificationContextType, Notification, NotificationEntity, NotificationType } from "../types/notification";
import useSocket from "@/service/socket";
import { getBidsByFreelancerId, getConversationById, getGigsByFreelancerId, getJobMilestoneById, getJobsByClientId, getNotificationsByUserIdWithFilters } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import { NotificationLoadingCtx } from "./notificationLoadingContext";
import { UserLoadingCtx } from "./userLoadingContext";
import { websocket } from "@/config/config";
import { useProjectInfo } from "./projectInfoContext";
import { ProjectInfoLoadingCtx } from "./projectInfoLoadingContext";
import { ConversationsInfoCtx } from "./conversationsContext";
import { MessageLoadingCtx } from "./messageLoadingContext";
import { ConversationInfo } from "@/types/conversation";

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
    const { messageLoadingState } = useContext(MessageLoadingCtx);
    const { setnotificationLoadingState } = useContext(NotificationLoadingCtx);
    const { setJobMilestonesInfo, jobsInfo, setJobsInfo, gigsInfo, setGigsInfo, bidsInfo, setBidsInfo } = useProjectInfo();
    const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);

    const upsertConversationInfo = (newConversationInfo: ConversationInfo) => {
        setConversationsInfo((prev) => {
            const existingIndex = prev.findIndex(
                (conversationInfo) => conversationInfo.conversation.id === newConversationInfo.conversation.id
            );
            if (existingIndex === -1) {
                return [...prev, newConversationInfo];
            }
            const next = [...prev];
            next[existingIndex] = newConversationInfo;
            return next;
        });
    };

    const init = async () => {
        if(messageLoadingState === "success") {
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
    }, [messageLoadingState]);

    useEffect(() => {
    }, [notifications]);

    useEffect(() => {
        if (!userInfo.id || !notificationSocket.socket || !notificationSocket.isConnected) {
            return;
        }

        const socket = notificationSocket.socket;
        const handleNotification = async (notification: Notification) => {
            setNotifications((prev) => [...prev, notification]);

            if (notification.entity_type === NotificationEntity.milestone) {
                const updatedMilestoneInfo = await getJobMilestoneById(notification.entity_id);                    
                if (updatedMilestoneInfo.success && updatedMilestoneInfo.data) {
                    const updatedMilestone = updatedMilestoneInfo.data;
                    setJobMilestonesInfo((prev) => {
                        const milestoneExists = prev.some((jobMilestone) => jobMilestone.id === updatedMilestone.id);
                        if (notification.type === NotificationType.milestoneStarted) {
                            if (milestoneExists) {
                                return prev.map((jobMilestone) =>
                                    jobMilestone.id === updatedMilestone.id ? updatedMilestone : jobMilestone
                                );
                            }
                            return [...prev, updatedMilestone];
                        }
                        if (!milestoneExists) {
                            return prev;
                        }
                        return prev.map((jobMilestone) =>
                            jobMilestone.id === updatedMilestone.id ? updatedMilestone : jobMilestone
                        );
                    });
                }
            }

            if (notification.entity_type === NotificationEntity.job) {
                if (notification.type === NotificationType.jobPosted) {
                    const userJobs = await getJobsByClientId(userInfo.id);
                    if (userJobs.success) {
                        setJobsInfo(userJobs.data ?? []);
                    } else {
                        setJobsInfo([]);
                    }
                }
            }

            if (notification.entity_type === NotificationEntity.gig) {
                const userGigs = await getGigsByFreelancerId(userInfo.id);
                if (userGigs.success) {
                    setGigsInfo(userGigs.data ?? []);
                } else {
                    setGigsInfo([]);
                }
            }

            if (notification.entity_type === NotificationEntity.conversation) {
                if (
                    notification.type === NotificationType.chatCreated ||
                    notification.type === NotificationType.chatUpdated
                ) {
                    const conversationInfo = await getConversationById(notification.entity_id);
                    if (conversationInfo.success && conversationInfo.data) {
                        upsertConversationInfo(conversationInfo.data);
                    }
                }
            }

            if (notification.entity_type === NotificationEntity.bid) {
                if (notification.type === NotificationType.bidSent) {
                    const userBids = await getBidsByFreelancerId(userInfo.id);
                    if (userBids.success) {
                        setBidsInfo(userBids.data ?? []);
                    } else {
                        setBidsInfo([]);
                    }
                }
            }
        };

        socket.emit("joinUserRoom", userInfo.id);
        socket.on(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);

        return () => {
            socket.off(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
        };
    }, [notificationSocket.isConnected, notificationSocket.socket, userInfo.id]);

    return (
        <NotificationCtx.Provider value={{ notifications, setNotifications, notificationsError, setNotificationsError }}>
            {children}
        </NotificationCtx.Provider>
    );
};