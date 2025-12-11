'use client';

import { useSearchParams } from "next/navigation";
import ChatNavbar from "@/components/chat/chatNavbar";
import ChatSidebar from "@/components/chat/chatSidebar";
import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import { useContext, useEffect, useState, Suspense } from "react";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "@/components/loading";
import router from "next/router";
import ChatComb from "@/components/chat/chatComb";
import { ConversationsInfoCtx } from "@/context/conversationsContext";
import { ConversationLoadingCtx } from "@/context/conversationLoadingContext";
import { MessagesInfoCtx } from "@/context/messagesContext";
import { MessageLoadingCtx } from "@/context/messageLoadingContext";
import { Message } from "@/types/message";
import useSocket from '@/service/socket';
import { websocket } from "@/config/config";

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

    const searchParams = useSearchParams();
    const conversationId = searchParams.get("conversationId");
    const chatSocket = useSocket();    

    const handleChatClick = (conversation_id: string) => {
        setSelectedConversationId(conversation_id);
        chatSidebarItems.forEach((chat) => {
            chat.selected = chat.conversation_id === conversation_id;
        });
    };

    const handleSendMessage = (message: Message) => {
        console.log("test-message", message);
        if(chatSocket.isConnected) {
            chatSocket.socket?.emit(websocket.WEBSOCKET_SEND_NEW_MESSAGE, {
                user_id: userInfo.id,
                conversation_id: message.conversation_id,
                body_text: message.body_text,
                kind: message.kind,
            });
        }
    };

    useEffect(() => {
        if(messageLoadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadConversations = async () => {
                    conversationsInfo.forEach((conversation) => {
                        const now = new Date();
                        const lastMessageTime = now.getHours() + ":" + now.getMinutes();
                        setChatSidebarItems((prev) => [...prev, {
                            conversation_id: conversation.conversation.id,
                            receiver: conversation.clientInfo.id === userInfo.id ? conversation.freelancerInfo as User : conversation.clientInfo as User,
                            status: "typing",
                            lastMessage: "Hello, how are you?",
                            lastMessageTime: now,
                            pinned: false,
                            selected: false,
                            onChatClick: () => {
                                handleChatClick(conversation.conversation.id);
                            },
                            onPinChat: () => {},
                            onUnpinChat: () => {},
                        }]);
                    });

                    if(conversationId) {
                        handleChatClick(conversationId as string);
                    } else {
                        handleChatClick(conversationsInfo[0].conversation.id);
                    }

                    console.log("test-conversationsInfo", conversationsInfo);
                    console.log("test-messagesInfo", messagesInfo);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                loadConversations();
            }
        } else if (messageLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, messageLoadingState, router]);

    if(loading === "pending") {
        return <Loading />;
    }

    if(loading === "success") {
        return (
            <div>
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
                            receiver={chatSidebarItems.length > 0 ? chatSidebarItems.find((conversation) => conversation.conversation_id === selectedConversationId)?.receiver as User ?? null : null} 
                            job={conversationsInfo.length > 0 ? conversationsInfo.find((conversation) => conversation.conversation.id === selectedConversationId)?.jobInfo as Job ?? null : null} 
                            clientName={``} 
                            acceptHandler={() => {}} 
                            messages={[]} 
                            onSendMessage={handleSendMessage} 
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