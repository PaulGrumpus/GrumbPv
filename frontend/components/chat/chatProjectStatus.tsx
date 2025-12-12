import Button from "../button";
import Link from "next/link";

interface ChatProjectStatusProps {
    status: number; // 1-4
    actionHandler?: () => void;
    actionLabel?: string;
    jobMilestoneId: string;
    conversationId: string;
    jobApplicationDocId: string;
}

const steps = [
    "Started the job",
    "Escrowed the fund",
    "Delivered the product",
    "Approved payment",
];

const ChatProjectStatus = ({ status, actionHandler, actionLabel, jobMilestoneId, conversationId, jobApplicationDocId }: ChatProjectStatusProps) => {
    const safeStatus = Math.min(Math.max(status, 1), steps.length);
    const activeIndex = safeStatus - 1;

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

                <div className="flex items-center justify-center pb-20.5">
                    <Button padding="px-6 py-1.5" onClick={actionHandler}>
                        <p className="text-normal font-regular text-[#FFFFFF]">
                            {actionLabel ?? "Escrow Fund"}
                        </p>
                    </Button>
                </div>

                <div className="flex items-center justify-center pb-6">
                    <Link href={`/reference?jobApplicationId=${jobApplicationDocId}&conversationId=${conversationId}`} className="w-full flex justify-center">
                        <Button padding="px-4 py-1.5" variant="secondary">
                            <p className="text-normal font-regular text-[#7E3FF2]">Go to doc</p>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ChatProjectStatus;