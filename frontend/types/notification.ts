export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    entity_type: NotificationEntity;
    entity_id: string;
    actor_user_id?: string;
    title: string;
    body: string;
    payload?: any;
    read_at?: string;
    created_at?: string;
}

export enum NotificationType {
    jobPosted = "JOB_POSTED",
    gigPosted = "GIG_POSTED",
    bidSent = "BID_SENT",
    bidReceived = "BID_RECEIVED",
    bidAccepted = "BID_ACCEPTED",
    bidDeclined = "BID_DECLIEND",
    bidWithdrawn = "BID_WITHDRAWN",
    milestoneStarted = "MILESTONE_STARTED",
    milestoneFunded = "MILESTONE_FUNDED",
    milestoneDelivered = "MILESTONE_DELIVERED",
    milestoneApproved = "MILESTONE_APPROVED",
    milestoneFundsReleased = "MILESTONE_FUNDS_RELEASED",
    disputeStarted = "DISPUTE_STARTED",
    disputeResolved = "DISPUTE_RESOLVED",
    messageReceived = "MESSAGE_RECEIVED",    
    requirementDocsCreated = "REQUIREMENT_DOCS_CREATED",
    requirementDocsConfirmed = "REQUIREMENT_DOCS_CONFIRMED",
    chatCreated = "CHAT_CREATED",
    chatUpdated = "CHAT_UPDATED",
  }   

export enum NotificationEntity {
    job = "job",
    gig = "gig",
    bid = "bid",
    milestone = "milestone",
    escrow = "escrow",
    dispute = "dispute",
    conversation = "conversation",
    jobApplicationDoc = "job_application_doc",
}


export interface NotificationContextType {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    notificationsError: string;
    setNotificationsError: (notificationsError: string) => void;
}