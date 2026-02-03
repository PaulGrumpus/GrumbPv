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
    confirmEditRounds: number; // 0..2; when >= 2, user can only confirm (no field edits)
    initialBudget: number;
    initialCurrency: string;
    initialDeliverables: string;
    initialOutOfScope: string;
    initialStartDate: Date;
    initialEndDate: Date;
}

const currencies = ["USD", "USDT", "USDC", "BNB"];
const charCount = 300;

const ReferenceDoc = ({ jobId, jobApplicationId, conversationId, userInfo, clientId, freelancerId, projectName, clientFullName, freelancerFullName, description, freelancerConfirmed, clientConfirmed, confirmEditRounds, initialBudget, initialCurrency, initialDeliverables, initialOutOfScope, initialStartDate, initialEndDate }: ReferenceDocProps) => {
    const canEditContent = confirmEditRounds < 2;
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
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 36; // Reduced margin for fuller text width
        const topMargin = 50;
        const bottomMargin = 70;
        const usableWidth = pageWidth - margin * 2; // ~523pt usable width on A4
        let cursorY = topMargin;
        let currentPage = 1;

        // Consistent colors
        const headerColor = "#2F3DF6";
        const contentColor = "#000000"; // Same black color for ALL content text
        const mutedColor = "#8F99AF";

        const checkAndAddPage = (requiredHeight: number): boolean => {
            if (cursorY + requiredHeight > pageHeight - bottomMargin) {
                doc.addPage();
                currentPage++;
                cursorY = topMargin;
                return true;
            }
            return false;
        };

        const addSectionHeader = (label: string) => {
            checkAndAddPage(30);
            doc.setFontSize(14);
            doc.setTextColor(headerColor);
            doc.setFont("helvetica", "bold");
            doc.text(label, margin, cursorY);
            cursorY += 20;
        };

        const addSectionContent = (content: string, fontSize = 11) => {
            // Set font BEFORE calculating line splits (affects width calculation)
            doc.setFontSize(fontSize);
            doc.setTextColor(contentColor);
            doc.setFont("helvetica", "normal");
            
            const lines = doc.splitTextToSize(content || "N/A", usableWidth);
            const lineHeight = fontSize + 4;
            
            for (let i = 0; i < lines.length; i++) {
                checkAndAddPage(lineHeight);
                // Reset text styling after page break (footer might change it)
                doc.setFontSize(fontSize);
                doc.setTextColor(contentColor);
                doc.setFont("helvetica", "normal");
                doc.text(lines[i], margin, cursorY);
                cursorY += lineHeight;
            }
            cursorY += 15;
        };

        const addSection = (label: string, content: string) => {
            addSectionHeader(label);
            addSectionContent(content);
        };

        const addKeyValuePair = (key: string, value: string) => {
            checkAndAddPage(20);
            // Set styling after potential page break
            doc.setFontSize(11);
            doc.setTextColor(contentColor);
            doc.setFont("helvetica", "bold");
            doc.text(`${key}: `, margin, cursorY);
            const keyWidth = doc.getTextWidth(`${key}: `);
            doc.setFont("helvetica", "normal");
            doc.text(value || "N/A", margin + keyWidth, cursorY);
            cursorY += 18;
        };

        // === HEADER SECTION ===
        doc.setFontSize(24);
        doc.setTextColor(headerColor);
        doc.setFont("helvetica", "bold");
        const title = projectTitle || "Project Agreement";
        doc.text(title, pageWidth / 2, cursorY, { align: "center" });
        cursorY += 15;

        doc.setFontSize(11);
        doc.setTextColor(mutedColor);
        doc.setFont("helvetica", "normal");
        doc.text("Project Agreement Document", pageWidth / 2, cursorY, { align: "center" });
        cursorY += 30;

        // Divider line
        doc.setDrawColor(headerColor);
        doc.setLineWidth(2);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 25;

        // === PARTIES INFO ===
        doc.setFillColor("#F8F9FC");
        doc.roundedRect(margin, cursorY - 5, usableWidth, 55, 5, 5, "F");
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(contentColor);
        doc.text("Client:", margin + 15, cursorY + 15);
        doc.setFont("helvetica", "normal");
        doc.text(clientName || "N/A", margin + 60, cursorY + 15);

        doc.setFont("helvetica", "bold");
        doc.text("Freelancer:", margin + 15, cursorY + 35);
        doc.setFont("helvetica", "normal");
        doc.text(freelancerName || "N/A", margin + 85, cursorY + 35);

        cursorY += 70;

        // === JOB ID SECTION ===
        addSectionHeader("Job ID");
        doc.setFontSize(11);
        doc.setTextColor(contentColor);
        doc.setFont("helvetica", "normal");
        doc.text(jobId || "N/A", margin, cursorY);
        cursorY += 25;

        // === PROJECT DESCRIPTION ===
        addSection("Project Description", projectDescription);

        // === DELIVERABLES ===
        addSection("Deliverables", deliverables);

        // === OUT OF SCOPE ===
        addSection("Out of Scope", outOfScope);

        // === TIMELINE ===
        addSectionHeader("Timeline");
        addKeyValuePair("Start Date", formatDisplayDate(startDate));
        addKeyValuePair("End Date", formatDisplayDate(endDate));
        cursorY += 10;

        // === BUDGET ===
        addSectionHeader("Budget & Payment");
        addKeyValuePair("Amount", `${budget || "N/A"} ${currency || ""}`);
        cursorY += 10;

        // === AGREEMENT STATUS ===
        addSectionHeader("Agreement Status");
        
        checkAndAddPage(25);
        doc.setFontSize(11);
        const freelancerStatus = freelancerConfirmed ? "[CONFIRMED]" : "[PENDING]";
        const freelancerStatusColor = freelancerConfirmed ? "#22C55E" : "#EAB308";
        doc.setFont("helvetica", "bold");
        doc.setTextColor(freelancerStatusColor);
        doc.text(freelancerStatus, margin, cursorY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(contentColor);
        doc.text(` ${freelancerName} - Freelancer`, margin + doc.getTextWidth(freelancerStatus), cursorY);
        cursorY += 20;

        checkAndAddPage(25);
        const clientStatus = clientConfirmed ? "[CONFIRMED]" : "[PENDING]";
        const clientStatusColor = clientConfirmed ? "#22C55E" : "#EAB308";
        doc.setFont("helvetica", "bold");
        doc.setTextColor(clientStatusColor);
        doc.text(clientStatus, margin, cursorY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(contentColor);
        doc.text(` ${clientName} - Client`, margin + doc.getTextWidth(clientStatus), cursorY);
        cursorY += 30;

        // === SIGNATURE SECTION ===
        checkAndAddPage(100);
        
        const signatureBoxWidth = (usableWidth - 30) / 2;
        const signatureY = cursorY + 20;
        
        doc.setDrawColor("#E5E7EB");
        doc.setLineWidth(1);
        
        // Client signature box
        doc.roundedRect(margin, signatureY, signatureBoxWidth, 60, 3, 3, "S");
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text("Client Signature", margin + 10, signatureY + 15);
        doc.setFontSize(11);
        doc.setTextColor(contentColor);
        doc.text(clientName || "N/A", margin + 10, signatureY + 45);
        if (clientConfirmed) {
            doc.setTextColor("#22C55E");
            doc.setFontSize(9);
            doc.text("SIGNED", margin + signatureBoxWidth - 45, signatureY + 15);
        }
        
        // Freelancer signature box
        const freelancerBoxX = margin + signatureBoxWidth + 30;
        doc.roundedRect(freelancerBoxX, signatureY, signatureBoxWidth, 60, 3, 3, "S");
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        doc.text("Freelancer Signature", freelancerBoxX + 10, signatureY + 15);
        doc.setFontSize(11);
        doc.setTextColor(contentColor);
        doc.text(freelancerName || "N/A", freelancerBoxX + 10, signatureY + 45);
        if (freelancerConfirmed) {
            doc.setTextColor("#22C55E");
            doc.setFontSize(9);
            doc.text("SIGNED", freelancerBoxX + signatureBoxWidth - 45, signatureY + 15);
        }

        // Add footer to all pages with total page count
        const totalPagesCount = doc.getNumberOfPages();
        for (let i = 1; i <= totalPagesCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(mutedColor);
            doc.text(`Page ${i} of ${totalPagesCount}`, pageWidth / 2, pageHeight - 30, { align: "center" });
            doc.setDrawColor("#E5E7EB");
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);
        }

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
            const message = error instanceof Error ? error.message : String(error);
            toast.error(message, {
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
                {confirmEditRounds > 0 && (
                    <p className="text-normal font-regular text-[#8F99AF] mb-2">
                        Edit round {confirmEditRounds} of 2
                        {confirmEditRounds >= 2 && " — you can only confirm (no more edits)."}
                    </p>
                )}
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
                                    className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                    value={projectDescription}
                                    onChange={(e) => {
                                        if (!canEditContent) return;
                                        const value = e.target.value;
                                        if (value.length <= charCount) {
                                            setProjectDescription(value);
                                        }
                                    }}
                                    maxLength={charCount}
                                    disabled={!canEditContent}
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
                                    className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                    value={deliverables}
                                    onChange={(e) => canEditContent && setDeliverables(e.target.value)}
                                    disabled={!canEditContent}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Out of Scope</p>
                            <textarea
                                className='text-normal font-regular text-black text-left p-3 border border-[#8F99AF] rounded-lg max-w-full min-h-45 resize-none mb-2 disabled:opacity-60 disabled:cursor-not-allowed'
                                value={outOfScope}
                                onChange={(e) => canEditContent && setOutOfScope(e.target.value)}
                                disabled={!canEditContent}
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
                                    if (!canEditContent) return;
                                    const value = e.target.value;
                                    if (!/^\d*\.?\d*$/.test(value)) return;
                                    setBudget(value);
                                    setError("");
                                }}
                                className='w-full border border-[#8F99AF] rounded-lg p-3 flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed'
                                placeholder='Budget'
                                disabled={!canEditContent}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className='text-normal font-medium text-[#8F99AF] text-left'>Currency (beta version only supports BNB)</p>
                            <div ref={dropdownRef} className={`relative cursor-pointer ${dropdownMenuOpen ? 'border-blue-500' : ''}`}>
                                <select
                                    value={currency}
                                    onChange={(e) => {
                                        if (canEditContent) {
                                            setCurrency(e.target.value);
                                            setDropdownMenuOpen(false);
                                        }
                                    }}
                                    className='w-full appearance-none rounded-lg cursor-pointer border border-[#8F99AF] bg-white p-3 text-normal font-regular text-black focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        canEditContent && setDropdownMenuOpen((prev: boolean) => !prev);
                                    }}
                                    disabled={!canEditContent}
                                >
                                    <option value='' disabled>
                                        Select one ...
                                    </option>
                                    {currencies.map((curr) => (
                                        <option 
                                            key={curr} 
                                            value={curr} 
                                            className={`text-normal cursor-pointer bg-white py-2 px-3 ${
                                                curr === "BNB" 
                                                    ? 'font-bold text-black' 
                                                    : 'font-regular text-gray-400'
                                            }`}
                                            disabled={curr !== "BNB"}
                                        >
                                            {curr}
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
                                            onClick={() => canEditContent && setIsStartDateCalendarOpen(true)}
                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                                            placeholder='Select start date'
                                            aria-haspopup="dialog"
                                            aria-expanded={isStartDateCalendarOpen}
                                            aria-controls="start-date-calendar"
                                            disabled={!canEditContent}
                                        />
                                        <button
                                            type='button'
                                            onClick={() => canEditContent && setIsStartDateCalendarOpen((prev) => !prev)}
                                            className='text-black disabled:opacity-60 disabled:cursor-not-allowed'
                                            aria-label='Open start date calendar'
                                            aria-controls="start-date-calendar"
                                            aria-expanded={isStartDateCalendarOpen}
                                            disabled={!canEditContent}
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
                                            onClick={() => canEditContent && setIsEndDateCalendarOpen(true)}
                                            className='flex-1 bg-transparent text-normal font-regular text-black text-left focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                                            placeholder='Select end date'
                                            aria-haspopup="dialog"
                                            aria-expanded={isEndDateCalendarOpen}
                                            aria-controls="end-date-calendar"
                                            disabled={!canEditContent}
                                        />
                                        <button
                                            type='button'
                                            onClick={() => canEditContent && setIsEndDateCalendarOpen((prev) => !prev)}
                                            className='text-black disabled:opacity-60 disabled:cursor-not-allowed'
                                            aria-label='Open end date calendar'
                                            aria-controls="end-date-calendar"
                                            aria-expanded={isEndDateCalendarOpen}
                                            disabled={!canEditContent}
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
                                <p className="text-normal font-medium text-[#7E3FF2] text-left">Job ID</p>
                                <div className="flex flex-col gap-2 p-3 max-w-full">
                                    <p className="text-normal font-regular text-black text-left">{jobId}</p>
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