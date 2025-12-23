export type DashboardResponse = {
    jobs: DashboardJob[];
    bids: DashboardBid[];          // freelancer only, empty for client
    gigs: DashboardGig[];          // freelancer only, empty for client
    conversations: DashboardConversation[];
    notifications: DashboardNotification[];
};  

export type DashboardJob = {
    id: string;
    title: string;
    description_md: string;
    status: string;
    created_at: string;
    location: string;
    tags: string[];
    image_id: string | null;
    deadline_at: string | null;
    budget_min_usd: string | null;
    budget_max_usd: string | null;
    token_symbol: string | null;
    is_remote: boolean;
    // client only
    bids?: DashboardJobBid[];
    // freelancer only
    client?: DashboardClient;
    milestones: DashboardMilestone[];
    jobApplicationsDocs: DashboardJobApplicationDoc[];
};

export type DashboardJobBid = {
    id: string;
    bid_amount: string | null;
    token_symbol: string | null;
    cover_letter_md: string | null;
    period: number | null;
    status: string;
    freelancer: DashboardFreelancer;
};

export type DashboardBid = {
    id: string;
    bid_amount: string | null;
    cover_letter_md: string | null;
    period: number | null;
    status: string;
    created_at: string;
    token_symbol: string | null;
    job: {
        id: string;
        title: string;
        location: string;
        budget_min_usd: string | null;
        budget_max_usd: string | null;
        deadline_at: string | null;
        description_md: string;
        tags: string[];
        status: string;
        token_symbol: string | null;
        client_id: string;
    };
};

export type DashboardJobApplicationDoc = {
    id: string;
    budget: string | null;
    start_date: string | null;
    end_date: string | null;
    deliverables: string | null;
    out_of_scope: string | null;
    token_symbol: string | null;
    client_confirm: boolean;
    freelancer_confirm: boolean;
    job_milestone_id: string | null;
    // client side
    freelancer_id?: string;
    // freelancer side
    client_id?: string;
};

export type DashboardMilestone = {
    id: string;
    title: string;
    status: string;
    amount: string;
    order_index: number;
    escrow: string | null;
    due_at: string | null;
    freelancer_id?: string;
};

export type DashboardFreelancer = {
    id: string;
    display_name: string | null;
    email?: string;
    address?: string;
    image_id?: string;
};
  
export type DashboardClient = {
    id: string;
    display_name: string | null;
    email?: string;
    image_id?: string;
};

export type DashboardGig = {
    id: string;
    title: string;
    description_md: string;
    budget_min_usd: string | null;
    budget_max_usd: string | null;
    token_symbol: string | null;
    tags: string[];
    image_id: string | null;
    created_at: string;
};

export type DashboardConversation = {
    id: string;
    job_id: string | null;
    gig_id: string | null;
    created_at: string;
    participants: {
        user_id: string;
        is_pinned: boolean;
        is_muted: boolean;
    }[];
    messages: DashboardMessage[];
};
  
export type DashboardMessage = {
    id: string;
    sender_id: string;
    kind: string;
    body_text: string | null;
    created_at: string;
    edited_at: string | null;
};

export type DashboardNotification = {
    id: string;
    type: string;
    entity_type: string;
    entity_id: string;
    title: string;
    body: string;
    payload: any;
    created_at: string;
};
    

export interface DashboardContextType {
    /* -------- Jobs -------- */
    jobsInfo: DashboardJob[];
    setJobsInfo: React.Dispatch<React.SetStateAction<DashboardJob[]>>;
  
    /* -------- Freelancer bids -------- */
    bidsInfo: DashboardBid[];
    setBidsInfo: React.Dispatch<React.SetStateAction<DashboardBid[]>>;
  
    /* -------- Gigs -------- */
    gigsInfo: DashboardGig[];
    setGigsInfo: React.Dispatch<React.SetStateAction<DashboardGig[]>>;
  
    /* -------- Conversations -------- */
    conversationsInfo: DashboardConversation[];
    setConversationsInfo: React.Dispatch<
      React.SetStateAction<DashboardConversation[]>
    >;
  
    /* -------- Notifications -------- */
    notificationsInfo: DashboardNotification[];
    setNotificationsInfo: React.Dispatch<
      React.SetStateAction<DashboardNotification[]>
    >;
  
    /* -------- Error handling -------- */
    dashboardError: string;
    setDashboardError: React.Dispatch<React.SetStateAction<string>>;
}