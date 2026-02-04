'use client';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User } from "@/types/user";
import { Message } from "@/types/message";
import { EscrowBackendConfig } from "@/config/config";
import { ChevronRightIcon, ArrowDownTrayIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { formatLabel, formatHourMinute, uploadFile } from "@/utils/functions";

const FILE_NAME_MARKER = '__FILE_NAME__:';
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (matches backend multer limit)
const MAX_FILE_SIZE_LABEL = '100 MB';

// Parse body_text: extract url, optional caption, optional original filename (for file messages).
function parseMessageBody(bodyText: string | undefined): { type: 'image' | 'file' | 'text'; url?: string; caption?: string; originalFilename?: string } {
    if (!bodyText || !bodyText.trim()) return { type: 'text' };
    const trimmed = bodyText.trim();
    const lines = trimmed.split(/\r?\n/);
    let originalFilename: string | undefined;
    const restLines: string[] = [];
    for (const line of lines) {
        if (line.startsWith(FILE_NAME_MARKER)) {
            originalFilename = line.slice(FILE_NAME_MARKER.length).trim() || undefined;
        } else {
            restLines.push(line);
        }
    }
    const rest = restLines.join('\n').trim();
    const urlMatch = rest.match(/(https?:\/\/[^\s]+|\/(?:backend\/)?uploads\/[^\s]+)/i);
    const url = urlMatch ? urlMatch[1].replace(/[\s\n]+$/, '') : null;
    const caption = url ? rest.replace(url, '').replace(/\n+$/, '').trim() : rest || undefined;

    if (url) {
        const lower = url.toLowerCase();
        const isImage = /\/uploads\/images\//.test(lower) || /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url);
        const isUploadFile = /\/uploads\//.test(lower) || /\/backend\/uploads\//.test(lower);
        if (isImage) return { type: 'image', url, caption: caption || undefined };
        if (isUploadFile) return { type: 'file', url, caption: caption || undefined, originalFilename };
    }
    return { type: 'text', caption: trimmed || undefined };
}

// Extensions aligned with backend fileUpload (videos, images, docs, sounds)
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|avi|wmv)$/i;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|aac|m4a|ogg|webm)$/i;
const TEXT_EXTENSIONS = /\.(txt|md|json|csv|log|xml|html|htm|ts|tsx|js|jsx|yml|yaml|env|ini|cfg|conf)$/i;

function getFilePreviewType(filename: string): 'video' | 'audio' | 'image' | 'pdf' | 'text' | 'unsupported' {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (IMAGE_EXTENSIONS.test(lower)) return 'image';
    if (VIDEO_EXTENSIONS.test(lower)) return 'video';
    if (AUDIO_EXTENSIONS.test(lower)) return 'audio';
    if (TEXT_EXTENSIONS.test(lower)) return 'text';
    return 'unsupported';
}

function MessageBubbleContent({ bodyText, bubbleClass }: { bodyText: string | undefined; bubbleClass: string }) {
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [fileViewer, setFileViewer] = useState<{ url: string; filename: string } | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [textLoadError, setTextLoadError] = useState(false);
    const parsed = parseMessageBody(bodyText);

    useEffect(() => {
        if (!lightboxUrl) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxUrl(null);
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [lightboxUrl]);

    useEffect(() => {
        if (!fileViewer) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setFileViewer(null);
        };
        window.addEventListener('keydown', onEscape);
        return () => window.removeEventListener('keydown', onEscape);
    }, [fileViewer]);

    useEffect(() => {
        if (!fileViewer) {
            setTextContent(null);
            setTextLoadError(false);
            return;
        }
        if (getFilePreviewType(fileViewer.filename) !== 'text') return;
        setTextContent(null);
        setTextLoadError(false);
        fetch(fileViewer.url)
            .then((res) => (res.ok ? res.text() : Promise.reject(new Error('Failed to load'))))
            .then(setTextContent)
            .catch(() => setTextLoadError(true));
    }, [fileViewer?.url, fileViewer?.filename]);

    if (parsed.type === 'image' && parsed.url) {
        return (
            <div className={`${bubbleClass} overflow-hidden`}>
                <button
                    type="button"
                    onClick={() => setLightboxUrl(parsed.url!)}
                    className="block max-w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg"
                >
                    <img src={parsed.url} alt="Shared image" className="max-w-full max-h-64 rounded-lg object-contain" />
                </button>
                {parsed.caption && <p className="mt-2 whitespace-pre-wrap wrap-break-word break-all">{parsed.caption}</p>}
                {lightboxUrl && (
                    <div
                        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/85 p-4"
                        onClick={() => setLightboxUrl(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image preview"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <a
                                href={lightboxUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Download image"
                                title="Download"
                            >
                                <ArrowDownTrayIcon className="w-6 h-6" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setLightboxUrl(null)}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label="Close"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <img
                            src={lightboxUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </div>
        );
    }
    if (parsed.type === 'file' && parsed.url) {
        const displayName = parsed.originalFilename || 'Download';

        return (
            <div className={`${bubbleClass} flex items-center gap-3 min-w-0 max-w-full`}>
                <DocumentIcon className="w-8 h-8 shrink-0 text-white/90" />
                <div className="flex-1 min-w-0">
                    {parsed.caption && <p className="whitespace-pre-wrap wrap-break-word break-all text-sm">{parsed.caption}</p>}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 max-w-full">
                        <a
                            href={parsed.url}
                            download={parsed.originalFilename || undefined}
                            rel="noopener noreferrer"
                            className="text-white hover:text-white/90 shrink-0"
                            title="Download"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </a>
                        <button
                            type="button"
                            onClick={() => setFileViewer({ url: parsed.url!, filename: displayName })}
                            className="text-sm font-medium text-white underline hover:text-white/90 text-left break-all whitespace-normal max-w-full"
                            title={`View ${displayName}`}
                        >
                            <span className="break-all">{displayName}</span>
                        </button>
                    </div>
                </div>
                {fileViewer && fileViewer.url === parsed.url && (
                    <div
                        className="fixed inset-0 z-9999 flex flex-col bg-black/90 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-label="File preview"
                        onClick={() => setFileViewer(null)}
                    >
                        <div
                            className="flex flex-1 flex-col min-h-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                        <div className="flex items-center justify-between shrink-0 py-2 border-b border-white/20">
                            <span className="text-sm font-medium text-white truncate max-w-[70%]" title={fileViewer.filename}>
                                {fileViewer.filename}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={fileViewer.url}
                                    download={fileViewer.filename}
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Download"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                </a>
                                <a
                                    href={fileViewer.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-white/90 hover:text-white underline"
                                >
                                    Open in new tab
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setFileViewer(null)}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    aria-label="Close"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 mt-4 rounded-lg overflow-hidden bg-[#1E293B] flex items-center justify-center">
                            {getFilePreviewType(fileViewer.filename) === 'pdf' && (
                                <iframe
                                    src={fileViewer.url}
                                    title={fileViewer.filename}
                                    className="w-full h-full min-h-[60vh] border-0"
                                />
                            )}
                            {getFilePreviewType(fileViewer.filename) === 'image' && (
                                <div className="w-full h-full min-h-[60vh] flex items-center justify-center p-4">
                                    <img
                                        src={fileViewer.url}
                                        alt={fileViewer.filename}
                                        className="max-w-full max-h-full object-contain rounded-lg"
                                    />
                                </div>
                            )}
                            {getFilePreviewType(fileViewer.filename) === 'video' && (
                                <div className="w-full h-full min-h-[60vh] flex items-center justify-center p-4">
                                    <video
                                        src={fileViewer.url}
                                        controls
                                        className="max-w-full max-h-full rounded-lg"
                                        title={fileViewer.filename}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                            {getFilePreviewType(fileViewer.filename) === 'audio' && (
                                <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
                                    <DocumentIcon className="w-20 h-20 text-white/50" />
                                    <p className="text-sm text-white/80 truncate max-w-full" title={fileViewer.filename}>
                                        {fileViewer.filename}
                                    </p>
                                    <audio
                                        src={fileViewer.url}
                                        controls
                                        className="w-full max-w-md"
                                        title={fileViewer.filename}
                                    >
                                        Your browser does not support the audio tag.
                                    </audio>
                                </div>
                            )}
                            {getFilePreviewType(fileViewer.filename) === 'text' && (
                                <div className="w-full h-full min-h-[60vh] overflow-auto p-4">
                                    {textContent === null && !textLoadError && (
                                        <p className="text-white/70">Loading...</p>
                                    )}
                                    {textLoadError && (
                                        <div className="space-y-2">
                                            <p className="text-amber-400">Could not load content (e.g. CORS or network).</p>
                                            <a
                                                href={fileViewer.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white underline"
                                            >
                                                Open in new tab
                                            </a>
                                        </div>
                                    )}
                                    {textContent !== null && (
                                        <pre className="text-sm text-[#E5E7EB] whitespace-pre-wrap font-sans wrap-break-word">
                                            {textContent}
                                        </pre>
                                    )}
                                </div>
                            )}
                            {getFilePreviewType(fileViewer.filename) === 'unsupported' && (
                                <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[40vh] text-white/80">
                                    <DocumentIcon className="w-16 h-16 text-white/50" />
                                    <p>Preview not available for this file type.</p>
                                    <div className="flex gap-3">
                                        <a
                                            href={fileViewer.url}
                                            download={fileViewer.filename}
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-lg bg-[#7E3FF2] hover:bg-[#6E35E0] text-white transition-colors"
                                        >
                                            Download
                                        </a>
                                        <a
                                            href={fileViewer.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
                                        >
                                            Open in new tab
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return <span className="whitespace-pre-wrap wrap-break-word break-all max-w-full">{parsed.caption ?? bodyText}</span>;
}
import { toast } from "react-toastify";

interface ChatMainProps {
    isMobile: boolean;  
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
    onMobileProfileClick: () => void;
    onMobileProjectInfoClick: () => void;
}

const ChatMain = ({isMobile, sender, receiver, messages, conversation_id, isWriting, onSendMessage, onEditMessage, onDeleteMessage, onReadMessage, onUnreadMessage, onPinMessage, onUnpinMessage, onReplyToMessage, onForwardMessage, onSaveMessage, onPhoneCall, onVideoCall, onWritingMessage, onStopWritingMessage, onMobileProfileClick, onMobileProjectInfoClick }: ChatMainProps) => {

    // const messagesEndRef = useRef<HTMLDivElement>(null);
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
    const initialScrollDoneRef = useRef<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
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
        if (!messagesContainerRef.current) return;

        // First visit to this conversation: jump to bottom without smooth effect
        if (!initialScrollDoneRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            initialScrollDoneRef.current = true;
            prevMessagesLengthRef.current = messages.length;
            return;
        }

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
        // Reset scroll state when switching conversations and jump to bottom instantly
        initialScrollDoneRef.current = false;
        prevMessagesLengthRef.current = messages.length;
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [conversation_id]);

    useEffect(() => {
        // Reset textarea and wrapper height when message is cleared
        if (newMessage === '' && textareaRef.current && textareaWrapperRef.current && messagesContainerRef.current) {
            textareaRef.current.style.height = 'auto';
            const resetHeight = textareaRef.current.scrollHeight;
            textareaWrapperRef.current.style.height = `${resetHeight}px`;
            
            // Restore messages container height, accounting for any selected file preview space
            const previewOffset = selectedFile ? 80 : 0; // px reserved for preview bar
            const baseHeight = initialMessagesContainerMaxHeightRef.current - previewOffset;
            const clampedHeight = Math.max(100, baseHeight);
            messagesContainerRef.current.style.maxHeight = `${clampedHeight}px`;
            messagesContainerRef.current.style.minHeight = `${clampedHeight}px`;
            
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
    }, [newMessage, conversation_id, sender.id, onStopWritingMessage, selectedFile]);

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
            const wasAtBottom =
                messagesContainerRef.current.scrollHeight -
                    messagesContainerRef.current.scrollTop -
                    messagesContainerRef.current.clientHeight <
                10;
            
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
            
            // Set wrapper height
            textareaWrapperRef.current.style.height = `${newHeight}px`;
            
            // Calculate total height increase from initial height
            const totalHeightIncrease = newHeight - initialTextareaHeightRef.current;
            
            // Also reserve space for the selected file preview bar if present
            const previewOffset = selectedFile ? 80 : 0; // px reserved for preview bar
            
            // Shrink messages container to keep last message + composer (and preview) visible
            const baseHeight = initialMessagesContainerMaxHeightRef.current - totalHeightIncrease - previewOffset;
            const newMaxHeight = Math.max(100, baseHeight);
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

    const sendMessage = async () => {
        const hasText = newMessage.trim().length > 0;
        const hasFile = !!selectedFile;
        if (!hasText && !hasFile) return;

        // Clear stop writing timeout and emit stop signal when message is sent
        if (stopWritingTimeoutRef.current) {
            clearTimeout(stopWritingTimeoutRef.current);
            stopWritingTimeoutRef.current = null;
        }
        if (onStopWritingMessage && conversation_id) {
            onStopWritingMessage(conversation_id);
        }

        let body = newMessage.trim();
        let kind: Message["kind"] = "text";

        if (hasFile && selectedFile) {
            try {
                const result = await uploadFile(selectedFile);
                if (!result.success) {
                    toast.error(result.error as string, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                    return;
                }
                const fileUrl = result.data.url as string;
                const originalFilename = (result.data as { original_filename?: string }).original_filename ?? selectedFile.name;

                if (body) {
                    body = `${body}\n${fileUrl}`;
                } else {
                    body = fileUrl;
                }
                // For non-image files, append original filename so the bubble can show it instead of "Download"
                if (!selectedFile.type.startsWith("image/")) {
                    body = `${body}\n${FILE_NAME_MARKER}${originalFilename}`;
                }

                kind = selectedFile.type.startsWith("image/") ? "image" : "file";
            } catch (error: any) {
                toast.error(error?.message || "Failed to upload file", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                return;
            }
        }

        if (!body) return;

        onSendMessage(
            {
                conversation_id,
                body_text: body,
                sender_id: sender.id,
                kind,
            } as Message
        );

        setNewMessage("");
        setSelectedFile(null);
        setUploadedFileName("");
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage.trim() || selectedFile) {
                void sendMessage();
            }
        }
    };

    const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() || selectedFile) {
            void sendMessage();
        }
    };

    const handleUploadFile = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*/*";
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (!file) {
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                return;
            }
            setSelectedFile(file);
            setUploadedFileName(file.name);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            } else {
                setPreviewUrl(null);
            }

            toast.success(`Selected ${file.name}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        };
        fileInput.click();
    }

    return (
        <div className="relative">
            <div className="absolute top-0 left-0 w-full">
                <div className="flex items-center justify-between bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6] p-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image 
                                src={receiver? EscrowBackendConfig.uploadedImagesURL + receiver.image_id : EscrowBackendConfig.uploadedImagesURL + "/default.jpg"}
                                alt="Receiver Photo"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-small font-regular text-[#DEE4F2]">{receiver?.display_name || formatLabel(receiver?.email ?? "") || formatLabel(receiver?.address ?? "") || "No receiver"}</p>
                        {isMobile && (
                            <ChevronRightIcon onClick={onMobileProfileClick} className="w-6 h-6 text-white cursor-pointer" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isMobile && (
                            <div 
                                onClick={onMobileProjectInfoClick}
                                className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg hover:bg-[#6E35E0] transition-colors duration-150 hover:scale-90"
                            >
                                <Image 
                                    src="/Grmps/docs.svg"
                                    alt="Docs"
                                    width={24}
                                    height={24}
                                />
                            </div>
                        )}
                        {/* <div className="w-10 h-10 p-2 bg-[#7E3FF2] rounded-lg hover:bg-[#6E35E0] transition-colors duration-150 hover:scale-90">
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
                        </div> */}
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
                            {messages?.length ? messages.map((message, index) => {
                                // Check if this is the last message in a sequence from the same sender
                                const isLastInSequence = index === messages.length - 1 || 
                                    messages[index + 1]?.sender_id !== message.sender_id;
                                
                                // Get receipt status for sender's messages
                                const getMessageStatus = () => {
                                    if (message.sender_id !== sender.id || !message.receipts || !receiver) {
                                        return null;
                                    }
                                    // Find all receipts for the receiver
                                    const receiverReceipts = message.receipts.filter(receipt => receipt.user_id === receiver.id);
                                    if (!receiverReceipts || receiverReceipts.length === 0) {
                                        return 'sent';
                                    }
                                    // Get the highest state (read > delivered > sent)
                                    const states = receiverReceipts.map(r => r.state);
                                    if (states.includes('read')) return 'read';
                                    if (states.includes('delivered')) return 'delivered';
                                    return 'sent';
                                };

                                const messageStatus = getMessageStatus();
                                
                                return (
                                    <div
                                        key={index}
                                        className={`flex py-1 ${
                                        message.sender_id === sender.id ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div className="flex flex-col max-w-[80%]">
                                            {message.sender_id === sender.id ? (
                                                <div className="flex items-end gap-2">
                                                    <div className="flex flex-col">

                                                        <div className="flex items-center justify-end gap-1 mt-2">
                                                            <span className="text-xs text-[#8F99AF]">
                                                                {formatHourMinute(message.created_at.toString())}
                                                            </span>
                                                            {messageStatus && (
                                                                <Image
                                                                    src={messageStatus === 'sent' ? "/Grmps/sent.svg" : "/Grmps/received.svg"}
                                                                    alt={messageStatus === 'sent' ? "Sent" : messageStatus === 'delivered' ? "Delivered" : "Read"}
                                                                    width={16}
                                                                    height={16}
                                                                    className="ml-1"
                                                                />
                                                            )}
                                                        </div>
                                                        <div
                                                            className={`py-4 px-5 rounded-[1.125rem] wrap-break-word break-all whitespace-pre-wrap max-w-full overflow-hidden text-white text-sm ${
                                                            message.sender_id === sender.id
                                                                ? "bg-[#2F3DF6]"
                                                                : "bg-[#7E3FF2]"
                                                            } ${isLastInSequence ? "chat-bubble-sender" : ""}`}
                                                        >
                                                            <MessageBubbleContent
                                                                bodyText={message.body_text}
                                                                bubbleClass=""
                                                            />
                                                        </div>
                                                    </div>
                                                    {isLastInSequence ? (
                                                        <div className="min-w-9 w-9 h-9 rounded-full overflow-hidden">
                                                            <Image 
                                                                src={EscrowBackendConfig.uploadedImagesURL + sender.image_id}
                                                                alt="Sender Photo"
                                                                width={36}
                                                                height={36}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-9 w-9 h-9"></div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-end gap-2">
                                                    {isLastInSequence ? (
                                                        <div className="min-w-9 w-9 h-9 rounded-full overflow-hidden">
                                                            <Image 
                                                                src={EscrowBackendConfig.uploadedImagesURL + receiver?.image_id || EscrowBackendConfig.uploadedImagesURL + "/default.jpg"}
                                                                alt="Receiver Photo"
                                                                width={36}
                                                                height={36}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="min-w-9 w-9 h-9"></div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-[#8F99AF]">
                                                            {formatHourMinute(message.created_at.toString())}
                                                        </span>
                                                        <div
                                                            className={`py-4 px-5 rounded-[1.125rem] wrap-break-word break-all whitespace-pre-wrap max-w-full overflow-hidden text-white text-sm ${
                                                            message.sender_id === sender.id
                                                                ? "bg-[#2F3DF6]"
                                                                : "bg-[#7E3FF2]"
                                                            } ${isLastInSequence ? "chat-bubble-receiver" : ""}`}
                                                        >
                                                            <MessageBubbleContent
                                                                bodyText={message.body_text}
                                                                bubbleClass=""
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : null}
                            
                            {/* <div ref={messagesEndRef} /> */}
                        </div>

                        {isWriting && (
                            <div className="flex justify-start items-center py-1 max-h-2">
                                <p className="text-xs text-gray-400">{receiver? receiver.display_name ?? receiver.role : "No receiver"} is typing...</p>
                                <div className="flex items-center gap-1.5 px-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '200ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" style={{ animationDelay: '400ms' }}></div>
                                </div>
                                
                            </div>
                        )}

                        {!isWriting && <div className="h-2 py-1"></div>}
                        
                        {selectedFile && (
                            <div className="mr-3 mb-2 flex items-center gap-3 bg-[#1E293B] border border-[#32475B] rounded-lg p-2">
                                {previewUrl && (
                                    // Use native img for blob preview to avoid Next Image domain issues
                                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0">
                                        <img
                                            src={previewUrl}
                                            alt={uploadedFileName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                {!previewUrl && (
                                    <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#334155] text-xs text-[#E5E7EB] shrink-0">
                                        FILE
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#E5E7EB] truncate max-w-full">
                                        {uploadedFileName}
                                    </p>
                                    <p className="text-[10px] text-[#9CA3AF]">
                                        This file will be uploaded and sent as a link. Max {MAX_FILE_SIZE_LABEL}.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setUploadedFileName("");
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl);
                                            setPreviewUrl(null);
                                        }
                                    }}
                                    className="text-xs text-[#F97373] hover:text-[#FCA5A5] px-2 py-1 rounded-md border border-transparent hover:border-[#FCA5A5]"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <div
                            ref={formContainerRef}
                            className="flex-none bg-linear-to-r from-[#7E3FF2] to-[#2F3DF6] border border-[#32475B] rounded-xl p-1.5 mr-3"
                        >
                            <form 
                                onSubmit={handleSubmitMessage}
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
                                        <button
                                            type="button"
                                            title={`Attach file (max ${MAX_FILE_SIZE_LABEL})`}
                                            className="hover:scale-90 transition-transform duration-150"
                                            onClick={handleUploadFile}
                                        >
                                            <Image 
                                                src="/Grmps/paperclip.svg"
                                                alt="Paperclip"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </button>
                                        {/* <button className="hover:scale-90 transition-transform duration-150">
                                            <Image 
                                                src="/Grmps/face-smile.svg"
                                                alt="Smile"
                                                width={24}
                                                height={24}
                                                className="cursor-pointer"
                                            />
                                        </button> */}
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