'use client';

import { 
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { ConversationInfoContextType, Conversations } from "@/types/conversation";
import { LoadingCtx } from "./loadingContext";
import { getConversationByParticipant } from "@/utils/functions";
import { UserInfoCtx } from "./userContext";

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
    const [conversationsInfo, setConversationsInfo] = useState<Conversations[]>(defaultProvider.conversationsInfo);
    const [conversationsError, setConversationsError] = useState<string>(defaultProvider.conversationsError);
    const { userInfo } = useContext(UserInfoCtx);
    const { setLoadingState } = useContext(LoadingCtx);

    const init = async () => {
        setLoadingState("pending");
        const conversations = await getConversationByParticipant(userInfo.id);
        if(conversations.success) {
            setConversationsInfo(conversations.data ?? []);
            setLoadingState("success");
        } else {
            setConversationsError(conversations.error as string);
            setLoadingState("failure");
        }
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <ConversationsInfoCtx.Provider value={{ conversationsInfo, setConversationsInfo, conversationsError, setConversationsError }}>
            {children}
        </ConversationsInfoCtx.Provider>
    )
}

export {ConversationsInfoCtx, ConversationsInfoProvider};