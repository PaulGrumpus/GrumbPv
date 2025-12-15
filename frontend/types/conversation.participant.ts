export interface ConversationParticipant {
    id: string;
    conversation_id: string;
    user_id: string;
    is_muted?: boolean;
    blocked_until?: string;
    is_pinned?: boolean;
    last_read_msg_id?: string;
}