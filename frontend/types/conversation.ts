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