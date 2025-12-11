'use client';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import { Message } from "@/types/message";
import { EscrowBackendConfig } from "@/config/config";

interface ChatMainProps {
    sender: User;
    receiver: User | null;
    messages: Message[];
    conversation_id: string;
    onSendMessage: (message: Message) => void;
    onEditMessage?: (message: Message) => void;
    onDeleteMessage?: (message: Message) => void;
    onReadMessage?: (message: Message) => void;
    onUnreadMessage?: (message: Message) => void;
    onPinMessage?: (message: Message) => void;
    onUnpinMessage?: (message: Message) => void;
    onReplyToMessage?: (message: Message) => void;
    onForwardMessage?: (message: Message) => void;
    onSaveMessage?: (message: Message) => void;
    onPhoneCall?: () => void;
    onVideoCall?: () => void;
}

const ChatMain = ({sender, receiver, messages, conversation_id, onSendMessage, onEditMessage, onDeleteMessage, onReadMessage, onUnreadMessage, onPinMessage, onUnpinMessage, onReplyToMessage, onForwardMessage, onSaveMessage, onPhoneCall, onVideoCall }: ChatMainProps) => {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef<number>(0);
    
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            // Use double requestAnimationFrame to ensure DOM has been updated
            // First RAF: wait for React to commit changes
            // Second RAF: wait for browser to paint
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        const container = messagesContainerRef.current;
                        container.scrollTo({
                            top: container.scrollHeight,
                            behavior: "smooth"
                        });
                    }
                });
            });
        }
    };
    
    const [newMessage, setNewMessage] = useState("");
    const [charError, setCharError] = useState(false);

    useEffect(() => {
        // Only scroll if messages actually increased (new message added)
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom();
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;
    
        // setCharError(message.length > CHARACTER_LIMIT);
        setNewMessage(message);
    };

    const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(
                {
                    conversation_id: conversation_id,
                    body_text: newMessage,
                    sender_id: sender.id,
                    kind: "text",
                } as Message
            );
            setNewMessage("");
            // Don't scroll here - let useEffect handle it when messages prop updates
        }
    };

    return (
        <div className="relative">
            <div className="absolute top-0 left-0 w-full">
                <div className="flex items-center justify-between bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6] p-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden">
                            <Image 
                                src={receiver? EscrowBackendConfig.uploadedImagesURL + receiver.image_id : EscrowBackendConfig.uploadedImagesURL + "/default.jpg"}
                                alt="Receiver Photo"
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-small font-regular text-[#DEE4F2]">{receiver? receiver.display_name : "No receiver"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg">
                            <Image 
                                src="/Grmps/video.svg"
                                alt="Call"
                                width={24}
                                height={24}
                            />
                        </div>
                        <div className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg">
                            <Image 
                                src="/Grmps/phone.svg"
                                alt="Call"
                                width={24}
                                height={24}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="flex-1 overflow-y-auto pt-18">
                    <div className="p-4 pr-1 space-y-2 min-h-[calc(100vh-19.5rem)] bg-[#2F3DF633]">
                        <div 
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto min-h-[calc(100vh-19.5rem)] max-h-[calc(100vh-19.5rem)] decorate-scrollbar"
                        >
                            {messages && messages.length && messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                    message.sender_id === sender.id ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div className="flex flex-col max-w-[80%]">
                                        <span
                                            className={`text-xs text-gray-400 mb-0.5 ${
                                            message.sender_id === sender.id ? "text-right" : "text-left"
                                            }`}
                                        >
                                            {message.sender_id === sender.id ? sender.display_name : receiver? receiver.display_name : "No receiver"}
                                        </span>
                                        <div
                                            className={`py-2 px-3 rounded-lg ${
                                            message.sender_id === sender.id
                                                ? "bg-linear-to-r from-emerald-600 to-emerald-700"
                                                : "bg-linear-to-r from-indigo-600 to-indigo-700"
                                            } text-white text-sm`}
                                        >
                                            {message.body_text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex-none bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6] border border-[#32475B] rounded-xl p-1.5">
                            <form 
                                onSubmit={
                                    (e) => {
                                        e.preventDefault();
                                        if (newMessage.trim()) {
                                            handleSubmitMessage(e);
                                        }
                                    }
                                }
                                noValidate
                            >
                                {/* {charError && (
                                    <span className="text-xs text-red-500">
                                        Message must be 50 characters or less
                                    </span>
                                )} */}
                                <div className="flex justify-between items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleMessageChange}
                                        placeholder="Send a message..."
                                        // maxLength={CHARACTER_LIMIT}
                                        // disabled={!selectedSide}
                                        className={`px-4 py-2 text-[#DEE4F2] w-full max-w-70% focus:outline-none ${charError ? 'border-red-500' : ''}`}
                                    />
                                    <div className="flex items-center gap-5">
                                        <div>
                                            <Image 
                                                src="/Grmps/paperclip.svg"
                                                alt="Paperclip"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <Image 
                                                src="/Grmps/face-smile.svg"
                                                alt="Smile"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="p-2.5 cursor-pointer bg-[#7E3FF2]"                                    
                                        >
                                            <Image 
                                                src="/Grmps/send.svg"
                                                alt="Send"
                                                width={24}
                                                height={24}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatMain