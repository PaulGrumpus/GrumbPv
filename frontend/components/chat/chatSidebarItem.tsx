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
    clickHandler: () => void;
    onPinChat: () => void;
    onUnpinChat: () => void;
}

const ChatSidebarItem = ({ name, image, status, lastMessage, lastMessageTime, selected, clickHandler, onPinChat, onUnpinChat }: ChatSidebarItemProps) => {
    return (
        <div 
            className={`flex justify-between group hover:text-white hover:bg-linear-to-r hover:from-(--color-light-blue) hover:to-(--color-purple) ${selected ? "bg-linear-to-r from-(--color-light-blue) to-(--color-purple)" : ""} p-4 border-b border-[#8F99AFCC] cursor-pointer`}
            onClick={clickHandler}
        >
            <div className="max-w-75% flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden">
                    <Image src={EscrowBackendConfig.uploadedImagesURL + image} alt={name} width={36} height={36} />
                </div>
                <div className="flex flex-col">
                    <p className="text-small font-regular text-black group-hover:text-white">{name}</p>
                    {status === "typing" ? (
                        <p className="text-tiny font-regular text-[#2F3DF6]">{status}...</p>
                    ) : (
                        <p className="text-tiny font-regular text-[#8F99AF] truncate group-hover:text-white">{lastMessage}</p>
                    )}
                </div>
            </div>
            <p className="text-tiny font-regular text-black group-hover:text-white">{lastMessageTime}</p>
        </div>
    );
};

export default ChatSidebarItem;