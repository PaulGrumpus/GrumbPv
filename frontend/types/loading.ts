export type userLoadingState = "pending" | "failure" | "success";

export type LoadingContextType = {
  userLoadingState: userLoadingState;
  setuserLoadingState: React.Dispatch<React.SetStateAction<userLoadingState>>;
};