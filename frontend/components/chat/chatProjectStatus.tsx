"use client";

import Button from "../button";
import Link from "next/link";
import { User } from "@/types/user";
import Image from "next/image";
import { toast } from "react-toastify";
import { fundEscrow, deliverWork } from "@/utils/functions";
import { useWallet } from "@/context/walletContext";
import { CONFIG } from "@/config/config";
import ModalTemplate from "../modalTemplate";
import { useState } from "react";

interface ChatProjectStatusProps {
    status: number; // 1-4
    actionHandler?: () => void;
    actionLabel?: string;
    jobMilestoneId: string;
    conversationId: string;
    jobApplicationDocId: string;
    user: User;
    ipfsUrl: string | null;
}

const steps = [
    "Started the job",
    "Escrowed the fund",
    "Delivered the product",
    "Approved payment",
];

const ChatProjectStatus = ({ status, actionHandler, actionLabel, jobMilestoneId, conversationId, jobApplicationDocId, user, ipfsUrl }: ChatProjectStatusProps) => {
    const safeStatus = Math.min(Math.max(status, 1), steps.length);
    const activeIndex = safeStatus - 1;
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [projectDescription, setProjectDescription] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { sendTransaction } = useWallet();

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
        console.log("test-result", result);
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        console.log("test-txHash", txHash);
        if (result.success) {
            toast.success("Escrow funded successfully");
        } else {
            toast.error(result.error);
        }
    }

    const handleDeliverWork = async () => {
        const result = await deliverWork(user.id, jobMilestoneId, Number(CONFIG.chainId), selectedFile);
        console.log("test-result", result);
        const txHash = await sendTransaction({
            to: result.data.to,
            data: result.data.data,
            value: result.data.value,
            chainId: Number(result.data.chainId),
        });
        console.log("test-txHash", txHash);
        if (result.success) {
            toast.success("Work delivered successfully");
        } else {
            toast.error(result.error);
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
        <div className="py-3 px-3.75 bg-linear-to-b from-[#7E3FF2] to-[#6A32E8] rounded-xl shadow-[0_10px_35px_rgba(55,0,132,0.35)]">
            <div className="max-w-62.5 w-full">
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
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold ${
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
                        <div className="pb-20.5">
                            {user.role === "client" ? (
                                <Button padding="px-6 py-1.5" onClick={handleFundEscrow}>
                                    <p className="text-normal font-regular text-[#FFFFFF]">
                                        Escrow Fund
                                    </p>
                                </Button>
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
                                <Button padding="px-6 py-1.5" onClick={() => setIsOpen(true)}>
                                    <p className="text-normal font-regular text-[#FFFFFF]">
                                        Deliver Product
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
                                        <Link href={`${ipfsUrl}`} className="max-w-[25%] truncate">
                                            <p className="text-normal font-regular text-[#2F3DF6] text-left truncate">{ipfsUrl}</p>
                                        </Link>
                                        <Button
                                            onClick={() => handleDownload(ipfsUrl ?? "")}
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
                                    <Button padding="px-6 py-1.5" onClick={actionHandler}>
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
                                <Button padding="px-6 py-1.5" onClick={actionHandler}>
                                    <p className="text-normal font-regular text-[#FFFFFF]">
                                        Withdraw Payment
                                    </p>
                                </Button>
                            )}
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
                                    <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                        <Button padding="px-5.5 py-1.5" variant="primary">
                                            <p className="text-normal font-regular text-white">Dispute</p>
                                        </Button>
                                    </Link>
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
                            <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                                <Button padding="px-5.5 py-1.5" variant="primary">
                                    <p className="text-normal font-regular text-white">Dispute</p>
                                </Button>
                            </Link>
                        </div>
                    )}   
                    {status === 4 && ( 
                        <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`}>
                            <Button padding="px-4 py-1.5" variant="secondary">
                                <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                            </Button>
                        </Link>
                    )}           
                </div>
            </div>
            <ModalTemplate
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={"Deliver Product"}
                subtitle={"Deliver your product to the client"}
                actionLabel="Confirm"
                className="p-10.5"
                onAction={() => {
                    setIsOpen(false);
                    handleDeliverWork();
                }}
            >
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
            </ModalTemplate>
        </div>
    );
};

export default ChatProjectStatus;