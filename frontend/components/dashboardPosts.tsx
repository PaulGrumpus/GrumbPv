'use client'

import Button from "./Button";
import Image from "next/image";
import { toast } from "react-toastify";
import { CONFIG } from "@/config/config";
import ModalTemplate from "./modalTemplate";
import { useState } from "react";

const STATUSES = [
    { key: "started", label: "Started the job" },
    { key: "funded", label: "Escrow Funds have been made" },
    { key: "delivered", label: "Deliverables submitted" },
    { key: "approved", label: "Approved the payment" },
];

interface DashboardPostsProps {
    jobId: string;
    title: string;
    description: string;
    status: number;
    ipfsUrl?: string;
    variant: "open" | "completed";
    clickHandler: () => void;
}

const userRole:string = CONFIG.userRole;

const DashboardPosts = ({ variant, jobId, title, description, status, ipfsUrl, clickHandler }: DashboardPostsProps) => {
    const totalSteps = STATUSES.length;
    const [isOpen, setIsOpen] = useState(false);
    
    const handleFund = () => {
        toast.success("Processing fund...", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        clickHandler();
    }

    const handleDeliver = () => {
        setIsOpen(true);
    }

    const handleApprove = () => {
        toast.success("Processing approve...", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        clickHandler();
    }

    const handleWithdraw = () => {
        toast.success("Processing withdraw...", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        clickHandler();
    }

    const handleDispute = () => {
        if ((status >= 2 && status < 4 && userRole === "client") || (status === 3 && userRole === "freelancer"))
        {
            toast.success("Processing dispute...", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            })
            clickHandler();
        } else {
            toast.info("You are not allowed to dispute", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }
    
    const handleGoToDoc = () => {
        toast.success("Processing go to doc...", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        clickHandler();
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

    const handleDeliverUploadedFile = () => {
        toast.success("Processing deliver uploaded file...", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
        clickHandler();
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
            <div className="linear-border linear-border--dark-hover">
                <div className="linear-border__inner p-8 bg-white">
                    {
                        variant === "open" && (
                            <div className="text-black flex flex-wrap justify-between gap-6">
                                <div className="flex flex-col max-w-180 gap-6">
                                    <p className="text-subtitle font-bold text-black">{title}</p>
                                    <p className="text-normal font-regular text-black">
                                        {description}
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
                                    {ipfsUrl && status == 3 && userRole === "client" && (
                                        <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                            <p
                                                className='flex-1 bg-transparent text-normal font-regular text-[#2F3DF6] text-left focus:outline-none max-w-153.5 truncate'
                                            >
                                                {ipfsUrl}
                                            </p>
                                            <div className="flex items-center gap-2.5">
                                                <div>
                                                    <Button
                                                        onClick={() => handleCopy(ipfsUrl)}
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
                                                        onClick={() => handleDownload(ipfsUrl)}
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
                                    <p className="text-subtitle font-bold text-black">{title}</p>
                                    <p className="text-normal font-regular text-black">
                                        {description}
                                    </p>
                                </div>
                                {ipfsUrl && userRole === "client" && (
                                    <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                        <p className='flex-1 bg-transparent text-normal font-regular text-[#2F3DF6] text-left focus:outline-none max-w-70 truncate'>
                                            {ipfsUrl}
                                        </p>
                                        <div className="flex items-center gap-2.5">
                                            <div>
                                                <Button
                                                    onClick={() => handleCopy(ipfsUrl)}
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
                                                    onClick={() => handleDownload(ipfsUrl)}
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
                title={"Deliver Product"}
                subtitle={description}
                actionLabel="Confirm"
                className="p-10.5"
                onAction={() => {
                    setIsOpen(false);
                    handleDeliverUploadedFile();
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
    )
}

export default DashboardPosts;