'use client';

import { useRef, useState, useEffect, useContext } from "react";
import SectionPlaceholder from "./sectionPlaceholder";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "../button";
import Image from "next/image";
import { toast } from "react-toastify";
import { LoadingCtx } from "@/context/loadingContext";
import { useRouter } from "next/navigation";
import { UserInfoCtx } from "@/context/userContext";
import Loading from "../loading";
import { createJob } from "@/utils/functions";
import { JobStatus, LocationType } from "@/types/jobs";

const uploadImage = "/Grmps/upload.svg";


const calendarIcon = "/Grmps/dateIcon.svg";
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const parseISODate = (value?: string) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const formatDisplayDate = (value: string) => {
    const parsed = parseISODate(value);
    if (!parsed) {
        return "";
    }

    return parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const buildMonthMatrix = (viewDate: Date) => {
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    const weeks: Date[][] = [];
    for (let week = 0; week < 6; week += 1) {
        const days: Date[] = [];
        for (let day = 0; day < 7; day += 1) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + week * 7 + day);
            days.push(cellDate);
        }
        weeks.push(days);
    }

    return weeks;
};

const isSameDay = (date: Date, isoDate?: string) => {
    const comparison = parseISODate(isoDate);
    if (!comparison) {
        return false;
    }

    return (
        date.getFullYear() === comparison.getFullYear() &&
        date.getMonth() === comparison.getMonth() &&
        date.getDate() === comparison.getDate()
    );
};

const isToday = (date: Date) => {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

interface CalendarDropdownProps {
    id: string;
    selectedDate?: string;
    monthDate: Date;
    onSelectDate: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

const CalendarDropdown = ({ id, selectedDate, monthDate, onSelectDate, onMonthChange }: CalendarDropdownProps) => {
    const monthMatrix = buildMonthMatrix(monthDate);
    const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const navigateMonth = (direction: "prev" | "next") => {
        const nextMonth = direction === "prev"
            ? new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
            : new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        onMonthChange(nextMonth);
    };

    return (
        <div
            id={id}
            role="dialog"
            aria-label="Calendar date picker"
            className="absolute left-0 bottom-full z-30 mb-4 w-full rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xl"
        >
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigateMonth("prev")}
                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                    aria-label="Go to previous month"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <p className="text-normal font-medium text-black">{monthLabel}</p>
                <button
                    type="button"
                    onClick={() => navigateMonth("next")}
                    className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
                    aria-label="Go to next month"
                >
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-tiny font-medium text-gray-500">
                {dayLabels.map((label) => (
                    <span key={label}>{label}</span>
                ))}
            </div>
            <div className="mt-2 space-y-1">
                {monthMatrix.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                        {week.map((date) => {
                            const currentMonth = date.getMonth() === monthDate.getMonth();
                            const selected = isSameDay(date, selectedDate);
                            const today = isToday(date);
                            const buttonClasses = [
                                "flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
                                currentMonth ? "text-black" : "text-gray-400",
                                selected ? "bg-gradient-to-r from-(--color-light-blue) to-(--color-purple) text-white shadow" : "",
                                !selected && today ? "border border-[#7E3FF2] text-[#7E3FF2]" : "",
                                !selected ? "hover:bg-gray-100" : "",
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <button
                                    type="button"
                                    key={date.toISOString()}
                                    onClick={() => onSelectDate(date)}
                                    className={buttonClasses}
                                    aria-pressed={selected}
                                    aria-label={date.toLocaleDateString(undefined, {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex justify-end">
                <button
                    type="button"
                    onClick={() => onSelectDate(new Date())}
                    className="text-sm font-medium text-[#7E3FF2] transition hover:underline"
                >
                    Today
                </button>
            </div>
        </div>
    );
};

const CreateJobSection = () => {
    const [title, setTitle] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState("");
    const categories = ["remote", "onsite", "hybrid"];
    const [description, setDescription] = useState("");
    const [maxBudget, setMaxBudget] = useState<number>(0);
    const [minBudget, setMinBudget] = useState<number>(0);
    const startPickerRef = useRef<HTMLDivElement | null>(null);
    const initialDate = formatISODate(new Date());
    const [dueDate, setDueDate] = useState(initialDate);
    const [isDueDateCalendarOpen, setIsDueDateCalendarOpen] = useState(false);
    const [dueDateCalendarMonth, setDueDateCalendarMonth] = useState(parseISODate(initialDate) ?? new Date());
    const [error, setError] = useState("");
    const [checkError, setCheckError] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { loadingState, setLoadingState } = useContext(LoadingCtx);
    const [loading, setLoading] = useState("pending");
    const { userInfo, setUserInfo } = useContext(UserInfoCtx);
    const router = useRouter();

    useEffect(() => {
        if (!isDueDateCalendarOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                isDueDateCalendarOpen &&
                startPickerRef.current &&
                !startPickerRef.current.contains(event.target as Node)
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
        if (title === "" || selectedLocation === "" || description === "" || maxBudget === 0 || minBudget === 0 || dueDate === "") {
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

        const response = await createJob(
            { 
                title, 
                location: selectedLocation as LocationType, 
                description_md: description, 
                budget_max_usd:maxBudget, 
                budget_min_usd: minBudget, 
                deadline_at: new Date(dueDate).toISOString() ?? "",
                client_id: userInfo.id,
                status: JobStatus.OPEN,
            },
            selectedFile
        );

        if (response.success) {
            toast.success("Job created successfully", {
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
        if(loadingState === "success") {
            if(userInfo.id === "") {
                setLoadingState("failure");
                return;
            }
            if (userInfo && userInfo.id) {
                setLoading("success");
            }
        } else if (loadingState === "failure") {
            router.push("/");
        }
    }, [userInfo, loadingState, router])

    if (loading === "pending") {
        return <Loading />;
    }

    if (loading === "success") {
        return (
            <div>
                <SectionPlaceholder
                    title="Create Job"
                    description="Set up a new job to showcase your services to clients."
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
                            <div className="flex gap-6">
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Max Budget (USD)</p>
                                    <input
                                        type="number"
                                        value={maxBudget}
                                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Max Budget'
                                    />
                                </div>
                                <div>
                                    <p className='text-normal font-regular text-black text-left pb-2'>Min Budget (USD)</p>
                                    <input
                                        type="number"
                                        value={minBudget}
                                        onChange={(e) => setMinBudget(Number(e.target.value))}
                                        className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                        placeholder='Min Budget'
                                    />
                                </div>
                                <div className="flex-1" ref={startPickerRef}>
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
                                    onClick={handlePostJob}
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
export default CreateJobSection;
