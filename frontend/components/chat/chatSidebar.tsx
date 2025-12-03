import { useEffect, useState } from "react";
import ChatSidebarItem from "./chatSidebarItem";
import Image from "next/image";

const chats = [
    {
        id: 1,
        name: "John Doe",
        image: "62fa7b72-5fd1-46fa-ae8f-2387d09ce907.jpg",
        status: "typing",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        pinned: true,
    },
    {
        id: 2,
        name: "Jane Doe",
        image: "c0cf1c35-20a1-4412-9b15-45429788ea25.jpg",
        status: "online",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        pinned: false,
    },
    {
        id: 3,
        name: "John Doe",
        image: "971411da-4c27-47f7-b171-45c2b39e64c9.png",
        status: "online",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        pinned: false,
    },
    {
        id: 4,
        name: "Jane Doe",
        image: "7e8e2ec9-db1c-441a-bb53-3c1c5a661d59.jpg",
        status: "online",
        lastMessage: "Hello, how are you?",
        lastMessageTime: "12:00 PM",
        pinned: false,
    },    
];

const ChatSidebar = () => {

    const [pinnedChats, setPinnedChats] = useState<typeof chats>([]);
    const [unpinnedChats, setUnpinnedChats] = useState<typeof chats>([]);

    useEffect(() => {
        setPinnedChats(chats.filter((chat) => chat.pinned).sort((a, b) => a.lastMessageTime.localeCompare(b.lastMessageTime)));
        setUnpinnedChats(chats.filter((chat) => !chat.pinned).sort((a, b) => a.lastMessageTime.localeCompare(b.lastMessageTime)));
    }, [chats]);

    return (
        <div className="flex flex-col w-full">
            {pinnedChats.length > 0 && (
                <div>
                    <div className="pt-4 px-4 pb-1 w-full bg-[#2F3DF633]">
                        <div className="flex items-center justify-center gap-2">
                            <Image src="/images/pin.svg" alt="Pinned" width={24} height={24} />
                            <p className="text-small font-regular text-[#2F3DF6]">Pinned</p>
                        </div>
                    </div>
                    {pinnedChats.map((chat) => (
                        <ChatSidebarItem 
                            key={chat.id} 
                            name={chat.name} 
                            image={chat.image} 
                            status={chat.status} 
                            lastMessage={chat.lastMessage} 
                            lastMessageTime={chat.lastMessageTime} 
                            clickHandler={() => {}} 
                        />
                    ))}
                    <div className="w-full pb-2.5"></div>
                </div>
            )}
            {unpinnedChats.length > 0 && (
                <div>
                    <div className="pt-4 px-4 pb-1 w-full bg-[#2F3DF633]">
                        <div className="flex items-center justify-center gap-2">
                            <Image src="/images/message.svg" alt="Unpinned" width={24} height={24} />
                            <p className="text-small font-regular text-[#7E3FF2]">All Messages</p>
                        </div>
                    </div>
                    {unpinnedChats.map((chat) => (
                        <ChatSidebarItem 
                            key={chat.id} 
                            name={chat.name} 
                            image={chat.image} 
                            status={chat.status} 
                            lastMessage={chat.lastMessage} 
                            lastMessageTime={chat.lastMessageTime} 
                            clickHandler={() => {}} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatSidebar;