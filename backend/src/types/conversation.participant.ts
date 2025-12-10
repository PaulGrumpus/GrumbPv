export interface newConversationParticipantParam {
    conversation_id: string;
    user_id: string;
    is_muted: boolean;
    blocked_until?: Date;
    is_pinned: boolean;
    last_read_msg_id?: string;
}