export interface Bid {
    id?: string;
    job_id: string;
    freelancer_id: string;
    cover_letter_md?: string;
    bid_amount: number;
    token_symbol: string;
    status: BidStatus;
    created_at?: number;
    updated_at?: number;
}

export enum BidStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    WITHDRAWN = "withdrawn",
}