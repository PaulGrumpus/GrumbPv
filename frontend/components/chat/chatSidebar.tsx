'use client';

import { useEffect, useState } from "react";
import ChatSidebarItem from "./chatSidebarItem";
import Image from "next/image";
import { User } from "@/types/user";
import { formatHourMinute } from "@/utils/functions";

interface ChatSidebarItemType {
    conversation_id: string;
    receiver: User;
    status: string;
    lastMessage: string;
    lastMessageTime: Date;
    pinned: boolean;
    selected: boolean;
    onChatClick: (conversation_id: string) => void;
    onPinChat: (conversation_id: string) => void;
    onUnpinChat: (conversation_id: string) => void;
}

const ChatSidebar = ({ chats }: { chats: ChatSidebarItemType[] }) => {

    const [pinnedChats, setPinnedChats] = useState<ChatSidebarItemType[]>([]);
    const [unpinnedChats, setUnpinnedChats] = useState<ChatSidebarItemType[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    useEffect(() => {
        setPinnedChats(
            chats
                .filter((chat) => chat.pinned)
                // .sort((a, b) => a.lastMessageTime.getTime() - b.lastMessageTime.getTime())
        );
        setUnpinnedChats(
            chats
                .filter((chat) => !chat.pinned)
                // .sort((a, b) => a.lastMessageTime.getTime() - b.lastMessageTime.getTime())
        );
    }, [chats]);

    useEffect(() => {
        if (chats.length === 0) {
            setSelectedConversationId(null);
            return;
        }

        const hasSelection = chats.some((chat) => chat.conversation_id === selectedConversationId);
        if (!hasSelection) {
            setSelectedConversationId(chats[0].conversation_id);
        }
    }, [chats, selectedConversationId]);


    const handleChatClick = (conversation_id: string) => {
        setSelectedConversationId(conversation_id);
    };

    return (
        <div className="flex flex-col w-full h-full max-h-[calc(100vh-8.6875rem)] overflow-y-auto hide-scrollbar border-r border-[#8F99AFCC]">
            {pinnedChats.length > 0 && (
                <div>
                    <div className="pt-4 px-4 pb-1 w-full bg-[#2F3DF633]">
                        <div className="flex items-center gap-2">
                            <Image src="/Grmps/pin.svg" alt="Pinned" width={24} height={24} />
                            <p className="text-small font-regular text-[#2F3DF6]">Pinned</p>
                        </div>
                    </div>
                    {pinnedChats.map((chat) => (
                        <ChatSidebarItem 
                            key={chat.conversation_id} 
                            name={chat.receiver.display_name ?? ""} 
                            image={chat.receiver.image_id ?? ""} 
                            status={chat.status} 
                            lastMessage={chat.lastMessage} 
                            lastMessageTime={formatHourMinute(chat.lastMessageTime.toString())} 
                            selected={chat.conversation_id === selectedConversationId}
                            clickHandler={ () => {
                                handleChatClick(chat.conversation_id);
                                chat.onChatClick(chat.conversation_id);
                            }} 
                            onPinChat={() => {}} 
                            onUnpinChat={() => {}} 
                        />
                    ))}
                    <div className="w-full pb-2.5"></div>
                </div>
            )}
            {unpinnedChats.length > 0 && (
                <div>
                    <div className="pt-4 px-4 pb-1 w-full bg-[#2F3DF633]">
                        <div className="flex items-center gap-2">
                            <Image src="/Grmps/message.svg" alt="Unpinned" width={24} height={24} />
                            <p className="text-small font-regular text-[#7E3FF2]">All Messages</p>
                        </div>
                    </div>
                    {unpinnedChats.map((chat) => (
                        <ChatSidebarItem 
                            key={chat.conversation_id} 
                            name={chat.receiver.display_name ?? ""} 
                            image={chat.receiver.image_id ?? ""} 
                            status={chat.status} 
                            lastMessage={chat.lastMessage} 
                            lastMessageTime={formatHourMinute(chat.lastMessageTime.toString())} 
                            selected={chat.conversation_id === selectedConversationId}
                            clickHandler={ () => {
                                handleChatClick(chat.conversation_id);
                                chat.onChatClick(chat.conversation_id);
                            }} 
                            onPinChat={() => {}} 
                            onUnpinChat={() => {}} 
                        />
                    ))}
                </div>
            )}
            {chats.length === 0 && (
                <div className="pt-4 px-4 pb-1 w-full bg-[#2F3DF633]">
                    <div className="flex items-center gap-2">
                    <Image src="/Grmps/message.svg" alt="Unpinned" width={24} height={24} />
                        <p className="text-small font-regular text-[#7E3FF2]">All Messages</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSidebar;