'use client';

import { useContext, useEffect, useRef, useState } from "react";

import Button from "./button";
import Image from "next/image";
import { User } from "@/types/user";
import { Bid, BidStatus } from "@/types/bid";
import { EscrowBackendConfig } from "@/config/config";
import { toast } from "react-toastify";
import { createConversationAndParticipant, createJobApplication, deleteJobApplication, getBidById, getJobById, updateBidStatus } from "@/utils/functions";
import { useRouter } from "next/navigation";
import { ConversationsInfoCtx } from "@/context/conversationsContext";
import SmallLoading from "./smallLoading";
import { useDashboard } from "@/context/dashboardContext";
import { UserInfoCtx } from "@/context/userContext";


type freelancer = {
    id: string;
    display_name: string;
    email: string;
    address: string;
    image_id: string;
    finished_job_num: number;
    total_fund: number;
}

interface ApplicationItem {
    id: string;
    bid_amount: string;
    token_symbol: string;
    cover_letter_md: string;
    period: number;
    status: string;
    freelancer: freelancer;
}

export interface ApplicationPostProps {
    item: ApplicationItem;
    job_id?: string;
}
interface ApplicationWithUser extends Bid {
    freelancer?: User;
}

const COLLAPSED_MAX_HEIGHT = 120;

const ApplicationPost = ({ item, job_id }: ApplicationPostProps) => {
    const { id, freelancer, bid_amount, token_symbol, cover_letter_md, period, status } = item;
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const coverLetterRef = useRef<HTMLParagraphElement>(null);
    // const { conversationsInfo, setConversationsInfo } = useContext(ConversationsInfoCtx);
    const router = useRouter();
    const [loading, setLoading] = useState("success");
    const { userInfo } = useContext(UserInfoCtx);

    const { jobsInfo, setJobsInfo, setConversationsInfo } = useDashboard();

    useEffect(() => {
        const el = coverLetterRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [cover_letter_md]);

    const handleAccept = async (id: string) => {
        try {
            const bid = jobsInfo.find(job => job.id == job_id)?.bids?.find(bid => bid.id === id);
            // const bid = await getBidById(id ?? "");
            // if (!bid.success) {
            //     throw new Error(bid.error as string);
            // }
            if(bid?.status === BidStatus.ACCEPTED) {
                throw new Error("Job bid is already accepted");
            }
            if(bid?.status === BidStatus.DECLINED) {
                throw new Error("Job bid is already declined");
            }
            if(bid?.status === BidStatus.WITHDRAWN) {
                throw new Error("Job bid is already withdrawn");
            }

            setLoading("pending");
            
            // const jobInfo = jobsInfo.find(job => job.id === job_id);
            let job_application_id = "";
            // let client_id = "";
            // client_id = jobInfo?.client?.id ?? "";
            const jobApplication = await createJobApplication({
                job_id: job_id ?? "",
                client_id: userInfo.id,
                freelancer_id: freelancer.id ?? "",
                client_confirm: false,
                freelancer_confirm: false,
            });
            if (jobApplication.success) {
                job_application_id = jobApplication.data.id;
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== jobApplication.data.job_id) return job;
                
                        didUpdate = true;
                
                        const applicationDocs = job.jobApplicationsDocs ?? [];
                
                        const nextApplicationDocs = [
                            ...applicationDocs.filter(a => a.id !== jobApplication.data.id),
                            { ...jobApplication.data }, // force new ref
                        ];
                
                        return {
                            ...job,
                            jobApplicationsDocs: nextApplicationDocs,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            } else {
                throw new Error(jobApplication.error as string);
            }
            const result = await updateBidStatus(id ?? "", BidStatus.ACCEPTED, job_id ?? "", freelancer.id ?? "");
            if (result.success) {
                toast.success("Bid accepted successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                throw new Error(result.error as string);
            }

            const conversation = await createConversationAndParticipant(job_application_id, job_id ?? "", "", userInfo.id, freelancer.id ?? "");
            if (!conversation.success) {
                throw new Error(conversation.error as string);
            }

            setConversationsInfo(prev => {
                const exists = prev.some(c => c.id === conversation.data.id);
            
                if (!exists) {
                    return [conversation.data, ...prev];
                }
            
                return prev.map(conv =>
                    conv.id === conversation.data.id
                        ? {
                            ...conv,
                            ...conversation.data,
                            participants:
                                conversation.data.participants ?? conv.participants,
                            messages:
                                conversation.data.messages ?? conv.messages,
                        }
                        : conv
                );
            });
            router.push(`/chat?conversation_id=${conversation.data.id}`);
        } catch (error) {
            error instanceof Error ? toast.error(error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            }) : toast.error(error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } finally {
            setLoading("success");
        }
    };

    const handleDecline = async (id: string) => {
        try {
            // const jobApplication = await deleteJobApplication(id ?? "");
            // if (!jobApplication.success) {
            //     throw new Error(jobApplication.error as string);
            // }
            setLoading("pending");
            const result = await updateBidStatus(id ?? "", BidStatus.DECLINED, job_id ?? "", freelancer.id ?? "");
            if (result.success) {
                toast.success("Bid declined successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                throw new Error(result.error as string);
            }
        } catch (error) {
            error instanceof Error ? toast.error(error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            }) : toast.error(error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } finally{
            setLoading("success");
        }
    };

    return (
        <div>
                {
                    loading === "pending" && <SmallLoading />
                }
                {
                    loading === "success" && 
                    <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                        <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                            <div className="text-black">
                                <div className='flex items-center justify-center'>
                                    <div className="w-25 h-25 rounded-full overflow-hidden mb-4">
                                        <Image 
                                            src={freelancer?.image_id ? EscrowBackendConfig.uploadedImagesURL + freelancer.image_id : EscrowBackendConfig.uploadedImagesURL + "/default.jpg"}
                                            alt="job image"
                                            width={100}
                                            height={100}
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col pb-6">
                                    <h1 className="text-normal font-bold text-black truncate">Name: {freelancer?.display_name}</h1>
                                    <p className="text-light-large font-regular text-black truncate">Email: {freelancer?.email}</p>
                                    <p className="text-light-large font-regular text-black truncate">Address: {freelancer?.address}</p>
                                    <p className="text-light-large font-regular text-black truncate">Finished Jobs: {freelancer?.finished_job_num}</p>
                                    <p className="text-light-large font-regular text-black truncate">Total Earned: {Number(freelancer?.total_fund).toFixed(2) + " BNB"}</p>
                                </div>
            
                                <div
                                    className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}
                                >
                                    <p
                                        className="text-normal font-regular text-black"
                                    >
                                        Cover Letter:
                                    </p>   
                                    <p
                                        ref={coverLetterRef}
                                        className="text-normal font-regular text-black"
                                    >
                                        {cover_letter_md ? cover_letter_md : "N/A"}
                                    </p>
                                </div>
                                {canToggle && (
                                    <button
                                        type="button"
                                        className="mt-3 text-small font-regular text-gray-500 cursor-pointer"
                                        onClick={() => setExpanded((prev) => !prev)}
                                    >
                                        {expanded ? "show less" : "show more"}
                                    </button>
                                )}
            
                                <div className="flex flex-col pb-6">
                                    <p className="text-normal font-bold text-black">Bid Amount: {bid_amount} {token_symbol}</p>
                                    <p className="text-normal font-regular text-black">Period: {period ? period : "N/A"} days</p>
                                </div>
            
                                <div className="flex justify-end pt-6 gap-2">
                                    <Button 
                                        variant='primary' 
                                        padding='px-5 py-2' 
                                        onClick={() => handleAccept(id ?? "")}
                                    >
                                        Contact
                                    </Button>
                                    <Button 
                                        variant='secondary' 
                                        padding='px-5 py-2' 
                                        onClick={() => handleDecline(id ?? "")}
                                    >
                                        Decline
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
        </div>
        
    );
};

export default ApplicationPost;