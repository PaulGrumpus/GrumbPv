import { useEffect, useRef, useState } from "react";
import Button from "../button";
import { Job } from "@/types/jobs";

interface ChatProjectInfoProps {
    job: Job;
    clientName: string;
    acceptHandler: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const ChatProjectInfo = ({ job, clientName, acceptHandler }: ChatProjectInfoProps) => {    

    return (
        <div className="bg-[#7E3FF2] rounded-xl py-3.75 px-3">
            <div className="flex items-center justify-center pt-6 pb-2.5">
                <h1 className="text-light-large font-bold text-[#DEE4F2]">Project Overview</h1>
            </div>
            <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Title: {job.title}</p>
            <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Client: {clientName}</p>
            <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Budget: {job.budget_min_usd} - {job.budget_max_usd} {job.token_symbol}</p>
            <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Deadline: {formatDate(job.deadline_at ?? "")}</p>
            <div className="px-2.5 py-2">
                <p className="text-normal font-medium text-[#DEE4F2]">Project Info:</p>
                <p className="text-normal font-medium text-[#DEE4F2] max-h-30 overflow-y-auto hide-scrollbar">{job.description_md}</p>
            </div>
            <div className="flex items-center justify-center pt-2.5 pb-6">
                <Button 
                    padding="px-5 py-1.5" 
                    onClick={() => {
                        acceptHandler();
                    }}
                >
                    <p className="text-normal font-normal text-[#FFFFFF]">Accept</p>
                </Button>
            </div>
        </div>
    );
};

export default ChatProjectInfo;