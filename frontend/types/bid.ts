export interface Bid {
    id?: string;
    job_id: string;
    freelancer_id: string;
    cover_letter_md?: string;
    bid_amount: number;
    token_symbol: string;
    period?: number;
    status: BidStatus;
    created_at?: number;
    updated_at?: number;
}

export enum BidStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    WITHDRAWN = "withdrawn",
}

export interface BidPostProps {
    job_description: string;
    job_title: string;
    job_location?: string; 
    job_tags?: string[];  
    job_deadline?: number | string | undefined;
    job_max_budget: number;
    job_min_budget: number;
    bid_id?: string;
    bid_cover_letter: string;
    bid_amount: number;
    currency: string;
    bid_status: BidStatus; 
}
