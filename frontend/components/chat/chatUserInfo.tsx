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

const ChatUserInfo = ({ user }: { user: User }) => {
    return (
        <div className="bg-[#7E3FF2] rounded-xl py-3.75 px-3">
            <div
                className="flex items-center justify-center flex-col"
            >
                <div className="w-25 h-25 rounded-full overflow-hidden mb-2">
                    <Image 
                        src={EscrowBackendConfig.uploadedImagesURL + user.image_id} 
                        alt="User Photo" 
                        width={100} 
                        height={100} 
                        className="w-full h-full object-cover" 
                    />
                </div>
                <h1 className="text-light-large font-bold text-[#DEE4F2] pb-3">{user.display_name}</h1>
                <div className="flex items-center justify-center bg-[#FFFFFF33] rounded-sm py-1 px-2.5 mb-3">
                    <p className="text-small font-regular text-[#DEE4F2]">{user.role}</p>
                </div>
                <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center justify-center py-2 px-2.5">
                        <p className="text-normal font-medium text-[#DEE4F2]">Joined: {formatDate(user.created_at)}</p>
                    </div>
                    {user.email && (
                        <div className="flex items-center justify-center py-2 px-2.5">
                            <p className="text-normal font-medium text-[#DEE4F2]">Email: {shortenEmail(user.email)}</p>
                        </div>
                    )}
                    {user.address && (
                        <div className="flex items-center justify-center py-2 px-2.5">
                            <p className="text-normal font-medium text-[#DEE4F2]">Address: {shortenAddress(user.address)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatUserInfo;