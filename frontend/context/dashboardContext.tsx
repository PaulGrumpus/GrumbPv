'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    DashboardJob,
    DashboardBid,
    DashboardGig,
    DashboardConversation,
    DashboardNotification,
    DashboardContextType,
} from "@/types/dashboard";

import { UserLoadingCtx } from "./userLoadingContext";
import { DashboardLoadingCtx } from "./dashboardLoadingContext";
import { getBidById, getConversationById, getDashboardDataByUserId, getGigById, getJobApplicationById, getJobBidForClientById, getJobById, getJobMilestoneByEscrowAddress, getJobMilestoneById } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import useSocket from "@/service/socket";
import { NotificationEntity, NotificationType } from "@/types/notification";
import { websocket } from "@/config/config";
import { Message } from "@/types/message";

const defaultProvider: DashboardContextType = {
    jobsInfo: [],
    setJobsInfo: () => {},
  
    gigsInfo: [],
    setGigsInfo: () => {},
  
    bidsInfo: [],
    setBidsInfo: () => {},
  
    conversationsInfo: [],
    setConversationsInfo: () => {},
  
    notificationsInfo: [],
    setNotificationsInfo: () => {},
  
    dashboardError: '',
    setDashboardError: () => {}
};
  
export const DashboardCtx =
    createContext<DashboardContextType>(defaultProvider);
  
type Props = {
    children: ReactNode;
};
  
