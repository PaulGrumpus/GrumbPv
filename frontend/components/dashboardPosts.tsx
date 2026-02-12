'use client'

import Button from "./button";
import Image from "next/image";
import { toast } from "react-toastify";
import { CONFIG } from "@/config/config";
import ModalTemplate from "./modalTemplate";
import { useContext, useEffect, useRef, useState } from "react";
import { JobMilestoneStatus } from "@/types/jobMilestone";
import { approveWork, buyerJoinDispute, createChainTx, deliverWork, fundEscrow, getJobApplicationById, increaseFund, increaseWithdraw, initiateDispute, updateJobMilestone, updateUserFunds, venderPayDisputeFee, withdrawFunds } from "@/utils/functions";
import { User } from "@/types/user";
import { useWallet } from "@/context/walletContext";
import { useProjectInfo } from "@/context/projectInfoContext";
import { useRouter } from "next/navigation";
import { UserInfoCtx } from "@/context/userContext";
import { useDashboard } from "@/context/dashboardContext";
import SmallLoading from "./smallLoading";
import { useMilestoneDelivery } from "@/context/milestoneDeliveryContext";

const STATUSES = [
    { key: "started", label: "Started the job" },
    { key: "funded", label: "Escrow Funds have been made" },
    { key: "delivered", label: "Deliverables submitted" },
    { key: "approved", label: "Approved the payment" },
];

interface DashboardPostsProps {
    user: User;
    jobMilestoneId: string;
    title: string;
    description: string;
    milestoneStatus: JobMilestoneStatus;
    ipfs?: string;
    variant: "open" | "completed";
    applicationDocId: string;
    clickHandler: () => void;
}

const COLLAPSED_MAX_HEIGHT = 120;

