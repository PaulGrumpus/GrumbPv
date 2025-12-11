import { useContext } from "react";
import { SocketCtx } from "@/context/socketContext";

const useSocket = () => {
  const { socket, isConnected } = useContext(SocketCtx);
  return { socket, isConnected };
};

export default useSocket;