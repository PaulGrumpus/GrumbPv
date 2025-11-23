'use client'

import Button from "./Button";
import { useState } from "react";

const STATUSES = [
    { key: "started", label: "Started the job" },
    { key: "funded", label: "Escrow Funds have been made" },
    { key: "delivered", label: "Deliverables submitted" },
    { key: "approved", label: "Approved the payment" },
];

interface DashboardPostsProps {
    variant: "open" | "completed";
}

const DashboardPosts = ({ variant }: DashboardPostsProps) => {
    const userRole:string = "freelancer";
    const [status] = useState(2);
    const totalSteps = STATUSES.length;

    const handleFund = () => {
        console.log("processing fund...");
    }
    const handleDeliver = () => {
        console.log("processing deliver...");
    }
    const handleApprove = () => {
        console.log("processing approve...");
    }
    const handleWithdraw = () => {
        console.log("processing withdraw...");
    }
    const handleDispute = () => {
        (status >= 2 && status < 4 && userRole === "client") ||
        (status === 3 && userRole === "freelancer") ? console.log("processing dispute...") : console.log("you are not allowed to dispute");
    }
    const handleGoToDoc = () => {
        console.log("processing go to doc...");
    }
    return (
        <div className="linear-border linear-border--dark-hover">
            <div className="linear-border__inner p-8 bg-white">
                {
                    variant === "open" && (
                        <div className="text-black flex flex-wrap justify-between gap-6">
                            <div className="flex flex-col max-w-180 gap-6">
                                <p className="text-subtitle font-bold text-black">Job Title</p>
                                <p className="text-normal font-regular text-black">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
                                </p>
                                <div className="relative mt-2 h-3.5 min-w-[280px]">
                                    <div className="absolute inset-0 rounded-full bg-[#e8e8f0]" />
                                    {STATUSES.slice(1).map((_, index) => {
                                        const segmentIndex = index + 1;
                                        const left = `${(segmentIndex - 1) * (100 / (totalSteps - 1))}%`;
                                        const width = `${100 / (totalSteps - 1)}%`;
                                        const isActive = status > segmentIndex;
                                        return (
                                            <div
                                                key={`segment-${segmentIndex}`}
                                                className="absolute inset-y-0 left-0 rounded-full"
                                                style={{
                                                    left,
                                                    width,
                                                    background: isActive
                                                        ? "linear-gradient(90deg, rgba(84,98,255,0.95) 0%, rgba(118,67,231,0.95) 100%)"
                                                        : "#8F99AF66",
                                                }}
                                            />
                                        );
                                    })}
                                    {STATUSES.map((statusItem, index) => {
                                        const position =
                                            totalSteps === 1 ? 0 : (index / (totalSteps - 1)) * 100;
                                        const isActive = status > index;
                                        return (
                                            <div
                                                key={`dot-${statusItem.key}`}
                                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                                                style={{ left: `${position}%` }}
                                            >
                                                <span
                                                    className={`block h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_4px_rgba(90,107,255,0.6)] cursor-pointer ${
                                                        isActive ? "bg-[#5a6bff]" : "bg-[#8F99AF66]"
                                                    }`}
                                                />
                                                <span
                                                    className="pointer-events-none absolute left-1/2 hidden w-max -translate-x-1/2 rounded-lg border border-[#5a6bff] bg-white p-3 text-normal font-regular text-[#7E3FF2] shadow-lg group-hover:flex"
                                                    style={{ bottom: "calc(100% + 0.9rem)" }}
                                                >
                                                    {statusItem.label}
                                                    <span
                                                        className="pointer-events-none absolute top-[110%] left-1/2 -translate-x-1/2 h-0 w-0 border-x-6 border-x-transparent border-t-6 border-t-[#8b53ff]"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {status == 1 && userRole === "client" && (
                                    <Button 
                                        padding="px-10.375 py-3"
                                        onClick={handleFund}
                                    >
                                        Fund
                                    </Button>
                                )}
                                {status == 2 && userRole === "freelancer" && (
                                    <Button 
                                        padding="px-8.75 py-3"
                                        onClick={handleDeliver}
                                    >
                                        Deliver 
                                    </Button>
                                )}
                                {status == 3 && userRole === "client" && (
                                    <Button 
                                        padding="px-7.5 py-3"
                                        onClick={handleApprove}
                                    >
                                        Approve
                                    </Button>
                                )}
                                {status == 4 && userRole === "freelancer" && (
                                    <Button 
                                        padding="px-6.375 py-3"
                                        onClick={handleWithdraw}
                                    >
                                        Withdraw 
                                    </Button>
                                )}
                                <Button 
                                    padding="px-8.5 py-3.25"
                                    variant={
                                        (status >= 2 && status < 4 && userRole === "client") ||
                                        (status === 3 && userRole === "freelancer")
                                            ? "secondary"
                                            : "disable"
                                    }
                                    onClick={handleDispute}
                                >
                                    Dispute
                                </Button>
                                <Button 
                                    padding="px-6.25 py-3"
                                    variant="secondary"
                                    onClick={handleGoToDoc}
                                >
                                    Go to Doc
                                </Button>
                            </div>
                        </div>
                    )
                }
                {
                    variant === "completed" && (
                        <div className="text-black flex flex-wrap justify-between gap-6">
                            <div className="flex flex-col gap-6">
                                <p className="text-subtitle font-bold text-black">Job Title</p>
                                <p className="text-normal font-regular text-black">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
                                </p>
                            </div>
                        </div>
                    )
                }
                
            </div>
        </div>
    )
}

export default DashboardPosts;