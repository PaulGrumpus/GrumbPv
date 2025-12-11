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
    isWriting: boolean;
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
    onWritingMessage: (conversation_id: string) => void;
    onStopWritingMessage: (conversation_id: string) => void;
}

const ChatMain = ({sender, receiver, messages, conversation_id, isWriting, onSendMessage, onEditMessage, onDeleteMessage, onReadMessage, onUnreadMessage, onPinMessage, onUnpinMessage, onReplyToMessage, onForwardMessage, onSaveMessage, onPhoneCall, onVideoCall, onWritingMessage, onStopWritingMessage }: ChatMainProps) => {

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaWrapperRef = useRef<HTMLDivElement>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef<number>(0);
    const prevTextareaHeightRef = useRef<number>(0);
    const initialTextareaHeightRef = useRef<number>(0);
    const initialMessagesContainerMaxHeightRef = useRef<number>(0);
    const stopWritingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const prevMessageRef = useRef<string>('');
    
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

    useEffect(() => {
        // Set initial wrapper height and messages container max-height
        if (textareaRef.current && textareaWrapperRef.current && messagesContainerRef.current) {
            const initialHeight = textareaRef.current.scrollHeight;
            textareaWrapperRef.current.style.height = `${initialHeight}px`;
            prevTextareaHeightRef.current = initialHeight;
            initialTextareaHeightRef.current = initialHeight;
            
            // Store initial height of messages container (use clientHeight for the visible area)
            initialMessagesContainerMaxHeightRef.current = messagesContainerRef.current.clientHeight;
        }
    }, []);

    useEffect(() => {
        // Reset textarea and wrapper height when message is cleared
        if (newMessage === '' && textareaRef.current && textareaWrapperRef.current && messagesContainerRef.current) {
            textareaRef.current.style.height = 'auto';
            const resetHeight = textareaRef.current.scrollHeight;
            textareaWrapperRef.current.style.height = `${resetHeight}px`;
            
            // Restore messages container to original max-height and min-height
            messagesContainerRef.current.style.maxHeight = `${initialMessagesContainerMaxHeightRef.current}px`;
            messagesContainerRef.current.style.minHeight = `${initialMessagesContainerMaxHeightRef.current}px`;
            
            prevTextareaHeightRef.current = resetHeight;
            initialTextareaHeightRef.current = resetHeight;
            
            // Clear stop writing timeout and emit stop signal when message is cleared (but not on initial mount)
            if (prevMessageRef.current !== '') {
                if (stopWritingTimeoutRef.current) {
                    clearTimeout(stopWritingTimeoutRef.current);
                    stopWritingTimeoutRef.current = null;
                }
                if (onStopWritingMessage && conversation_id && sender?.id) {
                    onStopWritingMessage(conversation_id);
                }
            }
        }
        prevMessageRef.current = newMessage;
    }, [newMessage, conversation_id, sender.id, onStopWritingMessage]);

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (stopWritingTimeoutRef.current) {
                clearTimeout(stopWritingTimeoutRef.current);
                stopWritingTimeoutRef.current = null;
            }
        };
    }, []);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const message = e.target.value;
    
        // setCharError(message.length > CHARACTER_LIMIT);
        setNewMessage(message);
        
        // Clear existing timeout if user is still typing
        if (stopWritingTimeoutRef.current) {
            clearTimeout(stopWritingTimeoutRef.current);
            stopWritingTimeoutRef.current = null;
        }
        
        // Emit writing signal immediately when user types
        if (onWritingMessage && conversation_id && sender?.id) {
            onWritingMessage(conversation_id);
        }
        
        // Set timeout to emit stop writing signal after 3 seconds of inactivity
        if (onStopWritingMessage && conversation_id && sender?.id) {
            stopWritingTimeoutRef.current = setTimeout(() => {
                onStopWritingMessage(conversation_id);
                stopWritingTimeoutRef.current = null;
            }, 3000);
        }
        
        // Auto-resize textarea and adjust messages container (Discord-like behavior)
        if (textareaRef.current && textareaWrapperRef.current && messagesContainerRef.current) {
            // Store current scroll position
            const wasAtBottom = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop - messagesContainerRef.current.clientHeight < 10;
            
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
            
            // Set wrapper height
            textareaWrapperRef.current.style.height = `${newHeight}px`;
            
            // Calculate total height increase from initial height
            const totalHeightIncrease = newHeight - initialTextareaHeightRef.current;
            
            // Shrink messages container by the total height increase to keep last message visible
            // This makes the messages area shrink as textarea grows, like Discord
            const newMaxHeight = Math.max(100, initialMessagesContainerMaxHeightRef.current - totalHeightIncrease);
            messagesContainerRef.current.style.maxHeight = `${newMaxHeight}px`;
            messagesContainerRef.current.style.minHeight = `${newMaxHeight}px`;
            
            // Maintain scroll position - if was at bottom, stay at bottom
            if (wasAtBottom) {
                requestAnimationFrame(() => {
                    if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                    }
                });
            }
            
            prevTextareaHeightRef.current = newHeight;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage.trim()) {
                handleSubmitMessage(e as any);
            }
        }
    };

    const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim()) {
            // Clear stop writing timeout and emit stop signal when message is sent
            if (stopWritingTimeoutRef.current) {
                clearTimeout(stopWritingTimeoutRef.current);
                stopWritingTimeoutRef.current = null;
            }
            if (onStopWritingMessage && conversation_id) {
                onStopWritingMessage(conversation_id);
            }
            
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
                        <div className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg hover:bg-[#6E35E0] transition-colors duration-150 hover:scale-90">
                            <Image 
                                src="/Grmps/video.svg"
                                alt="Call"
                                width={24}
                                height={24}
                            />
                        </div>
                        <div className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg hover:bg-[#6E35E0] transition-colors duration-150 hover:scale-90">
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
                            className="flex-1 overflow-y-auto min-h-[calc(100vh-19.5rem)] max-h-[calc(100vh-19.5rem)] decorate-scrollbar pb-2"
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
                                            className={`py-2 px-3 rounded-lg wrap-break-word whitespace-pre-wrap ${
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

                        {isWriting && (
                            <div className="flex justify-start items-center py-1 max-h-2">
                                <p className="text-xs text-gray-400">{receiver? receiver.display_name : "No receiver"} is typing...</p>
                                <div className="flex items-center gap-1.5 px-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }}></div>
                                </div>
                                
                            </div>
                        )}

                        {!isWriting && <div className="h-2 py-1"></div>}
                        
                        <div 
                            ref={formContainerRef}
                            className="flex-none bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6] border border-[#32475B] rounded-xl p-1.5 mr-3"
                        >
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
                                <div className="flex justify-between items-end gap-2">
                                    <div 
                                        ref={textareaWrapperRef}
                                        className="w-full max-w-70% flex-1"
                                    >
                                        <textarea
                                            ref={textareaRef}
                                            value={newMessage}
                                            onChange={handleMessageChange}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Send a message..."
                                            rows={1}
                                            // maxLength={CHARACTER_LIMIT}
                                            // disabled={!selectedSide}
                                            className={`px-4 py-2 text-[#DEE4F2] w-full focus:outline-none resize-none overflow-hidden wrap-break-word whitespace-pre-wrap ${charError ? 'border-red-500' : ''}`}
                                            style={{ maxHeight: '200px' }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-5 shrink-0">
                                        <button className="hover:scale-90 transition-transform duration-150">
                                            <Image 
                                                src="/Grmps/paperclip.svg"
                                                alt="Paperclip"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </button>
                                        <button className="hover:scale-90 transition-transform duration-150">
                                            <Image 
                                                src="/Grmps/face-smile.svg"
                                                alt="Smile"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </button>
                                        <button
                                            type="submit"
                                            className="p-2.5 cursor-pointer bg-[#7E3FF2] rounded-lg hover:bg-[#6E35E0] transition-colors duration-150 hover:scale-90"                                    
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