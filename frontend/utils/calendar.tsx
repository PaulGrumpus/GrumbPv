import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const calendarIcon = "/Grmps/dateIcon.svg";

export const formatISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const parseISODate = (value?: string) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

export const formatDisplayDate = (value: string) => {
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

export const buildMonthMatrix = (viewDate: Date) => {
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

export const isSameDay = (date: Date, isoDate?: string) => {
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

export const isToday = (date: Date) => {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
};

export interface CalendarDropdownProps {
    id: string;
    selectedDate?: string;
    monthDate: Date;
    onSelectDate: (date: Date) => void;
    onMonthChange: (date: Date) => void;
}

export const CalendarDropdown = ({ id, selectedDate, monthDate, onSelectDate, onMonthChange }: CalendarDropdownProps) => {
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