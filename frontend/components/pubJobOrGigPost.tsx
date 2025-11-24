'use client';

import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import Image from "next/image";

interface pubJobOrGigPostProps {
    description: string;
    title: string;
    location: string; 
    tags: string[];  
    price: number;
    currency: string;
    deadline: number | string;
    createdAt: number;   
    image?: string;
    label: string;
    clickHandler: () => void;
}

const formatDueDate = (deadline: number | string) => {
    if (deadline === null || deadline === undefined) {
        return "TBD";
    }

    const numericDeadline =
        typeof deadline === "number"
            ? deadline
            : Number.isNaN(Number(deadline))
                ? undefined
                : Number(deadline);

    const timestamp =
        numericDeadline !== undefined
            ? (numericDeadline > 1e12 ? numericDeadline : numericDeadline * 1000)
            : Date.parse(String(deadline));

    if (!Number.isFinite(timestamp)) {
        return "TBD";
    }

    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
    }).format(new Date(timestamp));
};

const COLLAPSED_MAX_HEIGHT = 168;

const PubJobOrGigPost = ({ description, title, location, tags, price, currency, deadline, clickHandler, image, label }: pubJobOrGigPostProps) => {
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
        <div className="linear-border linear-border--dark-hover">
            <div className="linear-border__inner p-6 bg-white">
                <div className="text-black">
                    <div className="flex justify-between pb-6">
                        <div className="flex flex-col max-w-[75%]">
                            <h1 className="text-subtitle font-bold text-black">{title}</h1>
                            <div className="flex gap-2">
                                <p className="text-light-large font-regular text-black">{location}</p>
                                <p className="text-light-large font-regular text-black">{price}{currency}</p>
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

                    {image && (
                        <div className="py-6">
                            <Image 
                                src={image || ""}
                                alt="job image"
                                width={100}
                                height={100}
                                className="rounded-lg h-100 w-full object-cover"
                            />
                        </div>
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