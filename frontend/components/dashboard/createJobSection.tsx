'use client';

import { useRef, useState, useEffect, useContext, useMemo } from "react";
import SectionPlaceholder from "./sectionPlaceholder";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "../button";
import Image from "next/image";
import { toast } from "react-toastify";
import { UserLoadingCtx } from "@/context/userLoadingContext";
import { useRouter, useSearchParams } from "next/navigation";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "../loading";
import { createJob, updateJob } from "@/utils/functions";
import { JobStatus, LocationType } from "@/types/jobs";
import { formatISODate, parseISODate, formatDisplayDate, calendarIcon, CalendarDropdown } from "@/utils/calendar";
import { NotificationLoadingCtx } from "@/context/notificationLoadingContext";
import SmallLoading from "../smallLoading";
import { DashboardLoadingCtx } from "@/context/dashboardLoadingContext";
import { useDashboard } from "@/context/dashboardContext";

const uploadImage = "/Grmps/upload.svg";

const CreateJobSection = () => {
    const [title, setTitle] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("");
    const categories = ["remote", "onsite", "hybrid"];
    const [description, setDescription] = useState("");
    const [maxBudget, setMaxBudget] = useState<string>("");
    const [minBudget, setMinBudget] = useState<string>("");
    const dueDatePickerRef = useRef<HTMLDivElement | null>(null);
    const initialDueDate = useMemo(() => formatISODate(new Date()), []);
    const [dueDate, setDueDate] = useState(initialDueDate);
    const [isDueDateCalendarOpen, setIsDueDateCalendarOpen] = useState(false);
    const [dueDateCalendarMonth, setDueDateCalendarMonth] = useState(parseISODate(initialDueDate) ?? new Date());
    const [error, setError] = useState("");
    const [checkError, setCheckError] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { userLoadingState, setuserLoadingState } = useContext(UserLoadingCtx);
    const [loading, setLoading] = useState("pending");
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const router = useRouter();
    const { notificationLoadingState } = useContext(NotificationLoadingCtx);
    const { dashboardLoadingState } = useContext(DashboardLoadingCtx);
    const searchParams = useSearchParams();
    const editingJobId = searchParams.get("jobId") ?? "";
    const isEditing = Boolean(editingJobId);
    const { jobsInfo, setJobsInfo } = useDashboard();
    const editingJob = jobsInfo.find((job) => job.id === editingJobId);
    
    useEffect(() => {
        if (!isDueDateCalendarOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                isDueDateCalendarOpen &&
                dueDatePickerRef.current &&
                !dueDatePickerRef.current.contains(event.target as Node)
            ) {
                setIsDueDateCalendarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isDueDateCalendarOpen]);

    const handleDueDateSelect = (date: Date) => {
        setDueDate(formatISODate(date));
        setDueDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsDueDateCalendarOpen(false);
    };
    

    useEffect(() => {
        if (!editingJob) {
            return;
        }

        setTitle(editingJob.title ?? "");
        setSelectedLocation(editingJob.location ?? "");
        setDescription(editingJob.description_md ?? "");
        setMaxBudget(editingJob.budget_max_usd ?? "");
        setMinBudget(editingJob.budget_min_usd ?? "");
        setDueDate(
            editingJob.deadline_at
                ? formatISODate(new Date(editingJob.deadline_at))
                : initialDueDate
        );
    }, [editingJob, initialDueDate]);


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
    
    const handlePostJob = async () => {
        if (title === "" || selectedLocation === "" || description === "" || Number(maxBudget) === 0 || Number(minBudget) === 0 || dueDate === "") {
            setError("Please fill in all fields");
            setCheckError(true);
            return;
        }

        if (Number(maxBudget) <= 0) {
            setError("Max budget must be greater than 0");
            setCheckError(true);
            return;
        }

        if (Number(minBudget) <= 0) {
            setError("Min budget must be greater than 0");
            setCheckError(true);
            return;
        }

        if (Number(maxBudget) < Number(minBudget)) {
            setError("Max budget must be greater than min budget");
            setCheckError(true);
            return;
        }

        if (parseISODate(dueDate) && parseISODate(dueDate)! < new Date()) {
            setError("Due date must be in the future");
            setCheckError(true);
            return;
        }

        setError("");
        setCheckError(false);

        setLoading("pending");

        const jobPayload = {
            title,
            location: selectedLocation as LocationType,
            description_md: description,
            budget_max_usd: Number(maxBudget),
            budget_min_usd: Number(minBudget),
            deadline_at: new Date(dueDate).toISOString() ?? "",
            client_id: userInfo.id,
            status: JobStatus.OPEN,
        };

        const response = isEditing && editingJobId
            ? await updateJob(editingJobId, jobPayload, selectedFile)
            : await createJob(jobPayload, selectedFile);

        if (response.success) {
            const successMessage = isEditing ? "Job updated successfully" : "Job created successfully";
            toast.success(successMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            if (isEditing && editingJobId && response.data) {
                const updatedJob = response.data;
                setJobsInfo((prev) =>
                    prev.map((job) =>
                        job.id === editingJobId
                            ? {
                                  ...job,
                                  title: updatedJob.title,
                                  description_md: updatedJob.description_md,
                                  location: updatedJob.location ?? job.location,
                                  tags: updatedJob.tags ?? job.tags,
                                  image_id: updatedJob.image_id,
                                  deadline_at: updatedJob.deadline_at,
                                  budget_max_usd: updatedJob.budget_max_usd,
                                  budget_min_usd: updatedJob.budget_min_usd,
                                  token_symbol: updatedJob.token_symbol,
                                  status: updatedJob.status ?? job.status,
                              }
                            : job
                    )
                );
            } else {
                setTitle("");
                setSelectedLocation("");
                setDescription("");
                setMaxBudget("");
                setMinBudget("");
                setDueDate(initialDueDate);
                setSelectedFile(null);
                setUploadedFileName("");
                setPreviewUrl(null);
            }

        } else {
            toast.error(response.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }

        setLoading("success");
    }

    useEffect(() => {
        if(userLoadingState === "success") {
            if(userInfo.id === "") {
                setuserLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                const loadCreateJob = async () => {
                    // await new Promise(resolve => setTimeout(resolve, 1000));
                    setLoading("success");
                }
                if(dashboardLoadingState === "success") {
                    loadCreateJob();
                }
            }
        } else if (userLoadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, userLoadingState, router, dashboardLoadingState])

    if (loading === "pending") {
        return <SmallLoading size="lg" />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title={isEditing ? "Edit Job" : "Create Job"}
                    description={isEditing ? "Update an existing job listing." : "Set up a new job to showcase your services to clients."}
                /> 
                <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                    <div className="linear-border__inner rounded-[0.4375rem] bg-white py-8 px-3 lg:p-8">
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
                                <p className='text-normal font-regular text-black text-left'>Location</p>
                                <div ref={dropdownRef} className={`relative w-full ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => {
                                            setSelectedLocation(e.target.value);
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
                            <div className="flex lg:flex-row flex-col gap-6">
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Max Budget (USD)</p>
                                    <input
                                        value={maxBudget}
                                        type="text"
                                        inputMode="decimal"
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // allow: "", "1", "1.", "1.2", "0.25"
                                            if (!/^\d*\.?\d*$/.test(value)) return;

                                            setMaxBudget(value);
                                            setError("");
                                        }}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Max Budget'
                                    />
                                </div>
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Min Budget (USD)</p>
                                    <input
                                        value={minBudget}
                                        type="text"
                                        inputMode="decimal"
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            // allow: "", "1", "1.", "1.2", "0.25"
                                            if (!/^\d*\.?\d*$/.test(value)) return;

                                            setMinBudget(value);
                                            setError("");
                                        }}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Min Budget'
                                    />
                                </div>
                                <div className="flex-1" ref={dueDatePickerRef}>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Due Date</p>
                                    <div className='relative'>
                                        <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                            <input
                                                id="due-date-input"
                                                type='text'
                                                readOnly
                                                value={formatDisplayDate(dueDate)}
                                                onClick={() => setIsDueDateCalendarOpen(true)}
                                                className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer'
                                                placeholder='Select due date'
                                                aria-haspopup="dialog"
                                                aria-expanded={isDueDateCalendarOpen}
                                                aria-controls="due-date-calendar"
                                            />
                                            <button
                                                type='button'
                                                onClick={() => setIsDueDateCalendarOpen((prev) => !prev)}
                                                className='text-black'
                                                aria-label='Open due date calendar'
                                                aria-controls="due-date-calendar"
                                                aria-expanded={isDueDateCalendarOpen}
                                            >
                                                <div>
                                                    <Image 
                                                        src={calendarIcon} 
                                                        alt='calendar icon' 
                                                        width={24} 
                                                        height={24} 
                                                    />
                                                </div>
                                            </button>
                                        </div>
                                        {isDueDateCalendarOpen && (
                                            <CalendarDropdown
                                                id="due-date-calendar"
                                                selectedDate={dueDate}
                                                monthDate={dueDateCalendarMonth}
                                                onSelectDate={handleDueDateSelect}
                                                onMonthChange={(date) => setDueDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center lg:block">
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
                                    <div className="flex justify-center lg:block">
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
                                    </div>
                                )}
                            </div>
                            {error && checkError && <p className='text-normal font-regular text-red-500 text-left'>{error}</p>}
                            <div className="flex justify-center lg:block">
                                <div className='w-30'>
                                    <Button
                                        padding='px-10.75 py-3'
                                        onClick={handlePostJob}
                                    >
                                        <p className='text-normal font-regular'>{isEditing ? "Update" : "Post"}</p>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return <SmallLoading size="lg" />;
    }
}
export default CreateJobSection;
