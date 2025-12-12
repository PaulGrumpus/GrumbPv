import { User } from "@/types/user";
import { Job } from "@/types/jobs";
import ChatMain from "./chatMain";
import ChatProjectInfo from "./chatProjectInfo";
import ChatUserInfo from "./chatUserInfo";
import { Message } from "@/types/message";

interface ChatCombProps {
    sender: User;
    receiver: User | null;
    job: Job | null;
    conversation_id: string;
    clientName: string;
    acceptHandler: (conversation_id: string) => void;
    messages: Message[];
    isWriting: boolean;
    onSendMessage: (message: Message) => void;
    onWritingMessage: (conversation_id: string) => void;
    onStopWritingMessage: (conversation_id: string) => void;
}

const ChatComb = ({ sender, receiver, job, conversation_id, clientName, acceptHandler, messages, isWriting, onSendMessage, onWritingMessage, onStopWritingMessage }: ChatCombProps) => {
    return (
        <div className="flex">
            <div className="flex-1 w-[70%]">
                <ChatMain 
                    conversation_id={conversation_id}
                    sender={sender} 
                    receiver={receiver} 
                    messages={messages} 
                    isWriting={isWriting}
                    onSendMessage={onSendMessage}
                    onWritingMessage={onWritingMessage}
                    onStopWritingMessage={onStopWritingMessage}
                />
            </div>
            <div className="flex-end max-w-[30%]">
                <div className="flex flex-col gap-4.25 px-3.5 max-h-[calc(100vh-10rem)] overflow-y-auto hide-scrollbar">
                    <ChatUserInfo 
                        user={receiver} 
                    />
                    <ChatProjectInfo 
                        job={job} 
                        clientName={job? clientName : "No client name"} 
                        acceptHandler={() => acceptHandler(conversation_id)} 
                    />
                </div>
            </div>
        </div>
    )
}

export default ChatComb