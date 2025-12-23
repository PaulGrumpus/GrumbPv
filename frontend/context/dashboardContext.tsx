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
import { getBidById, getConversationById, getDashboardDataByUserId, getGigById, getGigsByFreelancerId, getJobBidForClientById, getJobById, getJobMilestoneById, getJobsByClientId } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import useSocket from "@/service/socket";
import { NotificationEntity, NotificationType } from "@/types/notification";
import { websocket } from "@/config/config";

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
        console.log("test-dashboardLoadingState", dashboardLoadingState);
    }, [dashboardLoadingState])
  
    useEffect(() => {
        init();
    }, [userLoadingState]);

    useEffect(() => {
        if (!userInfo.id || !notificationSocket.socket || !notificationSocket.isConnected) {
            return;
        }

        const socket = notificationSocket.socket;
        const handleNotification = async (notification: DashboardNotification) => {
            console.log("TEST-NEW-NOTIFICATION:", notification);
            setNotificationsInfo((prev) => [...prev, notification]);

            if (notification.entity_type === NotificationEntity.milestone) {
                const updatedMilestoneInfo = await getJobMilestoneById(notification.entity_id);                                    
                if (updatedMilestoneInfo.success && updatedMilestoneInfo.data) {
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

            if (
                notification.entity_type === NotificationEntity.job &&
                notification.type === NotificationType.jobPosted
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
                        const exists = prev.some(bid => bid.id === bidRes.data.id);
                        if (exists) return prev;
                    
                        return [bidRes.data, ...prev];
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
                setConversationsInfo(prev => {
                    const index = prev.findIndex(c => c.id === conversation.id);
                
                    if (index === -1) {
                        return [conversation, ...prev];
                    }
                
                    return prev.map(c =>
                        c.id === conversation.id
                        ? {
                            ...c,
                            ...conversation,
                            // ensure messages are not lost accidentally
                            messages: conversation.messages ?? c.messages,
                            participants: conversation.participants ?? c.participants,
                            }
                        : c
                    );
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

        return () => {
            socket.off(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
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