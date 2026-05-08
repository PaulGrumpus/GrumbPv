export const user_role = {
  client: 'client',
  freelancer: 'freelancer',
  admin: 'admin',
} as const;

export const job_status = {
  draft: 'draft',
  open: 'open',
  in_review: 'in_review',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

export const bid_status = {
  pending: 'pending',
  accepted: 'accepted',
  declined: 'declined',
  withdrawn: 'withdrawn',
} as const;

export const milestone_status = {
  pending_fund: 'pending_fund',
  funded: 'funded',
  delivered: 'delivered',
  approved: 'approved',
  released: 'released',
  disputedByClient: 'disputedByClient',
  disputedByFreelancer: 'disputedByFreelancer',
  disputedWithCounterSide: 'disputedWithCounterSide',
  resolvedToBuyer: 'resolvedToBuyer',
  resolvedToVendor: 'resolvedToVendor',
  cancelled: 'cancelled',
} as const;

export const notification_type = {
  JOB_POSTED: 'JOB_POSTED',
  JOB_UPDATED: 'JOB_UPDATED',
  JOB_EXPIRING_SOON: 'JOB_EXPIRING_SOON',
  GIG_POSTED: 'GIG_POSTED',
  GIG_UPDATED: 'GIG_UPDATED',
  BID_SENT: 'BID_SENT',
  BID_RECEIVED: 'BID_RECEIVED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_DECLIEND: 'BID_DECLIEND',
  BID_WITHDRAWN: 'BID_WITHDRAWN',
  MILESTONE_ESCROW_DEPLOYED: 'MILESTONE_ESCROW_DEPLOYED',
  MILESTONE_STARTED: 'MILESTONE_STARTED',
  MILESTONE_FUNDED: 'MILESTONE_FUNDED',
  MILESTONE_DELIVERED: 'MILESTONE_DELIVERED',
  MILESTONE_APPROVED: 'MILESTONE_APPROVED',
  MILESTONE_FUNDS_RELEASED: 'MILESTONE_FUNDS_RELEASED',
  MILESTONE_CANCELLED: 'MILESTONE_CANCELLED',
  DISPUTE_STARTED: 'DISPUTE_STARTED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  REQUIREMENT_DOCS_CREATED: 'REQUIREMENT_DOCS_CREATED',
  REQUIREMENT_DOCS_CONFIRMED: 'REQUIREMENT_DOCS_CONFIRMED',
  CHAT_CREATED: 'CHAT_CREATED',
  CHAT_UPDATED: 'CHAT_UPDATED',
  DEPOSIT_FUNDS: 'DEPOSIT_FUNDS',
  DELIVER_WORK: 'DELIVER_WORK',
  APPROVE_WORK: 'APPROVE_WORK',
  WITHDRAW_FUNDS: 'WITHDRAW_FUNDS',
} as const;

export const notification_entity = {
  job: 'job',
  job_application_doc: 'job_application_doc',
  gig: 'gig',
  bid: 'bid',
  milestone: 'milestone',
  escrow: 'escrow',
  dispute: 'dispute',
  conversation: 'conversation',
  chain_tx: 'chain_tx',
} as const;
