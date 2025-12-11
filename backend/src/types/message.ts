export interface newMessageParam {
    user_id: string;
    conversation_id: string;
    kind: msg_type;
    body_text?: string;
    attachment_id?: string;
    reply_to_msg_id?: string;
    created_at: Date;
}

export enum msg_type {
    text = "text",
    image = "image",
    file = "file",
    system = "system",
}