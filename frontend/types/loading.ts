export type LoadingState = "pending" | "failure" | "success";

export type LoadingContextType = {
  loadingState: LoadingState;
  setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
};