"use client";

import { useRef, useState, useEffect, useContext } from "react";
import SectionPlaceholder from "./sectionPlaceholder";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "../button";
import Image from "next/image";
import { toast } from "react-toastify";
import { UserInfoCtx } from "@/context/userContext";
import { UserLoadingCtx } from "@/context/loadingContext";
import { useRouter } from "next/navigation";
import Loading from "../loading";
import { createGig } from "@/utils/functions";

const uploadImage = "/Grmps/upload.svg";

const CreateGigSection = () => {
    const [title, setTitle] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const categories = ["Software Development", "Design", "Marketing", "Writing", "Translation", "Video Editing", "Audio Editing", "Data Entry", "Customer Support", "Other"];
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [budgetMaxUsd, setBudgetMaxUsd] = useState<number>(0);
    const [budgetMinUsd, setBudgetMinUsd] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const [error, setError] = useState("");
    const [checkError, setCheckError] = useState(false);
    const router = useRouter();
    
    const handleUploadFile = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*/*";
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (!file) {
                return;
            }
            setSelectedFile(file);
            setUploadedFileName(file.name);

            toast.success(`Selected ${file.name}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        };
        fileInput.click();
    }

    const handlePostGig = async () => {
        if (title === "" || selectedCategory === "" || description === "" || budgetMaxUsd === 0 || budgetMinUsd === 0) {
            setError("Please fill in all fields");
            setCheckError(true);
            return;
        }

        if (Number(budgetMaxUsd) <= 0) {
            setError("Max budget must be greater than 0");
            setCheckError(true);
            return;
        }

        if (Number(budgetMinUsd) <= 0) {
            setError("Min budget must be greater than 0");
            setCheckError(true);
            return;
        }

        if (Number(budgetMaxUsd) < Number(budgetMinUsd)) {
            setError("Max budget must be greater than min budget");
            setCheckError(true);
            return;
        }

        setError("");
        setCheckError(false);

        const response = await createGig(
            {
                title,
                description_md: description,
                budget_max_usd: budgetMaxUsd,
                budget_min_usd: budgetMinUsd,
                tags: [selectedCategory ?? ""],
                freelancer_id: userInfo.id,
                link,
            },
            selectedFile
        );

        if (response.success) {
            toast.success("Gig created successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            toast.error(response.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }        
    }

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedFile]);

    const removeUploadedFile = () => {
        setSelectedFile(null);
        setUploadedFileName("");
        setPreviewUrl(null);
        toast.success("Uploaded file removed", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
        });
    }

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadCreateGig = async () => {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    setLoading("success");
                }
                loadCreateGig();
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, router])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title="Create Gig"
                    description="Set up a new gig to showcase your services to clients."
                /> 
                <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                    <div className="linear-border__inner rounded-[0.4375rem] bg-white p-8">
                        <div className='flex flex-col gap-6'>
                            <div>
                                <p className='text-normal font-regular text-black text-left pb-2'>Title</p>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                    placeholder='Title'
                                />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <p className='text-normal font-regular text-black text-left'>Category</p>
                                <div ref={dropdownRef} className={`relative w-full ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setDropdownMenuOpen(false);
                                        }}
                                        className='w-full appearance-none rounded-lg border border-[#8F99AF] bg-white p-3 text-normal font-regular text-black focus:outline-none focus:border-blue-500'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setDropdownMenuOpen((prev: boolean) => !prev);
                                        }}
                                    >
                                        <option value='' disabled>
                                            Select one ...
                                        </option>
                                        {categories.map((category) => (
                                            <option key={category} value={category} className='text-normal font-regular text-black bg-white py-2 px-3'>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {dropdownMenuOpen ? (
                                        <ChevronUpIcon className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-black absolute right-3 top-1/2 -translate-y-1/2" />
                                    )}
                                </div>
                            </div>
                            <div className='w-full'>
                                <p className='text-normal font-regular text-black text-left pb-2'>Description</p>
                                <div className='flex flex-col'>
                                    <textarea className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-33.5 resize-none' value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Max Budget (USD)</p>
                                    <input
                                        type="number"
                                        value={budgetMaxUsd}
                                        onChange={(e) => setBudgetMaxUsd(Number(e.target.value))}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Max Budget'
                                    />
                                </div>
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Min Budget (USD)</p>
                                    <input
                                        type="number"
                                        value={budgetMinUsd}
                                        onChange={(e) => setBudgetMinUsd(Number(e.target.value))}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Min Budget'
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className='text-normal font-regular text-black text-left pb-2'>Reference Link</p>
                                    <input
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Reference Link'
                                    />
                                </div>
                            </div>
                            <div >
                                {uploadedFileName ? (
                                    <div className="">
                                        <div className="w-full h-100">
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="uploaded preview"
                                                    className="w-full h-full rounded-lg object-cover"
                                                />
                                            ) : (
                                                <p className="text-normal font-regular text-black text-left">No image uploaded</p>
                                            )}
                                        </div>
                                        <p 
                                            className=" pt-4 text-normal font-regular text-[#2F3DF6] underline cursor-pointer"
                                            onClick={removeUploadedFile}
                                        >
                                            {uploadedFileName}
                                        </p>
                                    </div>
                                ) : (
                                    <div className='w-40'>
                                        <Button
                                            variant="secondary"
                                            padding="p-3"
                                            onClick={() => handleUploadFile()}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <Image
                                                        src={uploadImage}
                                                        alt="upload"
                                                        width={24}
                                                        height={24}
                                                    />
                                                </div>
                                                <p className="text-normal font-regular">Upload Image</p>
                                            </div>
                                        </Button>
                                    </div>
                                )}
                            </div>
                            {error && checkError && <p className='text-normal font-regular text-red-500 text-left'>{error}</p>}
                            <div className='w-30'>
                                <Button
                                    padding='px-10.75 py-3'
                                    onClick={handlePostGig}
                                >
                                    <p className='text-normal font-regular'>Post</p>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return <Loading />;
    }
}
export default CreateGigSection;
