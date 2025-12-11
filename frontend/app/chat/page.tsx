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
import { UserLoadingCtx } from "@/context/loadingContext";
import Loading from "@/components/loading";
import { getConversationByParticipant, getJobs } from "@/utils/functions";
import router from "next/router";
import ChatComb from "@/components/chat/chatComb";
import { toast } from "react-toastify";
import { Conversations } from "@/types/conversation";

const ChatPage = () => {
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [conversations, setConversations] = useState<Conversations[]>([]);
    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadJobs = async () => {
                    const jobs = await getJobs();
                    setJobs(jobs.data ?? []);


                    const conversations = await getConversationByParticipant(userInfo.id);
                    if(!conversations.success) {
                        toast.error(conversations.error as string, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }

                    if(conversations.success) {
                        setConversations(conversations.data ?? []);
                    }

                    console.log("conversations", conversations);


                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                loadJobs();
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, router]);

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
                            chats={[
                                {
                                    conversation_id: "1",
                                    receiver: userInfo,
                                    status: "typing",
                                    lastMessage: "Hello, how are you?",
                                    lastMessageTime: new Date(),
                                    pinned: true,
                                    selected: true,
                                    onChatClick: () => {},
                                    onPinChat: () => {},
                                    onUnpinChat: () => {},
                                },
                                {
                                    conversation_id: "2",
                                    receiver: userInfo,
                                    status: "online",
                                    lastMessage: "Hello, how are you?",
                                    lastMessageTime: new Date(),
                                    pinned: false,
                                    selected: false,
                                    onChatClick: () => {},
                                    onPinChat: () => {},
                                    onUnpinChat: () => {},
                                },
                                {
                                    conversation_id: "3",
                                    receiver: userInfo,
                                    status: "online",
                                    lastMessage: "Hello, how are you?",
                                    lastMessageTime: new Date(),
                                    pinned: false,
                                    selected: false,
                                    onChatClick: () => {},
                                    onPinChat: () => {},
                                    onUnpinChat: () => {},
                                },
                                {
                                    conversation_id: "4",
                                    receiver: userInfo,
                                    status: "online",
                                    lastMessage: "Hello, how are you?",
                                    lastMessageTime: new Date(),
                                    pinned: false,
                                    selected: false,
                                    onChatClick: () => {},
                                    onPinChat: () => {},
                                    onUnpinChat: () => {},
                                }
                            ]}
                        />
                    </div>
                    <div className="w-[75%]">
                        <ChatComb 
                            sender={userInfo} 
                            receiver={userInfo} 
                            job={jobs[0]} 
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