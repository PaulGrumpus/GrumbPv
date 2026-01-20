"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { formatISODate, parseISODate, formatDisplayDate, calendarIcon, CalendarDropdown } from "@/utils/calendar";
import Image from "next/image";
import Button from "./button";
import { updateJobApplication } from "@/utils/functions";
import { User } from "@/types/user";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SmallLoading from "./smallLoading";
import { jsPDF } from "jspdf";

interface ReferenceDocProps {
    jobId: string;
    jobApplicationId: string;
    conversationId: string;
    userInfo: User;
    clientId: string;
    freelancerId: string;
    projectName: string;
    clientFullName: string;
    freelancerFullName: string;
    description: string;
    freelancerConfirmed: boolean;
    clientConfirmed: boolean;
    initialBudget: number;
    initialCurrency: string;
    initialDeliverables: string;
    initialOutOfScope: string;
    initialStartDate: Date;
    initialEndDate: Date;
}

const currencies = ["USD", "USDT", "USDC", "BNB", "ETH"];
const charCount = 300;

const ReferenceDoc = ({ jobId, jobApplicationId, conversationId, userInfo, clientId, freelancerId, projectName, clientFullName, freelancerFullName, description, freelancerConfirmed, clientConfirmed, initialBudget, initialCurrency, initialDeliverables, initialOutOfScope, initialStartDate, initialEndDate }: ReferenceDocProps) => {
    const [projectTitle, setProjectTitle] = useState(projectName);
    const [clientName, setClientName] = useState(clientFullName);
    const [freelancerName, setFreelancerName] = useState(freelancerFullName);
    const [projectDescription, setProjectDescription] = useState(description);
    const [deliverables, setDeliverables] = useState(initialDeliverables);
    const [deliverablesList, setDeliverablesList] = useState<string[]>([]);
    const [outOfScope, setOutOfScope] = useState(initialOutOfScope);
    const [budget, setBudget] = useState<string>(initialBudget.toString());
    const [currency, setCurrency] = useState(initialCurrency);
    const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const startDatePickerRef = useRef<HTMLDivElement | null>(null);
    const endDatePickerRef = useRef<HTMLDivElement | null>(null);
    const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false);
    const [isEndDateCalendarOpen, setIsEndDateCalendarOpen] = useState(false);
    const [startDate, setStartDate] = useState(formatISODate(initialStartDate));
    const [endDate, setEndDate] = useState(formatISODate(initialEndDate));
    const [startDateCalendarMonth, setStartDateCalendarMonth] = useState(parseISODate(startDate) ?? new Date());
    const [endDateCalendarMonth, setEndDateCalendarMonth] = useState(parseISODate(endDate) ?? new Date());
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState("success");
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownMenuOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownMenuOpen]);

    useEffect(() => {
        if (!isStartDateCalendarOpen && !isEndDateCalendarOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                isStartDateCalendarOpen &&
                startDatePickerRef.current &&
                !startDatePickerRef.current.contains(event.target as Node)
            ) {
                setIsStartDateCalendarOpen(false);
            }

            if (
                isEndDateCalendarOpen &&
                endDatePickerRef.current &&
                !endDatePickerRef.current.contains(event.target as Node)
            ) {
                setIsEndDateCalendarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isStartDateCalendarOpen, isEndDateCalendarOpen]);

    const handleStartDateSelect = (date: Date) => {
        setStartDate(formatISODate(date));
        setStartDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsStartDateCalendarOpen(false);
    };

    const handleEndDateSelect = (date: Date) => {
        setEndDate(formatISODate(date));
        setEndDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsEndDateCalendarOpen(false);
    };

    const handlePrint = () => {
        const doc = new jsPDF("p", "pt", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        let cursorY = 50;
        const usableWidth = pageWidth - margin * 2;

        const addText = (text: string, fontSize = 12, color = "#000000") => {
            doc.setFontSize(fontSize);
            doc.setTextColor(color);
            doc.text(text, margin, cursorY);
            cursorY += fontSize + 6;
        };

        const addSection = (label: string, content: string) => {
            addText(label, 14, "#2F3DF6");
            const lines = doc.splitTextToSize(content || "N/A", usableWidth);
            doc.setFontSize(11);
            doc.setTextColor("#000000");
            doc.text(lines, margin, cursorY);
            cursorY += lines.length * 14 + 10;
            if (cursorY > doc.internal.pageSize.getHeight() - 60) {
                doc.addPage();
                cursorY = 40;
            }
        };

        doc.setFontSize(22);
        doc.setTextColor("#2F3DF6");
        const title = projectTitle || "Project Agreement";
        doc.text(title, pageWidth / 2, cursorY, { align: "center" });
        cursorY += 30;

        doc.setFontSize(12);
        doc.setTextColor("#000000");
        doc.text(`Client: ${clientName || "N/A"}`, margin, cursorY);
        doc.text(`Freelancer: ${freelancerName || "N/A"}`, pageWidth - margin - 160, cursorY);
        cursorY += 24;

        addSection("Project Description", projectDescription);
        addSection("Deliverables", deliverables);
        addSection("Out of Scope", outOfScope);
        addSection("Timeline", `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`);
        addSection("Budget", `${budget || "N/A"} ${currency || ""}`.trim());
        addSection(
            "Agreement Status",
            `${freelancerConfirmed ? "✅ Freelancer confirmed" : "❌ Freelancer pending"}\n${clientConfirmed ? "✅ Client confirmed" : "❌ Client pending"}`
        );

        const safeTitle = projectTitle ? projectTitle.replace(/\s+/g, "-").toLowerCase() : "reference-document";
        doc.save(`${safeTitle}.pdf`);
    }
    const handleConfirm = async () => {
        if (!agreeToTerms) {
            setError("Please agree to the terms and conditions");
            return;
        }

        if (startDate >= endDate) {
            setError("Start date must be before end date");
            return;
        }

        if (Number(budget) <= 0) {
            setError("Budget must be greater than 0");
            return;
        }

        if (Number(budget) > 1000000) {
            setError("Budget must be less than 1000000");
            return;
        }

        setError("");

        setLoading("pending");

        try{
            const result = await updateJobApplication(jobApplicationId, userInfo.id, {
                job_id: jobId,
                client_id: clientId,
                freelancer_id: freelancerId,
                client_confirm: userInfo.id === clientId ? true : clientConfirmed,
                freelancer_confirm: userInfo.id === freelancerId ? true : freelancerConfirmed,
                deliverables: deliverables,
                out_of_scope: outOfScope,
                budget: Number(budget),
                token_symbol: currency,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
            });
    
            if (!result.success) {
                throw new Error(result.error as string);
            }

            if(result.data.job_milestone_id) {
                toast.success(`Escrow Contract deployed successfully - ${result.data.escrow_address}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                toast.success("Job application updated successfully", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
            
            router.push(`/chat?conversationId=${conversationId}`);
        } catch (error) {
            error instanceof Error ? toast.error(error.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            }) : toast.error(error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            toast.error(error as string, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        } finally {
            setLoading("success");
        }

    }

    useEffect(() => {
        const deliverablesList = deliverables.split("\n").map((item) => item.trim());
        setDeliverablesList(deliverablesList);
    },[deliverables])

    if (loading === "pending") {
        return <SmallLoading />;
    }

    if (loading === "success") {
        return (
            <div>
                <h1 className="lg:text-display text-title font-bold text-black lg:pb-10.25 pb-6">Project Agreement Form</h1>
                <div className="flex lg:flex-row flex-col gap-8">
                    <div className="lg:w-[53.87%] w-full max-w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Project Title</p>
                            <input
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                placeholder='Project Title'
                                disabled
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Client Name</p>
                            <input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                placeholder='Client Name'
                                disabled
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Freelancer Name</p>
                            <input
                                value={freelancerName}
                                onChange={(e) => setFreelancerName(e.target.value)}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                placeholder='Freelancer Name'
                                disabled
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left pb-2'>Project Description</p>
                            <div className='flex flex-col'>
                                <textarea
                                    className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2'
                                    value={projectDescription}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= charCount) {
                                            setProjectDescription(value);
                                        }
                                    }}
                                    maxLength={charCount}
                                />
                                <div className='flex justify-flex-end'>
                                    <p className='text-normal font-regular text-gray-400 text-left'>{charCount - projectDescription.length} characters left</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left pb-2'>Deliverables</p>
                            <div className='flex flex-col'>
                                <textarea
                                    className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2'
                                    value={deliverables}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // if (value.length <= charCount) {
                                        // }
                                        setDeliverables(value);
                                    }}
                                    // maxLength={charCount}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Out of Scope</p>
                            <textarea
                                className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2'
                                value={outOfScope}
                                onChange={(e) => setOutOfScope(e.target.value)}
                                // maxLength={charCount}
                            />
                            {/* <input
                                value={outOfScope}
                                onChange={(e) => setOutOfScope(e.target.value)}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                placeholder='Out of Scope'
                            /> */}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Budget</p>
                            <input
                                value={budget}
                                type="text"
                                inputMode="decimal"
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // allow: "", "1", "1.", "1.2", "0.25"
                                    if (!/^\d*\.?\d*$/.test(value)) return;

                                    setBudget(value);
                                    setError("");
                                }}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none'
                                placeholder='Budget'
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Currency</p>
                            <div ref={dropdownRef} className={`relative cursor-pointer ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                <select
                                    value={currency}
                                    onChange={(e) => {
                                        setCurrency(e.target.value);
                                        setDropdownMenuOpen(false);
                                    }}
                                    className='w-full appearance-none rounded-lg cursor-pointer border border-[#8F99AF] bg-white p-3 text-normal font-regular text-black focus:outline-none focus:border-blue-500'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setDropdownMenuOpen((prev: boolean) => !prev);
                                    }}
                                >
                                    <option value='' disabled>
                                        Select one ...
                                    </option>
                                    {currencies.map((currency) => (
                                        <option key={currency} value={currency} className='text-normal font-regular cursor-pointer text-black bg-white py-2 px-3'>
                                            {currency}
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
                        <div className="flex lg:flex-row flex-col gap-2.5">
                            <div className="flex-1" ref={startDatePickerRef}>
                                <p className='text-normal font-regular text-[#8F99AF] text-left pb-2'>Start Date</p>
                                <div className='relative'>
                                    <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                        <input
                                            id="start-date-input"
                                            type='text'
                                            readOnly
                                            value={formatDisplayDate(startDate)}
                                            onClick={() => setIsStartDateCalendarOpen(true)}
                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer'
                                            placeholder='Select start date'
                                            aria-haspopup="dialog"
                                            aria-expanded={isStartDateCalendarOpen}
                                            aria-controls="start-date-calendar"
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setIsStartDateCalendarOpen((prev) => !prev)}
                                            className='text-black'
                                            aria-label='Open start date calendar'
                                            aria-controls="start-date-calendar"
                                            aria-expanded={isStartDateCalendarOpen}
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
                                    {isStartDateCalendarOpen && (
                                        <CalendarDropdown
                                            id="start-date-calendar"
                                            selectedDate={startDate}
                                            monthDate={startDateCalendarMonth}
                                            onSelectDate={handleStartDateSelect}
                                            onMonthChange={(date) => setStartDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1" ref={endDatePickerRef}>
                                <p className='text-normal font-regular text-[#8F99AF] text-left pb-2'>Due Date</p>
                                <div className='relative'>
                                    <div className='flex items-center border border-[#8F99AF] rounded-lg p-3 gap-3'>
                                        <input
                                            id="end-date-input"
                                            type='text'
                                            readOnly
                                            value={formatDisplayDate(endDate)}
                                            onClick={() => setIsEndDateCalendarOpen(true)}
                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer'
                                            placeholder='Select end date'
                                            aria-haspopup="dialog"
                                            aria-expanded={isEndDateCalendarOpen}
                                            aria-controls="end-date-calendar"
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setIsEndDateCalendarOpen((prev) => !prev)}
                                            className='text-black'
                                            aria-label='Open end date calendar'
                                            aria-controls="end-date-calendar"
                                            aria-expanded={isEndDateCalendarOpen}
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
                                    {isEndDateCalendarOpen && (
                                        <CalendarDropdown
                                            id="end-date-calendar"
                                            selectedDate={endDate}
                                            monthDate={endDateCalendarMonth}
                                            onSelectDate={handleEndDateSelect}
                                            onMonthChange={(date) => setEndDateCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 p-2.5">
                            <input
                                type="checkbox"
                                id="agree-to-terms"
                                className="w-4 h-4 accent-[#34C759] text-gray-300"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                            />
                            <label htmlFor="agree-to-terms" className="text-normal font-regular text-black">Upon mutual agreement, this document becomes binding and shall not be amended or modified by either party throughout the duration of the work.</label>
                        </div>
                        {error && (
                            <p className="text-normal font-regular text-red-500 text-left">{error}</p>
                        )}
                        <div className="flex lg:justify-start justify-center gap-2.5">
                            <Button
                                variant="secondary"
                                padding="px-10.5 py-3"
                                onClick={handlePrint}
                            >
                                <p className="text-normal font-regular">Print</p>
                            </Button>
                            <Button
                                padding="px-6 py-3"
                                variant={freelancerConfirmed && clientConfirmed ? "disable" : "primary"}
                                onClick={handleConfirm}
                            >
                                <p className="text-normal font-regular">Confirm</p>
                            </Button>
                        </div>
                    </div>
                    <div className="lg:max-w-[40.13%] w-full max-w-full">
                        <p className="text-subtitle font-medium text-[#2F3DF6] text-left pb-2.5">Project Agreement Form  Preview</p>
                        <div className="border-l-3 border-[#7E3FF2] rounded-lg flex flex-col gap-6 p-6">
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Project Title</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <p className="text-normal font-bold text-black text-left">{projectTitle}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Parties</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <p className="text-normal font-bold text-black text-left">{clientName}</p>
                                    <p className="text-normal font-bold text-black text-left">{freelancerName}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Project Description</p>
                                <div className="flex flex-col gap-2 p-3 max-w-full">
                                    <p className="text-normal font-regular text-black text-left">{projectDescription}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 max-h-45 overflow-y-auto">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Deliverables</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <ul>
                                        {deliverablesList.map((item, index) => (
                                            <li key={index} className="text-normal font-regular text-black text-left">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 max-h-45 overflow-y-auto">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Out of Scope</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <p className="text-normal font-regular text-black text-left">{outOfScope}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Budget & Payment</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <p className="text-normal font-bold text-black text-left"><span className="font-medium">Amount:</span> {budget} {currency}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Timeline</p>
                                <div className="flex flex-col gap-2 p-3">
                                    <p className="text-normal font-regular text-black text-left">{formatDisplayDate(startDate)}</p>
                                    <p className="text-normal font-regular text-black text-left">{formatDisplayDate(endDate)}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Aggrement</p>
                                <div className="flex flex-col gap-2 p-3">
                                    {freelancerConfirmed && <p className="text-normal font-regular text-black text-left">✅ {freelancerName} - Freelancer</p>}
                                    {clientConfirmed && <p className="text-normal font-regular text-black text-left">✅ {clientName} - Client</p>}
                                    {freelancerConfirmed && clientConfirmed && <p className="text-normal font-regular text-black text-left">✅ Both Parties Agree</p>}
                                </div>
                            </div>
                            <div className="flex p-3 pt-9 justify-between">
                                <div className={`border-t py-2 px-3 ${clientConfirmed ? 'border-[#7E3FF2] border-t-2' : 'border-[#8F99AF]'}`}>
                                    <p className={`text-normal font-regular text-left ${clientConfirmed ? 'text-[#7E3FF2] font-bold text-light-large' : 'text-[#8F99AF]'}`} >{clientName}</p>
                                </div>
                                <div className={`border-t py-2 px-3 ${freelancerConfirmed ? 'border-[#7E3FF2] border-t-2' : 'border-[#8F99AF]'}`}>
                                    <p className={`text-normal font-regular text-left ${freelancerConfirmed ? 'text-[#7E3FF2] font-bold text-light-large' : 'text-[#8F99AF]'}`} >{freelancerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ReferenceDoc;