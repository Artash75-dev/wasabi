"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import NextTopLoader from "nextjs-toploader";
import HeaderAdmin from "../pages/admin/headerAdmin";
import HeaderDeliver from "../pages/delivery/headerDeliver";
import { deliveryStore } from "@/store/event";
import axios from "axios";
import { StarHalf } from "lucide-react";
import { useSocketDeliverContext } from "@/providers/SocketDeliverContext";

export default function Header() {
  const { socket } = useSocketDeliverContext();
  const auth = Cookies.get("auth");
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [customColor, setCustomColor] = useState();
  const [authData, setAuthData] = useState(null);
  const { setDiscountDelivery } = deliveryStore();
  const authorization = auth ? JSON.parse(auth) : null;

  useEffect(() => {
    const updateClock = () => {
      const current = new Date();
      const hours = String(current.getHours()).padStart(2, "0");
      const minutes = String(current.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    if (auth) {
      setAuthData(JSON.parse(auth)); // Parse JSON string if it's a JSON object
    }

    updateClock();
    const intervalId = setInterval(updateClock, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (pathname.includes("/admin")) {
      setCustomColor("hsla(83, 83%, 32%, 1)");
    } else {
      setCustomColor("hsla(0, 0%, 100%, 1)");
    }
  }, [pathname]);

  useEffect(() => {
    if (authorization) {
      const { user_id, role, name, login } = authorization;
      if (role == "delivery") {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("sending");
            sendLocation(latitude, longitude);
          },
          (error) => console.error(error),
          { enableHighAccuracy: true }
        );
        function sendLocation(latitude, longitude) {
          socket?.emit("updateLocation", {
            lat: latitude,
            lng: longitude,
            deliver_id: user_id,
            name,
            email: login,
          });
        }

        return () => {
          navigator.geolocation.clearWatch(watchId);
          socket?.disconnect();
        };
      }
    }
  }, [socket]);

  useEffect(() => {
    if (!pathname.includes("/delivery")) {
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get("/api/discount");
        const promotions = res?.data?.data;
        setDiscountDelivery(promotions);
      } catch (error) {}
    };
    fetchData();
  }, [pathname, setDiscountDelivery]);

  return (
    <>
      <NextTopLoader
        color={customColor}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={true}
        easing="ease"
        speed={200}
        template='<div class="bar" role="bar"><div class="peg"></div></div> <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
        zIndex={999999999}
        showAtBottom={false}
      />
      <main
        className={`${
          pathname.includes("/delivery")
            ? "bg-primary "
            : "bg-background border"
        } shadow-sm fixed top-0 left-0 w-full z-[400]`}
      >
        {pathname.includes("/admin") && (
          <HeaderAdmin authData={authData} pathname={pathname} />
        )}
        {pathname.includes("/delivery") && (
          <HeaderDeliver time={time} authData={authData} pathname={pathname} />
        )}
      </main>
    </>
  );
}
