'use client';

import { useSearchParams } from "next/navigation";
import ChatNavbar from "@/components/chat/chatNavbar";
import ChatSidebar from "@/components/chat/chatSidebar";
import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import { useContext, useEffect, useState, Suspense } from "react";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "@/components/loading";
import { useRouter } from "next/navigation";
import ChatComb from "@/components/chat/chatComb";
import { ConversationsInfoCtx } from "@/context/conversationsContext";
import { MessagesInfoCtx } from "@/context/messagesContext";
import { MessageLoadingCtx } from "@/context/messageLoadingContext";
import { Message } from "@/types/message";
import useSocket from '@/service/socket';
import { websocket } from "@/config/config";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";

interface ChatSidebarItem {
    conversation_id: string;
    receiver: User;
    status: string;
    lastMessage: string;
    lastMessageTime: Date;
    pinned: boolean;
    selected: boolean;
    onChatClick: () => void;
    onPinChat: () => void;
    onUnpinChat: () => void;
}

const ChatPageContent = () => {
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const [loading, setLoading] = useState("pending");
    const [chatSidebarItems, setChatSidebarItems] = useState<ChatSidebarItem[]>([]);
    const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);
    const { messagesInfo, setMessagesInfo } = useContext(MessagesInfoCtx);
    const { messageLoadingState, setmessageLoadingState } = useContext(MessageLoadingCtx);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("conversation_id");
    const chatSocket = useSocket();   
    const router = useRouter();

    const handleChatClick = (conversation_id: string) => {
        setSelectedConversationId(conversation_id);
        setChatSidebarItems((prev) =>
            prev.map((chat) => ({
                ...chat,
                selected: chat.conversation_id === conversation_id,
            }))
        );
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
        console.log("handleAcceptHandler");
        const job_application_doc_id = conversationsInfo.find((conversation) => conversation.conversation.id === conversation_id)?.conversation.job_application_doc_id;
        router.push(`/reference?jobApplicationId=${job_application_doc_id}&conversationId=${conversation_id}`);
    };

    useEffect(() => {
        console.log("chatSocket.isConnected =", chatSocket.isConnected);

        if (chatSocket.isConnected && selectedConversationId) {
            console.log("Joining room:", selectedConversationId);
            chatSocket.socket?.emit("joinRoom", selectedConversationId);
        }
    }, [chatSocket.isConnected, selectedConversationId]);

    useEffect(() => {
        if (!chatSocket.socket) return;
    
        const handler = (message: Message) => {
            setChatSidebarItems((prev) => prev.map((chat) => chat.conversation_id === message.conversation_id && message.sender_id !== userInfo.id ? { ...chat, lastMessage: message.body_text ?? "" } : chat));
            setChatSidebarItems((prev) => prev.map((chat) => chat.conversation_id === message.conversation_id && message.sender_id !== userInfo.id ? { ...chat, lastMessageTime: message.created_at as Date } : chat));
            setMessagesInfo((prev) => [...prev, {
                ...message,
                messageReceipt: [],
            }]);
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
    }, [chatSocket.socket, userInfo.id]);

    useEffect(() => {
        if(messageLoadingState === "success") {
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

                    const now = new Date();
                    const builtChats: ChatSidebarItem[] = conversationsInfo.map((conversation) => ({
                        conversation_id: conversation.conversation.id,
                        receiver: conversation.clientInfo.id === userInfo.id ? conversation.freelancerInfo as User : conversation.clientInfo as User,
                        status: "idle",
                        lastMessage: "",
                        lastMessageTime: now,
                        pinned: false,
                        selected: false,
                        onChatClick: () => {
                            handleChatClick(conversation.conversation.id);
                        },
                        onPinChat: () => {},
                        onUnpinChat: () => {},
                    }));

                    setChatSidebarItems(builtChats);

                    const targetConversationId = conversationId ?? conversationsInfo[0]?.conversation.id;
                    if (targetConversationId) {
                        handleChatClick(targetConversationId);
                    }

                    console.log("test-conversationsInfo", conversationsInfo);
                    console.log("test-messagesInfo", messagesInfo);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                if(notificationLoadingState === "success") {
                    loadConversations();
                }
            }
        } else if (messageLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, messageLoadingState, router, notificationLoadingState, conversationsInfo]);

    if(loading === "pending") {
        return <Loading />;
    }

    if(loading === "success") {
        return (
            <div className="max-h-screen overflow-hidden">
                <ChatNavbar />
                <div className="flex">
                    <div className="w-[25%]">
                        <ChatSidebar
                            chats={chatSidebarItems}
                        />
                    </div>
                    <div className="w-[75%]">
                        <ChatComb
                            sender={userInfo} 
                            conversation_id={selectedConversationId as string}
                            job_application_doc_id={conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.conversation.id === selectedConversationId)?.conversation.job_application_doc_id as string ?? "" : ""}
                            receiver={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.receiver as User ?? null : null} 
                            job={conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.conversation.id === selectedConversationId)?.jobInfo as Job ?? null : null} 
                            clientName={``} 
                            messages={messagesInfo.filter((message) => message.conversation_id === selectedConversationId) as Message[] ?? []} 
                            isWriting={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.status === "typing" ? true : false : false}
                            onSendMessage={handleSendMessage} 
                            onWritingMessage={handleWritingMessage}
                            onStopWritingMessage={handleStopWritingMessage}
                            acceptHandler={handleAcceptHandler}
                        />
                    </div>
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