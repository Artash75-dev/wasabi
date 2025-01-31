// context/SocketContext.js
"use client";
import { NEXT_BASE_URL } from "@/lib/utils";
import { orderCreateInfo } from "@/store/event";
import { usePathname } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Initialize socket (replace with your socket URL)
const socket = io(NEXT_BASE_URL);

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const { setOrderData, orderData } = orderCreateInfo();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for socket events
    socket.on("phone", (data) => {
      if (
        !pathname.startsWith("/admin") ||
        pathname.startsWith("/admin/add-order")
      ) {
        return;
      }

      if (data.has) {
        window.location.href = `https://wassabi-sushi.onrender.com/admin/add-order?client=${data?.clientId}`;
        setOrderData({
          ...orderData,
          client_id: data?.clientId,
        });
        console.log("its true");
      } else {
        window.location.href = `https://wassabi-sushi.onrender.com/admin/clients/add`;
        console.log("its false");
      }
    });

    // Clean up on component unmount
    return () => {
      socket.off("phone");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ state, setState, socket }}>
      {children}
    </SocketContext.Provider>
  );
};
