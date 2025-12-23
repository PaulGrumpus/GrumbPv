'use client';

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import Button from "./button";
import Image from "next/image";
import { createBid } from "@/utils/functions";
import { BidStatus } from "@/types/bid";
import { toast } from "react-toastify";
import SmallLoading from "./smallLoading";

interface ApplyJobProps {
    jobTitle: string;
    jobDescription: string;
    jobId: string;
    freelancerId: string;
    clickHandler: () => void;
}

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

const ApplyJob = ({ jobTitle, jobDescription, jobId, freelancerId, clickHandler }: ApplyJobProps) => {
    const [title, setTitle] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(""); 
    const categories = ["BNB", "USDC", "USDT", "USD"];
    const [coverLetter, setCoverLetter] = useState("");
    const [budget, setBudget] = useState(0);
    const initialDate = formatISODate(new Date());
    const [startDate, setStartDate] = useState(initialDate);
    const [endDate, setEndDate] = useState(initialDate);
    const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
    const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
    const [startCalendarMonth, setStartCalendarMonth] = useState(parseISODate(initialDate) ?? new Date());
    const [endCalendarMonth, setEndCalendarMonth] = useState(parseISODate(initialDate) ?? new Date());
    const [period, setPeriod] = useState(0);
    const startPickerRef = useRef<HTMLDivElement | null>(null);
    const endPickerRef = useRef<HTMLDivElement | null>(null);

    const [loading, setLoading] = useState("success");

    useEffect(() => {
        if (!isStartCalendarOpen && !isEndCalendarOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                isStartCalendarOpen &&
                startPickerRef.current &&
                !startPickerRef.current.contains(event.target as Node)
            ) {
                setIsStartCalendarOpen(false);
            }

            if (
                isEndCalendarOpen &&
                endPickerRef.current &&
                !endPickerRef.current.contains(event.target as Node)
            ) {
                setIsEndCalendarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStartCalendarOpen, isEndCalendarOpen]);

    useEffect(() => {
        if (!isStartCalendarOpen && !isEndCalendarOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsStartCalendarOpen(false);
                setIsEndCalendarOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isStartCalendarOpen, isEndCalendarOpen]);

    const handleStartSelect = (date: Date) => {
        setStartDate(formatISODate(date));
        setStartCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsStartCalendarOpen(false);
    };

    const handleEndSelect = (date: Date) => {
        setEndDate(formatISODate(date));
        setEndCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsEndCalendarOpen(false);
    };

    const [error, setError] = useState("");

    const handleApply = async () => {
        // if (title === "") {
        //     setError("Please enter a title");
        //     return;
        // }        

        if (budget <= 0) {
            setError("Budget must be greater than 0");
            setBudget(0);
            return;
        }

        if (budget > 1000000) {
            setError("Budget must be less than 1000000");
            setBudget(0);
            return;
        }

        if (selectedCategory === "") {
            setError("Please select a category");
            return;
        }

        // if (startDate >= endDate) {
        //     setError("Start date must be before end date");
        //     return;
        // }

        setError("");
        setLoading("pending");
        const result = await createBid({
            job_id: jobId,
            freelancer_id: freelancerId,
            cover_letter_md: coverLetter,
            bid_amount: budget,
            token_symbol: selectedCategory ?? "USD",
            period: period,
            status: BidStatus.PENDING,
        });
        if (result.success) {
            toast.success("Bid created successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            setLoading("success");
            clickHandler();
        } else {
            toast.error(result.error, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        setLoading("success");
    };

    
        return (
            <div>
                {
                    loading === "pending" && <SmallLoading />
                }
                {
                    loading === "success" &&
                        <div>
                            <p className='lg:text-display text-title lg:text-left text-center font-bold text-black pb-6'>{jobTitle}</p>
                            <p className='text-light-large font-regular text-black lg:text-left text-center pb-6'>{jobDescription}</p>
                            <div className="linear-border rounded-lg p-0.25 linear-border--dark-hover">
                                <div className="linear-border__inner rounded-[0.4375rem] bg-white py-8 px-3 lg:p-8">
                                    <div className='flex flex-col gap-6'>
                                        {/* <div>
                                            <p className='text-normal font-regular text-black text-left pb-2'>Title</p>
                                            <input
                                                value={title}
                                                onChange={(e) => {
                                                    setTitle(e.target.value);
                                                    setError("");
                                                }}
                                                className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                                placeholder='Title'
                                            />
                                        </div> */}
                                        <div className='w-full'>
                                            <p className='text-normal font-regular text-black text-left pb-2'>Cover Letter</p>
                                            <div className='flex flex-col'>
                                                <textarea className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-33.5 resize-none' value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col lg:flex-row gap-6 w-full">
                                            <div className="lg:w-full w-auto">
                                                <p className='text-normal font-regular text-black text-left pb-2'>Budget</p>
                                                <input
                                                    value={budget}
                                                    type="number"
                                                    onChange={(e) => {
                                                        setBudget(Number(e.target.value));
                                                        setError("");
                                                    }}
                                                    className='w-full bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                                    placeholder='Budget'
                                                />
                                            </div>
                                            <div className='flex flex-col gap-2 lg:w-full w-auto'>
                                                <p className='text-normal font-regular text-black text-left'>Category</p>
                                                <div ref={dropdownRef} className={`relative lg:w-full w-auto ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                                    <select
                                                        value={selectedCategory}
                                                        onChange={(e) => {
                                                            setSelectedCategory(e.target.value);
                                                            setError("");
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
                                            <div className="w-full">
                                                <p className='text-normal font-regular text-black text-left pb-2'>Period</p>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        value={period}
                                                        onChange={(e) => {
                                                            setPeriod(Number(e.target.value));
                                                            setError("");
                                                        }}
                                                        className=' bg-transparent text-normal font-regular text-black text-left focus:outline-none border border-[#8F99AF] rounded-lg p-3'
                                                        placeholder='Period'
                                                    />
                                                    <p className='text-normal font-regular text-black'>Days</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className='flex flex-col gap-4 md:flex-row md:gap-2.5'>
                                            <div className="flex-1" ref={startPickerRef}>
                                                <p className='text-normal font-regular text-black text-left pb-2'>Start Date</p>
                                                <div className='relative'>
                                                    <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                                        <input
                                                            id="start-date-input"
                                                            type='text'
                                                            readOnly
                                                            value={formatDisplayDate(startDate)}
                                                            onClick={() => setIsStartCalendarOpen(true)}
                                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer'
                                                            placeholder='Select start date'
                                                            aria-haspopup="dialog"
                                                            aria-expanded={isStartCalendarOpen}
                                                            aria-controls="start-date-calendar"
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={() => setIsStartCalendarOpen((prev) => !prev)}
                                                            className='text-black'
                                                            aria-label='Open start date calendar'
                                                            aria-controls="start-date-calendar"
                                                            aria-expanded={isStartCalendarOpen}
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
                                                    {isStartCalendarOpen && (
                                                        <CalendarDropdown
                                                            id="start-date-calendar"
                                                            selectedDate={startDate}
                                                            monthDate={startCalendarMonth}
                                                            onSelectDate={handleStartSelect}
                                                            onMonthChange={(date) => setStartCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1" ref={endPickerRef}>
                                                <p className='text-normal font-regular text-black text-left pb-2'>End Date</p>
                                                <div className='relative'>
                                                    <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                                        <input
                                                            id="end-date-input"
                                                            type='text'
                                                            readOnly
                                                            value={formatDisplayDate(endDate)}
                                                            onClick={() => setIsEndCalendarOpen(true)}
                                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer'
                                                            placeholder='Select end date'
                                                            aria-haspopup="dialog"
                                                            aria-expanded={isEndCalendarOpen}
                                                            aria-controls="end-date-calendar"
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={() => setIsEndCalendarOpen((prev) => !prev)}
                                                            className='text-black'
                                                            aria-label='Open end date calendar'
                                                            aria-controls="end-date-calendar"
                                                            aria-expanded={isEndCalendarOpen}
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
                                                    {isEndCalendarOpen && (
                                                        <CalendarDropdown
                                                            id="end-date-calendar"
                                                            selectedDate={endDate}
                                                            monthDate={endCalendarMonth}
                                                            onSelectDate={handleEndSelect}
                                                            onMonthChange={(date) => setEndCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div> */}
                                        {error && (
                                            <div className="text-small font-regular text-red-500 text-left">
                                                {error}
                                            </div>
                                        )}
                                        <div className='flex justify-end'>
                                            <div className='w-30'>
                                                <Button
                                                    padding='px-10.75 py-3'
                                                    onClick={handleApply}
                                                >
                                                    <p className='text-normal font-regular'>Apply</p>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                }
            
            </div>
        )

}
export default ApplyJob;
