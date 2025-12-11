'use client';

import { 
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { UserLoadingCtx } from "./userLoadingContext";
import { MessageContextType, MessageInfo } from "@/types/message";
import { getAllMessagesByConversationIds } from "@/utils/functions";
import { MessageLoadingCtx } from "./messageLoadingContext";
import { ConversationLoadingCtx } from "./conversationLoadingContext";
import { ConversationsInfoCtx } from "./conversationsContext";

const defaultProvider: MessageContextType = {
    messagesInfo: [],
    setMessagesInfo: () => {},
    messagesError: '',
    setMessagesError: () => {}
}

const MessagesInfoCtx = createContext<MessageContextType>(defaultProvider);

type Props = {
    children: ReactNode;
}

const MessagesInfoProvider = ({ children }: Props) => {
    const [messagesInfo, setMessagesInfo] = useState<MessageInfo[]>(defaultProvider.messagesInfo);
    const [messagesError, setMessagesError] = useState<string>(defaultProvider.messagesError);
    const { conversationsInfo } = useContext(ConversationsInfoCtx);
    const { conversationLoadingState, setconversationLoadingState } = useContext(ConversationLoadingCtx);
    const { setmessageLoadingState } = useContext(MessageLoadingCtx);

    const init = async () => {
        if(conversationLoadingState === "success") {
            setconversationLoadingState("pending");
            const messages = await getAllMessagesByConversationIds(conversationsInfo.map(conversation => conversation.conversation.id));
            if(messages.success) {
                setMessagesInfo(messages.data ?? []);
                setmessageLoadingState("success");
            } else {
                setMessagesError(messages.error as string);
                setmessageLoadingState("failure");
            }
        } else {
            setmessageLoadingState("pending");
        }
    }

    useEffect(() => {
        init();
    }, [conversationLoadingState]);

    return (
        <MessagesInfoCtx.Provider value={{ messagesInfo, setMessagesInfo, messagesError, setMessagesError }}>
            {children}
        </MessagesInfoCtx.Provider>
    )
}

export {MessagesInfoCtx, MessagesInfoProvider};