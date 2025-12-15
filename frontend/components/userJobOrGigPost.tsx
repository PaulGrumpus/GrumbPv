'use client';

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { LocationType } from "@/types/jobs";
import Button from "./button";
import ModalTemplate from "./modalTemplate";
import { getBidsByJobId, getUserById } from "@/utils/functions";
import { Bid } from "@/types/bid";
import { toast } from "react-toastify";
import { User } from "@/types/user";
import ApplicationPost from "./applicationPost";
import SmallLoading from "./smallLoading";

interface userJobOrGigPostProps {
    job_id?: string;
    gig_id?: string;
    title: string;
    description: string;
    location?: LocationType; 
    tags: string[];  
    price?: number;
    currency?: string;
    image?: string;
    minBudget?: number;
    maxBudget?: number;
    deadline?: number;
    status?: string;
    link?: string;
    variant?: "job" | "gig";    
}

interface ApplicationWithUser extends Bid {
    user: User;
}

const editIcon = "/Grmps/lucide_edit.svg";

const COLLAPSED_MAX_HEIGHT = 120;

const UserJobOrGigPost = ({ job_id, gig_id, description, title, location, tags, image, minBudget, maxBudget, currency, deadline, status, link, variant = "job" }: userJobOrGigPostProps) => {
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
    const [loading, setLoading] = useState("success");

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [description]);

    const handleApplications = async () => {
        setLoading("pending");
        const result = await getBidsByJobId(job_id ?? "");
        if (result.success) {
            if (result.data) {
                setApplications(result.data); // freelancer already included
            } else {
                setApplications([]);
                toast.error(result.error || "No applications found");
            }
        } else {
            toast.error(result.error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        setLoading("success");
        setIsOpen(true);
    }

    return (
        <div>
            <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                    {loading === "pending" ? (
                        <SmallLoading />
                    ) : (
                        <div className="text-black">
                            <div className="flex justify-between gap-6">
                                <div className="flex flex-col max-w-[75%]">
                                    <h1 className="text-subtitle font-bold text-black">{title}</h1>
                                    {location && (
                                        <p className="text-normal font-regular text-black">Location: {location === LocationType.REMOTE ? "Remote" : location === LocationType.ON_SITE ? "On Site" : "Hybrid"}</p>
                                    )}
                                    {minBudget && maxBudget && (
                                        <p className="text-normal font-regular text-black">
                                            Budget: {minBudget} - {maxBudget} {currency}
                                        </p>
                                    )}                      
                                </div>
                                <div 
                                    onClick={() => {
                                        console.log("edit");
                                    }}
                                    className="cursor-pointer hover:scale-110 transition-transform duration-200"
                                >
                                    <Image 
                                        src={editIcon} 
                                        alt="edit" 
                                        width={24} 
                                        height={24}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {deadline && (
                                    <p className="text-normal font-regular text-black">
                                        Due Date: {new Date(deadline * 1000).toLocaleDateString()}
                                    </p>
                                )}
                                {status && (
                                    <p className="text-normal font-regular text-black">
                                        Status: {status}
                                    </p>
                                )}
                                {link && (
                                    <p className="text-normal font-regular text-black">
                                        Link: {link}
                                    </p>
                                )}
                            </div>

                            <div
                                className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"} pt-6`}
                            >
                                <p
                                    className="text-normal font-regular text-black"
                                >
                                    Description:
                                </p>
                                <p
                                    ref={descriptionRef}
                                    className="text-normal font-regular text-black"
                                >
                                    {description}
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
                            
                            <div className="pb-6"></div>
                            {image && (
                                <div className="w-full h-100 rounded-lg overflow-hidden">
                                    <Image 
                                        src={image || ""}
                                        alt="post image" 
                                        width={1000}
                                        height={500}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            {tags.length > 0 && (
                                <div className="flex justify-end pt-6">
                                    <div className="flex gap-2">
                                        {tags.map((tag) => (
                                            <div
                                                key={tag}
                                                className="linear-border linear-border--dark-hover rounded-full p-px"
                                            >
                                                <span className="linear-border__inner rounded-full bg-white px-3 py-1 text-tiny font-regular text-black">
                                                    {tag}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {variant === "job" && (
                                <div className="flex justify-end pt-6">
                                    <Button
                                        padding='px-7 py-3'
                                        onClick={handleApplications}
                                    >
                                        <p className='text-normal font-regular'>Applications</p>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <ModalTemplate
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                actionLabel="Close"
                onAction={() => {}}
                className="p-10.5"
                customButton={true}                
            >
                <div className="mt-6">
                    <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                        <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                            <p className="text-large font-bold text-[#2F3DF6] py-6">See Applicants:</p>
                            <div className="grid grid-cols-3 gap-6">
                                {applications.length > 0 ? (
                                    applications.map((application) => (
                                        <ApplicationPost key={application.id} {...application} />
                                    ))
                                ) : (
                                    <p className="text-normal font-regular text-black">No applications found</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ModalTemplate>
        </div>
    );
};

export default UserJobOrGigPost;