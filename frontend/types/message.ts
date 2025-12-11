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

export interface MessageReceipt {
    id: string;
    message_id: string;
    user_id: string;
    state: ReadState;
    created_at: Date;
}

export type ReadState = 'sent' | 'delivered' | 'read';

export interface MessageInfo {
    message: Message;
    messageReceipt: MessageReceipt[];
}

export interface MessageContextType {
    messagesInfo: MessageInfo[];
    setMessagesInfo: React.Dispatch<React.SetStateAction<MessageInfo[]>>;
    messagesError: string;
    setMessagesError: React.Dispatch<React.SetStateAction<string>>;
}