'use client';

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

interface BidPostProps {
    description: string;
    title: string;
    location: string; 
    tags: string[];  
    price: number;
    currency: string;
    deadline: number;
    status: "pending" | "accepted" | "declined"; 
}

const COLLAPSED_MAX_HEIGHT = 168;

const BidPost = ({ description, title, location, tags, price, currency, deadline, status }: BidPostProps) => {
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
                    <div className="flex justify-between pb-6">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <h1 className="text-subtitle font-bold text-black">{title}</h1>
                                <div>
                                    <Image 
                                        src="/Grmps/yellowStar.svg" 
                                        alt="favorite icon" 
                                        width={24} 
                                        height={24} 
                                    />
                                </div>                
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-light-large font-regular text-black">{location}</p>
                                <p className="text-light-large font-regular text-black">{price}{currency}</p>
                                <p className="text-light-large font-regular text-black">Due Date: {new Date(deadline * 1000).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {status === "pending" && (
                            <div className="bg-[#8F99AF1A] border border-[#8F99AF] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#8F99AF]">Pending...</p>
                            </div>
                        )}
                        {status === "accepted" && (
                            <div className="bg-[#34C7591A] border border-[#34C759] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#34C759]">Accepted</p>
                            </div>
                        )}
                        {status === "declined" && (
                            <div className="bg-[#FF383C33] border border-[#FF383C] rounded-lg px-6.75 py-1.75 h-fit">
                                <p className="text-normal font-regular italic text-[#FF383C]">Declined</p>
                            </div>
                        )}
                    </div>
                    <div
                        className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}
                    >
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
                </div>
            </div>
        </div>
    );
};

export default BidPost;