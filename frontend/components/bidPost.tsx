'use client';

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { BidPostProps, BidStatus } from "@/types/bid";
import { LocationType } from "@/types/jobs";
import { formatDueDate } from "@/utils/functions";

const COLLAPSED_MAX_HEIGHT = 120;

const BidPost = ({ bid_id, job_description, job_title, job_location, job_tags, job_max_budget, job_min_budget, job_deadline, bid_cover_letter, bid_amount, currency, bid_status }: BidPostProps) => {
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const [canToggleBidCoverLetter, setCanToggleBidCoverLetter] = useState(false);
    const [expandedBidCoverLetter, setExpandedBidCoverLetter] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const bidCoverLetterRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [job_description]);

    useEffect(() => {
        const el = bidCoverLetterRef.current;
        if (!el) {
            return;
        }
        setCanToggleBidCoverLetter(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [bid_cover_letter]);

    return (
        <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
            <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                <div className="text-black">
                    <div className="flex justify-between pb-6 gap-6">
                        <div className="flex flex-col max-w-[75%]">
                            <div className="flex items-center gap-1">
                                <h1 className="text-subtitle font-bold text-black">{job_title}</h1>
                                {/* <div>
                                    <Image 
                                        src="/Grmps/yellowStar.svg" 
                                        alt="favorite icon" 
                                        width={24} 
                                        height={24} 
                                    />
                                </div>                 */}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-normal font-regular text-black">Location: {job_location === LocationType.REMOTE ? "Remote" : job_location === LocationType.ON_SITE ? "On Site" : "Hybrid"}</p>
                                <p className="text-normal font-regular text-black">Budget: {job_min_budget} - {job_max_budget}{currency}</p>
                                <p className="text-normal font-regular text-black">Due Date: {formatDueDate(job_deadline)}</p>
                            </div>
                            <div className="flex justify-start">
                                <p className="text-normal font-regular text-black">Job Tags: </p>
                                <div className="flex gap-2">
                                    {job_tags?.map((tag) => (
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
                        </div>
                        {bid_status === BidStatus.PENDING && (
                            <div className="bg-[#8F99AF1A] border border-[#8F99AF] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#8F99AF]">Pending...</p>
                            </div>
                        )}
                        {bid_status === BidStatus.ACCEPTED && (
                            <div className="bg-[#34C7591A] border border-[#34C759] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#34C759]">Accepted</p>
                            </div>
                        )}
                        {bid_status === BidStatus.DECLINED && (
                            <div className="bg-[#FF383C33] border border-[#FF383C] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#FF383C]">Declined</p>
                            </div>
                        )}
                        {bid_status === BidStatus.WITHDRAWN && (
                            <div className="bg-[#FF383C33] border border-[#2F3DF6] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#2F3DF6]">Withdrawn</p>
                            </div>
                        )}
                    </div>
                    <div
                        className={`overflow-hidden transition-[max-height] min-h-42 duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}
                    >
                        <p
                            className="text-normal font-regular text-black"
                        >
                            Job Description:
                        </p>
                        <p
                            ref={descriptionRef}
                            className="text-normal font-regular text-black"
                        >
                            {job_description}
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

                    {!canToggle && (
                        <div className="h-8.25"></div>
                    )}

                    <div className="pb-6"></div>

                    <div className={`overflow-hidden transition-[max-height] duration-200 ${expandedBidCoverLetter ? "max-h-none" : "max-h-42"}`}>
                        <p className="text-normal font-regular text-black">Bid Cover Letter:</p>
                        <p
                            ref={bidCoverLetterRef}
                            className="text-normal font-regular text-black"
                        >
                            {bid_cover_letter}
                        </p>
                    </div>

                    {canToggleBidCoverLetter && (
                        <button
                            type="button"
                            className="mt-3 text-small font-regular text-gray-500 cursor-pointer"
                            onClick={() => setExpandedBidCoverLetter((prev) => !prev)}
                        >
                            {expandedBidCoverLetter ? "show less" : "show more"}
                        </button>
                    )}

                    <div className="flex flex-col pt-6">
                        <p className="text-normal font-regular text-black">Bid Amount:</p>
                        <p
                            className="text-normal font-regular text-black"
                        >
                            {bid_amount} {currency}
                        </p>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default BidPost;