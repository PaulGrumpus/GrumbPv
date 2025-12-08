export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    kind: MessageKind;
    body_text?: string;
    attachment_id?: string;
    reply_to_msg_id?: string;
    created_at: Date;
    edited_at?: Date;
    deleted_at?: Date;
}

export type MessageKind = 'text' | 'image' | 'file' | 'system';