'use client'

import DashboardPosts from "@/components/dashboardPosts";
import Image from "next/image";
import { useState } from "react";

const DashboardOverview = () => {
    const [openJobs, setOpenJobs] = useState(true);
    const [showAllOpenJobs, setShowAllOpenJobs] = useState(false);
    const totalOpenJobPosts = 3;
    const openJobPosts = Array.from({ length: totalOpenJobPosts }, (_, index) => index);
    const visibleOpenJobPosts = showAllOpenJobs ? openJobPosts : openJobPosts.slice(0, 2);

    return (
        <div>
            <h1 className="text-display font-bold text-black pb-6">Dashboard</h1>
            <p className="text-normal font-regular text-black pb-20">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in
                eros elementum tristique.
            </p>
            <div className="flex flex-col gap-20">
                <div className="linear-border linear-border--dark-hover">
                    <div className="linear-border__inner bg-white">
                        <div className="flex flex-col py-3 px-4">
                            <div
                                className="flex justify-between items-center py-5 w-241.5"
                                onClick={() => {
                                    setOpenJobs(!openJobs);
                                }}
                            >
                                <h2 className="text-title font-bold text-black">Open Jobs</h2>
                                <div className="w-6 h-6">
                                    <Image
                                        src="/Grmps/chevronUp.svg"
                                        alt="Chevron Up"
                                        width={32}
                                        height={32}
                                        className={`h-full w-full ${!openJobs ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>
                            {openJobs && (
                                <div className="flex flex-col gap-8">
                                    {visibleOpenJobPosts.map((postId) => (
                                        <DashboardPosts key={`open-job-${postId}`} variant="open" />
                                    ))}
                                    {openJobPosts.length > 2 && (
                                        <p
                                            className="text-center text-small font-semibold text-[#5a6bff] cursor-pointer"
                                            onClick={() => setShowAllOpenJobs((prev) => !prev)}
                                        >
                                            {showAllOpenJobs ? "Show less" : "Show more"}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="linear-border linear-border--dark-hover">
                    <div className="linear-border__inner bg-white">
                        <div className="flex flex-col py-3 px-4">
                            <div
                                className="flex justify-between items-center py-5 w-241.5"
                                onClick={() => {
                                    setOpenJobs(!openJobs);
                                }}
                            >
                                <h2 className="text-title font-bold text-black">Completed Jobs</h2>
                                <div className="w-6 h-6">
                                    <Image
                                        src="/Grmps/chevronUp.svg"
                                        alt="Chevron Up"
                                        width={32}
                                        height={32}
                                        className={`h-full w-full ${!openJobs ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>
                            {openJobs && (
                                <div>
                                    <div className="grid grid-cols-2 gap-8">
                                        {visibleOpenJobPosts.map((postId) => (
                                            <DashboardPosts key={`open-job-${postId}`} variant="completed" />
                                        ))}
                                    </div>
                                    {openJobPosts.length > 2 && (
                                        <p
                                            className="text-center text-small font-semibold text-[#5a6bff] cursor-pointer mt-8"
                                            onClick={() => setShowAllOpenJobs((prev) => !prev)}
                                        >
                                            {showAllOpenJobs ? "Show less" : "Show more"}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;

