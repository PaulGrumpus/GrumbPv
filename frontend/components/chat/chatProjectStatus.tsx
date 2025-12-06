import Button from "../button";

interface ChatProjectStatusProps {
    status: number;
    actionHandler?: () => void;
    actionLabel?: string;
    jobId: string;
}

const ChatProjectStatus = ({ status, actionHandler, actionLabel, jobId }: ChatProjectStatusProps) => {
    return (
        <div className="py-3 px-3.75 bg-[#7E3FF2] rounded-xl">
            <div className="flex items-center justify-between">
                <p className="text-light-large font-bold text-[#DEE4F2]">Project Status</p>
            </div>
            <div className="flex gap-1 pb-6">
                <div className="w-[83%]">
                    <p className="text-normal font-regular text-[#DEE4F2] p-3">Started the job</p>
                    <p className="text-normal font-regular text-[#DEE4F2] p-3">Escrowed the fund</p>
                    <p className="text-normal font-regular text-[#DEE4F2] p-3">Delivered the product</p>
                    <p className="text-normal font-regular text-[#DEE4F2] p-3">Approved payment</p>
                </div>
                <div className="w-[17%]">
                    
                </div>
            </div>
            <div className="flex items-center justify-center pb-20.5">
                <Button
                    padding="px-6 py-1.5"
                    onClick={actionHandler}
                >
                    <p className="text-normal font-regular text-[#FFFFFF]">{actionLabel}</p>
                </Button>
            </div>
            <div>
                <Button
                    padding="px-6 py-1.5"
                    onClick={actionHandler}
                >
                    <p className="text-normal font-regular text-[#FFFFFF]">{actionLabel}</p>
                </Button>
                
            </div>
        </div>
    )
}

export default ChatProjectStatus;