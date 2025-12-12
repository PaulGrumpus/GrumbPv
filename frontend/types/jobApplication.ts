export interface JobApplication {
    id?: string;
    job_id: string;
    client_id: string;
    freelancer_id: string;
    client_confirm: boolean;
    freelancer_confirm: boolean;
    deliverables?: string;
    out_of_scope?: string;
    budget?: number;
    token_symbol?: string;
    start_date?: string;
    end_date?: string;
    created_at?: number;
    updated_at?: number;
}