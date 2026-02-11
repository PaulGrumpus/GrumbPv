import Image from "next/image";
import { User } from "@/types/user";
import { EscrowBackendConfig } from "@/config/config";

const shortenEmail = (email: string) => {
    return email.length > 10 ? `${email.slice(0, 5)}...${email.slice(-5)}` : email;
}

const shortenAddress = (address: string) => {
    return address.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Format total seconds (decimal) as "X days, Y hours, Z mins" */
const formatSecondsToDuration = (totalSeconds: number): string => {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "N/A";
    const sec = Math.floor(totalSeconds);
    if (sec < 60) return `${sec} sec${sec !== 1 ? "s" : ""}`;
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
    parts.push(`${mins} min${mins !== 1 ? "s" : ""}`);
    return parts.join(", ");
}

const ChatUserInfo = ({ user }: { user: User | null }) => {
    return (
        <div className="bg-[#7E3FF2] rounded-xl py-3 px-3.75">
            <div className="w-full min-w-62.5">
                <div
                    className="flex items-center justify-center flex-col w-full"
                >
                    <div className="w-25 h-25 rounded-full overflow-hidden mb-2 mt-8">
                        <Image 
                            src={user? EscrowBackendConfig.uploadedImagesURL + user.image_id : EscrowBackendConfig.uploadedImagesURL + "/default.jpg"} 
                            alt="User Photo" 
                            width={100} 
                            height={100} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <h1 className="text-light-large font-bold text-[#DEE4F2] pb-3">{user? user.display_name : "No user"}</h1>
                    <div className="flex items-center justify-center bg-[#FFFFFF33] rounded-sm py-1 px-2.5 mb-3">
                        <p className="text-small font-regular text-[#DEE4F2]">{user? user.role : "No role"}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 mb-8">
                        <div className="flex items-center justify-center py-2 px-2.5">
                            <p className="text-normal font-medium text-[#DEE4F2]">Joined: {user? formatDate(user.created_at) : "No created at"}</p>
                        </div>
                        {user?.email && (
                            <div className="flex items-center justify-center py-2 px-2.5">
                                <p className="text-normal font-medium text-[#DEE4F2]">Email: {user? shortenEmail(user.email) : "No email"}</p>
                            </div>
                        )}
                        {user?.address && (
                            <div className="flex items-center justify-center py-2 px-2.5">
                                <p className="text-normal font-medium text-[#DEE4F2]">Address: {user? shortenAddress(user.address) : "No address"}</p>
                            </div>
                        )}
                        {user?.role === "freelancer" && (
                            <div className="flex py-2 px-2.5 flex-col gap-2">
                                <p className="text-normal font-medium text-[#DEE4F2]">Finished Jobs: {user? user.finished_job_num : "No Finished Jobs"}</p>
                                <p className="text-normal font-medium text-[#DEE4F2]">Total Earned: {user? Number(user.total_fund).toFixed(2) + " BNB" : "No total fund"}</p>
                            </div>
                        )}
                        {user?.role === "client" && (
                            <div className="flex py-2 px-2.5 flex-col gap-2">
                                <p className="text-normal font-medium text-[#DEE4F2]">Finished Jobs: {user? user.finished_job_num : "No Finished Jobs"}</p>
                                <p className="text-normal font-medium text-[#DEE4F2]">Total Spent: {user? Number(user.total_fund).toFixed(2) + " BNB" : "No total fund"}</p>
                                <p className="text-normal font-medium text-[#DEE4F2]">Avg Fund Time: {user.fund_num && user.fund_cycle ? formatSecondsToDuration(Number(user.fund_cycle) / Number(user.fund_num)) : "N/A"}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatUserInfo;