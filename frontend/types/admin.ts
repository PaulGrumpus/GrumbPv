export interface AdminUser {
  id: string;
  email: string | null;
  address: string | null;
  display_name: string | null;
  role: 'client' | 'freelancer' | 'admin';
  is_verified: boolean;
  image_id: string | null;
  country_code: string | null;
  created_at: string;
  updated_at: string;
  finished_job_num: number | null;
  total_fund: number | null;
}

export interface AdminUserDetails extends AdminUser {
  bio: string | null;
  chain: string;
  fund_cycle: number | null;
  fund_num: number | null;
  _count: {
    jobs: number;
    bids: number;
    milestones: number;
    conversations: number;
  };
}

export interface AdminGig {
  id: string;
  freelancer_id: string;
  title: string;
  description_md: string | null;
  budget_min: number | null;
  budget_max: number | null;
  token_symbol: string | null;
  tags: string[];
  image_id: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
  freelancer: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
  };
}

export interface AdminJob {
  id: string;
  client_id: string;
  title: string;
  description_md: string | null;
  budget_min: number | null;
  budget_max: number | null;
  token_symbol: string | null;
  deadline_at: string | null;
  status: 'draft' | 'open' | 'in_review' | 'in_progress' | 'completed' | 'cancelled';
  is_remote: boolean;
  location: string;
  tags: string[];
  image_id: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
  };
  _count: {
    bids: number;
    milestones: number;
  };
  hasDispute: boolean;
}

export interface AdminBid {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter_md: string | null;
  bid_amount: number;
  period: number | null;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  token_symbol: string | null;
  created_at: string;
  freelancer: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
    address: string | null;
    is_verified: boolean;
    finished_job_num: number | null;
    total_fund: number | null;
  };
}

export interface AdminMilestone {
  id: string;
  job_id: string;
  freelancer_id: string | null;
  title: string;
  amount: number;
  due_at: string | null;
  order_index: number;
  status: string;
  escrow: string | null;
  ipfs: string | null;
  created_at: string;
  updated_at: string;
  freelancer: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
  } | null;
}

export interface AdminJobDetails extends Omit<AdminJob, '_count'> {
  client: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
    address: string | null;
    is_verified: boolean;
  };
  bids: AdminBid[];
  milestones: AdminMilestone[];
  conversations: {
    id: string;
    created_at: string;
    escrow: string | null;
    participants: {
      user: {
        id: string;
        display_name: string | null;
        email: string | null;
        role: string;
      };
    }[];
  }[];
  jobApplicationsDocs: {
    id: string;
    deliverables: string | null;
    out_of_scope: string | null;
    budget: number | null;
    token_symbol: string | null;
    start_date: string | null;
    end_date: string | null;
    client_confirm: boolean;
    freelancer_confirm: boolean;
    created_at: string;
  }[];
  hasDispute: boolean;
  disputedMilestones: AdminMilestone[];
  disputeChatHistory: {
    id: string;
    body_text: string | null;
    kind: string;
    created_at: string;
    sender: {
      id: string;
      display_name: string | null;
      email: string | null;
      role: string;
      image_id: string | null;
    };
  }[];
}

export interface AdminConversation {
  id: string;
  type: string;
  job_id: string | null;
  gig_id: string | null;
  escrow: string | null;
  created_at: string;
  participants: {
    user: {
      id: string;
      display_name: string | null;
      email: string | null;
      image_id: string | null;
      role: string;
    };
  }[];
  job: {
    id: string;
    title: string;
  } | null;
  gig: {
    id: string;
    title: string;
  } | null;
  _count: {
    messages: number;
  };
}

export interface AdminMessage {
  id: string;
  body_text: string | null;
  kind: string;
  attachment_id: string | null;
  created_at: string;
  sender: {
    id: string;
    display_name: string | null;
    email: string | null;
    image_id: string | null;
    role: string;
  };
}

export interface AdminConversationDetails extends AdminConversation {
  messages: AdminMessage[];
  job: {
    id: string;
    title: string;
    status: string;
    client_id: string;
  } | null;
  gig: {
    id: string;
    title: string;
    freelancer_id: string;
  } | null;
}

export interface AdminDashboardStats {
  counts: {
    users: number;
    jobs: number;
    gigs: number;
    conversations: number;
    disputedJobs: number;
    openJobs: number;
    expiredJobs: number;
    totalFund: number;
    totalWithdraw: number;
  };
  jobsByStatus: Record<string, number>;
  recentUsers: {
    id: string;
    display_name: string | null;
    email: string | null;
    role: string;
    created_at: string;
  }[];
  recentJobs: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    deadline_at: string | null;
  }[];
}

export interface AdminSystemSettings {
  id: string;
  key: string;
  fee_bps: number;
  buyer_fee_bps: number;
  vendor_fee_bps: number;
  dispute_fee_bps: number;
  reward_rate_bps: number;
  reward_rate_per_1_e_18: string;
  arbiter_address: string;
  fee_recipient_address: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type JobStatusFilter = 'all' | 'open' | 'expired' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
