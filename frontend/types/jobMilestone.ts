export type JobMilestone = {  
    id?: string
    job_id?: string
    title?: string
    amount?: number | string
    due_at?: Date | string
    order_index?: number
    status?: string
    created_at?: Date | string
    token_symbol?: string
    escrow?: string
    ipfs?: string
    updated_at?: Date | string
    freelancer_id?: string
  }