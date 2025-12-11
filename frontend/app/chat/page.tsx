'use client';

import ChatNavbar from "@/components/chat/chatNavbar";
import ChatSidebar from "@/components/chat/chatSidebar";
import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import { Gig } from "@/types/gigs";
import { Conversation } from "@/types/conversation";
import { ConversationParticipant } from "@/types/conversation.participant";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import Loading from "@/components/loading";
import { getConversationByParticipant, getJobs } from "@/utils/functions";
import router from "next/router";
import ChatComb from "@/components/chat/chatComb";
import { toast } from "react-toastify";
import { ConversationInfo } from "@/types/conversation";
import { ConversationsInfoCtx } from "@/context/conversationsContext";
import { ConversationLoadingCtx } from "@/context/conversationLoadingContext";

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

const ChatPage = () => {
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [chatSidebarItems, setChatSidebarItems] = useState<ChatSidebarItem[]>([]);
    const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);
    const { conversationLoadingState, setconversationLoadingState } = useContext(ConversationLoadingCtx);
    useEffect(() => {
        if(conversationLoadingState === "success") {
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
                            onChatClick: () => {},
                            onPinChat: () => {},
                            onUnpinChat: () => {},
                        }]);
                    });

                    console.log("test-conversationsInfo", conversationsInfo);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                loadConversations();
            }
        } else if (conversationLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, conversationLoadingState, router]);

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
                            receiver={chatSidebarItems.length > 0 ? chatSidebarItems[0].receiver : null} 
                            job={conversationsInfo.length > 0 ? conversationsInfo[0].jobInfo as Job : null} 
                            clientName={``} 
                            acceptHandler={() => {}} 
                            messages={[]} 
                            onSendMessage={() => {}} 
                        />
                    </div>
                </div>
            </div>
        )
    } else {
        return <Loading />;
    }
}

export default ChatPage;