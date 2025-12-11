'use client';

import { 
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { ConversationInfoContextType, ConversationInfo } from "@/types/conversation";
import { UserLoadingCtx } from "./userLoadingContext";
import { getConversationByParticipant } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";
import { ConversationLoadingCtx } from "./conversationLoadingContext";

const defaultProvider: ConversationInfoContextType = {
    conversationsInfo: [],
    setConversationsInfo: () => {},
    conversationsError: '',
    setConversationsError: () => {}
}

const ConversationsInfoCtx = createContext<ConversationInfoContextType>(defaultProvider);

type Props = {
    children: ReactNode;
}

const ConversationsInfoProvider = ({ children }: Props) => {
    const [conversationsInfo, setConversationsInfo] = useState<ConversationInfo[]>(defaultProvider.conversationsInfo);
    const [conversationsError, setConversationsError] = useState<string>(defaultProvider.conversationsError);
    const { userInfo } = useContext(UserInfoCtx);
    const { userLoadingState } = useContext(UserLoadingCtx);
    const { conversationLoadingState, setconversationLoadingState } = useContext(ConversationLoadingCtx);

    const init = async () => {
        if(userLoadingState === "success") {
            setconversationLoadingState("pending");
            const conversations = await getConversationByParticipant(userInfo.id);
            if(conversations.success) {
                setConversationsInfo(conversations.data ?? []);
                setconversationLoadingState("success");
            } else {
                setConversationsError(conversations.error as string);
                setconversationLoadingState("failure");
            }
        } else {
            setconversationLoadingState("pending");
        }
    }

    useEffect(() => {
        init();
    }, [userLoadingState]);

    return (
        <ConversationsInfoCtx.Provider value={{ conversationsInfo, setConversationsInfo, conversationsError, setConversationsError }}>
            {children}
        </ConversationsInfoCtx.Provider>
    )
}

export {ConversationsInfoCtx, ConversationsInfoProvider};