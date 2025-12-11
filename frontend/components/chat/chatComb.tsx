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
    clientName: string;
    acceptHandler: () => void;
    messages: Message[];
    onSendMessage: (message: Message) => void;
}

const ChatComb = ({ sender, receiver, job, clientName, acceptHandler, messages, onSendMessage }: ChatCombProps) => {
    return (
        <div className="flex">
            <div className="flex-1 w-[70%]">
                <ChatMain 
                    sender={sender} 
                    receiver={receiver} 
                    messages={messages} 
                    onSendMessage={onSendMessage}
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
                        acceptHandler={acceptHandler} 
                    />
                </div>
            </div>
        </div>
    )
}

export default ChatComb