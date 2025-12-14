export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    entityType: NotificationEntity;
    entityId: string;
    actorUserId?: string;
    title: string;
    body: string;
    payload?: any;
    readAt?: Date;
    createdAt?: Date;
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