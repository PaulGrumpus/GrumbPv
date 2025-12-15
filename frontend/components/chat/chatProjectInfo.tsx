import { useEffect, useRef, useState } from "react";
import Button from "../button";
import { Job } from "@/types/jobs";

interface ChatProjectInfoProps {
    job: Job | null;
    clientName: string;
    acceptHandler: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const ChatProjectInfo = ({ job, clientName, acceptHandler }: ChatProjectInfoProps) => {    

    return (
        <div className="bg-[#7E3FF2] rounded-xl py-3 px-3.75">
            <div className="max-w-62.5 w-full">
                <div className="flex items-center justify-center pt-6 pb-2.5">
                    <h1 className="text-light-large font-bold text-[#DEE4F2]">Project Overview</h1>
                </div>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Title: {job? job.title : "No title"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Client: {job? clientName : "No client name"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Budget: {job? job.budget_min_usd : "No budget"} - {job? job.budget_max_usd : "No budget"} {job? job.token_symbol : "No token symbol"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Deadline: {job? formatDate(job.deadline_at ?? "") : "No deadline"}</p>
                <div className="px-2.5 py-2">
                    <p className="text-normal font-medium text-[#DEE4F2]">Project Info:</p>
                    <p className="text-normal font-medium text-[#DEE4F2] max-h-30 overflow-y-auto hide-scrollbar">{job? job.description_md : "No description"}</p>
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
        </div>
    );
};

export default ChatProjectInfo;