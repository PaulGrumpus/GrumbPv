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