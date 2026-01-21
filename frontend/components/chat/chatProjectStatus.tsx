"use client";

import Button from "../button";
import Link from "next/link";
import { User } from "@/types/user";
import Image from "next/image";
import { toast } from "react-toastify";
import { fundEscrow, deliverWork, approveWork, updateJobMilestone, withdrawFunds, initiateDispute, buyerJoinDispute, venderPayDisputeFee } from "@/utils/functions";
import { useWallet } from "@/context/walletContext";
import { CONFIG } from "@/config/config";
import ModalTemplate from "../modalTemplate";
import { useContext, useEffect, useState } from "react";
import { JobMilestoneStatus } from "@/types/jobMilestone";
import { useDashboard } from "@/context/dashboardContext";
import { UserInfoCtx } from "@/context/userContext";
import { DashboardMilestone } from "@/types/dashboard";
import SmallLoading from "../smallLoading";
import { useMilestoneDelivery } from "@/context/milestoneDeliveryContext";

interface ChatProjectStatusProps {
    status: number; // 1-4
    actionHandler?: () => void;
    actionLabel?: string;
    jobMilestoneId: string;
    conversationId: string;
    jobApplicationDocId: string;
    user: User;
    ipfs: string | null;
    job_id: string
}

const steps = [
    "Started the job",
    "Escrowed the fund",
    "Delivered the product",
    "Approved payment",
];

