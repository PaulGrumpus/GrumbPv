'use client';

import { useEffect, useRef, useState } from "react";

import Button from "./button";
import Image from "next/image";
import { LocationType } from "@/types/jobs";
import { formatDueDate } from "@/utils/functions";

interface pubJobOrGigPostProps {
    description: string;
    title: string;
    location?: LocationType; 
    tags: string[];  
    minBudget: number;
    maxBudget: number;
    currency: string;
    deadline?: number | string | undefined;
    createdAt: number;   
    image?: string;
    label: string;
    clickHandler: () => void;
}

const COLLAPSED_MAX_HEIGHT = 120;

const PubJobOrGigPost = ({ description, title, location, tags, minBudget, maxBudget, currency, deadline, clickHandler, image, label }: pubJobOrGigPostProps) => {
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
                        <div className="flex flex-col max-w-[75%]">
                            <h1 className="text-subtitle font-bold text-black">{title}</h1>
                            <div className="flex flex-col">
                                <p className="text-light-large font-regular text-black">Location: {location === LocationType.REMOTE ? "Remote" : location === LocationType.ON_SITE ? "On Site" : "Hybrid"}</p>
                                <p className="text-light-large font-regular text-black">Budget: {minBudget} - {maxBudget}{currency}</p>
                                <p className="text-light-large font-regular text-black">Due Date: {formatDueDate(deadline)}</p>
                            </div>
                        </div>
                        <div className="fit-content">
                            <Button 
                                variant="secondary"
                                padding='px-5 py-3'
                                onClick={clickHandler}
                            >
                                <p className="text-normal font-regular">{label}</p>
                            </Button>
                        </div>
                    </div>

                    {image && (
                        <div className="py-6">
                            <Image 
                                src={image || ""}
                                alt="job image"
                                width={1000}
                                height={500}
                                className="rounded-lg h-100 w-full object-cover"
                            />
                        </div>
                    )}

                    <div
                        className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}
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

export default PubJobOrGigPost;