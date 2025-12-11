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

interface ApplicationWithUser extends Bid {
    user: User;
}

const COLLAPSED_MAX_HEIGHT = 120;

const ApplicationPost = ({ user, id, cover_letter_md, bid_amount, token_symbol, status, period, job_id, freelancer_id }: ApplicationWithUser) => {
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const coverLetterRef = useRef<HTMLParagraphElement>(null);
    const { setConversationsInfo } = useContext(ConversationsInfoCtx);
    const router = useRouter();

    useEffect(() => {
        const el = coverLetterRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [cover_letter_md]);

    const handleAccept = async (id: string) => {
        try {
            const bid = await getBidById(id ?? "");
            if (!bid.success) {
                throw new Error(bid.error as string);
            }
            if(bid.data.status === BidStatus.ACCEPTED) {
                throw new Error("Job bid is already accepted");
            }
            if(bid.data.status === BidStatus.DECLINED) {
                throw new Error("Job bid is already declined");
            }
            if(bid.data.status === BidStatus.WITHDRAWN) {
                throw new Error("Job bid is already withdrawn");
            }
            const jobInfo = await getJobById(job_id ?? "");
            let job_application_id = "";
            let client_id = "";
            if (jobInfo.success) {
                client_id = jobInfo.data.client_id;
            } else {
                throw new Error(jobInfo.error as string);
            }
            const jobApplication = await createJobApplication({
                job_id: job_id ?? "",
                client_id: client_id,
                freelancer_id: freelancer_id ?? "",
            });
            if (jobApplication.success) {
                job_application_id = jobApplication.data.id;
            } else {
                throw new Error(jobApplication.error as string);
            }
            const result = await updateBidStatus(id ?? "", BidStatus.ACCEPTED, job_id ?? "", freelancer_id ?? "");
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

            const conversation = await createConversationAndParticipant(job_application_id, job_id ?? "", "", client_id, freelancer_id ?? "");
            if (!conversation.success) {
                throw new Error(conversation.error as string);
            }

            setConversationsInfo((prev) => [...prev, {
                conversation: conversation.data,
                participants: conversation.data.participants,
                clientInfo: jobInfo.data.client_info,
                freelancerInfo: jobInfo.data.freelancer_info,
                jobInfo: jobInfo.data,
                gigInfo: null,
            }]);

            router.push(`/reference?jobApplicationId=${job_application_id}&conversationId=${conversation.data}`);
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
        }
    };

    const handleDecline = async (id: string) => {
        try {
            // const jobApplication = await deleteJobApplication(id ?? "");
            // if (!jobApplication.success) {
            //     throw new Error(jobApplication.error as string);
            // }
            const result = await updateBidStatus(id ?? "", BidStatus.DECLINED, job_id ?? "", freelancer_id ?? "");
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
        }
    };

    return (
        <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
            <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                <div className="text-black">
                    {user.image_id && (
                        <div className='flex items-center justify-center'>
                            <div className="w-25 h-25 rounded-full overflow-hidden">
                                <Image 
                                    src={EscrowBackendConfig.uploadedImagesURL + user.image_id}
                                    alt="job image"
                                    width={100}
                                    height={100}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col pb-6">
                        <h1 className="text-normal font-bold text-black truncate">Name: {user.display_name}</h1>
                        <p className="text-light-large font-regular text-black truncate">Email: {user.email}</p>
                        <p className="text-light-large font-regular text-black truncate">Address: {user.address}</p>
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
                            Accept
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
    );
};

export default ApplicationPost;