export const DashboardProvider = ({ children }: Props) => {
    const [jobsInfo, setJobsInfo] = useState<DashboardJob[]>([]);
    const [gigsInfo, setGigsInfo] = useState<DashboardGig[]>([]);
    const [bidsInfo, setBidsInfo] = useState<DashboardBid[]>([]);
    const [conversationsInfo, setConversationsInfo] = useState<DashboardConversation[]>([]);
    const [notificationsInfo, setNotificationsInfo] = useState<DashboardNotification[]>([]);
    const [dashboardError, setDashboardError] = useState<string>("");
    const { userInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const { dashboardLoadingState, setdashboardLoadingState } = useContext(DashboardLoadingCtx);

    const notificationSocket = useSocket();
  
    const init = async () => {
        if (userLoadingState === "success") {
            setdashboardLoadingState("pending");

            const userDahboard = await getDashboardDataByUserId(userInfo.id, userInfo.role);
            if(userDahboard.success) {
                setJobsInfo(userDahboard.data.jobs ?? []);
                setGigsInfo(userDahboard.data.gigs ?? []);
                setBidsInfo(userDahboard.data.bids ?? []);
                setConversationsInfo(userDahboard.data.conversations ?? []);
                setNotificationsInfo(userDahboard.data.notifications ?? []);
        
            } else {
                setJobsInfo([]);
                setGigsInfo([]);
                setBidsInfo([]);
                setConversationsInfo([]);
                setNotificationsInfo([]);
            }
            
            setdashboardLoadingState("success");
            
        } else {
            setdashboardLoadingState("failure");
        }
    };

    useEffect(() => {
        init();
    }, [userLoadingState]);

    useEffect(() => {
        if (!userInfo.id || !notificationSocket.socket || !notificationSocket.isConnected) {
            return;
        }

        const socket = notificationSocket.socket;
        const handleIncomingMessage = (message: Message) => {
            setConversationsInfo((prev) =>
                prev.map((conversation) =>
                    conversation.id === message.conversation_id
                        ? {
                              ...conversation,
                              messages: [
                                  ...conversation.messages,
                                  {
                                      ...message,
                                      messageReceipt: [],
                                  },
                              ],
                          }
                        : conversation
                )
            );
        };

        const handleNotification = async (notification: DashboardNotification) => {
            setNotificationsInfo((prev) => [...prev, notification]);

            if (notification.entity_type === NotificationEntity.milestone) {
                let updatedMilestoneInfo = null;
                if(notification.type === NotificationType.milestoneEscrowDeployed) {
                    updatedMilestoneInfo = await getJobMilestoneByEscrowAddress(notification.entity_id);
                } else{
                    updatedMilestoneInfo = await getJobMilestoneById(notification.entity_id);                                    
                }
                if (updatedMilestoneInfo && updatedMilestoneInfo.success && updatedMilestoneInfo.data) {
                    const updatedMilestone = updatedMilestoneInfo.data;
                    setJobsInfo(prevJobs => {
                        let didUpdate = false;
                    
                        const nextJobs = prevJobs.map(job => {
                            if (job.id !== updatedMilestone.job_id) return job;
                    
                            didUpdate = true;
                    
                            const milestones = job.milestones ?? [];
                    
                            const nextMilestones = [
                                ...milestones.filter(m => m.id !== updatedMilestone.id),
                                { ...updatedMilestone }, // force new ref
                            ].sort((a, b) => a.order_index - b.order_index);
                    
                            return {
                                ...job,
                                milestones: nextMilestones,
                            };
                        });
                    
                        return didUpdate ? nextJobs : prevJobs;
                    });
                }
            }

            if (notification.entity_type === NotificationEntity.jobApplicationDoc) {
                const jobApplicationDocRes = await getJobApplicationById(notification.entity_id);
                if (!jobApplicationDocRes.success || !jobApplicationDocRes.data) return;
                const jobApplicationDoc = jobApplicationDocRes.data.job_application_info;
                let jobUpdated = false;

                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== jobApplicationDoc.job_id) return job;
                        
                        didUpdate = true;

                        const applicationDocs = job.jobApplicationsDocs ?? [];
                        const nextApplicationDocs = [
                            ...applicationDocs.filter(a => a.id !== jobApplicationDoc.id),
                            { ...jobApplicationDoc }, // force new ref
                        ];
                        return {
                            ...job,
                            jobApplicationsDocs: nextApplicationDocs,
                        };
                    });
                    jobUpdated = didUpdate;
                    return didUpdate ? nextJobs : prevJobs;
                });

                if (!jobUpdated && userInfo.role === "freelancer" && userInfo.id) {
                    const dashboardResult = await getDashboardDataByUserId(userInfo.id, userInfo.role);
                    if (dashboardResult.success && dashboardResult.data) {
                        setJobsInfo(dashboardResult.data.jobs ?? []);
                    }
                }
            }

            if (
                notification.entity_type === NotificationEntity.job
            ) {
                const jobRes = await getJobById(notification.entity_id);
                if (!jobRes.success || !jobRes.data) return;
              
                setJobsInfo(prev => {
                    const exists = prev.some(job => job.id === jobRes.data.id);
                    if (exists) return prev;
                
                    return [jobRes.data, ...prev];
                });
            }

            if (notification.entity_type === NotificationEntity.gig) {
                if(userInfo.role === "freelancer"){
                    const gigRes = await getGigById(notification.entity_id);
                    if (!gigRes.success || !gigRes.data) return;
                
                    setGigsInfo(prev => {
                        const exists = prev.some(gig => gig.id === gigRes.data.id);
                        if (exists) return prev;
                    
                        return [gigRes.data, ...prev];
                    });
                }
            }

            if (notification.entity_type === NotificationEntity.bid) {
                if(userInfo.role === "freelancer"){
                    const bidRes = await getBidById(notification.entity_id);
                    if (!bidRes.success || !bidRes.data) return;
                
                    setBidsInfo(prev => {
                        const exists = prev.some(b => b.id === bidRes.data.id);
                    
                        if (!exists) {
                            // INSERT
                            return [bidRes.data, ...prev];
                        }
                    
                        // UPDATE
                        return prev.map(b =>
                            b.id === bidRes.data.id
                                ? { ...b, ...bidRes.data }
                                : b
                        );
                    });
                } else {
                    const bidRes = await getJobBidForClientById(notification.entity_id);
                    if (!bidRes.success || !bidRes.data) return;
                    const bid = bidRes.data;

                    setJobsInfo(prevJobs =>
                        prevJobs.map(job => {
                            if (job.id !== bid.job_id) return job;
                
                            const bids = job.bids ?? [];
                            const exists = bids.some(b => b.id === bid.id);
                
                            return {
                                ...job,
                                bids: exists
                                    ? bids.map(b => (b.id === bid.id ? bid : b))
                                    : [...bids, bid],
                            };
                        })
                    );
                }
            }

            const upsertConversationInfo = (conversation: DashboardConversation) => {
                setConversationsInfo((prev) => {
                    const existingIndex = prev.findIndex(
                        (conversationInfo) => conversationInfo.id === conversation.id
                    );
                    if (existingIndex === -1) {
                        return [...prev, conversation];
                    }
                    const next = [...prev];
                    next[existingIndex] = conversation;
                    return next;
                });
            };

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
        };

        socket.emit("joinUserRoom", userInfo.id);
        socket.on(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
        socket.on(websocket.WEBSOCKET_NEW_MESSAGE, handleIncomingMessage);

        return () => {
            socket.off(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
            socket.off(websocket.WEBSOCKET_NEW_MESSAGE, handleIncomingMessage);
        };
    }, [notificationSocket.isConnected, notificationSocket.socket, userInfo.id]);

    return (
        <DashboardCtx.Provider
            value={{
                jobsInfo,
                setJobsInfo,
        
                gigsInfo,
                setGigsInfo,
        
                bidsInfo,
                setBidsInfo,
        
                conversationsInfo,
                setConversationsInfo,
        
                notificationsInfo,
                setNotificationsInfo,
        
                dashboardError,
                setDashboardError
            }}
        >
            {children}
        </DashboardCtx.Provider>
    );
};

export const useDashboard = () => useContext(DashboardCtx);