export type JobMilestone = {  
  id?: string
  job_id?: string
  title?: string
  amount?: number | string
  due_at?: Date | string
  order_index?: number
  status?: JobMilestoneStatus
  created_at?: Date | string
  token_symbol?: string
  escrow?: string
  ipfs?: string
  updated_at?: Date | string
  freelancer_id?: string
}

export enum JobMilestoneStatus {
  PENDING_FUND = "pending_fund",
  FUNDED = "funded",
  DELIVERED = "delivered",
  APPROVED = "approved",
  RELEASED = "released",
  DISPUTED_WITHOUT_COUNTER_SIDE = "disputedWithoutCounterSide",
  DISPUTED_WITH_COUNTER_SIDE = "disputedWithCounterSide",
  RESOLVED_TO_BUYER = "resolvedToBuyer",
  RESOLVED_TO_VENDOR = "resolvedToVendor",
  CANCELLED = "cancelled",
}