"use client";

import { useEffect, useState } from "react";
import "./index.css";

export default function DotInput() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // This will only run on the client side
    const checkOnlineStatus = async () => {
      if (typeof navigator !== "undefined") {
        setIsOnline(navigator.onLine);
      }
    };

    checkOnlineStatus();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window?.addEventListener("online", handleOnline);
    window?.addEventListener("offline", handleOffline);

    return () => {
      window?.removeEventListener("online", handleOnline);
      window?.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <label className="dot-container">
      <input type="checkbox" checked={isOnline} readOnly />
      <div className="dot-checkmark"></div>
    </label>
  );
}
