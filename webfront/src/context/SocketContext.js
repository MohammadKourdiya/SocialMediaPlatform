import { createContext, useContext } from "react";

export const SocketContext = createContext(null);

// Custom hook for easy usage
export const useSocket = () => useContext(SocketContext);