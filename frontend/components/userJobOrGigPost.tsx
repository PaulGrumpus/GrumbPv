'use client';

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

interface userJobOrGigPostProps {
    title: string;
    description: string;
    subtitle: string; 
    tags: string[];  
    price?: number;
    currency?: string;
    image?: string;
}

const editIcon = "/Grmps/lucide_edit.svg";

const COLLAPSED_MAX_HEIGHT = 168;

const UserJobOrGigPost = ({ description, title, subtitle, tags, image }: userJobOrGigPostProps) => {
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
                            <h1 className="text-subtitle font-bold text-black">{title}</h1>
                            <p className="text-light-large font-regular text-black">{subtitle}</p>
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

                    {image && (
                        <div className="pb-6 w-full h-40 rounded-lg overflow-hidden">
                            <Image 
                                src={image || ""}
                                alt="post image" 
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

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

export default UserJobOrGigPost;