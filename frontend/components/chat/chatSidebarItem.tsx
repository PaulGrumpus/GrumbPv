'use client';

import { EscrowBackendConfig } from "@/config/config";
import Image from "next/image";

interface ChatSidebarItemProps {
    name: string;
    image: string;
    status: string;
    lastMessage: string;
    lastMessageTime: string;
    selected: boolean;
    unreadCount: number;
    clickHandler: () => void;
    onPinChat: () => void;
    onUnpinChat: () => void;
}

const ChatSidebarItem = ({ name, image, status, lastMessage, lastMessageTime, selected, unreadCount, clickHandler, onPinChat, onUnpinChat }: ChatSidebarItemProps) => {
    return (
        <div 
            className={`flex justify-between group hover:text-white hover:bg-linear-to-r hover:from-(--color-light-blue) hover:to-(--color-purple) ${selected ? "bg-linear-to-r from-(--color-light-blue) to-(--color-purple) text-white" : ""} p-4 border-b border-[#8F99AFCC] cursor-pointer text-black`}
            onClick={clickHandler}
        >
            <div className="max-w-[75%] flex items-center gap-2 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image src={EscrowBackendConfig.uploadedImagesURL + image} alt={name} width={36} height={36} />
                </div>
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <p className="text-small font-regular group-hover:text-white truncate">{name}</p>
                    {status === "typing" ? (
                        <p className="text-tiny font-regular text-[#2F3DF6] truncate">{status}...</p>
                    ) : (
                        <p className={`text-tiny font-regular text-[#8F99AF] truncate group-hover:text-white ${selected ? "text-white" : ""}`}>{lastMessage}</p>
                    )}
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <p className="text-tiny font-regular group-hover:text-white">{lastMessageTime}</p>
                {unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatSidebarItem;