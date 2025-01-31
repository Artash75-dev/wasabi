"use client"

import NotificationText from "@/components/pages/delivery/NotificationText";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Message() {
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  const handleNotificationPush = () => {
    if (!isNotificationEnabled) {
      toast.error("Уведомления отключены. Включите их в настройках!");
      return;
    }

    if ("Notification" in window) {
      new Notification("Уведомление", {
        body: "Вам пришло новое заказ!",
        icon: "/logo.jpg",
        renotify: true,
        vibrate: [500, 100, 500],
        tag: "new-order-notification",
      });
    } else {
      toast.error("Уведомления не поддерживаются в вашем браузере.");
    }
  };

  const handleOnNotif = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          setIsNotificationEnabled(true);
          toast.success("Уведомления включены.");
        } else {
          setIsNotificationEnabled(false);
          toast.error("Включите уведомления в настройках раздела!");
        }
      });
    } else {
      toast.error("Уведомления не поддерживаются в вашем браузере.");
    }
  };

  return (
    <div>
      <NotificationText />
      <Button
        onClick={handleNotificationPush}
        variant="ghost"
        className="border border-input"
      >
        Notification Push
      </Button>
      <Button
        onClick={handleOnNotif}
        variant="ghost"
        className="border border-input"
      >
        Notification On
      </Button>
    </div>
  );
}
