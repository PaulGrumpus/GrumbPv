export interface Gig {
    id?: string
    freelancer_id: string
    title: string
    description_md: string
    budget_min?: number
    budget_max?: number
    token_symbol?: string
    tags?: string[]
    link?: string
    image_id?: string
    created_at?: string
    updated_at?: string
}
