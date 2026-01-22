'use client';

import { useSearchParams } from "next/navigation";
import ChatNavbar from "@/components/chat/chatNavbar";
import ChatSidebar from "@/components/chat/chatSidebar";
import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import { useContext, useEffect, useState, Suspense, useRef } from "react";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import ChatComb from "@/components/chat/chatComb";
import { ConversationsInfoCtx } from "@/context/conversationsContext";
import { MessagesInfoCtx } from "@/context/messagesContext";
import { MessageLoadingCtx } from "@/context/messageLoadingContext";
import { Message, ReadState } from "@/types/message";
import useSocket from '@/service/socket';
import { websocket } from "@/config/config";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import { useDashboard } from "@/context/dashboardContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";

interface ChatSidebarItem {
    conversation_id: string;
    receiver: User;
    status: string;
    lastMessage: string;
    lastMessageTime: Date;
    pinned: boolean;
    selected: boolean;
    unreadCount: number;
    onChatClick: () => void;
    onPinChat: () => void;
    onUnpinChat: () => void;
}

const ChatPageContent = () => {
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const [loading, setLoading] = useState("pending");
    const [chatSidebarItems, setChatSidebarItems] = useState<ChatSidebarItem[]>([]);
    // const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);
    // const { messagesInfo, setMessagesInfo } = useContext(MessagesInfoCtx);
    const { userLoadingState } = useContext(UserLoadingCtx);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
    const searchParams = useSearchParams();
    const [conversationId, setConversationId] = useState<string | null>(null);
    useEffect(() => {
        const id = searchParams.get("conversation_id");
        if(id) {
            setConversationId(id);
        }
    }, [searchParams]);
    const chatSocket = useSocket();   
    const router = useRouter();
    const { conversationsInfo, setConversationsInfo, jobsInfo, bidsInfo, markMessageAsPendingRead } = useDashboard();    

    const [jobId, setJobId] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [jobTokenSymbol, setJobTokenSymbol] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobMaxBudget, setJobMaxBudget] = useState("");
    const [jobMinBudget, setJobMinBudget] = useState("");
    const [jobDeadlineAt, setJobDeadlineAt] = useState("");   
    const [clientName, setClientName]  = useState("");

    useEffect(() => {
        if(userInfo.role === "client") {
            setJobId(conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id ?? "" : "");
            setJobTitle(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.title ?? "");
            setJobTokenSymbol(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.token_symbol ?? "");
            setJobDescription(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.description_md ?? "");
            setJobMaxBudget(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.budget_max_usd ?? "");
            setJobMinBudget(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.budget_min_usd ?? "");
            setJobDeadlineAt(jobsInfo.find(job => job.id === conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id)?.deadline_at ?? "");        
        } else {
            const Id = conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_id ?? "": "";
            setJobId(Id);
            setJobTitle(bidsInfo.find(bid => bid.job.id === Id)?.job.title ?? "");
            setJobTokenSymbol(bidsInfo.find(bid => bid.job.id === Id)?.job.token_symbol ?? "");
            setJobDescription(bidsInfo.find(bid => bid.job.id === Id)?.job.description_md ?? "");
            setJobMaxBudget(bidsInfo.find(bid => bid.job.id === Id)?.job.budget_max_usd ?? "");
            setJobMinBudget(bidsInfo.find(bid => bid.job.id === Id)?.job.budget_min_usd ?? "");
            setJobDeadlineAt(bidsInfo.find(bid => bid.job.id === Id)?.job.deadline_at ?? "");
        }

        const userName = conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.participants[0].user.role === "client" ? conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.participants[0].user.display_name ?? "" : conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.participants[1].user.display_name ?? "";

        setClientName(userName);
    }, [selectedConversationId])


    const sentReceiptIds = useRef<Set<string>>(new Set());

    const emitMessageReceipt = (message: Message) => {
        if (!message || message.sender_id === userInfo.id) {
            return;
        }

        if (!chatSocket.socket || !chatSocket.socket.connected) {
            return;
        }

        if (sentReceiptIds.current.has(message.id)) {
            return;
        }

        sentReceiptIds.current.add(message.id);
        
        // Notify dashboard context that we're marking this as read (to prevent 'delivered' from overwriting)
        markMessageAsPendingRead(message.id);
        
        chatSocket.socket.emit(websocket.WEBSOCKET_SEND_MESSAGE_RECEIPT, {
            message_id: message.id,
            user_id: userInfo.id,
            state: 'read' as ReadState,
        });
    };

    const markConversationMessagesRead = (conversation_id: string) => {
        const conversation = conversationsInfo.find((conversation) => conversation.id === conversation_id);
        if (!conversation?.messages) {
            return;
        }

        conversation.messages.forEach((message) => {
            conversation.messages.forEach((message) => {
                if (message.sender_id !== userInfo.id) {
                    if(message.receipts && message.receipts.some((receipt) => receipt.user_id === userInfo.id && receipt.state === 'read')) {
                        return;
                    }
                    console.log("marking message as read", message);
                    emitMessageReceipt(message);
                }
            });
        });
    };

    const [mobileView, setMobileView] = useState<"list" | "chat">("list");

    const handleChatClick = (conversation_id: string) => {
        setSelectedConversationId(conversation_id);
        setChatSidebarItems((prev) =>
            prev.map((chat) => ({
                ...chat,
                selected: chat.conversation_id === conversation_id,
            }))
        );

        setMobileView("chat");
        markConversationMessagesRead(conversation_id);
    };

    
    const handleSendMessage = (message: Message) => {
        if(chatSocket.isConnected) {
            chatSocket.socket?.emit(websocket.WEBSOCKET_SEND_NEW_MESSAGE, {
                user_id: userInfo.id,
                conversation_id: message.conversation_id,
                body_text: message.body_text,
                kind: message.kind,
                created_at: new Date(),
            });
        }
    };

    const handleWritingMessage = (conversation_id: string) => {
        if(chatSocket.isConnected) {
            chatSocket.socket?.emit(websocket.WEBSOCKET_SEND_WRITING_MESSAGE, {
                conversation_id: conversation_id,
                sender_id: userInfo.id,
            });
        }
    };

    const handleStopWritingMessage = (conversation_id: string) => {
        if(chatSocket.isConnected) {
            chatSocket.socket?.emit(websocket.WEBSOCKET_SEND_STOP_WRITING_MESSAGE, {
                conversation_id: conversation_id,
                sender_id: userInfo.id,
            });
        }
    };

    const handleAcceptHandler = (conversation_id: string) => {
        const job_application_doc_id = conversationsInfo.find((conversation) => conversation.id === conversation_id)?.job_application_doc_id;
        router.push(`/reference?jobApplicationId=${job_application_doc_id}&conversationId=${conversation_id}`);
    };

    useEffect(() => {
        if (chatSocket.isConnected && selectedConversationId) {
            chatSocket.socket?.emit("joinRoom", selectedConversationId);
        }
    }, [chatSocket.isConnected, selectedConversationId]);

    useEffect(() => {
        if (!chatSocket.socket) return;        

        const handler = (message: Message) => {
            // Update sidebar items with new message info
            setChatSidebarItems((prev) =>
                prev.map((chat) => {
                    if (chat.conversation_id !== message.conversation_id) {
                        return chat;
                    }

                    return {
                        ...chat,
                        lastMessage: message.body_text ?? chat.lastMessage,
                        lastMessageTime: message.created_at ? new Date(message.created_at) : new Date(),
                    };
                })
            );
            
            // If this message is in the currently selected conversation, mark it as read immediately
            if (selectedConversationId === message.conversation_id && message.sender_id !== userInfo.id) {
                emitMessageReceipt(message);
            }
            setConversationId(message.conversation_id);
        };        

        chatSocket.socket.on(websocket.WEBSOCKET_NEW_MESSAGE, handler);
        chatSocket.socket.on(websocket.WEBSOCKET_WRITING_MESSAGE, (param: { conversation_id: string, sender_id: string }) => {
            if(param.sender_id !== userInfo.id) {
                setChatSidebarItems((prev) => prev.map((chat) => chat.conversation_id === param.conversation_id ? { ...chat, status: "typing" } : chat));
            }
        });
        chatSocket.socket.on(websocket.WEBSOCKET_STOP_WRITING_MESSAGE, (param: { conversation_id: string, sender_id: string }) => {
            if(param.sender_id !== userInfo.id) {
                setChatSidebarItems((prev) => prev.map((chat) => chat.conversation_id === param.conversation_id ? { ...chat, status: "idle" } : chat));
            }
        });

        return () => {
            chatSocket.socket?.off(websocket.WEBSOCKET_NEW_MESSAGE, handler);
            chatSocket.socket?.off(websocket.WEBSOCKET_WRITING_MESSAGE, handler);
            chatSocket.socket?.off(websocket.WEBSOCKET_STOP_WRITING_MESSAGE, handler);
        };
    }, [chatSocket.socket, userInfo.id, selectedConversationId, conversationsInfo]);

    // Helper function to build chat sidebar items
    const buildChatSidebarItems = (conversations: typeof conversationsInfo, currentItems: ChatSidebarItem[] = []) => {
        if (!conversations.length) {
            return [];
        }

        return conversations
            .map((conversation) => {
                const latestMessage = conversation.messages?.[conversation.messages.length - 1];
                const lastMessageTime = latestMessage
                    ? new Date(latestMessage.created_at)
                    : new Date(conversation.created_at ?? Date.now());

                // Calculate unread count for this conversation
                const unreadCount = conversation.messages?.filter((message) => {
                    // Skip messages sent by current user
                    if (message.sender_id === userInfo.id) {
                        return false;
                    }

                    // Get receipts (handle both 'receipts' and 'messageReceipt' for compatibility)
                    const receipts = (message as any).receipts || (message as any).messageReceipt || [];

                    // Check if message has receipts
                    if (!receipts || receipts.length === 0) {
                        // No receipts means not read
                        return true;
                    }

                    // Check if there's a 'read' receipt for the current user
                    const hasReadReceipt = receipts.some(
                        (receipt: any) => receipt.user_id === userInfo.id && receipt.state === 'read'
                    );

                    // If no 'read' receipt found, message is unread
                    return !hasReadReceipt;
                }).length ?? 0;

                // Preserve selection and status from current items
                const existingItem = currentItems.find(item => item.conversation_id === conversation.id);

                return {
                    conversation_id: conversation.id,
                    receiver: conversation.participants[0].user.id === userInfo.id ? conversation.participants[1].user as User : conversation.participants[0].user as User,
                    status: existingItem?.status ?? "idle",
                    lastMessage: latestMessage?.body_text ?? "",
                    lastMessageTime,
                    pinned: false,
                    selected: existingItem?.selected ?? false,
                    unreadCount,
                    onChatClick: () => {
                        handleChatClick(conversation.id);
                    },
                    onPinChat: () => {},
                    onUnpinChat: () => {},
                };
            })
            .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
    };

    // Initial load of conversations
    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadConversations = async () => {
                    if (!conversationsInfo.length) {
                        setChatSidebarItems([]);
                        setLoading("success");
                        return;
                    }

                    const builtChats = buildChatSidebarItems(conversationsInfo, []);
                    setChatSidebarItems(builtChats);

                    const targetConversationId = conversationId ?? builtChats[0]?.conversation_id;
                    if (targetConversationId) {
                        handleChatClick(targetConversationId);
                    }                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setLoading("success");
                }
                if(dashboardLoadingState === "success") {
                    loadConversations();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, router, dashboardLoadingState]);

    // Update chat sidebar items when conversationsInfo changes (for real-time updates)
    useEffect(() => {
        if (dashboardLoadingState === "success" && conversationsInfo.length > 0 && userInfo.id) {
            setChatSidebarItems((prevItems) => {
                const builtChats = buildChatSidebarItems(conversationsInfo, prevItems);
                return builtChats;
            });
        }
    }, [conversationsInfo, dashboardLoadingState, userInfo.id]);

    if(loading === "pending") {
        return <Loading />;
    }

    if(loading === "success") {
        return (
            <div className="max-h-screen overflow-hidden">
                <ChatNavbar onBack={() => setMobileView("list")} />
                <div className="hidden lg:flex">
                    <div className="w-[25%]">
                        <ChatSidebar
                            chats={chatSidebarItems}
                        />
                    </div>
                    <div className="w-[75%]">
                        <ChatComb
                            sender={userInfo} 
                            conversation_id={selectedConversationId as string}
                            job_application_doc_id={conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_application_doc_id as string ?? "" : ""}
                            receiver={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.receiver as User ?? null : null} 
                            job_id={jobId}
                            job_title={jobTitle}
                            job_token_symbol={jobTokenSymbol}
                            job_description={jobDescription}
                            job_max_budget={jobMaxBudget}
                            job_min_budget={jobMinBudget}
                            job_deadline_at={jobDeadlineAt}
                            clientName={clientName}
                            messages={conversationsInfo.find(conversation => conversation.id === selectedConversationId)?.messages || []} 
                            isWriting={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.status === "typing" ? true : false : false}
                            onSendMessage={handleSendMessage} 
                            onWritingMessage={handleWritingMessage}
                            onStopWritingMessage={handleStopWritingMessage}
                            acceptHandler={handleAcceptHandler}
                            isMobile={false}
                        />
                    </div>
                </div>

                <div className="flex lg:hidden h-[calc(100vh-4rem)] w-full lg:w-auto">
                    {mobileView === "list" && (
                        <ChatSidebar
                        chats={chatSidebarItems}
                        />
                    )}

                    {mobileView === "chat" && selectedConversationId && (
                        <ChatComb
                            sender={userInfo}
                            conversation_id={selectedConversationId as string}
                            job_application_doc_id={conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.id === selectedConversationId)?.job_application_doc_id as string ?? "" : ""}
                            receiver={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.receiver as User ?? null : null} 
                            job_id={jobId}
                            job_title={jobTitle}
                            job_token_symbol={jobTokenSymbol}
                            job_description={jobDescription}
                            job_max_budget={jobMaxBudget}
                            job_min_budget={jobMinBudget}
                            job_deadline_at={jobDeadlineAt}
                            clientName={clientName}
                            messages={conversationsInfo.find(conversation => conversation.id === selectedConversationId)?.messages || []} 
                            isWriting={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.status === "typing" ? true : false : false}
                            onSendMessage={handleSendMessage} 
                            onWritingMessage={handleWritingMessage}
                            onStopWritingMessage={handleStopWritingMessage}
                            acceptHandler={handleAcceptHandler}
                            isMobile={true}
                        />
                    )}
                </div>
            </div>
        )
    } else {
        return <Loading />;
    }
}

const ChatPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <ChatPageContent />
        </Suspense>
    );
}

export default ChatPage;