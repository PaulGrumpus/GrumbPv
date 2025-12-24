export interface newConversationParam {
  type: convo_type;
  job_id?: string;
  created_at: Date;
  escrow?: string;
  gig_id?: string;
  job_application_doc_id?: string;
  client_id: string;
  freelancer_id: string;
}

export enum convo_type {
  dm = 'dm',
}
