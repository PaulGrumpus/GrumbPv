export type userLoadingState = "pending" | "failure" | "success";

export type LoadingContextType = {
  userLoadingState: userLoadingState;
  setuserLoadingState: React.Dispatch<React.SetStateAction<userLoadingState>>;
};

export type conversationLoadingState = "pending" | "failure" | "success";

export type ConversationLoadingContextType = {
  conversationLoadingState: conversationLoadingState;
  setconversationLoadingState: React.Dispatch<React.SetStateAction<conversationLoadingState>>;
};

export type messageLoadingState = "pending" | "failure" | "success";

export type MessageLoadingContextType = {
  messageLoadingState: messageLoadingState;
  setmessageLoadingState: React.Dispatch<React.SetStateAction<messageLoadingState>>;
};

export type projectInfoLoadingState = "pending" | "failure" | "success";

export type ProjectInfoLoadingContextType = {
  projectInfoLoadingState: projectInfoLoadingState;
  setprojectInfoLoadingState: React.Dispatch<React.SetStateAction<projectInfoLoadingState>>;
};

export type notificationLoadingState = "pending" | "failure" | "success";

export type NotificationLoadingContextType = {
  notificationLoadingState: notificationLoadingState;
  setnotificationLoadingState: React.Dispatch<React.SetStateAction<notificationLoadingState>>;
};