'use client';

import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import ChatMain from "./chatMain";
import ChatProjectInfo from "./chatProjectInfo";
import ChatUserInfo from "./chatUserInfo";
import { Message } from "@/types/message";
import { useEffect, useState } from "react";
import { getJobApplicationById, getJobMilestoneById } from "@/utils/functions";
import { toast } from "react-toastify";
import ChatProjectStatus from "./chatProjectStatus";
import { userLoadingState } from "@/types/loading";
import SmallLoading from "../smallLoading";
import { useProjectInfo } from "@/context/projectInfoContext";
import { JobMilestoneStatus } from "@/types/jobMilestone";

interface ChatCombProps {
    sender: User;
    receiver: User | null;
    job: Job | null;
    conversation_id: string;
    job_application_doc_id: string;
    clientName: string;
    acceptHandler: (conversation_id: string) => void;
    messages: Message[];
    isWriting: boolean;
    onSendMessage: (message: Message) => void;
    onWritingMessage: (conversation_id: string) => void;
    onStopWritingMessage: (conversation_id: string) => void;
}

const ChatComb = ({ sender, receiver, job, conversation_id, job_application_doc_id, clientName, acceptHandler, messages, isWriting, onSendMessage, onWritingMessage, onStopWritingMessage }: ChatCombProps) => {
    const [jobMilestoneId, setJobMilestoneId] = useState<string | null>(null);
    const [ status, setStatus] = useState<number>(0);
    const [loading, setLoading] = useState<userLoadingState>("pending");
    const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
    const { jobMilestonesInfo } = useProjectInfo();

    useEffect(() => {
        let isMounted = true;
        const fetchJobMilestoneId = async () => {
            setLoading("pending");
            try {
                const jobApplicationInfo = await getJobApplicationById(job_application_doc_id);
                if(!jobApplicationInfo.success) {
                    toast.error(jobApplicationInfo.error as string, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                    });
                    return;
                }
                if(!isMounted) return;

                if(jobApplicationInfo.data.job_application_info.job_milestone_id){
                    setJobMilestoneId(jobApplicationInfo.data.job_application_info.job_milestone_id);
                   
                    const jobMilestoneInfo = jobMilestonesInfo.find((jobMilestone) => jobMilestone.id === jobApplicationInfo.data.job_application_info.job_milestone_id);
                    if(!isMounted) return;

                    let nextStatus = 0;
                    if(jobMilestoneInfo?.status === JobMilestoneStatus.PENDING_FUND) {
                        nextStatus = 1;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.FUNDED) {
                        nextStatus = 2;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.DELIVERED) {
                        nextStatus = 3;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.APPROVED) {
                        nextStatus = 4;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.RELEASED) {
                        nextStatus = 5;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.DISPUTED_WITHOUT_COUNTER_SIDE) {
                        nextStatus = 6;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE) {
                        nextStatus = 7;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.RESOLVED_TO_BUYER) {
                        nextStatus = 8;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.RESOLVED_TO_VENDOR) {
                        nextStatus = 9;
                    } else if(jobMilestoneInfo?.status === JobMilestoneStatus.CANCELLED) {
                        nextStatus = 10;
                    }
                    setStatus(Number.isFinite(nextStatus) ? nextStatus : 0);
                    setIpfsUrl(jobMilestoneInfo?.ipfs ?? null);
                } else {
                    setJobMilestoneId(null);
                    setStatus(0);
                    setIpfsUrl(null);
                }
            } finally {
                if(isMounted) setLoading("success");
            }
        };
        fetchJobMilestoneId();
        return () => { isMounted = false; };
    }, [job_application_doc_id, jobMilestonesInfo]);
    
    return (
        <div className="flex">
            <div className="flex-1 w-[70%]">
                <ChatMain 
                    conversation_id={conversation_id}
                    sender={sender} 
                    receiver={receiver} 
                    messages={messages} 
                    isWriting={isWriting}
                    onSendMessage={onSendMessage}
                    onWritingMessage={onWritingMessage}
                    onStopWritingMessage={onStopWritingMessage}
                />
            </div>
            <div className="flex-end max-w-[30%]">
                <div className="flex flex-col gap-4.25 px-3.5 max-h-[calc(100vh-9rem)] overflow-y-auto hide-scrollbar">
                    <ChatUserInfo 
                        user={receiver} 
                    />
                    {loading === "pending" ? 
                        <div className="flex items-center justify-center pt-30">
                            <SmallLoading />
                        </div>
                    : (
                        <div className="mb-10">
                            {!jobMilestoneId && <ChatProjectInfo 
                                job={job} 
                                clientName={job? clientName : "No client name"} 
                                acceptHandler={() => acceptHandler(conversation_id)} 
                            />}
                            {jobMilestoneId && <ChatProjectStatus 
                                user={sender}
                                status={status}
                                jobMilestoneId={jobMilestoneId} 
                                conversationId={conversation_id} 
                                jobApplicationDocId={job_application_doc_id} 
                                ipfs={ipfsUrl}
                            />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatComb