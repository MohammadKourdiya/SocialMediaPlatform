// src/context/SocketProvider.jsx

import { SocketContext } from "./SocketContext";
import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:5000", {
        query: { userId: user._id },
        transports: ["websocket"],
      });

      setSocket(socketio);

      return () => {
        socketio.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
export default SocketProvider;
