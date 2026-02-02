'use client';

import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
    useRef,
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
import { getBidById, getConversationById, getDashboardDataByUserId, getGigById, getJobApplicationById, getJobBidForClientById, getJobById, getJobMilestoneByEscrowAddress, getJobMilestoneById, getUserById } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import useSocket from "@/service/socket";
import { NotificationEntity, NotificationType } from "@/types/notification";
import { websocket } from "@/config/config";
import { Message, MessageInfo, ReadState } from "@/types/message";

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
    setDashboardError: () => {},
    
    markMessageAsPendingRead: () => {}
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
    const pendingReadReceipts = useRef<Set<string>>(new Set());
    const conversationsInfoRef = useRef<DashboardConversation[]>(conversationsInfo);
    conversationsInfoRef.current = conversationsInfo;
  
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
        console.log("conversationsInfo", conversationsInfo);
    }, [conversationsInfo]);

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
                                    receipts: message.receipts || [],
                                },
                            ],
                        }
                        : conversation
                )
            );

            // Only mark as delivered if message is not from current user
            // The chat page will handle marking as 'read' if the conversation is open
            // Use a small delay to allow 'read' to be sent first if user is viewing the conversation
            if (message.sender_id !== userInfo.id) {
                setTimeout(() => {
                    // Check if this message is being marked as read (tracked in ref)
                    if (!pendingReadReceipts.current.has(message.id)) {
                        socket.emit(websocket.WEBSOCKET_SEND_MESSAGE_RECEIPT, {
                            message_id: message.id,
                            user_id: userInfo.id,
                            state: 'delivered' as ReadState,
                        });
                    }
                }, 200); // Small delay to let 'read' go first
            }
        };

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
                if(notification.type === NotificationType.milestoneFundsReleased) {
                    if(userInfo.role === "client") {
                        const updatedFreelancerInfo = await getUserById(updatedMilestoneInfo.data.freelancer_id);
                        if (updatedFreelancerInfo.success && updatedFreelancerInfo.data) {
                            const user = updatedFreelancerInfo.data;
                            const updatedFreelancer = {
                                id: user.id,
                                display_name: user.display_name ?? null,
                                email: user.email,
                                address: user.address,
                                image_id: user.image_id,
                                finished_job_num: user.finished_job_num,
                                total_fund: user.total_fund,
                            };
                            setJobsInfo(prevJobs => {
                                let didUpdate = false;
                                const nextJobs = prevJobs.map(job => {
                                    const bids = job.bids ?? [];
                                    const hasBidFromFreelancer = bids.some(b => b.freelancer?.id === user.id);
                                    if (!hasBidFromFreelancer) return job;
                                    didUpdate = true;
                                    const nextBids = bids.map(b =>
                                        b.freelancer?.id === user.id
                                            ? { ...b, freelancer: { ...b.freelancer, ...updatedFreelancer } }
                                            : b
                                    );
                                    return { ...job, bids: nextBids };
                                });
                                return didUpdate ? nextJobs : prevJobs;
                            });
                        }
                    }
                    if(updatedMilestoneInfo.data.job_id) {
                        const currentConversations = conversationsInfoRef.current;
                        const conversationId = currentConversations.find(c => c.job_id === updatedMilestoneInfo.data.job_id)?.id;
                        if(conversationId) {
                            const newConversationInfo = await getConversationById(conversationId);
                            if(newConversationInfo.success && newConversationInfo.data) {
                                upsertConversationInfo(newConversationInfo.data);
                            }
                        }
                    }
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

        const handleMessageReceiptUpdated = (message: Message) => {
            console.log("handleMessageReceiptUpdated", message.receipts?.[0]?.user_id === userInfo.id ? message.receipts?.[0]?.state : message.receipts?.[1]?.state, message.receipts?.[1]?.user_id === userInfo.id ? message.receipts?.[0]?.state : message.receipts?.[1]?.state);
            
            // Remove from pending read receipts if it was marked as read
            const userReceipt = message.receipts?.find(r => r.user_id === userInfo.id);
            if (userReceipt && userReceipt.state === 'read') {
                pendingReadReceipts.current.delete(message.id);
            }
            
            setConversationsInfo((prev) =>
                prev.map((conversation) =>
                    conversation.id === message.conversation_id
                        ? {
                              ...conversation,
                              messages: conversation.messages.some(m => m.id === message.id)
                                  ? conversation.messages.map(m => {
                                      if (m.id === message.id) {
                                          // Merge receipts instead of replacing - keep the highest state for each user
                                          const existingReceipts = (m as any).receipts || (m as any).messageReceipt || [];
                                          const newReceipts = message.receipts || [];
                                          
                                          // Create a map of user_id -> highest state receipt
                                          const receiptMap = new Map();
                                          
                                          // Add existing receipts
                                          existingReceipts.forEach((receipt: any) => {
                                              const current = receiptMap.get(receipt.user_id);
                                              if (!current || getStatePriority(receipt.state) > getStatePriority(current.state)) {
                                                  receiptMap.set(receipt.user_id, receipt);
                                              }
                                          });
                                          
                                          // Add/update with new receipts (new receipts take priority if higher state)
                                          newReceipts.forEach((receipt: any) => {
                                              const current = receiptMap.get(receipt.user_id);
                                              if (!current || getStatePriority(receipt.state) >= getStatePriority(current.state)) {
                                                  receiptMap.set(receipt.user_id, receipt);
                                              }
                                          });
                                          
                                          return {
                                              ...message,
                                              receipts: Array.from(receiptMap.values()),
                                          };
                                      }
                                      return m;
                                  })
                                  : [...conversation.messages, message]
                          }
                        : conversation
                )
            );
        };
        
        // Helper function to get state priority (read > delivered > sent)
        const getStatePriority = (state: string): number => {
            if (state === 'read') return 3;
            if (state === 'delivered') return 2;
            if (state === 'sent') return 1;
            return 0;
        };

        socket.emit("joinUserRoom", userInfo.id);
        socket.on(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
        socket.on(websocket.WEBSOCKET_NEW_MESSAGE, handleIncomingMessage);
        socket.on(websocket.WEBSOCKET_MESSAGE_RECEIPT_UPDATED, handleMessageReceiptUpdated);

        return () => {
            socket.off(websocket.WEBSOCKET_NEW_NOTIFICATION, handleNotification);
            socket.off(websocket.WEBSOCKET_NEW_MESSAGE, handleIncomingMessage);
            socket.off(websocket.WEBSOCKET_MESSAGE_RECEIPT_UPDATED, handleMessageReceiptUpdated);
        };
    }, [notificationSocket.isConnected, notificationSocket.socket, userInfo.id]);

    const markMessageAsPendingRead = (messageId: string) => {
        pendingReadReceipts.current.add(messageId);
    };

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
                setDashboardError,
                
                markMessageAsPendingRead
            }}
        >
            {children}
        </DashboardCtx.Provider>
    );
};

export const useDashboard = () => useContext(DashboardCtx);