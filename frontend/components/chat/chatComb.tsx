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
import MobileDrawer from "./mobileDrawer";
import { useDashboard } from "@/context/dashboardContext";

interface ChatCombProps {
    sender: User;
    receiver: User | null;
    job_id: string;
    job_title: string;
    job_description: string
    job_min_budget: string
    job_max_budget: string
    job_deadline_at: string
    job_token_symbol: string;
    conversation_id: string;
    job_application_doc_id: string;
    clientName: string;
    acceptHandler: (conversation_id: string) => void;
    messages: Message[];
    isWriting: boolean;
    onSendMessage: (message: Message) => void;
    onWritingMessage: (conversation_id: string) => void;
    onStopWritingMessage: (conversation_id: string) => void;
    isMobile: boolean;
}

const ChatComb = ({ sender, receiver, job_id, job_token_symbol, job_title, job_description, job_max_budget, job_deadline_at, job_min_budget, conversation_id, job_application_doc_id, clientName, acceptHandler, messages, isWriting, onSendMessage, onWritingMessage, onStopWritingMessage, isMobile }: ChatCombProps) => {
    const [jobMilestoneId, setJobMilestoneId] = useState<string | null>(null);
    const [ status, setStatus] = useState<number>(0);
    const [loading, setLoading] = useState<userLoadingState>("pending");
    const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
    const { jobMilestonesInfo } = useProjectInfo();
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isProjectInfoOpen, setProjectInfoOpen] = useState(false);
    const { jobsInfo } = useDashboard();

    useEffect(() => {
        let isMounted = true;
        const fetchJobMilestoneId = async () => {
            setLoading("pending");
            try {
                const jobApplicationDoc =
                jobsInfo
                    .flatMap(job => job.jobApplicationsDocs)
                    .find(doc => doc.id === job_application_doc_id) ?? null;

                if(!isMounted) return;

                if(jobApplicationDoc?.id){
                    setJobMilestoneId(jobApplicationDoc.job_milestone_id);
                   
                    const jobMilestoneInfo = jobsInfo
                    .flatMap(job => job.milestones)
                    .find(milestone => milestone.id === jobApplicationDoc.job_milestone_id) ?? null;
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
    }, [job_application_doc_id, jobsInfo]);
    
    return (
        <div className="lg:flex block w-full lg:w-auto">
            <div className="flex-1 lg:w-[70%] w-full">
                <ChatMain 
                    conversation_id={conversation_id}
                    sender={sender} 
                    receiver={receiver} 
                    messages={messages} 
                    isWriting={isWriting}
                    onSendMessage={onSendMessage}
                    onWritingMessage={onWritingMessage}
                    onStopWritingMessage={onStopWritingMessage}
                    isMobile={isMobile}
                    onMobileProfileClick={() => setProfileOpen(true)}
                    onMobileProjectInfoClick={() => setProjectInfoOpen(true)}
                />
            </div>
            {/* <button onClick={() => setProfileOpen(true)}>
                Open Profile
            </button> */}
            <div className="hidden lg:block flex-end max-w-[30%]">
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
                                job_id={job_id}
                                job_token_symbol={job_token_symbol}
                                job_title={job_title}
                                job_description={job_description}
                                job_max_budget={job_max_budget}
                                job_min_budget={job_min_budget}
                                job_deadline_at={job_deadline_at}
                                clientName={job_id? clientName : "No client name"} 
                                acceptHandler={() => acceptHandler(conversation_id)} 
                            />}
                            {jobMilestoneId && <ChatProjectStatus 
                                user={sender}
                                status={status}
                                jobMilestoneId={jobMilestoneId} 
                                conversationId={conversation_id} 
                                jobApplicationDocId={job_application_doc_id} 
                                ipfs={ipfsUrl}
                                job_id={job_id}
                            />}
                        </div>
                    )}
                </div>
            </div>
            <MobileDrawer
                open={isProfileOpen}
                onClose={() => setProfileOpen(false)}
                slideDirection="down"
            >
                <div className="flex flex-col gap-4.25 max-h-[calc(100vh-9rem)] overflow-y-auto hide-scrollbar">
                    <ChatUserInfo 
                        user={receiver} 
                    />
                </div>
            </MobileDrawer>
            <MobileDrawer
                open={isProjectInfoOpen}
                onClose={() => setProjectInfoOpen(false)}
                slideDirection="up"
            >
                <div className="flex flex-col gap-4.25 max-h-[calc(100vh-9rem)] overflow-y-auto hide-scrollbar">
                    {loading === "pending" ? 
                        <div className="flex items-center justify-center bg-[#7E3FF2] h-[60vh]">
                            <SmallLoading />
                        </div>
                    : (
                        <div>
                            {!jobMilestoneId && <ChatProjectInfo 
                                job_id={job_id}
                                job_token_symbol={job_token_symbol}
                                job_title={job_title}
                                job_description={job_description}
                                job_max_budget={job_max_budget}
                                job_min_budget={job_min_budget}
                                job_deadline_at={job_deadline_at}
                                clientName={job_id? clientName : "No client name"} 
                                acceptHandler={() => acceptHandler(conversation_id)} 
                            />}
                            {jobMilestoneId && <ChatProjectStatus 
                                user={sender}
                                status={status}
                                jobMilestoneId={jobMilestoneId} 
                                conversationId={conversation_id} 
                                jobApplicationDocId={job_application_doc_id} 
                                ipfs={ipfsUrl}
                                job_id={job_id}
                            />}
                        </div>
                    )}
                </div>
            </MobileDrawer>
        </div>
    )
}

export default ChatComb