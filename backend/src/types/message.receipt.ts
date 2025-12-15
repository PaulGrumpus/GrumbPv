import { read_state } from "@prisma/client";

export interface newMessageReceiptParam {
    message_id: string;
    user_id: string;
    state: read_state;
}