'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { NotificationContextType, Notification, NotificationEntity, NotificationType } from "../types/notification";
import useSocket from "@/service/socket";
import { getConversationById, getGigsByFreelancerId, getJobMilestoneById, getJobsByClientId, getNotificationsByUserIdWithFilters } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import { NotificationLoadingCtx } from "./notificationLoadingContext";
import { UserLoadingCtx } from "./userLoadingContext";
import { websocket } from "@/config/config";
import { useProjectInfo } from "./projectInfoContext";
import { ProjectInfoLoadingCtx } from "./projectInfoLoadingContext";
import { ConversationsInfoCtx } from "./conversationsContext";
import { MessageLoadingCtx } from "./messageLoadingContext";

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
    const { setJobMilestonesInfo, jobsInfo, setJobsInfo, gigsInfo, setGigsInfo } = useProjectInfo();
    const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);

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
        if(notificationSocket.isConnected) {
            notificationSocket.socket?.emit("joinUserRoom", userInfo.id);
            notificationSocket.socket?.on(websocket.WEBSOCKET_NEW_NOTIFICATION, async (notification: Notification) => {
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
                if(notification.entity_type === NotificationEntity.job) {
                    if(notification.type === NotificationType.jobPosted) {
                        const userJobs = await getJobsByClientId(userInfo.id);
                        if(userJobs.success) {
                            setJobsInfo(userJobs.data ?? []);
                        } else {
                            setJobsInfo([]);
                        }
                    }
                }
                if(notification.entity_type === NotificationEntity.gig) {
                    const userGigs = await getGigsByFreelancerId(userInfo.id);
                    if(userGigs.success) {
                        setGigsInfo(userGigs.data ?? []);
                    } else {
                        setGigsInfo([]);
                    }
                }
                if(notification.entity_type === NotificationEntity.conversation) {
                    if(notification.type === NotificationType.chatCreated) {
                        const conversationInfo = await getConversationById(notification.entity_id);
                        if(conversationInfo.success) {
                            setConversationsInfo([...conversationsInfo, conversationInfo.data ?? []]);
                        } else {
                            setConversationsInfo([]);
                        }
                    }
                    if(notification.type === NotificationType.chatUpdated) {
                        const conversationInfo = await getConversationById(notification.entity_id);
                        if(conversationInfo.success) {
                            conversationsInfo.forEach((conversation) => {
                                if(conversation.conversation.id === notification.entity_id) {
                                    conversation.conversation = conversationInfo.data.conversation;
                                    conversation.participants = conversationInfo.data.participants;
                                    conversation.clientInfo = conversationInfo.data.clientInfo;
                                    conversation.freelancerInfo = conversationInfo.data.freelancerInfo;
                                    conversation.jobInfo = conversationInfo.data.jobInfo;
                                    conversation.gigInfo = conversationInfo.data.gigInfo;
                                }
                            });
                            setConversationsInfo(conversationsInfo);
                        } else {
                            setConversationsInfo([]);
                        }
                    }
                }                
            });
        }
    }, [notificationSocket.isConnected]);

    return (
        <NotificationCtx.Provider value={{ notifications, setNotifications, notificationsError, setNotificationsError }}>
            {children}
        </NotificationCtx.Provider>
    );
};