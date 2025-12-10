export interface newConversationParam {
    type: convo_type;
    job_id?: string;
    created_at: Date;
    escrow?: string;
    gig_id?: string;
}

export enum convo_type {
    dm = "dm",
}