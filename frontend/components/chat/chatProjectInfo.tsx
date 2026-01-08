import { useEffect, useRef, useState } from "react";
import Button from "../button";
import { Job } from "@/types/jobs";

interface ChatProjectInfoProps {
    job_id: string;
    job_title: string;
    job_description: string
    job_min_budget: string
    job_max_budget: string
    job_deadline_at: string
    job_token_symbol: string;
    clientName: string;
    acceptHandler: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const ChatProjectInfo = ({ job_id, job_token_symbol, job_title, job_description, job_max_budget, job_deadline_at, job_min_budget, clientName, acceptHandler }: ChatProjectInfoProps) => {    

    return (
        <div className="bg-[#7E3FF2] rounded-xl py-3 px-3.75">
            <div className="lg:max-w-62.5 w-full">
                <div className="flex items-center justify-center pt-6 pb-2.5">
                    <h1 className="text-light-large font-bold text-[#DEE4F2]">Project Overview</h1>
                </div>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Title: {job_id? job_title : "No title"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Client: {job_id? clientName : "No client name"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Budget: {job_id? job_min_budget : "No budget"} - {job_id? job_max_budget : "No budget"} {job_id? job_token_symbol : "No token symbol"}</p>
                <p className="text-normal font-medium text-[#DEE4F2] px-2.5 py-2">Deadline: {job_id? formatDate(job_deadline_at ?? "") : "No deadline"}</p>
                <div className="px-2.5 py-2">
                    <p className="text-normal font-medium text-[#DEE4F2]">Project Info:</p>
                    <p className="text-normal font-medium text-[#DEE4F2] max-h-30 overflow-y-auto hide-scrollbar">{job_id? job_description : "No description"}</p>
                </div>
                {job_id && (
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
                )}
            </div>
        </div>
    );
};

export default ChatProjectInfo;