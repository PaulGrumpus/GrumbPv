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
    bidReceived = "BID_RECEIVED",
    bidAccepted = "BID_ACCEPTED",
    jobStarted = "JOB_STARTED",
    milestoneFunded = "MILESTONE_FUNDED",
    milestoneDelivered = "MILESTONE_DELIVERED",
    milestoneApproved = "MILESTONE_APPROVED",
    fundsReleased = "FUNDS_RELEASED",
    disputeStarted = "DISPUTE_STARTED",
    disputeResolved = "DISPUTE_RESOLVED",
    messageReceived = "MESSAGE_RECEIVED",
  }

export enum NotificationEntity {
    job = "job",
    bid = "bid",
    milestone = "milestone",
    escrow = "escrow",
    dispute = "dispute",
    conversation = "conversation",
}


export interface NotificationContextType {
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    notificationsError: string;
    setNotificationsError: (notificationsError: string) => void;
}