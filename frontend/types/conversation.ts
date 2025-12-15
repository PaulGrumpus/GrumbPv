import { ConversationParticipant } from "./conversation.participant";
import { Gig } from "./gigs";
import { Job } from "./jobs";
import { User } from "./user";

export interface Conversation {
    type: convo_type;
    job_application_doc_id?: string;
    id: string;
    job_id?: string;
    created_at: string;
    escrow?: string;
    gig_id?: string;
}

export enum convo_type {
    dm = "dm",
}

export interface ConversationInfo {
    conversation: Conversation;
    participants: ConversationParticipant[];
    clientInfo: User;
    freelancerInfo: User | null;
    jobInfo: Job | null;
    gigInfo: Gig | null;
}   

export interface ConversationInfoContextType {
    conversationsInfo: ConversationInfo[];
    setConversationsInfo: React.Dispatch<React.SetStateAction<ConversationInfo[]>>;
    conversationsError: string;
    setConversationsError: React.Dispatch<React.SetStateAction<string>>;
}