'use client';

import ChatNavbar from "@/components/chat/chatNavbar";
import ChatSidebar from "@/components/chat/chatSidebar";
import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import { Message } from "@/types/message";
import { useContext, useEffect, useState } from "react";
import { UserInfoCtx } from "@/context/userContext";
import { LoadingCtx } from "@/context/loadingContext";
import Loading from "@/components/loading";
import { getJobs } from "@/utils/functions";
import router from "next/router";
import ChatComb from "@/components/chat/chatComb";

const ChatPage = () => {
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const [jobs, setJobs] = useState<Job[]>([]);
    
    useEffect(() => {
        if(loadingState === "success") {
            if(userInfo.id === "") {
                router.push("/");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadJobs = async () => {
                    const jobs = await getJobs();
                    setJobs(jobs.data ?? []);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                loadJobs();
            }
        } else if (loadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, loadingState, router]);

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