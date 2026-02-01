export interface Job {
    id?: string
    client_id: string
    title: string
    description_md: string
    budget_min?: number
    budget_max?: number
    token_symbol?: string
    location?: LocationType
    tags?: string[]
    image_id?: string
    deadline_at?: string
    status?: JobStatus
    is_remote?: boolean
    created_at?: string
    updated_at?: string
}

export enum LocationType {
    REMOTE = "remote",
    ON_SITE = "onsite",
    HYBRID = "hybrid",
}

export enum JobStatus {
    DRAFT = "draft",
    OPEN = "open",
    IN_REVIEW = "in_review",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}