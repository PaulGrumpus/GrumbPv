'use client';

import { useEffect, useRef, useState } from "react";

import Button from "./Button";

interface PostProps {
    description: string;
    title: string;
    location: string; 
    tags: string[];  
    price: number;
    currency: string;
    deadline: number;
    createdAt: number;    
}

const COLLAPSED_MAX_HEIGHT = 168;

const Post = ({ description, title, location, tags, price, currency, deadline }: PostProps) => {
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
                        <div className="flex flex-col">
                            <h1 className="text-subtitle font-bold text-black">{title}</h1>
                            <div className="flex gap-2">
                                <p className="text-light-large font-regular text-black">{location}</p>
                                <p className="text-light-large font-regular text-black">{price}{currency}</p>
                                <p className="text-light-large font-regular text-black">Due Date: {new Date(deadline * 1000).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <Button 
                            variant="secondary"
                            padding='px-5 py-3'
                        >
                            <p className="text-normal font-regular text-black">Apply Now</p>
                        </Button>
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
                            className="mt-3 text-small font-regular text-gray-500"
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

export default Post;