const DashboardPosts = ({ user, jobMilestoneId, title, description, milestoneStatus, ipfs, variant, applicationDocId, clickHandler }: DashboardPostsProps) => {
    const totalSteps = STATUSES.length;
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState(0);
    const { sendTransaction, address } = useWallet();
    const { setJobMilestonesInfo } = useProjectInfo();
    const router = useRouter();
    const { jobsInfo, setJobsInfo } = useDashboard();
    const { userInfo } = useContext(UserInfoCtx);
    const [loading, setLoading] = useState("success");
    const { 
        isMilestoneDelivering, 
        isMilestoneDelivered, 
        setMilestoneDelivering, 
        setMilestoneDelivered,
        resetMilestoneDelivery 
    } = useMilestoneDelivery();

    const [canToggle, setCanToggle] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) {
            return;
        }

        setCanToggle(el.scrollHeight > COLLAPSED_MAX_HEIGHT);
    }, [description]);

    useEffect(() => {
        let nextStatus = 0;
        if(milestoneStatus === JobMilestoneStatus.PENDING_FUND) {
            nextStatus = 1;
        } else if(milestoneStatus === JobMilestoneStatus.FUNDED) {
            nextStatus = 2;
        } else if(milestoneStatus === JobMilestoneStatus.DELIVERED) {
            nextStatus = 3;
        } else if(milestoneStatus === JobMilestoneStatus.APPROVED) {
            nextStatus = 4;
        } else if(milestoneStatus === JobMilestoneStatus.RELEASED) {
            nextStatus = 5;
        } else if(milestoneStatus === JobMilestoneStatus.DISPUTED_BY_CLIENT) {
            nextStatus = 6;
        } else if(milestoneStatus === JobMilestoneStatus.DISPUTED_BY_FREELANCER) {
            nextStatus = 7;
        } else if(milestoneStatus === JobMilestoneStatus.DISPUTED_WITH_COUNTER_SIDE) {
            nextStatus = 8;
        } else if(milestoneStatus === JobMilestoneStatus.RESOLVED_TO_BUYER) {
            nextStatus = 9;
        } else if(milestoneStatus === JobMilestoneStatus.RESOLVED_TO_VENDOR) {
            nextStatus = 10;
        } else if(milestoneStatus === JobMilestoneStatus.CANCELLED) {
            nextStatus = 11;
        }
        setStatus(Number.isFinite(nextStatus) ? nextStatus : 0);
    }, [milestoneStatus, setStatus]);

    const handleFund = async () => {
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const result = await fundEscrow(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const { hash: txHash, error: txError } = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error(txError || "Failed to fund escrow", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const jobApplicationDocInfo = await getJobApplicationById(applicationDocId);
        await updateUserFunds(jobApplicationDocInfo.data.client_info.id, Number(jobApplicationDocInfo.data.job_application_info.budget), 0);
        await increaseFund(Number(jobApplicationDocInfo.data.job_application_info.budget));
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
    
    const handleCancel = async () => {
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

    const handleDeliver = () => {
        setIsOpen(true);
    }

    const handleApprove = async () => {
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const result = await approveWork(user.id, jobMilestoneId, Number(CONFIG.chainId), ipfs ?? "");
        const { hash: txHash, error: txError } = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error(txError || "Failed to approve work", {
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

    const handleWithdraw = async () => {
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const result = await withdrawFunds(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const { hash: txHash, error: txError } = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error(txError || "Failed to withdraw funds", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const jobApplicationDocInfo = await getJobApplicationById(applicationDocId);
        await updateUserFunds(jobApplicationDocInfo.data.freelancer_info.id, Number(jobApplicationDocInfo.data.job_application_info.budget), 1);
        await updateUserFunds(jobApplicationDocInfo.data.client_info.id, 0, 1);
        await increaseWithdraw(Number(jobApplicationDocInfo.data.job_application_info.budget));
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
            await createChainTx("withdraw_funds", Number(CONFIG.chainId), jobMilestoneId, user.address ?? "", result.data.to, txHash, "success", user.id);
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
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        const result = await initiateDispute(user.id, jobMilestoneId, Number(CONFIG.chainId));
        const { hash: txHash, error: txError } = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error(txError || "Failed to initiate dispute", {
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
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        let result = null;
        if(userInfo.role === "client") {
            result = await buyerJoinDispute(user.id, jobMilestoneId, Number(CONFIG.chainId));
        }
        else {
            result = await venderPayDisputeFee(user.id, jobMilestoneId, Number(CONFIG.chainId));
        }
        const { hash: txHash, error: txError } = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        if (!txHash) {
            toast.error(txError || "Failed to initiate dispute", {
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
    
    const handleGoToDoc = () => {
        // toast.success("Processing go to doc...", {
        //     position: "top-right",
        //     autoClose: 5000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        // });
        // clickHandler();
        router.push(`/reference?jobApplicationId=${applicationDocId}`);
    }

    const handleCopy = async (url: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.setAttribute("readonly", "");
                textArea.style.position = "absolute";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            toast.success(
                "Copied ipfs url to clipboard",
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                }
            );
        } catch (error) {
            toast.error(
                "Failed to copy ipfs url",
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

    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [projectDescription, setProjectDescription] = useState<string>("");

    const handleDeliverUploadedFile = async () => {
        if(address?.toLowerCase() !== userInfo?.address?.toLowerCase()) {
            toast.error("You are not authorized to fund escrow, please connect to the correct wallet.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        // Check if already delivered
        if (isMilestoneDelivered(jobMilestoneId)) {
            toast.error("Work has already been delivered for this milestone", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            setIsOpen(false);
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

        if(selectedFile.size > 100 * 1024 * 1024) {
            toast.error("File size exceeds 100MB (Max 100MB - beta version)", {
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

    return (
        <div>
            <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                <div className="linear-border__inner rounded-[0.4375rem] lg:p-8 p-4 bg-white">
                    {
                        variant === "open" && (
                            <div className="text-black flex flex-wrap justify-between gap-6">
                                <div className="flex flex-col max-w-180 w-full gap-6">
                                    <p className="lg:text-subtitle text-large font-bold text-black">{title}</p>
                                    <div className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}>
                                        <p className="text-normal font-regular text-black" ref={descriptionRef}>
                                            {description}
                                        </p>
                                    </div>
                                    {canToggle && (
                                        <button
                                            type="button"
                                            className="mt-3 text-left text-small font-regular text-gray-500 cursor-pointer"
                                            onClick={() => setExpanded((prev) => !prev)}
                                        >
                                            {expanded ? "show less" : "show more"}
                                        </button>
                                    )}
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
                                    {ipfs && status == 3 && user.role === "client" && (
                                        <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                            <p
                                                className='flex-1 bg-transparent text-normal font-regular text-[#2F3DF6] text-left focus:outline-none max-w-153.5 truncate'
                                            >
                                                {CONFIG.ipfsGateWay}/{ipfs}
                                            </p>
                                            <div className="flex items-center gap-2.5">
                                                <div>
                                                    <Button
                                                        onClick={() => handleCopy(`${CONFIG.ipfsGateWay}/${ipfs}`)}
                                                        padding="p-3"
                                                        variant="secondary"
                                                    >
                                                        <Image
                                                            src="/Grmps/copy.svg"
                                                            alt="ipfs url"
                                                            width={24}
                                                            height={24}
                                                        />
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        onClick={() => handleDownload(`${CONFIG.ipfsGateWay}/${ipfs}`)}
                                                        padding="p-3"
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
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="lg:w-auto w-full">
                                    <div className="flex flex-col gap-2.5 lg:justify-end justify-center lg:px-0 px-12">
                                        {status == 1 && user.role === "client" && (
                                            <Button 
                                                padding="px-10.375 py-3"
                                                onClick={handleFund}
                                            >
                                                Fund
                                            </Button>
                                        )}
                                        {status == 1 && user.role === "client" && (
                                            <Button 
                                                padding="px-10.375 py-3"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {status == 2 && user.role === "freelancer" && (
                                            <Button 
                                                padding="px-8.75 py-3"
                                                onClick={handleDeliver}
                                                variant={
                                                    isMilestoneDelivered(jobMilestoneId) || isMilestoneDelivering(jobMilestoneId) 
                                                        ? "disable" 
                                                        : "primary"
                                                }
                                            >
                                                {isMilestoneDelivered(jobMilestoneId) 
                                                    ? "Already Delivered" 
                                                    : isMilestoneDelivering(jobMilestoneId)
                                                    ? "Delivering..."
                                                    : "Deliver"}
                                            </Button>
                                        )}
                                        {status == 3 && user.role === "client" && (
                                            <Button 
                                                padding="px-7.5 py-3"
                                                onClick={handleApprove}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {status == 4 && user.role === "freelancer" && (
                                            <Button 
                                                padding="px-6.375 py-3"
                                                onClick={handleWithdraw}
                                            >
                                                Withdraw 
                                            </Button>
                                        )}
                                        <div className="lg:w-auto w-full">
                                            {status >= 2 && status < 4 && (
                                                <Button 
                                                    padding="px-8.5 py-3.25"
                                                    className="w-full"
                                                    variant={
                                                        (status >= 2 && status < 4 && user.role === "client") ||
                                                        (status === 3 && user.role === "freelancer")
                                                            ? "secondary"
                                                            : "disable"
                                                    }
                                                    onClick={handleDispute}
                                                >
                                                    Dispute
                                                </Button>
                                            )}
                                            {status >= 6 && status < 8 && (
                                                <Button 
                                                    padding="px-8.5 py-3.25"
                                                    className="w-full"
                                                    variant={
                                                        (status === 7 && user.role === "client") ||
                                                        (status === 6 && user.role === "freelancer")
                                                            ? "secondary"
                                                            : "disable"
                                                    }
                                                    onClick={handleTakePartInDispute}
                                                >
                                                    Dispute
                                                </Button>
                                            )}
                                        </div>
                                        <Button 
                                            padding="px-6.25 py-3"
                                            variant="secondary"
                                            onClick={handleGoToDoc}
                                        >
                                            Go to Doc
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        variant === "completed" && (
                            <div className="text-black flex flex-col justify-between gap-6">
                                <div className="flex flex-col gap-6">
                                    <p className="lg:text-subtitle text-large font-bold text-black">{title}</p>
                                    <div className={`overflow-hidden transition-[max-height] duration-200 ${expanded ? "max-h-none" : "max-h-42"}`}>
                                        <p className="text-normal font-regular text-black" ref={descriptionRef}>
                                            {description}
                                        </p>
                                    </div>
                                    {canToggle && (
                                        <button
                                            type="button"
                                            className="mt-3 text-left text-small font-regular text-gray-500 cursor-pointer"
                                            onClick={() => setExpanded((prev) => !prev)}
                                        >
                                            {expanded ? "show less" : "show more"}
                                        </button>
                                    )}
                                </div>
                                {ipfs && user.role === "client" && (
                                    <div className='flex items-center border justify-between border-[#8F99AF] rounded-lg p-3 gap-3'>
                                        <p className='flex-1 bg-transparent text-normal font-regular text-[#2F3DF6] text-left focus:outline-none max-w-[80%] truncate'>
                                            {CONFIG.ipfsGateWay}/{ipfs}
                                        </p>
                                        <div className="flex items-center gap-2.5">
                                            <div>
                                                <Button
                                                    onClick={() => handleCopy(`${CONFIG.ipfsGateWay}/${ipfs}`)}
                                                    padding="p-3"
                                                    variant="secondary"
                                                >
                                                    <Image
                                                        src="/Grmps/copy.svg"
                                                        alt="ipfs url"
                                                        width={24}
                                                        height={24}
                                                    />
                                                </Button>
                                            </div>
                                            <div>
                                                <Button
                                                    onClick={() => handleDownload(`${CONFIG.ipfsGateWay}/${ipfs}`)}
                                                    padding="p-3"
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
            <ModalTemplate
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                // title={"Deliver Product"}
                // subtitle={description}
                actionLabel="Confirm"
                className="lg:p-10.5 p-3"
                onAction={() => {
                    handleDeliverUploadedFile();                    
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
                            <div className="lg:text-title text-subtitle lg:text-left text-center font-bold text-[#2F3DF6] py-6">Deliver Product</div>
                            <div className="lg:text-normal text-light-large text-gray-500 lg:text-left text-center">
                                Deliver your product to the client (Max 100MB - beta version)
                            </div>
                            <div className="flex lg:justify-end justify-center">
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
    )
}

export default DashboardPosts;