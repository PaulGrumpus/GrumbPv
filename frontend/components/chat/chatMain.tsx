'use client';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import { Message } from "@/types/message";
import { EscrowBackendConfig } from "@/config/config";

interface ChatMainProps {
    sender: User;
    receiver: User;
    messages: Message[];
    onSendMessage: (message: Message) => void;
    onEditMessage: (message: Message) => void;
    onDeleteMessage: (message: Message) => void;
    onReadMessage: (message: Message) => void;
    onUnreadMessage: (message: Message) => void;
    onPinMessage: (message: Message) => void;
    onUnpinMessage: (message: Message) => void;
    onReplyToMessage: (message: Message) => void;
    onForwardMessage: (message: Message) => void;
    onSaveMessage: (message: Message) => void;
    onPhoneCall: () => void;
    onVideoCall: () => void;
}

const ChatMain = ({sender, receiver, messages, onSendMessage, onEditMessage, onDeleteMessage, onReadMessage, onUnreadMessage, onPinMessage, onUnpinMessage, onReplyToMessage, onForwardMessage, onSaveMessage, onPhoneCall, onVideoCall }: ChatMainProps) => {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    const [newMessage, setNewMessage] = useState("");
    const [charError, setCharError] = useState(false);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSendMessage(messages[messages.length - 1]);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const message = e.target.value;
    
        // setCharError(message.length > CHARACTER_LIMIT);
        setNewMessage(message);
    };

    return (
        <div className="relative">
            <div className="fixed top-0 left-0 w-full h-full">
                <div className="flex items-center justify-center bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6]">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden">
                            <Image 
                                src={EscrowBackendConfig.uploadedImagesURL + receiver.image_id}
                                alt="Receiver Photo"
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-small font-regular text-[#DEE4F2]">{receiver.display_name}</p>
                    </div>
                    <div>
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
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-2">
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
                                        {message.sender_id === sender.id ? sender.display_name : receiver.display_name}
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

                    <div className="flex-none bg-gray-900 border-t border-gray-800">
                        <form 
                            onSubmit={
                                (e) => {
                                    e.preventDefault(); // Add this to the form
                                    // ... rest of your submit handler
                                    handleSubmitMessage(e);
                                }
                            }
                            className="p-4"
                        >
                            <div className="flex flex-col gap-2">
                                {/* {charError && (
                                    <span className="text-xs text-red-500">
                                        Message must be 50 characters or less
                                    </span>
                                )} */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleMessageChange}
                                        placeholder="Chat here (50 characters or less)..."
                                        // maxLength={CHARACTER_LIMIT}
                                        // disabled={!selectedSide}
                                        className={`grow px-4 py-2 bg-gray-800 border border-gray-700 
                                                rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                                                text-gray-100 placeholder-gray-500 disabled:opacity-50
                                                disabled:cursor-not-allowed 
                                                ${charError ? 'border-red-500' : ''}`
                                            }
                                    />
                                    <button
                                        type="submit"
                                        // disabled={!selectedSide || charError}
                                        className="px-6 bg-linear-to-r from-indigo-600 to-emerald-600 
                                                text-white rounded-lg hover:from-indigo-700 hover:to-emerald-700 
                                                transform hover:scale-[1.02] transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                disabled:transform-none"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

