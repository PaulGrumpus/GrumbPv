'use client';

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { LocationType } from "@/types/jobs";

interface userJobOrGigPostProps {
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
}

const editIcon = "/Grmps/lucide_edit.svg";

const COLLAPSED_MAX_HEIGHT = 168;

const UserJobOrGigPost = ({ description, title, location, tags, image, minBudget, maxBudget, currency, deadline, status, link }: userJobOrGigPostProps) => {
    const [expanded, setExpanded] = useState(false);
    const [canToggle, setCanToggle] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [description]);

    return (
        <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
            <div className="linear-border__inner rounded-[0.4375rem] p-6 bg-white">
                <div className="text-black">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
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
                        </p><p
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
                                width={100}
                                height={100}
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
                </div>
            </div>
        </div>
    );
};

export default UserJobOrGigPost;