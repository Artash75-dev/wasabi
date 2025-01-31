"use client"
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const useSocketDeliverContext = () => {
  return useContext(SocketContext);
};

// eslint-disable-next-line react/prop-types
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const socket = io();
    setSocket(socket);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", function () {
      });

      socket.on("message", (data) => {
      });
      socket.on("disconnect", () => {
        console.log("disconect");
      });
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