const ChatProjectStatus = ({job_id, status, actionHandler, actionLabel, jobMilestoneId, conversationId, jobApplicationDocId, user, ipfs }: ChatProjectStatusProps) => {
    const safeStatus = Math.min(Math.max(status, 1), steps.length);
    const activeIndex = safeStatus - 1;
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { userInfo } = useContext(UserInfoCtx);
    const { sendTransaction } = useWallet();
    const [ milestoneInfo, setMilestoneInfo] = useState<DashboardMilestone | undefined>(undefined);
    const { jobsInfo, setJobsInfo } = useDashboard();
    const [loading, setLoading] = useState("success");
    const { 
        isMilestoneDelivering, 
        isMilestoneDelivered, 
        setMilestoneDelivering, 
        setMilestoneDelivered,
        resetMilestoneDelivery 
    } = useMilestoneDelivery();

    useEffect(() => {
        const milestoneInfo = jobsInfo.find(job => job.id === job_id)?.milestones?.find(milestone => milestone.id === jobMilestoneId);
        if (milestoneInfo) {
            setMilestoneInfo(milestoneInfo);
        }
    }, [jobsInfo, job_id, jobMilestoneId]);
    // const { jobMilestonesInfo, setJobMilestonesInfo } = useProjectInfo();
    const handleDownload = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const fileName = url.split("/").pop() ?? "ipfs_file.txt";

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.open(objectUrl, "_blank");

            setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
        } catch (error) {
            toast.error(
                "Failed to download file",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            );
        }
    }

    const handleFundEscrow = async () => {
        const result = await fundEscrow(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error("Failed to fund escrow", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.FUNDED });
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Escrow funded successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleCancelProject = async () => {
        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.CANCELLED });
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Project cancelled successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleDeliverWork = async () => {
        // Check if already delivered
        if (isMilestoneDelivered(jobMilestoneId)) {
            toast.error("Work has already been delivered for this milestone", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        // Check if currently delivering (prevent double-click)
        if (isMilestoneDelivering(jobMilestoneId)) {
            toast.error("Delivery is already in progress. Please wait...", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        if(!selectedFile) {
            toast.error("Please select a file to deliver", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        // Set status to delivering (1) immediately when user clicks confirm
        setMilestoneDelivering(jobMilestoneId);
        setLoading("pending");        
        
        try {
            const result = await deliverWork(user.id, jobMilestoneId, Number(CONFIG.chainId), selectedFile);
            
            const txHash = await sendTransaction({
                to: result.data.to,
                data: result.data.data,
                value: result.data.value,
                chainId: Number(result.data.chainId),
            });
            
            if (!txHash) {
                // Reset to initial state if transaction fails
                resetMilestoneDelivery(jobMilestoneId);
                setLoading("success");
                setIsOpen(false);
                toast.error("Failed to deliver work", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                return;
            }
            
            const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.DELIVERED, ipfs: result.data.cid });
            
            if (updatedJobMilestone.success) {
                if (updatedJobMilestone.data) {
                    const updatedMilestone = updatedJobMilestone.data
                    setJobsInfo(prevJobs => {
                        let didUpdate = false;
                    
                        const nextJobs = prevJobs.map(job => {
                            if (job.id !== updatedMilestone.job_id) return job;
                    
                            didUpdate = true;
                    
                            const milestones = job.milestones ?? [];
                    
                            const nextMilestones = [
                                ...milestones.filter(m => m.id !== updatedMilestone.id),
                                { ...updatedMilestone }, // force new ref
                            ].sort((a, b) => a.order_index - b.order_index);
                    
                            return {
                                ...job,
                                milestones: nextMilestones,
                            };
                        });
                    
                        return didUpdate ? nextJobs : prevJobs;
                    });
                    // Mark as delivered (2) after successful milestone update
                    setMilestoneDelivered(jobMilestoneId);
                }
                setIsOpen(false);
                setLoading("success");
                toast.success("Work delivered successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                // Reset to initial state if milestone update fails
                resetMilestoneDelivery(jobMilestoneId);
                setLoading("success");
                setIsOpen(false);
                toast.error(updatedJobMilestone.error, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
        } catch (error) {
            // Reset to initial state if any error occurs
            resetMilestoneDelivery(jobMilestoneId);
            setLoading("success");
            setIsOpen(false);
            toast.error("An error occurred while delivering work", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleUploadFile = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*/*";
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (!file) {
                return;
            }

            setUploadedFileName(file.name);
            setSelectedFile(file);

            toast.success(`Selected ${file.name}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        };

        fileInput.click();
    };

    const removeUploadedFile = () => {
        setUploadedFileName("");
        setSelectedFile(null);
        toast.success("Uploaded file removed", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
    }

    const handleApproveWork = async () => {
        const result = await approveWork(user.id, jobMilestoneId, Number(CONFIG.chainId), ipfs ?? "");
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error("Failed to approve work", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.APPROVED });
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Work approved successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleWithdrawFunds = async () => {
        const result = await withdrawFunds(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error("Failed to withdraw funds", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.RELEASED });
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Funds withdrawn successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleDispute = async () => {
        const result = await initiateDispute(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error("Failed to initiate dispute", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: userInfo.role === "client" ? JobMilestoneStatus.DISPUTED_BY_CLIENT : JobMilestoneStatus.DISPUTED_BY_FREELANCER});
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Dispute initiated successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    const handleTakePartInDispute = async () => {
        let result = null;
        if(userInfo.role === "client") {
            result = await buyerJoinDispute(user.id, jobMilestoneId, Number(CONFIG.chainId));
        }
        else {
            result = await venderPayDisputeFee(user.id, jobMilestoneId, Number(CONFIG.chainId));
        }
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error("Failed to initiate dispute", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        const updatedJobMilestone = await updateJobMilestone(jobMilestoneId, { status: JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE});
        if (updatedJobMilestone.success) {
            if (updatedJobMilestone.data) {
                const updatedMilestone = updatedJobMilestone.data
                setJobsInfo(prevJobs => {
                    let didUpdate = false;
                
                    const nextJobs = prevJobs.map(job => {
                        if (job.id !== updatedMilestone.job_id) return job;
                
                        didUpdate = true;
                
                        const milestones = job.milestones ?? [];
                
                        const nextMilestones = [
                            ...milestones.filter(m => m.id !== updatedMilestone.id),
                            { ...updatedMilestone }, // force new ref
                        ].sort((a, b) => a.order_index - b.order_index);
                
                        return {
                            ...job,
                            milestones: nextMilestones,
                        };
                    });
                
                    return didUpdate ? nextJobs : prevJobs;
                });
            }
            toast.success("Dispute initiated successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(updatedJobMilestone.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    return (
        <div className="py-3 px-3.75 bg-linear-to-b from-[#7E3FF2] to-[#6A32E8] rounded-xl shadow-[0_10px_35px_rgba(55,0,132,0.35)] flex justify-center lg:block ">
            <div className="max-w-62.5 w-full">
                {status <= 4 && status >= 1 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Project Status</p>
                        </div>

                        <div className="flex gap-3 pb-6">
                            <div className="flex-1">
                                {steps.map((label, idx) => (
                                    <div className="p-3" key={label}>
                                        <p
                                            key={label}
                                            className={`text-normal font-regular text-[#DEE4F2] ${idx === activeIndex ? "font-semibold" : ""}`}
                                        >
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="w-[22%] flex justify-center">
                                <div className="flex flex-col items-center py-2.5 px-1.75">
                                {steps.map((_, idx) => {
                                    const isActive = idx === activeIndex;
                                    const isCompleted = idx < activeIndex;
                                    const isReached = idx <= activeIndex;
                                    const showConnector = idx < steps.length - 1;

                                    return (
                                        <div key={idx} className="flex flex-col items-center">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer ${
                                                    isReached
                                                        ? `bg-[#2F3DF6] text-white ${isActive ? "shadow-[0_8px_24px_rgba(77,125,255,0.45)]" : ""}`
                                                        : "bg-[#A79FD9] text-[#0F1421]"
                                                }`}
                                            >
                                                {idx + 1}
                                            </div>
                                            {showConnector && (
                                                <div
                                                    className={`w-[2px] h-5 ${
                                                        isCompleted ? "bg-[#2F3DF6]" : "bg-[#A79FD9]"
                                                    }`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            {status === 1 && ( 
                                <div className="pb-12">
                                    {user.role === "client" ? (
                                        <div className="flex flex-col gap-2.5 justify-center w-full">
                                            <Button padding="px-6 py-1.5" onClick={handleFundEscrow}>
                                                <p className="text-normal font-regular text-[#FFFFFF]">
                                                    Escrow Fund
                                                </p>
                                            </Button>
                                            <Button padding="px-6 py-1.5" onClick={handleCancelProject}>
                                                <p className="text-normal font-regular text-[#FFFFFF]">
                                                    Cancel Project
                                                </p>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-9"></div>
                                    )}
                                </div>
                            )}
                            {status === 2 && ( 
                                <div className="pb-20.5">
                                    {user.role === "client" ? (
                                        <div className="h-9"></div>
                                    ) : (
                                        <Button 
                                            padding="px-6 py-1.5" 
                                            onClick={() => setIsOpen(true)}
                                        >
                                            <p className="text-normal font-regular text-[#FFFFFF]">
                                                {isMilestoneDelivered(jobMilestoneId) 
                                                    ? "Already Delivered" 
                                                    : isMilestoneDelivering(jobMilestoneId)
                                                    ? "Delivering..."
                                                    : "Deliver Product"}
                                            </p>
                                        </Button>
                                    )}
                                </div>
                            )}
                            {status === 3 && ( 
                                <div>
                                    {user.role === "client" ? (
                                        <div className="flex flex-col items-center justify-center pb-7">
                                            <div className="flex items-center justify-center gap-3 pb-3">
                                                <Link href={`${CONFIG.ipfsGateWay}/${ipfs}`} className="max-w-[15%] truncate">
                                                    <p className="text-normal font-regular text-[#2F3DF6] text-left truncate">{CONFIG.ipfsGateWay}/{ipfs}</p>
                                                </Link>
                                                <Button
                                                    onClick={() => handleDownload(`${CONFIG.ipfsGateWay}/${ipfs}`)}
                                                    padding="p-1"
                                                    variant="secondary"
                                                >
                                                    <Image
                                                        src="/Grmps/download.svg"
                                                        alt="ipfs url"
                                                        width={24}
                                                        height={24}
                                                    />
                                                </Button>
                                            </div>
                                            <Button padding="px-6 py-1.5" onClick={handleApproveWork}>
                                                <p className="text-normal font-regular text-[#FFFFFF]">
                                                    Approve Result
                                                </p>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-9 pb-20.5"></div>
                                    )}
                                </div>
                            )}
                            {status === 4 && ( 
                                <div className="pb-20.5">
                                    {user.role === "client" ? (
                                        <div className="h-9"></div>
                                    ) : (
                                        <Button padding="px-6 py-1.5" onClick={handleWithdrawFunds}>
                                            <p className="text-normal font-regular text-[#FFFFFF]">
                                                Withdraw Payment
                                            </p>
                                        </Button>
                                    )}
                                </div>
                            )}
                            {status >= 5 && ( 
                                <div className="pb-20.5">
                                    <div className="h-9"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center pb-6">
                            {status === 1 && ( 
                                <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                    <Button padding="px-4 py-1.5" variant="secondary">
                                        <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                                    </Button>
                                </Link>
                            )}  
                            {status === 2 && ( 
                                <div>
                                    {user.role === "client" ? (
                                        <div className="flex gap-2.5 justify-center w-full">
                                            <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                                <Button padding="px-4 py-1.5" variant="secondary">
                                                    <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                                                </Button>
                                            </Link>
                                            <Button padding="px-5.5 py-1.5" variant="primary" onClick={handleDispute}>
                                                <p className="text-normal font-regular text-white">Dispute</p>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                            <Button padding="px-4 py-1.5" variant="secondary">
                                                <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}      
                            {status === 3 && ( 
                                <div className="flex gap-2.5 justify-center w-full">
                                    <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                        <Button padding="px-4 py-1.5" variant="secondary">
                                            <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                                        </Button>
                                    </Link>
                                    <Button padding="px-5.5 py-1.5" variant="primary" onClick={handleDispute}>
                                        <p className="text-normal font-regular text-white">Dispute</p>
                                    </Button>
                                </div>
                            )}   
                            {status >= 4 && ( 
                                <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                    <Button padding="px-4 py-1.5" variant="secondary">
                                        <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                                    </Button>
                                </Link>
                            )}           
                        </div>
                    </div>
                )}
                {status === 5 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Congratulations!</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Milestone Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The milestone has been successfully completed and the funds have been released to the freelancer.`}</p>
                        </div>
                    </div>
                )}
                {status === 6 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Disputed By Client</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Disputed Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The dispute was initiated by client due to certain issues with the project. ${userInfo.role === "client" ? "Please wait for the freelancer to participate in the dispute." : "To participate in this dispute, the freelancer must hold and pay a minimum of 0.5% of the escrowed amount in BNB from your wallet. This fee is required only for the lancer and is used to confirm your commitment to the dispute process."} `}</p>
                        </div>
                        {
                            userInfo.role === "client" ? (
                                <div>

                                </div>
                            ) : (
                                <div className="flex items-center justify-center mb-6">
                                    <Button padding="px-4 py-1.5" variant="primary" onClick={handleTakePartInDispute}>
                                        <p className="text-normal font-regular text-white">Take Part in Dispute</p>
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                )}
                {status === 7 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Disputed By Freelancer</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Disputed Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The dispute was initiated by freelancer due to certain issues with the project. ${userInfo.role === "client" ? "As the client, you can participate in the dispute without paying any additional BNB. No extra wallet balance or fee is required from your side." : "Please wait for the client to participate in the dispute."} `}</p>
                        </div>
                        {
                            userInfo.role === "client" ? (
                                <div className="flex items-center justify-center mb-6">
                                    <Button padding="px-4 py-1.5" variant="primary" onClick={handleTakePartInDispute}>
                                        <p className="text-normal font-regular text-white">Take Part in Dispute</p>
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    
                                </div>
                            )
                        }
                    </div>
                )}
                {status === 8 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Dispute Started with both sides</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Disputed Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The dispute was occured due to certain issues with the project. Both parties are required to participate in the dispute and they will be notified when the dispute is resolved. Please wait for the mediator to resolve the dispute.`}</p>
                        </div>
                    </div>
                )}
                {status === 9 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Dispute Resolved to Buyer</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Disputed Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The dispute was resolved in favor of the buyer. The funds have been released to the buyer.`}</p>
                        </div>
                    </div>
                )}
                {status === 10 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Dispute Resolved to Vendor</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Disputed Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The dispute was resolved in favor of the vendor. The funds have been released to the vendor.`}</p>
                        </div>
                    </div>
                )}
                {status === 11 && (
                    <div>
                        <div className="flex items-center justify-center mb-6 w-full mt-6">
                            <p className="text-light-large font-bold text-[#DEE4F2]">Project Cancelled</p>
                        </div>
                        <div className="flex justify-start w-full">
                            <p className="text-normal font-bold text-[#DEE4F2]">ID: <span className="font-regular">{jobMilestoneId}</span></p>
                        </div>
                        <div className="flex justify-start w-full mb-6">
                            <p className="text-normal font-bold text-[#DEE4F2]">Project: <span className="font-regular">{milestoneInfo?.title}</span></p>
                        </div>
                        <div className="flex flex-col justify-start w-full mb-12">
                            <p className="text-normal font-bold text-[#DEE4F2]">Summary:</p>
                            <p className="text-normal font-regular text-[#DEE4F2]">{`The project has been cancelled by the client.`}</p>
                        </div>
                    </div>
                )}
            </div>
            <ModalTemplate
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={"Deliver Product"}
                subtitle={"Deliver your product to the client"}
                actionLabel="Confirm"
                className="p-10.5"
                onAction={() => {                    
                    handleDeliverWork();
                }}
            >
                {
                    loading === "pending" && (
                        <div className="flex items-center justify-center">
                            <SmallLoading />
                        </div>
                    )
                }
                {
                    loading === "success" && (
                        <div className="mt-6">
                            <div className="flex justify-end">
                                <div className="flex items-center gap-2.5">
                                    { uploadedFileName 
                                    ? 
                                    <p 
                                        className="text-light-large font-regular text-[#2F3DF6] underline cursor-pointer"
                                        onClick={removeUploadedFile}
                                    >
                                        {uploadedFileName}
                                    </p> 
                                    : 
                                    <div>
                                        <Button
                                            padding="p-3"
                                            variant="secondary"
                                            onClick={() => handleUploadFile()}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <Image
                                                        src="/Grmps/upload.svg"
                                                        alt="upload"
                                                        width={24}
                                                        height={24}
                                                    />
                                                </div>
                                                <p className="text-light-large font-regular text-[#7E3FF2]">Upload Project</p>
                                            </div>
                                        </Button>
                                    </div>
                                }
                                    
                                </div>
                            </div>
                            <div className="my-6">
                                <p className="text-normal font-regular text-black pb-2">Project Description</p>
                                <textarea
                                    className="w-full h-20 border border-[#8F99AF] text-normal font-regular text-black text-left focus:outline-none rounded-lg p-3 min-h-33.5 resize-none"
                                    placeholder="About your product or anything"
                                    value={projectDescription}
                                    onChange={(e) => setProjectDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    )
                }
            </ModalTemplate>
        </div>
    );
};

export default ChatProjectStatus;